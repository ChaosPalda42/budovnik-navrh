// Kontrakt C-016 – src/lib/ico.mjs: kontrola IČO a DIČ (převod reference/bypalda/ico.php).
// Samostatný modul bez závislostí, jen exportované funkce.

/**
 * Nechá v textu jen cifry a doplní zleva nuly na 8 znaků.
 * Když v textu není žádná cifra, vrátí prázdný řetězec.
 * Když je cifer víc než 8, vrátí je bez doplňování.
 */
export function normalizujIco(ico) {
  const cifry = String(ico).replace(/\D+/g, '');

  if (cifry === '') {
    return '';
  }

  return cifry.padStart(8, '0');
}

/**
 * Kontrola IČO podle české normy (váhy 8,7,6,5,4,3,2).
 * Po normalizaci musí být přesně 8 cifer, jinak neplatí.
 */
export function platneIco(ico) {
  const normalizovane = normalizujIco(ico);

  if (normalizovane.length !== 8) {
    return false;
  }

  let vaha = 8;
  let soucet = 0;
  for (let i = 0; i < 7; i++) {
    soucet += Number(normalizovane[i]) * vaha;
    vaha--;
  }

  const c = soucet % 11;
  let ocekavana;
  if (c === 0) {
    ocekavana = 1;
  } else if (c === 1) {
    ocekavana = 0;
  } else {
    ocekavana = 11 - c;
  }

  return Number(normalizovane[7]) === ocekavana;
}

/**
 * Kontrola DIČ: předpona CZ (velká i malá písmena, kolem ní mezery)
 * a za ní 8 až 10 cifer. Osm cifer musí projít kontrolou IČO,
 * devět nebo deset cifer (rodné číslo) se bere jako platné.
 */
export function platneDic(dic) {
  const m = String(dic).match(/^\s*[cC][zZ]\s*(\d{8,10})\s*$/);

  if (!m) {
    return false;
  }

  const cislo = m[1];

  if (cislo.length === 8) {
    return platneIco(cislo);
  }

  return true;
}
