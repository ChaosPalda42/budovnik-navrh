<?php

// Kontrakt C-101 – Peníze v halířích.
// Samostatný soubor bez závislostí: převod částky z formuláře na haléře
// a český zápis peněz pro člověka.
declare(strict_types=1);

/**
 * Přečte částku, jak ji člověk napíše (nebo int/float v korunách),
 * a vrátí celé haléře.
 *
 * Ověří se, že vstup je platné číslo (s volitelnou minus/plus značkou),
 * aby se zabránilo zavádějícím výsledkům z řetězců jako "12abc34".
 */
function naHalere(string|int|float $vstup): int
{
    if (is_int($vstup)) {
        return $vstup * 100;
    }

    if (is_float($vstup)) {
        return (int) round($vstup * 100);
    }

    $s = $vstup;

    // Odstranění měny a mezer (včetně nezlomitelné U+00A0).
    $s = preg_replace('/kč|czk/iu', '', $s) ?? $s;
    $s = str_replace(["\u{00A0}", "\u{202F}", ' ', "\t", "\n", "\r"], '', $s);

    // Když v textu není žádná číslice, je to nesmysl -> 0.
    if (!preg_match('/\d/', $s)) {
        return 0;
    }

    // Celé číslo musí být rozpareované: "12abc34" je nesmysl, ne 1234.
    if (!preg_match('/^[+-]?(?:\d{1,3}(?:[.,]\d{3})+|\d+)(?:[.,]\d+)?$/', $s)) {
        return 0;
    }

    $negativni = str_starts_with($s, '-');

    if (str_contains($s, ',')) {
        // Čárka je desetinná oddělovačka (je-li jen jedna), tečky jsou tisíce.
        $s = str_replace('.', '', $s);
        $tecky = substr_count($s, ',');
        if ($tecky > 1) {
            $s = str_replace(',', '', $s); // víc čárek = oddělovače tisíců
        } else {
            $s = str_replace(',', '.', $s);
        }
    } elseif (substr_count($s, '.') > 1) {
        // Víc teček = oddělovače tisíců ('1.500.000').
        $s = str_replace('.', '', $s);
    }

    $s = ltrim($s, '+-');

    $casti = explode('.', $s, 2);
    $koruny = (int) ($casti[0] ?? '0');
    $desetinne = str_pad(substr($casti[1] ?? '', 0, 3), 3, '0');
    $halere = $koruny * 100 + (int) substr($desetinne, 0, 2);

    // Zaokrouhlení na celý haléř podle třetího desetinného místa.
    if ((int) $desetinne[2] >= 5) {
        $halere++;
    }

    return $negativni ? -$halere : $halere;
}

/**
 * Český zápis peněz: '15 000,50 Kč' (oddělovač tisíců je nezlomitelná mezera).
 * Celé koruny se píšou bez ',00'.
 */
function kc(int $halere, bool $sMenou = true): string
{
    $zaporna = $halere < 0;
    $abs = abs($halere);

    $koruny = intdiv($abs, 100);
    $hal = $abs % 100;

    $cislo = number_format($koruny, 0, ',', "\u{00A0}");
    if ($hal !== 0) {
        $cislo .= ',' . str_pad((string) $hal, 2, '0', STR_PAD_LEFT);
    }

    if ($zaporna) {
        $cislo = '-' . $cislo;
    }

    return $sMenou ? $cislo . ' Kč' : $cislo;
}

/**
 * Krátký zápis do dlaždic statistik:
 * do 100 000 Kč cele koruny, do 1 mil. tisíce, nad to miliony
 * na jedno desetinné místo (',0' se zahodí).
 */
function kcKratce(int $halere): string
{
    $absKoruny = intdiv(abs($halere), 100);

    if ($absKoruny < 100000) {
        return kc((int) round($halere / 100) * 100);
    }

    $predpona = $halere < 0 ? '-' : '';

    if ($absKoruny < 1000000) {
        $tisice = intdiv($absKoruny + 500, 1000);
        return $predpona . number_format($tisice, 0, ',', "\u{00A0}") . ' tis.';
    }

    $desetiny = intdiv($absKoruny + 50000, 100000);
    $text = number_format($desetiny / 10, 1, ',', "\u{00A0}");
    $text = preg_replace('/,0$/', '', $text) ?? $text;

    return $predpona . $text . ' mil.';
}
