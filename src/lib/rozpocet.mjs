/**
 * Z textu o rozpočtu, který napsal klient, udělá částku v haléřích.
 * Vrací 0, když se v textu nic přečíst nedá.
 * (převod reference/bypalda/rozpocet.php)
 */
export function rozpocetHalere(text) {
  let t = String(text).trim();
  t = t.replace(/[\u00A0\u202F]/g, ' ');
  t = t.toLowerCase();

  const pattern = /\d+(?: \d{3})*(?:[.,]\d+)?/gu;
  const cisla = [];
  let m;
  while ((m = pattern.exec(t)) !== null) {
    cisla.push({ retezec: m[0], pozice: m.index });
    if (m[0] === '') pattern.lastIndex++;
  }
  if (cisla.length === 0) {
    return 0;
  }

  const jednotka = (cislo) => {
    const zbytek = t.slice(cislo.pozice + cislo.retezec.length).replace(/^ +/, '');
    // 'miliarda' začíná na 'mil', takže se musí poznat dřív než miliony.
    if (zbytek.startsWith('mld') || (zbytek.startsWith('mil') && zbytek.slice(3).startsWith('iard'))) {
      return 1000000000;
    }
    if (zbytek.startsWith('mil')) {
      return 1000000;
    }
    if (zbytek.startsWith('tis')) {
      return 1000;
    }
    return 1;
  };

  const hodnota = parseFloat(cisla[0].retezec.replace(/ /g, '').replace(/,/g, '.'));
  let vlastniJednotka = jednotka(cisla[0]);

  if (vlastniJednotka === 1 && cisla.length > 1) {
    const druhaJednotka = jednotka(cisla[1]);
    if (druhaJednotka !== 1) {
      // „30–40 tis. Kč“ – jednotka se píše jednou, na konec, a platí pro obě meze.
      vlastniJednotka = druhaJednotka;
    } else if (hodnota > 0) {
      const druhaHodnota = parseFloat(cisla[1].retezec.replace(/ /g, '').replace(/,/g, '.'));
      if (druhaHodnota / hodnota >= 100) {
        // „20–50 000“ – zkrácená spodní mez rozsahu, myšleno v tisících.
        vlastniJednotka = 1000;
      }
    }
  }

  return Math.round(hodnota * vlastniJednotka * 100);
}
