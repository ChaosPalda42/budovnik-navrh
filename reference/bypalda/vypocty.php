<?php
// Kontrakt C-103 – lib/vypocty.php: součty dokladu.
// Samostatný soubor bez závislostí, jen globální funkce.
// Peníze jsou celá čísla v halířích, množství může být desetinné.
declare(strict_types=1);

/**
 * Součet jednoho řádku dokladu v halířích.
 * Chybějící 'mnozstvi' nebo 'cena' se bere jako 0.
 */
function soucetPolozky(array $polozka): int
{
    $mnozstvi = $polozka['mnozstvi'] ?? 0;
    $cena = $polozka['cena'] ?? 0;

    return (int) round((float) $mnozstvi * (float) $cena);
}

/**
 * Součty celého dokladu.
 *
 * @param array<int,array<string,mixed>> $polozky
 * @return array{zaklad:int,dph:int,celkem:int,sazby:array<int,array{zaklad:int,dph:int}>}
 */
function souctyDokladu(array $polozky, bool $platceDph): array
{
    $zaklad = 0;
    $dph = 0;
    $sazby = [];

    foreach ($polozky as $polozka) {
        $radek = soucetPolozky($polozka);
        $zaklad += $radek;

        if (!$platceDph) {
            continue;
        }

        $sazba = (int) ($polozka['dph'] ?? 0);
        $dphRadku = (int) round($radek * $sazba / 100);
        $dph += $dphRadku;

        if (!isset($sazby[$sazba])) {
            $sazby[$sazba] = ['zaklad' => 0, 'dph' => 0];
        }
        $sazby[$sazba]['zaklad'] += $radek;
        $sazby[$sazba]['dph'] += $dphRadku;
    }

    if (!$platceDph) {
        $sazby = [];
    } else {
        ksort($sazby);
    }

    return [
        'zaklad' => $zaklad,
        'dph' => $dph,
        'celkem' => $zaklad + $dph,
        'sazby' => $sazby,
    ];
}
