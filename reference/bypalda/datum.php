<?php
// Kontrakt C-102 – lib/datum.php: datumy a periody fakturace.
// Datumy v databázi jsou texty 'RRRR-MM-DD', časy 'RRRR-MM-DD HH:MM:SS'.
declare(strict_types=1);

function datumZona(): DateTimeZone
{
    return new DateTimeZone('Europe/Prague');
}

function dnes(): string
{
    return (new DateTimeImmutable('now', datumZona()))->format('Y-m-d');
}

function nyni(): string
{
    return (new DateTimeImmutable('now', datumZona()))->format('Y-m-d H:i:s');
}

/**
 * Načte datum (případně i čas) z textu 'RRRR-MM-DD[ HH:MM:SS]'.
 * Vrací null, pokud text datum neobsahuje.
 */
function datumParse(?string $iso): ?DateTimeImmutable
{
    if ($iso === null || trim($iso) === '') {
        return null;
    }
    $text = trim($iso);
    $formaty = ['Y-m-d H:i:s', 'Y-m-d H:i', 'Y-m-d'];
    foreach ($formaty as $format) {
        $dt = DateTimeImmutable::createFromFormat($format, $text, datumZona());
        if ($dt instanceof DateTimeImmutable) {
            return $dt->setTimezone(datumZona());
        }
    }
    return null;
}

function datumCz(?string $iso): string
{
    $dt = datumParse($iso);
    if ($dt === null) {
        return '';
    }
    return sprintf(
        '%d. %d. %d',
        (int) $dt->format('j'),
        (int) $dt->format('n'),
        (int) $dt->format('Y')
    );
}

function datumCasCz(?string $iso): string
{
    $dt = datumParse($iso);
    if ($dt === null) {
        return '';
    }
    $den = sprintf(
        '%d. %d. %d',
        (int) $dt->format('j'),
        (int) $dt->format('n'),
        (int) $dt->format('Y')
    );
    // Když vstup nemá čas, vrátí jen datum.
    if (!str_contains($iso ?? '', ':')) {
        return $den;
    }
    return $den . ' ' . $dt->format('H:i');
}

function posunDatum(string $iso, int $dni): string
{
    $dt = datumParse($iso);
    if ($dt === null) {
        return '';
    }
    return $dt->modify(sprintf('%+d days', $dni))->format('Y-m-d');
}

/**
 * Počet dní v měsíci daného roku/měsíce.
 */
function pocetDniMesice(int $rok, int $mesic): int
{
    return (int) cal_days_in_month(CAL_GREGORIAN, $mesic, $rok);
}

function posunMesice(string $iso, int $mesicu): string
{
    $dt = datumParse($iso);
    if ($dt === null) {
        return '';
    }
    $rok = (int) $dt->format('Y');
    $mesic = (int) $dt->format('n');
    $den = (int) $dt->format('j');

    $celkem = $rok * 12 + ($mesic - 1) + $mesicu;
    $novyRok = intdiv($celkem, 12);
    $novyMesic = (($celkem % 12) + 12) % 12 + 1;
    // Nikdy nepřetéct do dalšího měsíce: den oříznout na poslední den cíle.
    $novyDen = min($den, pocetDniMesice($novyRok, $novyMesic));

    return sprintf('%04d-%02d-%02d', $novyRok, $novyMesic, $novyDen);
}

function periodaMesicu(string $perioda): int
{
    switch ($perioda) {
        case 'mesicne':
            return 1;
        case 'ctvrtletne':
            return 3;
        case 'pololetne':
            return 6;
        case 'rocne':
            return 12;
        default:
            return 0;
    }
}

function dalsiFakturace(string $odIso, string $perioda, int $denFakturace): string
{
    $mesice = periodaMesicu($perioda);
    if ($mesice === 0) {
        return '';
    }
    $posunuty = posunMesice($odIso, $mesice);
    if ($posunuty === '') {
        return '';
    }
    $rok = (int) substr($posunuty, 0, 4);
    $mesic = (int) substr($posunuty, 5, 2);
    $den = max(1, min($denFakturace, pocetDniMesice($rok, $mesic)));
    return sprintf('%04d-%02d-%02d', $rok, $mesic, $den);
}

function zbyvaDni(?string $iso): ?int
{
    $dt = datumParse($iso);
    if ($dt === null) {
        return null;
    }
    $dnes = new DateTimeImmutable(dnes() . ' 00:00:00', datumZona());
    $cil = $dt->setTime(0, 0);
    return (int) $dnes->diff($cil)->format('%r%a');
}

function lhutaText(?string $iso): string
{
    $dny = zbyvaDni($iso);
    if ($dny === null) {
        return '';
    }
    if ($dny === 0) {
        return 'dnes';
    }
    if ($dny === 1) {
        return 'zítra';
    }
    if ($dny >= 2 && $dny <= 4) {
        return sprintf('za %d dny', $dny);
    }
    if ($dny >= 5) {
        return sprintf('za %d dní', $dny);
    }
    if ($dny === -1) {
        return 'po termínu o 1 den';
    }
    if ($dny >= -4) {
        return sprintf('po termínu o %d dny', abs($dny));
    }
    return sprintf('po termínu o %d dní', abs($dny));
}
