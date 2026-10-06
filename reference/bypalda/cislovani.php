<?php
// ---------------------------------------------------------------------------
// Číslování dokladů (C-104).
//
// Formát čísla se dá změnit v nastavení, proto se skládá ze zástupných značek:
//   {rok}      4 cifry roku          (2026)
//   {rok2}     2 cifry roku          (26)
//   {mesic}    2 cifry měsíce        (09)
//   {poradi}   pořadí bez doplňování  (7)
//   {poradi2}..{poradi5}
//              pořadí doplněné nulami zleva na danou délku (0007);
//              když je pořadí delší, NEZKRACUJE se ({poradi3} + 1234 = 1234).
// Text kolem značek se opíše, např. 'NAB{rok}{poradi3}' -> 'NAB2026007'.
//
// Z hotového čísla se zpátky přečte pořadí (poradiZCisla) a rok (rokZCisla),
// aby aplikace věděla, jaké číslo dát další v řadě.
// ---------------------------------------------------------------------------
declare(strict_types=1);

/** Zástupné značky, které umíme číst i zpátky. */
const CISLOVANI_ZNACKY = '(rok2|rok|mesic|poradi[2-5]?)';

/**
 * Doplní značky formátu podle data a pořadí.
 *
 * @param string $format  např. 'NAB{rok}{poradi3}'
 * @param string $datum   'RRRR-MM-DD'
 * @param int    $poradi  pořadí dokladu v řadě
 */
function vyrobCislo(string $format, string $datum, int $poradi): string
{
    $rok = 0;
    $mesic = 1;
    if (preg_match('#^(\d{4})-(\d{2})-\d{2}$#', $datum, $m) === 1) {
        $rok = (int)$m[1];
        $mesic = (int)$m[2];
    }

    return (string)preg_replace_callback(
        '/\{' . CISLOVANI_ZNACKY . '\}/',
        static function (array $m) use ($rok, $mesic, $poradi): string {
            switch ($m[1]) {
                case 'rok':
                    return sprintf('%04d', $rok);
                case 'rok2':
                    return sprintf('%02d', $rok % 100);
                case 'mesic':
                    return sprintf('%02d', $mesic);
                case 'poradi':
                    return (string)$poradi;
                default: // poradi2 az poradi5 – str_pad vetsi poradi nezkracuje
                    return str_pad((string)$poradi, (int)substr($m[1], 6), '0', STR_PAD_LEFT);
            }
        },
        $format
    );
}

/**
 * Z formátu sestaví regulární výraz a mapu značek na čísla capture skupin.
 * Text mimo značky se musí shodovat přesně, {poradi*} je skupina cifer
 * (i víc cifer, protože velké pořadí se nezkracuje).
 *
 * @return ?array{regex: string, skupiny: array<string,int>}  null když se regex nepodařilo sestavit
 */
function _cislovaniRozbor(string $format): ?array
{
    $regex = '';
    $skupiny = [];
    $offset = 0;
    $poradiSkupin = 0;
    while (
        preg_match(
            '/\{' . CISLOVANI_ZNACKY . '\}/',
            $format,
            $m,
            PREG_OFFSET_CAPTURE,
            $offset
        ) === 1
    ) {
        $zacatek = (int)$m[0][1];
        $regex .= preg_quote(substr($format, $offset, $zacatek - $offset), '#');
        $znacka = (string)$m[1][0];
        switch ($znacka) {
            case 'rok':
                $regex .= '(\\d{4})';
                $skupiny += ['rok' => ++$poradiSkupin];
                break;
            case 'rok2':
                $regex .= '(\\d{2})';
                $skupiny += ['rok2' => ++$poradiSkupin];
                break;
            case 'mesic':
                $regex .= '(\\d{2})';
                $skupiny += ['mesic' => ++$poradiSkupin];
                break;
            default: // poradi, poradi2..poradi5
                $regex .= '(\\d+)';
                $skupiny += ['poradi' => ++$poradiSkupin];
                break;
        }
        $offset = $zacatek + strlen($m[0][0]);
    }
    $regex .= preg_quote(substr($format, $offset), '#');

    $regex = '#^' . $regex . '$#u';
    if (@preg_match($regex, '') === false) {
        return null;
    }
    return ['regex' => $regex, 'skupiny' => $skupiny];
}

/**
 * Shoduje číslo s formátem; vrátí capture skupiny, nebo null když neodpovídá.
 *
 * @return ?array<int,string>
 */
function _cislovaniMatch(string $cislo, string $format): ?array
{
    $rozbor = _cislovaniRozbor($format);
    if ($rozbor === null) {
        return null;
    }
    if (preg_match($rozbor['regex'], $cislo, $m) !== 1) {
        return null;
    }
    return $m;
}

/**
 * Přečte pořadí z hotového čísla. Null, když číslo formátu neodpovídá
 * (nebo formát nemá značku pro pořadí).
 */
function poradiZCisla(string $cislo, string $format): ?int
{
    $rozbor = _cislovaniRozbor($format);
    if ($rozbor === null || !array_key_exists('poradi', $rozbor['skupiny'])) {
        return null;
    }
    $m = _cislovaniMatch($cislo, $format);
    if ($m === null) {
        return null;
    }
    return (int)$m[$rozbor['skupiny']['poradi']];
}

/**
 * Přečte rok z hotového čísla (u {rok2} přičte 2000).
 * Null, když formát rok neobsahuje nebo číslo formátu neodpovídá.
 */
function rokZCisla(string $cislo, string $format): ?int
{
    $rozbor = _cislovaniRozbor($format);
    if ($rozbor === null) {
        return null;
    }
    if (array_key_exists('rok', $rozbor['skupiny'])) {
        $skupina = $rozbor['skupiny']['rok'];
        $zaklad = 0;
    } elseif (array_key_exists('rok2', $rozbor['skupiny'])) {
        $skupina = $rozbor['skupiny']['rok2'];
        $zaklad = 2000;
    } else {
        return null;
    }
    $m = _cislovaniMatch($cislo, $format);
    if ($m === null) {
        return null;
    }
    return $zaklad + (int)$m[$skupina];
}
