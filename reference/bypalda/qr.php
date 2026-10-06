<?php
// Kontrakt C-106 – lib/qr.php: IBAN z běžného českého čísla účtu a text
// pro QR platbu podle standardu SPD 1.0.
// Samostatný soubor bez závislostí, jen globální funkce.
declare(strict_types=1);

/**
 * Z českého čísla účtu „předčíslí-číslo/kód banky“ vyrobí IBAN (CZ + kontrola + BBAN,
 * 24 znaků bez mezer). Kontrolní dvojčíslí podle ISO 7064 mod 97-10.
 * Mezery a pomlčky ve vstupu se ignorují. Když vstup už je IBAN
 * (začíná „CZ“ a po odstranění mezer má 24 znaků), vrátí ho bez mezer.
 * Když ve vstupu chybí lomítko s kódem banky nebo číslo účtu, vrátí ''.
 */
function iban(string $ucet): string
{
    // Nejdřív mezery: možná už máme hotový IBAN.
    $bezMezer = preg_replace('/\s+/', '', $ucet) ?? '';

    if (strlen($bezMezer) === 24 && str_starts_with($bezMezer, 'CZ')) {
        return $bezMezer;
    }

    // Běžný účet: [předčíslí-]číslo/kód banky (mezery už odstraněné).
    if (preg_match('#^(?:(\d{1,6})-)?(\d{1,10})/(\d{1,4})$#', $bezMezer, $f) !== 1) {
        return '';
    }

    $predcisli = str_pad($f[1] ?? '', 6, '0', STR_PAD_LEFT);
    $cislo = str_pad($f[2], 10, '0', STR_PAD_LEFT);
    $kodBanky = str_pad($f[3], 4, '0', STR_PAD_LEFT);

    $bban = $kodBanky . $predcisli . $cislo;

    // ISO 7064 mod 97-10: BBAN + „CZ00“ přeložené na cifry (C=12, Z=35).
    $retezec = $bban . '1235' . '00';
    $zbytek = 0;
    for ($i = 0, $delka = strlen($retezec); $i < $delka; $i++) {
        $zbytek = ($zbytek * 10 + (int) $retezec[$i]) % 97;
    }
    $kontrola = sprintf('%02d', 98 - $zbytek);

    return 'CZ' . $kontrola . $bban;
}

/**
 * Text pro QR platbu podle standardu SPD 1.0. Klíče vstupu:
 * 'ucet' (jako pro iban()), 'castka' (int, haléře), 'vs',
 * 'splatnost' ('RRRR-MM-DD'), 'zprava'.
 * Když se nepodaří vyrobit IBAN (nebo účet chybí), vrátí ''.
 */
function qrPlatbaText(array $d): string
{
    $ucet = iban((string) ($d['ucet'] ?? ''));

    if ($ucet === '') {
        return '';
    }

    $castky = ['SPD*1.0*ACC:' . $ucet];

    $castka = (int) ($d['castka'] ?? 0);
    if ($castka > 0) {
        $castky[] = '*AM:' . intdiv($castka, 100) . '.' . sprintf('%02d', $castka % 100);
        $castky[] = '*CC:CZK';
    }

    $vs = trim((string) ($d['vs'] ?? ''));
    if ($vs !== '') {
        $castky[] = '*X-VS:' . $vs;
    }

    $splatnost = trim((string) ($d['splatnost'] ?? ''));
    if ($splatnost !== '') {
        $castky[] = '*DT:' . preg_replace('/\D+/', '', $splatnost);
    }

    $zprava = (string) ($d['zprava'] ?? '');
    if ($zprava !== '') {
        // Bez diakritiky, hvězdičky na mezery, sešrotovat opakované mezery,
        // oříznout a zkrátit na 60 znaků; useknutý konce mezerů oříznout znovu.
        // Nahrazujeme i nerozpoznané mezeryové znaky (NBSP apod.).
        $cista = preg_replace('/\s+/u', ' ', str_replace('*', ' ', czBezDiakritiky($zprava))) ?? '';
        $cista = preg_replace('/[^\P{Z}\ ]+/u', ' ', $cista) ?? '';
        $castky[] = '*MSG:' . rtrim(mb_substr(trim($cista), 0, 60));
    }

    return implode('', $castky);
}

/**
 * Z textu odstraní českou diakritiku (pro MSG, které QR čte v ASCII).
 */
function czBezDiakritiky(string $text): string
{
    return strtr($text, [
        'á' => 'a', 'č' => 'c', 'ď' => 'd', 'é' => 'e', 'ě' => 'e', 'í' => 'i',
        'ň' => 'n', 'ó' => 'o', 'ř' => 'r', 'š' => 's', 'ť' => 't', 'ú' => 'u',
        'ů' => 'u', 'ý' => 'y', 'ž' => 'z',
        'Á' => 'A', 'Č' => 'C', 'Ď' => 'D', 'É' => 'E', 'Ě' => 'E', 'Í' => 'I',
        'Ň' => 'N', 'Ó' => 'O', 'Ř' => 'R', 'Š' => 'S', 'Ť' => 'T', 'Ú' => 'U',
        'Ů' => 'U', 'Ý' => 'Y', 'Ž' => 'Z',
        // horní pomlčka (–) a další typografické znaménkové náhrady
        '–' => '-', '—' => '-', '‘' => "'", '’' => "'",
        '“' => '"', '”' => '"',
    ]);
}
