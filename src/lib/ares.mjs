// Kontrakt C-023 – src/lib/ares.mjs: převod odpovědi rejstříku ARES (MF)
// na políčka, která má CRM u klienta. Žádné volání po síti – vstupem je
// už hotový objekt z JSON. Převod reference/bypalda/ares.php.

/**
 * PSČ na čitelný tvar: 17000 (int i string) → '170 00'.
 * Co nemá přesně 5 číslic (prázdné, null, nesmysl) → ''.
 */
export function aresPsc(psc) {
  if (Number.isInteger(psc) || typeof psc === 'string') {
    const text = String(psc);
    if (/^\d{5}$/.test(text)) {
      return text.slice(0, 3) + ' ' + text.slice(3, 5);
    }
  }
  return '';
}

/** isset: klíč existuje a hodnota není null/undefined. */
function isset(obj, klic) {
  return obj !== null && typeof obj === 'object' && klic in obj
    && obj[klic] !== null && obj[klic] !== undefined;
}

/** Hodnota jako řetězec (PHP (string)); null/undefined → ''. */
function text(hodnota) {
  return hodnota === null || hodnota === undefined ? '' : String(hodnota);
}

/**
 * Jeden subjekt z ARESu na objekt s klíči:
 * 'ico', 'nazev', 'dic', 'ulice', 'mesto', 'psc', 'zeme'.
 * Chybějící klíče nikde nechybí – vrací se prázdný řetězec.
 */
export function aresSubjekt(data) {
  const d = data !== null && typeof data === 'object' ? data : {};
  const sidlo = isset(d, 'sidlo') && typeof d.sidlo === 'object' && d.sidlo !== null ? d.sidlo : {};
  const dorucovaci = isset(d, 'adresaDorucovaci') && typeof d.adresaDorucovaci === 'object' && d.adresaDorucovaci !== null
    ? d.adresaDorucovaci
    : {};

  const ico = isset(d, 'ico') ? text(d.ico) : '';
  const nazev = isset(d, 'obchodniJmeno') ? text(d.obchodniJmeno) : '';
  const dic = isset(d, 'dic') ? text(d.dic).trim().toUpperCase() : '';

  // ulice: oficiální řádek adresy, jinak sestaveno ze sídla
  let ulice = '';
  if (isset(dorucovaci, 'radekAdresy1') && text(dorucovaci.radekAdresy1) !== '') {
    ulice = text(dorucovaci.radekAdresy1);
  } else {
    const cisloDomovni = isset(sidlo, 'cisloDomovni') ? text(sidlo.cisloDomovni) : '';
    if (cisloDomovni !== '') {
      const nazevUlice = isset(sidlo, 'nazevUlice') ? text(sidlo.nazevUlice).trim() : '';
      ulice = nazevUlice !== '' ? nazevUlice + ' ' + cisloDomovni : 'č.p. ' + cisloDomovni;
      const cisloOrientacni = isset(sidlo, 'cisloOrientacni') ? text(sidlo.cisloOrientacni) : '';
      if (cisloOrientacni !== '') {
        ulice += '/' + cisloOrientacni;
      }
    }
  }

  // mesto: poslední neprázdný řádek doručovací adresy bez PSČ zepředu,
  // jinak název obce ze sídla
  let mesto = '';
  let posledni = '';
  for (const radek of ['radekAdresy1', 'radekAdresy2', 'radekAdresy3']) {
    if (isset(dorucovaci, radek) && text(dorucovaci[radek]) !== '') {
      posledni = text(dorucovaci[radek]);
    }
  }
  if (posledni !== '') {
    // pět číslic (klidně s mezerou uvnitř) a mezery za nimi
    mesto = posledni.replace(/^\d{3}\s?\d{2}\s*/, '');
  } else if (isset(sidlo, 'nazevObce')) {
    mesto = text(sidlo.nazevObce);
  }

  const psc = aresPsc(isset(sidlo, 'psc') ? sidlo.psc : null);
  const zeme = isset(sidlo, 'kodStatu') && text(sidlo.kodStatu) !== ''
    ? text(sidlo.kodStatu)
    : 'CZ';

  return { ico, nazev, dic, ulice, mesto, psc, zeme };
}

/**
 * Z odpovědi vyhledávání udělá seznam subjektů (aresSubjekt na každého).
 * Když klíč chybí nebo není pole, vrátí prázdné pole.
 */
export function aresSeznam(odpoved) {
  const o = odpoved !== null && typeof odpoved === 'object' ? odpoved : {};
  if (!isset(o, 'ekonomickeSubjekty') || typeof o.ekonomickeSubjekty !== 'object' || o.ekonomickeSubjekty === null) {
    return [];
  }
  const seznam = [];
  for (const subjekt of o.ekonomickeSubjekty) {
    if (subjekt !== null && typeof subjekt === 'object') {
      seznam.push(aresSubjekt(subjekt));
    }
  }
  return seznam;
}
