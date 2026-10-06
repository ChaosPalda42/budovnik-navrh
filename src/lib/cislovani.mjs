// ---------------------------------------------------------------------------
// Číslování dokladů (C-015) – převod reference/bypalda/cislovani.php.
//
// Formát čísla se skládá ze zástupných značek:
//   {rok}      4 cifry roku          (2026)
//   {rok2}     2 cifry roku          (26)
//   {mesic}    2 cifry měsíce        (09)
//   {poradi}   pořadí bez doplňování  (7)
//   {poradi2}..{poradi5}
//              pořadí doplněné nulami zleva na danou délku (0007);
//              když je pořadí delší, NEZKRACUJE se ({poradi3} + 1234 = 1234).
// Text kolem značek se opíše, např. 'NAB{rok}{poradi3}' -> 'NAB2026007'.
// ---------------------------------------------------------------------------

/** Zástupné značky, které umíme číst i zpátky. */
export const CISLOVANI_ZNACKY = '(rok2|rok|mesic|poradi[2-5]?)';

/** Ekvivalent preg_quote – escapuje text mimo značky pro regulární výraz. */
function escapuj(text) {
  return text.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

/**
 * Doplní značky formátu podle data a pořadí.
 *
 * @param {string} format  např. 'NAB{rok}{poradi3}'
 * @param {string} datum   'RRRR-MM-DD'
 * @param {number} poradi  pořadí dokladu v řadě
 */
export function vyrobCislo(format, datum, poradi) {
  let rok = 0;
  let mesic = 1;
  const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(datum);
  if (m) {
    rok = Number(m[1]);
    mesic = Number(m[2]);
  }

  const re = new RegExp('\\{' + CISLOVANI_ZNACKY + '\\}', 'g');
  return format.replace(re, (_whole, znacka) => {
    switch (znacka) {
      case 'rok':
        return String(rok).padStart(4, '0');
      case 'rok2':
        return String(rok % 100).padStart(2, '0');
      case 'mesic':
        return String(mesic).padStart(2, '0');
      case 'poradi':
        return String(poradi);
      default: // poradi2 az poradi5 – str_pad vetsi poradi nezkracuje
        return String(poradi).padStart(Number(znacka.slice(6)), '0');
    }
  });
}

/**
 * Z formátu sestaví regulární výraz a mapu značek na čísla capture skupin.
 * Text mimo značky se musí shodovat přesně, {poradi*} je skupina cifer
 * (i víc cifer, protože velké pořadí se nezkracuje).
 *
 * @returns {{regex: RegExp, skupiny: Object<string, number>} | null}
 *          null když se regex nepodařilo sestavit
 */
function cislovaniRozbor(format) {
  let regex = '';
  const skupiny = {};
  let offset = 0;
  let poradiSkupin = 0;
  const re = new RegExp('\\{' + CISLOVANI_ZNACKY + '\\}', 'g');
  let m;
  while ((m = re.exec(format)) !== null) {
    const zacatek = m.index;
    regex += escapuj(format.slice(offset, zacatek));
    const znacka = m[1];
    if (znacka === 'rok') {
      regex += '(\\d{4})';
      skupiny['rok'] = ++poradiSkupin;
    } else if (znacka === 'rok2') {
      regex += '(\\d{2})';
      skupiny['rok2'] = ++poradiSkupin;
    } else if (znacka === 'mesic') {
      regex += '(\\d{2})';
      skupiny['mesic'] = ++poradiSkupin;
    } else {
      // poradi, poradi2..poradi5
      regex += '(\\d+)';
      skupiny['poradi'] = ++poradiSkupin;
    }
    offset = zacatek + m[0].length;
  }
  regex += escapuj(format.slice(offset));

  let celk;
  try {
    celk = new RegExp('^' + regex + '$');
  } catch {
    return null;
  }
  return { regex: celk, skupiny };
}

/**
 * Shoduje číslo s formátem; vrátí capture skupiny, nebo null když neodpovídá.
 *
 * @returns {string[] | null}
 */
function cislovaniMatch(cislo, format) {
  const rozbor = cislovaniRozbor(format);
  if (rozbor === null) {
    return null;
  }
  const m = rozbor.regex.exec(cislo);
  if (m === null) {
    return null;
  }
  return m;
}

/**
 * Přečte pořadí z hotového čísla. Null, když číslo formátu neodpovídá
 * (nebo formát nemá značku pro pořadí).
 *
 * @returns {number | null}
 */
export function poradiZCisla(cislo, format) {
  const rozbor = cislovaniRozbor(format);
  if (rozbor === null || !Object.prototype.hasOwnProperty.call(rozbor.skupiny, 'poradi')) {
    return null;
  }
  const m = cislovaniMatch(cislo, format);
  if (m === null) {
    return null;
  }
  return Number(m[rozbor.skupiny['poradi']]);
}

/**
 * Přečte rok z hotového čísla (u {rok2} přičte 2000).
 * Null, když formát rok neobsahuje nebo číslo formátu neodpovídá.
 *
 * @returns {number | null}
 */
export function rokZCisla(cislo, format) {
  const rozbor = cislovaniRozbor(format);
  if (rozbor === null) {
    return null;
  }
  let skupina;
  let zaklad;
  if (Object.prototype.hasOwnProperty.call(rozbor.skupiny, 'rok')) {
    skupina = rozbor.skupiny['rok'];
    zaklad = 0;
  } else if (Object.prototype.hasOwnProperty.call(rozbor.skupiny, 'rok2')) {
    skupina = rozbor.skupiny['rok2'];
    zaklad = 2000;
  } else {
    return null;
  }
  const m = cislovaniMatch(cislo, format);
  if (m === null) {
    return null;
  }
  return zaklad + Number(m[skupina]);
}
