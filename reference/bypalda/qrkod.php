<?php
// Kontrakt C-111 – lib/qrkod.php: hotový QR kód jako SVG obrázek.
//
// Vykresluje matici z lib/qr/matice.php do SVG: jeden <rect> na každý
// tmavý modul, klidová zóna, volitelné pozadí a volitelná značka uprostřed
// (jen pro dostatečně velké kódy – malé by značka znečitelna, viz
// site/scripts/qr-znacka-kontrola.php). Samotný text PLATBY se do SVG
// nikdy nevypisuje – putuje výš do modulů, ne do HTML.
//
// Samostatný soubor bez závislostí na aplikaci, jen globální funkce.
declare(strict_types=1);

require_once __DIR__ . '/qr/gf.php';
require_once __DIR__ . '/qr/tabulky.php';
require_once __DIR__ . '/qr/bity.php';
require_once __DIR__ . '/qr/matice.php';

/**
 * QR kód jako SVG (bajtový režim, úroveň opravy M).
 *
 * Volby:
 *  - 'velikost' strana obrázku v pixelech (výchozí 180),
 *  - 'okraj'    klidová zóna v modulech (výchozí 4),
 *  - 'barva'    barva tmavých modulů (výchozí '#000000'),
 *  - 'pozadi'   barva podkladu (výchozí '#ffffff'; prázdný řetězec = bez podkladu),
 *  - 'znacka'   krátký text doprostřed (výchozí '' = bez značky). Značka se
 *               kreslí jen pro matice od 33 modulů (verze 4+) – menší kódy
 *               by ji svými opravnými kódy neunesly a přestaly by se číst.
 *
 * Když je text prázdný nebo se nevejde do žádné verze, vrací ''.
 */
function qrSvg(string $text, array $volby = []): string
{
    if ($text === '') {
        return '';
    }
    $verze = qrNejmensiVerze(strlen($text));
    if ($verze === 0) {
        return '';
    }

    $velikost = (int) ($volby['velikost'] ?? 180);
    $okraj = (int) ($volby['okraj'] ?? 4);
    $barva = (string) ($volby['barva'] ?? '#000000');
    $pozadi = (string) ($volby['pozadi'] ?? '#ffffff');
    $znacka = (string) ($volby['znacka'] ?? '');

    // Číslo do SVG: nejvýš dvě desetinná místa, zbytečné nuly nesmí zůstat.
    $cislo = static function (float $hodnota): string {
        $s = number_format($hodnota, 2, '.', '');
        return rtrim(rtrim($s, '0'), '.');
    };

    $kodovaSlova = qrKodovaSlova($text, $verze);
    $m = qrMatice($kodovaSlova, $verze);

    $nMatice = count($m);
    $n = $nMatice + 2 * $okraj;

    $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' . $velikost . '" height="' . $velikost
        . '" viewBox="0 0 ' . $n . ' ' . $n . '" shape-rendering="crispEdges"'
        . ' role="img" aria-label="QR kód pro platbu">';

    if ($pozadi !== '') {
        $svg .= '<rect width="' . $n . '" height="' . $n . '" fill="' . $pozadi . '"/>';
    }

    // Tmavé moduly: jeden <rect> za každý, po řádcích odshora.
    foreach ($m as $radek => $sloupce) {
        foreach ($sloupce as $sloupec => $tmavy) {
            if ($tmavy === 1) {
                $svg .= '<rect x="' . ($sloupec + $okraj) . '" y="' . ($radek + $okraj)
                    . '" width="1" height="1" fill="' . $barva . '"/>';
            }
        }
    }

    // Značka uprostřed – jen kódy, které ji opravnými kódy unesou (verze 4+).
    if ($znacka !== '' && $nMatice >= 33) {
        $strana = (int) round($nMatice * 0.2);
        if ($strana % 2 === 0) {
            $strana++; // lichá strana, ať je pole přesně vycentrované
        }
        $x = $okraj + intdiv($nMatice - $strana, 2);
        $y = $x;
        $stred = $x + $strana / 2;
        $vypln = $pozadi !== '' ? $pozadi : '#ffffff';

        $svg .= '<rect x="' . $x . '" y="' . $y . '" width="' . $strana . '" height="' . $strana
            . '" rx="0.6" fill="' . $vypln . '" stroke="' . $barva . '" stroke-width="0.12"/>';
        $svg .= '<text x="' . $cislo($stred) . '" y="' . $cislo($stred)
            . '" text-anchor="middle" dominant-baseline="central"'
            . ' font-family="system-ui, sans-serif" font-weight="700"'
            . ' font-size="' . $cislo($strana * 0.46) . '" fill="' . $barva . '">'
            . htmlspecialchars($znacka, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
            . '</text>';
    }

    return $svg . '</svg>';
}
