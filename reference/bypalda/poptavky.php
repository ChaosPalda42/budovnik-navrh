<?php
// Kontrakt C-114 – co se dá z poptávky z webu vyčíst, než z ní vznikne
// klient a projekt. Samé čisté funkce: žádná databáze, žádné volání ARESu,
// nic se netiskne.
declare(strict_types=1);

/**
 * Převede klíč služby z formuláře na kategorii projektu v CRM.
 */
function poptavkaKategorie(string $sluzba): string
{
    $klic = mb_strtolower(trim($sluzba), 'UTF-8');
    return match ($klic) {
        'web' => 'web',
        'aplikace' => 'app',
        'ai' => 'ai',
        'automatizace' => 'auto',
        default => 'jine',
    };
}

/**
 * Název nového projektu: 'Služba – Kdo', bez pomlčky, když není nikdo.
 */
function poptavkaNazevProjektu(array $p): string
{
    $nazvy = [
        'web' => 'Web',
        'app' => 'Aplikace',
        'ai' => 'AI řešení',
        'auto' => 'Automatizace',
        'jine' => 'Poptávka',
    ];
    $sluzba = $nazvy[poptavkaKategorie((string)($p['sluzba'] ?? ''))];

    $kdo = trim((string)($p['firma'] ?? ''));
    if ($kdo === '') {
        $kdo = trim((string)($p['jmeno'] ?? ''));
    }
    if ($kdo === '') {
        return $sluzba;
    }
    return $sluzba . ' – ' . $kdo;
}

/**
 * Text, který se vloží do zadání projektu.
 */
function poptavkaZadani(array $p): string
{
    $zprava = trim((string)($p['zprava'] ?? ''));

    $sluzby = [
        'web' => 'Web',
        'aplikace' => 'Aplikace',
        'ai' => 'AI',
        'automatizace' => 'Automatizace',
        'jine' => 'Jiné / klient neví',
    ];
    $sluzba = $sluzby[mb_strtolower(trim((string)($p['sluzba'] ?? '')), 'UTF-8')] ?? null;

    $radky = [];
    $pridat = static function (string $popisek, string $hodnota) use (&$radky): void {
        if ($hodnota !== '') {
            $radky[] = $popisek . ': ' . $hodnota;
        }
    };
    $pridat('Kontakt', trim((string)($p['jmeno'] ?? '')));
    $pridat('E-mail', trim((string)($p['email'] ?? '')));
    $pridat('Telefon', trim((string)($p['telefon'] ?? '')));
    $pridat('Firma', trim((string)($p['firma'] ?? '')));
    if ($sluzba !== null) {
        $radky[] = 'Služba: ' . $sluzba;
    }
    $pridat('Rozpočet podle klienta', trim((string)($p['rozpocet'] ?? '')));
    $pridat('Odesláno ze stránky', trim((string)($p['stranka'] ?? '')));

    $casti = [];
    if ($zprava !== '') {
        $casti[] = $zprava;
    }
    $casti[] = "--- Z poptávky z webu ---\n" . implode("\n", $radky);
    return implode("\n\n", $casti);
}

/**
 * Podklady pro založení klienta z poptávky a (volitelně) z ARESu.
 */
function poptavkaKlientData(array $p, array $ares = []): array
{
    $firma = trim((string)($p['firma'] ?? ''));
    $jmeno = trim((string)($p['jmeno'] ?? ''));
    $aresNazev = trim((string)($ares['nazev'] ?? ''));

    $nazev = $aresNazev !== '' ? $aresNazev : ($firma !== '' ? $firma : $jmeno);

    return [
        'nazev' => $nazev,
        'typ' => ($firma !== '' || $ares !== []) ? 'firma' : 'osoba',
        'ico' => trim((string)($ares['ico'] ?? '')),
        'dic' => trim((string)($ares['dic'] ?? '')),
        'ulice' => trim((string)($ares['ulice'] ?? '')),
        'mesto' => trim((string)($ares['mesto'] ?? '')),
        'psc' => trim((string)($ares['psc'] ?? '')),
        'zeme' => trim((string)($ares['zeme'] ?? '')) !== '' ? trim((string)($ares['zeme'] ?? '')) : 'CZ',
        'email' => trim((string)($p['email'] ?? '')),
        'telefon' => trim((string)($p['telefon'] ?? '')),
        'web' => '',
        'stav' => 'potencialni',
        'zdroj' => 'web',
    ];
}

/**
 * Normalizace názvu klienta: malá písmena, skupiny bílých znaků jednou mezerou, ořez.
 */
function poptavkaNormalizaceNazvu(string $nazev): string
{
    $nizke = mb_strtolower($nazev, 'UTF-8');
    return trim((string)preg_replace('/\s+/u', ' ', $nizke));
}

/**
 * Najde id prvního klienta, který se shoduje (IČO, e-mail, název), jinak null.
 */
function poptavkaShodaKlienta(array $p, array $klienti, array $ares = []): ?int
{
    $ico = trim((string)($ares['ico'] ?? ''));
    if ($ico !== '') {
        foreach ($klienti as $klient) {
            if (trim((string)($klient['ico'] ?? '')) === $ico) {
                return (int)$klient['id'];
            }
        }
    }

    $email = mb_strtolower(trim((string)($p['email'] ?? '')), 'UTF-8');
    if ($email !== '') {
        foreach ($klienti as $klient) {
            if (mb_strtolower(trim((string)($klient['email'] ?? '')), 'UTF-8') === $email) {
                return (int)$klient['id'];
            }
        }
    }

    $aresNazev = trim((string)($ares['nazev'] ?? ''));
    $hledany = $aresNazev !== '' ? $aresNazev : trim((string)($p['firma'] ?? ''));
    if ($hledany !== '') {
        $hledany = poptavkaNormalizaceNazvu($hledany);
        foreach ($klienti as $klient) {
            if (poptavkaNormalizaceNazvu((string)($klient['nazev'] ?? '')) === $hledany) {
                return (int)$klient['id'];
            }
        }
    }

    return null;
}
