<?php
// Kontrakt C-108 – tabulky a vzorečky z normy QR pro úroveň opravy M
// (verze 1 až 20, bajtový režim). Samostatný soubor, bez závislostí.
declare(strict_types=1);

/**
 * Hrana symbolu v modulech: 4 * verze + 17.
 */
function qrVelikost(int $verze): int
{
    return 4 * $verze + 17;
}

/**
 * Celkový počet kódových slov (data + opravné kódy) pro verzi 1–20, úroveň M.
 * Mimo rozsah vrací 0.
 */
function qrCelkemKodu(int $verze): int
{
    $t = [26, 44, 70, 100, 134, 172, 196, 242, 292, 346, 404, 466, 532, 581, 655, 733, 815, 901, 991, 1085];
    if ($verze < 1 || $verze > 20) {
        return 0;
    }
    return $t[$verze - 1];
}

/**
 * Počet opravných kódů celkem pro verzi 1–20, úroveň M. Mimo rozsah vrací 0.
 */
function qrEcKodu(int $verze): int
{
    $t = [10, 16, 26, 36, 48, 64, 72, 88, 110, 130, 150, 176, 198, 216, 240, 280, 308, 338, 364, 416];
    if ($verze < 1 || $verze > 20) {
        return 0;
    }
    return $t[$verze - 1];
}

/**
 * Počet bloků pro verzi 1–20, úroveň M. Mimo rozsah vrací 0.
 */
function qrBloku(int $verze): int
{
    $t = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16];
    if ($verze < 1 || $verze > 20) {
        return 0;
    }
    return $t[$verze - 1];
}

/**
 * Rozdělení na bloky v pořadí: každý blok jako ['dat' => int, 'ec' => int].
 * Prvních (bloku - celkem % bloku) bloků má dat1 datových kódů, zbytek dat1 + 1.
 * Opravných kódů je na blok stejně: intdiv(celkem, bloku) - dat1.
 * Mimo rozsah vrací prázdné pole.
 *
 * @return list<array{dat: int, ec: int}>
 */
function qrRozdeleniBloku(int $verze): array
{
    $celkem = qrCelkemKodu($verze);
    $ecCelkem = qrEcKodu($verze);
    $bloku = qrBloku($verze);
    if ($celkem === 0 || $ecCelkem === 0 || $bloku === 0) {
        return [];
    }
    $vDruhSkupine = $celkem % $bloku;
    $vPrvniSkupine = $bloku - $vDruhSkupine;
    $dat1 = intdiv($celkem - $ecCelkem, $bloku);
    $dat2 = $dat1 + 1;
    $ec = intdiv($celkem, $bloku) - $dat1;

    $bloky = [];
    for ($i = 0; $i < $bloku; $i++) {
        $bloky[] = ['dat' => $i < $vPrvniSkupine ? $dat1 : $dat2, 'ec' => $ec];
    }
    return $bloky;
}

/**
 * Souřadnice středů zarovnávacích vzorů vzestupně. Verze 1 → prázdné pole.
 *
 * @return list<int>
 */
function qrZarovnani(int $verze): array
{
    if ($verze < 2) {
        return [];
    }
    $pocet = intdiv($verze, 7) + 2;
    $velikost = qrVelikost($verze);
    $krok = ($velikost === 145) ? 26 : ((int)ceil(($velikost - 13) / (2 * $pocet - 2))) * 2;

    $souradnice = [$velikost - 7];
    for ($i = 1; $i < $pocet - 1; $i++) {
        $souradnice[] = $souradnice[count($souradnice) - 1] - $krok;
    }
    $souradnice = array_reverse($souradnice);
    array_unshift($souradnice, 6);
    return $souradnice;
}

/**
 * 15 bitů informace o formátu (úroveň M, maska 0–7): BCH přes polynom
 * 0b10100110111, výsledek XOR maska 0b101010000010010.
 */
function qrFormatBity(int $maska): int
{
    $data = (0b00 << 3) | ($maska & 0b111);
    $hodnota = $data << 10;
    $generator = 0b10100110111;
    // dělení polynomem v GF(2): zbytek po dělení generátorem
    for ($i = 14; $i >= 10; $i--) {
        if (($hodnota & (1 << $i)) !== 0) {
            $hodnota ^= $generator << ($i - 10);
        }
    }
    return (($data << 10) | $hodnota) ^ 0b101010000010010;
}

/**
 * 18 bitů informace o verzi; pro verze < 7 vrací 0.
 * Verze << 12 plus zbytek po dělení polynomem 0b1111100100101.
 */
function qrVerzeBity(int $verze): int
{
    if ($verze < 7) {
        return 0;
    }
    $hodnota = $verze << 12;
    $generator = 0b1111100100101;
    // stupeň generátoru je 12
    for ($i = 17; $i >= 12; $i--) {
        if (($hodnota & (1 << $i)) !== 0) {
            $hodnota ^= $generator << ($i - 12);
        }
    }
    return ($verze << 12) | $hodnota;
}

/**
 * Nejmenší verze 1–20, do které se v bajtovém režimu vejde $bajtu bajtů.
 * Hlavička: 4 bity režimu + 8 bitů délka (verze 1–9) / 16 bitů (verze 10–20).
 * Když se údaj nevejde do žádné verze, vrací 0.
 */
function qrNejmensiVerze(int $bajtu): int
{
    for ($verze = 1; $verze <= 20; $verze++) {
        $hlavickaBitu = 4 + ($verze <= 9 ? 8 : 16);
        $kapacitaBitu = (qrCelkemKodu($verze) - qrEcKodu($verze)) * 8;
        if ($hlavickaBitu + $bajtu * 8 <= $kapacitaBitu) {
            return $verze;
        }
    }
    return 0;
}
