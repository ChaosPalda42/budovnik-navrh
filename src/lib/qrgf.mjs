// C-018 — Počítání v Galoisově tělese GF(256) a Reed–Solomonovy opravné
// kódy pro QR kód (převod reference/bypalda/qr/gf.php).
//
// Pravidla podle normy QR: generátor (primitivní prvek) je 2,
// primitivní polynom je 0x11D (285). Tabulky mocnin a logaritmů
// se spočítají jednou, ne při každém volání.

const PRIMITIVNI_POLYNOM = 285; // 0x11D

let tabulky = null;

function jeCeliste(hodnota) {
  return typeof hodnota === "number" && Number.isInteger(hodnota);
}

/**
 * Tabulky mocnin a logaritmů v GF(256), spočítané jednou za běh.
 *
 * navratova hodnota: [exp, log], kde exp[i] = 2^i a log[exp[i]] = i.
 */
export function gfTabulky() {
  if (tabulky === null) {
    const exp = new Array(256).fill(0);
    const log = new Array(256).fill(0);

    let x = 1;
    for (let i = 0; i < 256; i++) {
      exp[i] = x;
      // logaritmicka tabulka patri jen exponentum 0..254
      // (2^255 = 1 by prepislo log[1] = 0)
      if (i < 255) {
        log[x] = i;
      }
      x <<= 1; // x * 2
      if (x >= 256) {
        x ^= PRIMITIVNI_POLYNOM; // primitivni polynom 0x11D
      }
    }

    tabulky = [exp, log];
  }

  return tabulky;
}

/**
 * 2 na i v GF(256). Exponent se točí dokola po 255,
 * takže gfExp(258) == gfExp(3).
 */
export function gfExp(i) {
  if (!jeCeliste(i)) {
    throw new TypeError("gfExp: očekávám celé číslo, dostal jsem " + typeof i);
  }
  const [exp] = gfTabulky();
  let e = i % 255;
  if (e < 0) {
    e += 255;
  }
  return exp[e];
}

/**
 * Diskrétní logaritmus v GF(256) – opačná funkce k gfExp().
 * Pro 0 vrací 0 (logaritmus nuly není definovaný).
 */
export function gfLog(x) {
  if (!jeCeliste(x)) {
    throw new TypeError("gfLog: očekávám celé číslo, dostal jsem " + typeof x);
  }
  x &= 255;
  if (x === 0) {
    return 0;
  }
  const [, log] = gfTabulky();
  return log[x];
}

/**
 * Násobení v GF(256) přes logaritmickou tabulku.
 * Když je některý činitel 0, výsledek je 0.
 */
export function gfMul(a, b) {
  if (!jeCeliste(a) || !jeCeliste(b)) {
    throw new TypeError("gfMul: očekávám celá čísla");
  }
  a &= 255;
  b &= 255;
  if (a === 0 || b === 0) {
    return 0;
  }
  return gfExp((gfLog(a) + gfLog(b)) % 255);
}

/**
 * Koeficienty generujícího polynomu stupně stupen, od nejvyšší mocniny.
 * První koeficient je vždy 1, délka pole je stupen + 1.
 * Vznikne postupným násobením (x - 2^i) pro i = 0..stupen-1;
 * v GF(256) je odčítání stejné jako XOR.
 */
export function rsGenerator(stupen) {
  if (!jeCeliste(stupen) || stupen < 0) {
    throw new TypeError("rsGenerator: očekávám nezáporné celé číslo");
  }

  let poly = [1];

  for (let i = 0; i < stupen; i++) {
    const root = gfExp(i);
    const novy = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      const c = poly[j];
      // nasobeni x (posun o jednu mocninu nahoru)
      novy[j] ^= c;
      // nasobeni korenem 2^i
      novy[j + 1] ^= gfMul(c, root);
    }
    poly = novy;
  }

  return poly;
}

/**
 * Reed–Solomonovy opravné kódy pro pole bajtů data.
 * Klasické dělení polynomů: vezme data doplněná pocetEc nulami,
 * pro každý datový bajt spočítá činitel a odečte (XOR) násobek
 * generujícího polynomu. Zbytek dělení je pocetEc opravných kodů.
 *
 * navratova hodnota: přesně pocetEc čísel 0-255.
 */
export function rsKody(data, pocetEc) {
  if (!Array.isArray(data) || !data.every(jeCeliste)) {
    throw new TypeError("rsKody: data musí být pole celých čísel");
  }
  if (!jeCeliste(pocetEc) || pocetEc < 0) {
    throw new TypeError("rsKody: pocetEc musí být nezáporné celé číslo");
  }

  const gen = rsGenerator(pocetEc);

  const pracovni = data.map((bajt) => bajt & 255);
  for (let i = 0; i < pocetEc; i++) {
    pracovni.push(0);
  }

  const n = data.length;
  const m = gen.length;
  for (let i = 0; i < n; i++) {
    const factor = pracovni[i];
    if (factor === 0) {
      continue;
    }
    for (let j = 0; j < m; j++) {
      pracovni[i + j] ^= gfMul(gen[j], factor);
    }
  }

  return pracovni.slice(n);
}
