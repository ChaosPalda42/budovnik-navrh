<?php
// Kontrakt C-105 – lib/ico.php: kontrola IČO a DIČ.
// Samostatný soubor bez závislostí, jen globální funkce.
declare(strict_types=1);

/**
 * Nechá v textu jen cifry a doplní zleva nuly na 8 znaků.
 * Když v textu není žádná cifra, vrátí prázdný řetězec.
 * Když je cifer víc než 8, vrátí je bez doplňování.
 */
function normalizujIco(string $ico): string
{
    $cifry = preg_replace('/\D+/', '', $ico) ?? '';

    if ($cifry === '') {
        return '';
    }

    return str_pad($cifry, 8, '0', STR_PAD_LEFT);
}

/**
 * Kontrola IČO podle české normy (váhy 8,7,6,5,4,3,2).
 * Po normalizaci musí být přesně 8 cifer, jinak neplatí.
 */
function platneIco(string $ico): bool
{
    $normalizovane = normalizujIco($ico);

    if (strlen($normalizovane) !== 8) {
        return false;
    }

    $vaha = 8;
    $soucet = 0;
    for ($i = 0; $i < 7; $i++) {
        $soucet += (int) $normalizovane[$i] * $vaha;
        $vaha--;
    }

    $c = $soucet % 11;
    if ($c === 0) {
        $ocekavana = 1;
    } elseif ($c === 1) {
        $ocekavana = 0;
    } else {
        $ocekavana = 11 - $c;
    }

    return (int) $normalizovane[7] === $ocekavana;
}

/**
 * Kontrola DIČ: předpona CZ (velká i malá písmena, kolem ní mezery)
 * a za ní 8 až 10 cifer. Osm cifer musí projít kontrolou IČO,
 * devět nebo deset cifer (rodné číslo) se bere jako platné.
 */
function platneDic(string $dic): bool
{
    if (preg_match('/^\s*[cC][zZ]\s*(\d{8,10})\s*$/', $dic, $mezery) !== 1) {
        return false;
    }

    $cislo = $mezery[1];

    if (strlen($cislo) === 8) {
        return platneIco($cislo);
    }

    return true;
}
