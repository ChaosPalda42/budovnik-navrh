<?php
// ---------------------------------------------------------------------------
// Kontrakt C-110 – matice QR kódu: pevné vzory, rozmístění dat, maskování
// a výběr nejlepší masky.
//
// Tohle je jediná část jádra, kterou továrna nedotáhla (balíček P-001) –
// dopsal ji operátor. Pořadí kroků je závazné a odpovídá normě:
//   1. hledáčky s oddělovači, časovací řady, zarovnávací vzory
//   2. místa pro informaci o formátu (a u verzí 7+ o verzi) se REZERVUJÍ
//      ještě před daty, jinak by se data nasypala i tam
//   3. data po dvousloupcích zprava doleva, cikcak
//   4. maska jen na nerezervované moduly
//   5. skutečná informace o formátu až nakonec
//
// Matice je pole řádků, každý řádek pole 0/1: $m[$radek][$sloupec].
// ---------------------------------------------------------------------------
declare(strict_types=1);

require_once __DIR__ . '/tabulky.php';

/** Překlápí maska tenhle modul? */
function qrMaskaPlati(int $maska, int $r, int $s): bool
{
    return match ($maska) {
        0 => ($r + $s) % 2 === 0,
        1 => $r % 2 === 0,
        2 => $s % 3 === 0,
        3 => ($r + $s) % 3 === 0,
        4 => (intdiv($r, 2) + intdiv($s, 3)) % 2 === 0,
        5 => ($r * $s) % 2 + ($r * $s) % 3 === 0,
        6 => (($r * $s) % 2 + ($r * $s) % 3) % 2 === 0,
        default => (($r + $s) % 2 + ($r * $s) % 3) % 2 === 0,
    };
}

/**
 * Pevné vzory. Vrací [matice, rezervace] – rezervace říká, kam se nesmí
 * sypat data ani sahat maskou.
 */
function qrPevneVzory(int $verze): array
{
    $n = qrVelikost($verze);
    $m = array_fill(0, $n, array_fill(0, $n, 0));
    $rez = array_fill(0, $n, array_fill(0, $n, false));

    $poloz = function (int $r, int $s, int $hodnota) use (&$m, &$rez, $n): void {
        if ($r >= 0 && $r < $n && $s >= 0 && $s < $n) {
            $m[$r][$s] = $hodnota;
            $rez[$r][$s] = true;
        }
    };

    // Hledáčky i s bílým oddělovačem okolo (proto -1 až 7)
    foreach ([[0, 0], [0, $n - 7], [$n - 7, 0]] as [$r0, $s0]) {
        for ($r = -1; $r <= 7; $r++) {
            for ($s = -1; $s <= 7; $s++) {
                $tmavy = ($r >= 0 && $r <= 6 && ($s === 0 || $s === 6))
                    || ($s >= 0 && $s <= 6 && ($r === 0 || $r === 6))
                    || ($r >= 2 && $r <= 4 && $s >= 2 && $s <= 4);
                $poloz($r0 + $r, $s0 + $s, $tmavy ? 1 : 0);
            }
        }
    }

    // Časovací řady (mezi hledáčky)
    for ($i = 8; $i < $n - 8; $i++) {
        $poloz($i, 6, $i % 2 === 0 ? 1 : 0);
        $poloz(6, $i, $i % 2 === 0 ? 1 : 0);
    }

    // Zarovnávací vzory – kromě tří kombinací, které by padly na hledáčky
    $sour = qrZarovnani($verze);
    $posl = count($sour) - 1;
    foreach ($sour as $i => $r0) {
        foreach ($sour as $j => $s0) {
            if (($i === 0 && $j === 0) || ($i === 0 && $j === $posl) || ($i === $posl && $j === 0)) {
                continue;
            }
            for ($r = -2; $r <= 2; $r++) {
                for ($s = -2; $s <= 2; $s++) {
                    $tmavy = $r === -2 || $r === 2 || $s === -2 || $s === 2 || ($r === 0 && $s === 0);
                    $poloz($r0 + $r, $s0 + $s, $tmavy ? 1 : 0);
                }
            }
        }
    }

    return [$m, $rez];
}

/** Zapíše 15 bitů informace o formátu (a rovnou je rezervuje). */
function qrZapisFormat(array &$m, array &$rez, int $verze, int $maska): void
{
    $n = qrVelikost($verze);
    $bity = qrFormatBity($maska);
    for ($i = 0; $i < 15; $i++) {
        $bit = ($bity >> $i) & 1;
        // svislá kopie u levého horního hledáčku, zbytek dole vlevo
        if ($i < 6) {
            $m[$i][8] = $bit;
            $rez[$i][8] = true;
        } elseif ($i < 8) {
            $m[$i + 1][8] = $bit;
            $rez[$i + 1][8] = true;
        } else {
            $m[$n - 15 + $i][8] = $bit;
            $rez[$n - 15 + $i][8] = true;
        }
        // vodorovná kopie
        if ($i < 8) {
            $m[8][$n - $i - 1] = $bit;
            $rez[8][$n - $i - 1] = true;
        } elseif ($i < 9) {
            $m[8][15 - $i] = $bit;
            $rez[8][15 - $i] = true;
        } else {
            $m[8][14 - $i] = $bit;
            $rez[8][14 - $i] = true;
        }
    }
    // Tmavý modul – je tam vždycky, ať maska dopadne jakkoli
    $m[$n - 8][8] = 1;
    $rez[$n - 8][8] = true;
}

/** Zapíše 18 bitů informace o verzi (jen verze 7 a vyšší). */
function qrZapisVerzi(array &$m, array &$rez, int $verze): void
{
    if ($verze < 7) {
        return;
    }
    $n = qrVelikost($verze);
    $bity = qrVerzeBity($verze);
    for ($i = 0; $i < 18; $i++) {
        $bit = ($bity >> $i) & 1;
        $r = intdiv($i, 3);
        $s = $i % 3 + $n - 11;
        $m[$r][$s] = $bit;
        $rez[$r][$s] = true;
        $m[$s][$r] = $bit;
        $rez[$s][$r] = true;
    }
}

/** Nasype kódová slova do volných modulů: dvousloupce zprava, cikcak. */
function qrZapisData(array &$m, array $rez, array $kodovaSlova, int $verze): void
{
    $n = qrVelikost($verze);
    $smer = -1;
    $radek = $n - 1;
    $bit = 7;
    $bajt = 0;

    for ($s = $n - 1; $s > 0; $s -= 2) {
        if ($s === 6) {
            $s--;           // sloupec 6 je časovací
        }
        while (true) {
            for ($c = 0; $c < 2; $c++) {
                if (!$rez[$radek][$s - $c]) {
                    $tmavy = 0;
                    if ($bajt < count($kodovaSlova)) {
                        $tmavy = (($kodovaSlova[$bajt] >> $bit) & 1);
                    }
                    $m[$radek][$s - $c] = $tmavy;
                    $bit--;
                    if ($bit === -1) {
                        $bajt++;
                        $bit = 7;
                    }
                }
            }
            $radek += $smer;
            if ($radek < 0 || $radek >= $n) {
                $radek -= $smer;
                $smer = -$smer;
                break;
            }
        }
    }
}

/** Překlopí nerezervované moduly podle masky (dvakrát = zpátky). */
function qrPouzijMasku(array &$m, array $rez, int $maska): void
{
    $n = count($m);
    for ($r = 0; $r < $n; $r++) {
        for ($s = 0; $s < $n; $s++) {
            if (!$rez[$r][$s] && qrMaskaPlati($maska, $r, $s)) {
                $m[$r][$s] ^= 1;
            }
        }
    }
}

/** Trestné skóre masky podle normy – čím míň, tím líp se to čte. */
function qrTrestneSkore(array $m): int
{
    $n = count($m);
    $body = 0;

    // N1: souvislé řady pěti a víc stejných modulů
    for ($r = 0; $r < $n; $r++) {
        $stejnychR = 0;
        $stejnychS = 0;
        $posledniR = -1;
        $posledniS = -1;
        for ($s = 0; $s < $n; $s++) {
            $vRadku = $m[$r][$s];
            if ($vRadku === $posledniR) {
                $stejnychR++;
            } else {
                if ($stejnychR >= 5) {
                    $body += 3 + ($stejnychR - 5);
                }
                $posledniR = $vRadku;
                $stejnychR = 1;
            }
            $vSloupci = $m[$s][$r];
            if ($vSloupci === $posledniS) {
                $stejnychS++;
            } else {
                if ($stejnychS >= 5) {
                    $body += 3 + ($stejnychS - 5);
                }
                $posledniS = $vSloupci;
                $stejnychS = 1;
            }
        }
        if ($stejnychR >= 5) {
            $body += 3 + ($stejnychR - 5);
        }
        if ($stejnychS >= 5) {
            $body += 3 + ($stejnychS - 5);
        }
    }

    // N2: čtverce 2×2 stejné barvy
    $ctvercu = 0;
    for ($r = 0; $r < $n - 1; $r++) {
        for ($s = 0; $s < $n - 1; $s++) {
            $soucet = $m[$r][$s] + $m[$r][$s + 1] + $m[$r + 1][$s] + $m[$r + 1][$s + 1];
            if ($soucet === 0 || $soucet === 4) {
                $ctvercu++;
            }
        }
    }
    $body += $ctvercu * 3;

    // N3: vzor 1011101 se čtyřmi světlými před nebo za (plete se s hledáčkem)
    $nalezu = 0;
    for ($r = 0; $r < $n; $r++) {
        $oknoR = 0;
        $oknoS = 0;
        for ($s = 0; $s < $n; $s++) {
            $oknoR = (($oknoR << 1) & 0x7FF) | $m[$r][$s];
            if ($s >= 10 && ($oknoR === 0x5D0 || $oknoR === 0x05D)) {
                $nalezu++;
            }
            $oknoS = (($oknoS << 1) & 0x7FF) | $m[$s][$r];
            if ($s >= 10 && ($oknoS === 0x5D0 || $oknoS === 0x05D)) {
                $nalezu++;
            }
        }
    }
    $body += $nalezu * 40;

    // N4: jak daleko je podíl tmavých modulů od poloviny
    $tmavych = 0;
    foreach ($m as $radek) {
        $tmavych += array_sum($radek);
    }
    $vsech = $n * $n;
    $k = (int)abs((int)ceil($tmavych * 100 / $vsech / 5) - 10);
    $body += $k * 10;

    return $body;
}

/** Postaví matici s danou maskou (bez výběru). */
function qrMaticeSMaskou(array $kodovaSlova, int $verze, int $maska): array
{
    [$m, $rez] = qrPevneVzory($verze);
    // Formát se nejdřív jen rezervuje (hodnoty se přepíšou na konci),
    // aby se do jeho míst nenasypala data a nesáhla na ně maska.
    qrZapisFormat($m, $rez, $verze, $maska);
    qrZapisVerzi($m, $rez, $verze);
    qrZapisData($m, $rez, $kodovaSlova, $verze);
    qrPouzijMasku($m, $rez, $maska);
    qrZapisFormat($m, $rez, $verze, $maska);
    return $m;
}

function qrNejlepsiMaska(array $kodovaSlova, int $verze): int
{
    $nejlepsi = 0;
    $nejnizsi = PHP_INT_MAX;
    for ($maska = 0; $maska < 8; $maska++) {
        $skore = qrTrestneSkore(qrMaticeSMaskou($kodovaSlova, $verze, $maska));
        if ($skore < $nejnizsi) {
            $nejnizsi = $skore;
            $nejlepsi = $maska;
        }
    }
    return $nejlepsi;
}

function qrMatice(array $kodovaSlova, int $verze, ?int $maska = null): array
{
    if ($maska === null) {
        $maska = qrNejlepsiMaska($kodovaSlova, $verze);
    }
    return qrMaticeSMaskou($kodovaSlova, $verze, $maska);
}
