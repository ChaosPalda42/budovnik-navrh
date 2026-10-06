<?php

declare(strict_types=1);

/**
 * Z textu o rozpočtu, který napsal klient, udělá částku v haléřích.
 * Vrací 0, když se v textu nic přečíst nedá.
 */
function rozpocetHalere(string $text): int
{
    $text = trim($text);
    $text = str_replace(["\u{00A0}", "\u{202F}"], ' ', $text);
    $text = mb_strtolower($text, 'UTF-8');

    $pattern = '/\d+(?: \d{3})*(?:[.,]\d+)?/u';
    if (preg_match_all($pattern, $text, $m, PREG_OFFSET_CAPTURE) === false) {
        return 0;
    }
    $cisla = $m[0];
    if ($cisla === []) {
        return 0;
    }

    $jednotka = static function (array $cislo) use ($text): int {
        $zbytek = ltrim(substr($text, $cislo[1] + strlen($cislo[0])), ' ');
        // 'miliarda' začíná na 'mil', takže se musí poznat dřív než miliony.
        if (str_starts_with($zbytek, 'mld')
            || (str_starts_with($zbytek, 'mil') && str_starts_with(substr($zbytek, 3), 'iard'))) {
            return 1000000000;
        }
        if (str_starts_with($zbytek, 'mil')) {
            return 1000000;
        }
        if (str_starts_with($zbytek, 'tis')) {
            return 1000;
        }
        return 1;
    };

    $hodnota = (float) str_replace([' ', ','], ['', '.'], $cisla[0][0]);
    $vlastniJednotka = $jednotka($cisla[0]);

    if ($vlastniJednotka === 1 && isset($cisla[1])) {
        $druhaJednotka = $jednotka($cisla[1]);
        if ($druhaJednotka !== 1) {
            // „30–40 tis. Kč“ – jednotka se píše jednou, na konec, a platí pro obě meze.
            $vlastniJednotka = $druhaJednotka;
        } elseif ($hodnota > 0) {
            $druhaHodnota = (float) str_replace([' ', ','], ['', '.'], $cisla[1][0]);
            if ($druhaHodnota / $hodnota >= 100) {
                // „20–50 000“ – zkrácená spodní mez rozsahu, myšleno v tisících.
                $vlastniJednotka = 1000;
            }
        }
    }

    return (int) round($hodnota * $vlastniJednotka * 100);
}
