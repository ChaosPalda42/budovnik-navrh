<?php
// Kontrakt C-112 – lib/ares.php: převod odpovědi rejstříku ARES (MF)
// na políčka, která má CRM u klienta. Žádné volání po síti – vstupem je
// už hotové pole z json_decode.
declare(strict_types=1);

/**
 * PSČ na čitelný tvar: 17000 (int i string) → '170 00'.
 * Co nemá přesně 5 číslic (prázdné, null, nesmysl) → ''.
 */
function aresPsc($psc): string
{
    if (is_int($psc) || is_string($psc)) {
        $text = (string)$psc;
        if (preg_match('/^\d{5}$/', $text) === 1) {
            return substr($text, 0, 3) . ' ' . substr($text, 3, 2);
        }
    }
    return '';
}

/**
 * Jeden subjekt z ARESu na pole s klíči:
 * 'ico', 'nazev', 'dic', 'ulice', 'mesto', 'psc', 'zeme'.
 * Chybějící klíče nikde nechybí – vrací se prázdný řetězec.
 */
function aresSubjekt(array $data): array
{
    $sidlo = isset($data['sidlo']) && is_array($data['sidlo']) ? $data['sidlo'] : [];
    $dorucovaci = isset($data['adresaDorucovaci']) && is_array($data['adresaDorucovaci'])
        ? $data['adresaDorucovaci']
        : [];

    $ico = isset($data['ico']) ? (string)$data['ico'] : '';
    $nazev = isset($data['obchodniJmeno']) ? (string)$data['obchodniJmeno'] : '';
    $dic = isset($data['dic']) ? strtoupper(trim((string)$data['dic'])) : '';

    // ulice: oficiální řádek adresy, jinak sestaveno ze sídla
    $ulice = '';
    if (isset($dorucovaci['radekAdresy1']) && (string)$dorucovaci['radekAdresy1'] !== '') {
        $ulice = (string)$dorucovaci['radekAdresy1'];
    } else {
        $cisloDomovni = isset($sidlo['cisloDomovni']) ? (string)$sidlo['cisloDomovni'] : '';
        if ($cisloDomovni !== '') {
            $nazevUlice = isset($sidlo['nazevUlice']) ? trim((string)$sidlo['nazevUlice']) : '';
            $ulice = $nazevUlice !== '' ? $nazevUlice . ' ' . $cisloDomovni : 'č.p. ' . $cisloDomovni;
            $cisloOrientacni = isset($sidlo['cisloOrientacni']) ? (string)$sidlo['cisloOrientacni'] : '';
            if ($cisloOrientacni !== '') {
                $ulice .= '/' . $cisloOrientacni;
            }
        }
    }

    // mesto: poslední neprázdný řádek doručovací adresy bez PSČ zepředu,
    // jinak název obce ze sídla
    $mesto = '';
    $posledni = '';
    foreach (['radekAdresy1', 'radekAdresy2', 'radekAdresy3'] as $radek) {
        if (isset($dorucovaci[$radek]) && (string)$dorucovaci[$radek] !== '') {
            $posledni = (string)$dorucovaci[$radek];
        }
    }
    if ($posledni !== '') {
        // pět číslic (klidně s mezerou uvnitř) a mezery za nimi
        $mesto = preg_replace('/^\d{3}\s?\d{2}\s*/', '', $posledni);
    } elseif (isset($sidlo['nazevObce'])) {
        $mesto = (string)$sidlo['nazevObce'];
    }

    $psc = aresPsc(isset($sidlo['psc']) ? $sidlo['psc'] : null);
    $zeme = isset($sidlo['kodStatu']) && (string)$sidlo['kodStatu'] !== ''
        ? (string)$sidlo['kodStatu']
        : 'CZ';

    return [
        'ico' => $ico,
        'nazev' => $nazev,
        'dic' => $dic,
        'ulice' => $ulice,
        'mesto' => $mesto,
        'psc' => $psc,
        'zeme' => $zeme,
    ];
}

/**
 * Z odpovědi vyhledávání udělá seznam subjektů (aresSubjekt na každého).
 * Když klíč chybí nebo není pole, vrátí prázdné pole.
 */
function aresSeznam(array $odpoved): array
{
    if (!isset($odpoved['ekonomickeSubjekty']) || !is_array($odpoved['ekonomickeSubjekty'])) {
        return [];
    }
    $seznam = [];
    foreach ($odpoved['ekonomickeSubjekty'] as $subjekt) {
        if (is_array($subjekt)) {
            $seznam[] = aresSubjekt($subjekt);
        }
    }
    return $seznam;
}
