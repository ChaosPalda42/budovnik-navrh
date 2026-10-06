<?php
// Kontrakt C-109 – lib/qr/bity.php: z textu vytvoří kódová slova QR kódu
// (vždy bajtový režim 0b0100, úroveň opravy M) – nejdřív samotná datová
// slova, potom včetně Reed–Solomonových opravných kódů a proložení bloků.
declare(strict_types=1);

require_once __DIR__ . '/gf.php';
require_once __DIR__ . '/tabulky.php';

/**
 * Datová kódová slova (bajty 0–255) před opravnými kódy, vyplněná
 * až do konce kapacity verze.
 *
 * Postup proudu bitů:
 *  - 4 bity režimu (0b0100 = bajtový),
 *  - délka textu v bajtech na 8 bitů (verze 1–9) nebo 16 bitů (verze 10+),
 *  - každý bajt textu na 8 bitech,
 *  - pokud se ještě vejde, až 4 nulové bity ukončení,
 *  - doplnění nulami na celý bajt,
 *  - zbytek kapacity střídavě bajty 236 a 17 (první je 236).
 *
 * Kapacita je (qrCelkemKodu(verze) - qrEcKodu(verze)) kódových slov.
 *
 * @return list<int>
 */
function qrDatovaSlova(string $text, int $verze): array
{
    $kapacita = qrCelkemKodu($verze) - qrEcKodu($verze);

    /** @var list<int> $bity */
    $bity = [];

    // 4 bity režimu: bajtový (0b0100)
    foreach ([0, 1, 0, 0] as $bit) {
        $bity[] = $bit;
    }

    // délka textu v bajtech: 8 bitů pro verze 1–9, jinak 16 bitů
    $delkaBitu = ($verze <= 9) ? 8 : 16;
    $delka = strlen($text);
    for ($i = $delkaBitu - 1; $i >= 0; $i--) {
        $bity[] = ($delka >> $i) & 1;
    }

    // data: každý bajt na 8 bitech
    for ($k = 0, $n = strlen($text); $k < $n; $k++) {
        $bajt = ord($text[$k]);
        for ($i = 7; $i >= 0; $i--) {
            $bity[] = ($bajt >> $i) & 1;
        }
    }

    // ukončení: až 4 nulové bity, pokud se ještě vejdou
    $pocetUkonceni = min(4, $kapacita * 8 - count($bity));
    for ($i = 0; $i < $pocetUkonceni; $i++) {
        $bity[] = 0;
    }

    // doplnit nulami do celého bajtu
    while (count($bity) % 8 !== 0) {
        $bity[] = 0;
    }

    /** @var list<int> $slova */
    $slova = [];
    foreach (array_chunk($bity, 8) as $skupina) {
        $hodnota = 0;
        foreach ($skupina as $bit) {
            $hodnota = ($hodnota << 1) | $bit;
        }
        $slova[] = $hodnota;
    }

    // zbytek kapacity vyplnit střídavě 236 a 17
    $vypln = [236, 17];
    $i = 0;
    while (count($slova) < $kapacita) {
        $slova[] = $vypln[$i % 2];
        $i++;
    }

    return $slova;
}

/**
 * Hotová kódová slova k rozmístění do matice: datová slova rozdělená
 * na bloky podle qrRozdeleniBloku(), ke každému bloku Reed–Solomonovy
 * opravné kódy a všechno proložené po jednom slovu z bloku
 * (nejdřív data, za tím opravné kódy).
 *
 * Výsledek má přesně qrCelkemKodu(verze) čísel.
 *
 * @return list<int>
 */
function qrKodovaSlova(string $text, int $verze): array
{
    $datova = qrDatovaSlova($text, $verze);

    /** @var list<array<int,int>> $datBloky */
    $datBloky = [];
    /** @var list<array<int,int>> $ecBloky */
    $ecBloky = [];

    $offset = 0;
    foreach (qrRozdeleniBloku($verze) as $blok) {
        $data = array_slice($datova, $offset, $blok['dat']);
        $offset += $blok['dat'];
        $datBloky[] = $data;
        $ecBloky[] = rsKody($data, $blok['ec']);
    }

    $maxDat = 0;
    $maxEc = 0;
    foreach ($datBloky as $blok) {
        $maxDat = max($maxDat, count($blok));
    }
    foreach ($ecBloky as $blok) {
        $maxEc = max($maxEc, count($blok));
    }

    /** @var list<int> $vysledek */
    $vysledek = [];

    // proložená datová slova: nejdřív první z každého bloku, pak druhé…
    for ($i = 0; $i < $maxDat; $i++) {
        foreach ($datBloky as $blok) {
            if (isset($blok[$i])) {
                $vysledek[] = $blok[$i];
            }
        }
    }

    // proložené opravné kódy, stejným způsobem
    for ($i = 0; $i < $maxEc; $i++) {
        foreach ($ecBloky as $blok) {
            if (isset($blok[$i])) {
                $vysledek[] = $blok[$i];
            }
        }
    }

    return $vysledek;
}
