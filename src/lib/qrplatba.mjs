// Kontrakt C-017 – IBAN z běžného českého čísla účtu a text pro QR platbu
// podle standardu SPD 1.0. Převod reference/bypalda/qr.php.

const DIACRITIKA = {
  'á': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'ě': 'e', 'í': 'i',
  'ň': 'n', 'ó': 'o', 'ř': 'r', 'š': 's', 'ť': 't', 'ú': 'u',
  'ů': 'u', 'ý': 'y', 'ž': 'z',
  'Á': 'A', 'Č': 'C', 'Ď': 'D', 'É': 'E', 'Ě': 'E', 'Í': 'I',
  'Ň': 'N', 'Ó': 'O', 'Ř': 'R', 'Š': 'S', 'Ť': 'T', 'Ú': 'U',
  'Ů': 'U', 'Ý': 'Y', 'Ž': 'Z',
  // horní pomlčka (–) a další typografické znaménkové náhrady
  '–': '-', '—': '-', '‘': "'", '’': "'",
  '“': '"', '”': '"',
};

/**
 * Z textu odstraní českou diakritiku (pro MSG, které QR čte v ASCII).
 */
export function czBezDiakritiky(text) {
  return String(text).split('').map((c) => DIACRITIKA[c] ?? c).join('');
}

/**
 * Z českého čísla účtu „předčíslí-číslo/kód banky“ vyrobí IBAN (CZ + kontrola + BBAN,
 * 24 znaků bez mezer). Kontrolní dvojčíslí podle ISO 7064 mod 97-10.
 * Mezery a pomlčky ve vstupu se ignorují. Když vstup už je IBAN
 * (začíná „CZ“ a po odstranění mezer má 24 znaků), vrátí ho bez mezer.
 * Když ve vstupu chybí lomítko s kódem banky nebo číslo účtu, vrátí ''.
 */
export function iban(ucet) {
  const bezMezer = String(ucet).replace(/\s+/g, '');

  if (bezMezer.length === 24 && bezMezer.startsWith('CZ')) {
    return bezMezer;
  }

  const f = bezMezer.match(/^(?:(\d{1,6})-)?(\d{1,10})\/(\d{1,4})$/);
  if (!f) {
    return '';
  }

  const predcisli = (f[1] ?? '').padStart(6, '0');
  const cislo = f[2].padStart(10, '0');
  const kodBanky = f[3].padStart(4, '0');

  const bban = kodBanky + predcisli + cislo;

  // ISO 7064 mod 97-10: BBAN + „CZ00“ přeložené na cifry (C=12, Z=35).
  const retezec = bban + '1235' + '00';
  let zbytek = 0;
  for (const c of retezec) {
    zbytek = (zbytek * 10 + Number(c)) % 97;
  }
  const kontrola = String(98 - zbytek).padStart(2, '0');

  return 'CZ' + kontrola + bban;
}

/**
 * Text pro QR platbu podle standardu SPD 1.0. Klíče vstupu:
 * 'ucet' (jako pro iban()), 'castka' (int, haléře), 'vs',
 * 'splatnost' ('RRRR-MM-DD'), 'zprava'.
 * Když se nepodaří vyrobit IBAN (nebo účet chybí), vrátí ''.
 */
export function qrPlatbaText(d) {
  const ucet = iban(String(d.ucet ?? ''));

  if (ucet === '') {
    return '';
  }

  const castky = ['SPD*1.0*ACC:' + ucet];

  const castka = Math.trunc(Number(d.castka ?? 0));
  if (castka > 0) {
    castky.push('*AM:' + Math.floor(castka / 100) + '.' + String(castka % 100).padStart(2, '0'));
    castky.push('*CC:CZK');
  }

  const vs = String(d.vs ?? '').trim();
  if (vs !== '') {
    castky.push('*X-VS:' + vs);
  }

  const splatnost = String(d.splatnost ?? '').trim();
  if (splatnost !== '') {
    castky.push('*DT:' + splatnost.replace(/\D+/g, ''));
  }

  const zprava = String(d.zprava ?? '');
  if (zprava !== '') {
    // Bez diakritiky, hvězdičky na mezery, sešrotovat opakované mezery,
    // oříznout a zkrátit na 60 znaků; useknutý konce mezerů oříznout znovu.
    // Nahrazujeme i nerozpoznané mezeryové znaky (NBSP apod.).
    let cista = czBezDiakritiky(zprava).replace(/\*/g, ' ').replace(/\s+/g, ' ');
    cista = cista.replace(/[^\P{Z} ]+/gu, ' ');
    castky.push('*MSG:' + cista.trim().slice(0, 60).replace(/\s+$/g, ''));
  }

  return castky.join('');
}
