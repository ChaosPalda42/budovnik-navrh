<?php
// Kontrakt C-107 – počítání v Galoisově tělese GF(256) a Reed–Solomonovy
// opravné kódy pro QR kód. Samostatný soubor, bez závislostí.
//
// Pravidla podle normy QR: generátor (primitivní prvek) je 2,
// primitivní polynom je 0x11D (285). Tabulky mocnin a logaritmů
// se spočítají jednou (statická proměnná), ne při každém volání.
declare(strict_types=1);

/**
 * Tabulky mocnin a logaritmů v GF(256), spočítané jednou za běh.
 *
 * navratova hodnota: array{0: array<int,int>, 1: array<int,int>}
 * – [exp, log], kde exp[i] = 2^i a log[exp[i]] = i.
 *
 * @return array{0: array<int,int>, 1: array<int,int>}
 */
function gfTabulky(): array
{
    /** @var array{0: array<int,int>, 1: array<int,int>}|null $tabulky */
    static $tabulky = null;

    if ($tabulky === null) {
        /** @var array<int,int> $exp */
        $exp = array_fill(0, 256, 0);
        /** @var array<int,int> $log */
        $log = array_fill(0, 256, 0);

        $x = 1;
        for ($i = 0; $i < 256; $i++) {
            $exp[$i] = $x;
            // logaritmicka tabulka patri jen exponentum 0..254
            // (2^255 = 1 by prepislo log[1] = 0)
            if ($i < 255) {
                $log[$x] = $i;
            }
            $x <<= 1; // x * 2
            if ($x >= 256) {
                $x ^= 285; // primitivni polynom 0x11D
            }
        }

        $tabulky = [$exp, $log];
    }

    return $tabulky;
}

/**
 * 2 na $i v GF(256). Exponent se točí dokola po 255,
 * takže gfExp(258) == gfExp(3).
 */
function gfExp(int $i): int
{
    [$exp] = gfTabulky();
    $i %= 255;
    if ($i < 0) {
        $i += 255;
    }
    return $exp[$i];
}

/**
 * Diskrétní logaritmus v GF(256) – opačná funkce k gfExp().
 * Pro 0 vrací 0 (logaritmus nuly není definovaný).
 */
function gfLog(int $x): int
{
    $x &= 255;
    if ($x === 0) {
        return 0;
    }
    [, $log] = gfTabulky();
    return $log[$x];
}

/**
 * Násobení v GF(256) přes logaritmickou tabulku.
 * Když je některý činitel 0, výsledek je 0.
 */
function gfMul(int $a, int $b): int
{
    $a &= 255;
    $b &= 255;
    if ($a === 0 || $b === 0) {
        return 0;
    }
    return gfExp((gfLog($a) + gfLog($b)) % 255);
}

/**
 * Koeficienty generujícího polynomu stupně $stupen, od nejvyšší mocniny.
 * První koeficient je vždy 1, délka pole je $stupen + 1.
 * Vznikne postupným násobením (x - 2^i) pro i = 0..$stupen-1;
 * v GF(256) je odčítání stejné jako XOR.
 *
 * @return array<int,int>
 */
function rsGenerator(int $stupen): array
{
    /** @var array<int,int> $poly */
    $poly = [1];

    for ($i = 0; $i < $stupen; $i++) {
        $root = gfExp($i);
        /** @var array<int,int> $novy */
        $novy = array_fill(0, count($poly) + 1, 0);
        foreach ($poly as $j => $c) {
            // nasobeni x (posun o jednu mocninu nahoru)
            $novy[$j] ^= $c;
            // nasobeni korenem 2^i
            $novy[$j + 1] ^= gfMul($c, $root);
        }
        $poly = $novy;
    }

    return $poly;
}

/**
 * Reed–Solomonovy opravné kódy pro pole bajtů $data.
 * Klasické dělení polynomů: vezme $data doplněné $pocetEc nulami,
 * pro každý datový bajt spočítá činitel a odečte (XOR) násobek
 * generujícího polynomu. Zbytek dělení je $pocetEc opravných kodů.
 *
 * @param array<int,int> $data
 * @return array<int,int> přesně $pocetEc čísel 0-255
 */
function rsKody(array $data, int $pocetEc): array
{
    $gen = rsGenerator($pocetEc);

    /** @var array<int,int> $pracovni */
    $pracovni = [];
    foreach ($data as $bajt) {
        $pracovni[] = ((int) $bajt) & 255;
    }
    for ($i = 0; $i < $pocetEc; $i++) {
        $pracovni[] = 0;
    }

    $n = count($data);
    $m = count($gen);
    for ($i = 0; $i < $n; $i++) {
        $factor = $pracovni[$i];
        if ($factor === 0) {
            continue;
        }
        for ($j = 0; $j < $m; $j++) {
            $pracovni[$i + $j] ^= gfMul($gen[$j], $factor);
        }
    }

    return array_slice($pracovni, $n);
}
