<?php
declare(strict_types=1);

/**
 * Nahradí každou značku {klic} hodnotou z $udaje. Chybějící nebo prázdná
 * hodnota se nahradí '……' (dva znaky U+2026). Hodnoty se dosazují tak,
 * jak jsou, a znovu se neprohledávají.
 */
function vyplnVzor(string $vzor, array $udaje): string
{
    return preg_replace_callback(
        '/\{([a-z0-9_]+)\}/',
        function (array $m) use ($udaje): string {
            $klic = $m[1];
            $hodnota = $udaje[$klic] ?? null;
            if (is_string($hodnota) && trim($hodnota) !== '') {
                return $hodnota;
            }
            return '……';
        },
        $vzor
    ) ?? $vzor;
}

/**
 * Seznam značek použitých ve vzoru (bez závorek), v pořadí prvního výskytu
 * a bez opakování.
 */
function znackyVeVzoru(string $vzor): array
{
    if (!preg_match_all('/\{([a-z0-9_]+)\}/', $vzor, $m)) {
        return [];
    }
    return array_values(array_unique($m[1]));
}

/**
 * Značky ze vzoru, pro které v $udaje není hodnota nebo je prázdná.
 */
function chybejiciZnacky(string $vzor, array $udaje): array
{
    $chybejici = [];
    foreach (znackyVeVzoru($vzor) as $klic) {
        $hodnota = $udaje[$klic] ?? null;
        if (!is_string($hodnota) || trim($hodnota) === '') {
            $chybejici[] = $klic;
        }
    }
    return $chybejici;
}
