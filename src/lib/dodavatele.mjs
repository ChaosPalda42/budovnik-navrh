// C-005 — Registr subdodavatelů: kvalifikace, platnost dokladů, doporučení k zakázce.
// Data jsou řetězce "YYYY-MM-DD"; všechny výpočty v UTC (Date.UTC).

export const ZAKLADNI_DOKUMENTY = ["zivnostensky-list", "pojisteni"];

export const POVINNE_DOKUMENTY = {
  elektro: ["opravneni-elektro"],
  plyn: ["opravneni-plyn"],
  vytahy: ["opravneni-vytahy"],
  po: ["odborna-zpusobilost-po"],
};

function dnuMezi(a, b) {
  const pa = a.split("-").map(Number);
  const pb = b.split("-").map(Number);
  return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
}

export function stavDokumentu(dokument, dnes, predstihDni = 30) {
  const platnostDo = dokument && dokument.platnostDo;
  if (platnostDo === null || platnostDo === undefined || platnostDo === "") return "bez-omezeni";
  const d = dnuMezi(dnes, platnostDo);
  if (d < 0) return "neplatny";
  if (d <= predstihDni) return "vyprsi";
  return "platny";
}

export function nejlepsiDokument(dokumenty, typ) {
  const kandidati = (dokumenty || []).filter((d) => d && d.typ === typ);
  if (kandidati.length === 0) return null;
  let nejlepsi = null;
  for (const d of kandidati) {
    const bez = d.platnostDo === null || d.platnostDo === undefined || d.platnostDo === "";
    if (bez) {
      if (nejlepsi === null || nejlepsi.platnostDo === null || nejlepsi.platnostDo === undefined || nejlepsi.platnostDo === "") {
        // první dokument bez platnosti vyhrává
        if (nejlepsi === null || nejlepsi.platnostDo === null || nejlepsi.platnostDo === undefined || nejlepsi.platnostDo === "") {
          if (nejlepsi === null) nejlepsi = d;
        }
      } else {
        // nejlepsi má datum, toto bez data vyhrává
        nejlepsi = d;
      }
    } else if (nejlepsi === null) {
      nejlepsi = d;
    } else if (nejlepsi.platnostDo === null || nejlepsi.platnostDo === undefined || nejlepsi.platnostDo === "") {
      // nejlepsi je bez data, toto s datem nevyhrává
    } else if (d.platnostDo > nejlepsi.platnostDo) {
      nejlepsi = d;
    }
  }
  return nejlepsi;
}

export function kvalifikace(dodavatel, obor, dnes, predstihDni = 30) {
  const povinne = [...ZAKLADNI_DOKUMENTY, ...(POVINNE_DOKUMENTY[obor] || [])];
  const chybi = [];
  const neplatne = [];
  const vyprsi = [];
  for (const typ of povinne) {
    const dok = nejlepsiDokument(dodavatel.dokumenty, typ);
    if (dok === null) {
      chybi.push(typ);
    } else {
      const stav = stavDokumentu(dok, dnes, predstihDni);
      if (stav === "neplatny") neplatne.push(typ);
      else if (stav === "vyprsi") vyprsi.push(typ);
    }
  }
  const maObor = Array.isArray(dodavatel.obory) && dodavatel.obory.includes(obor);
  const aktivni = Boolean(dodavatel.aktivni);
  const zpusobily = maObor && aktivni && chybi.length === 0 && neplatne.length === 0;
  return { zpusobily, obor: maObor, aktivni, chybi, neplatne, vyprsi };
}

export function prumerHodnoceni(dodavatel) {
  const hodnoceni = dodavatel && dodavatel.hodnoceni;
  if (!Array.isArray(hodnoceni) || hodnoceni.length === 0) return null;
  const prumer = hodnoceni.reduce((s, h) => s + h, 0) / hodnoceni.length;
  return Math.round(prumer * 10) / 10;
}

export function skore(dodavatel, zakazka, dnes) {
  if (!kvalifikace(dodavatel, zakazka.obor, dnes).zpusobily) return null;
  const kvalita = ((prumerHodnoceni(dodavatel) ?? 3) / 5) * 40;
  const rychlost = Math.max(0, 1 - dodavatel.odezvaHodin / 48) * 30;
  const kapacita = (1 - dodavatel.vytizeni) * 20;
  const region = Array.isArray(dodavatel.kraje) && dodavatel.kraje.includes(zakazka.kraj) ? 10 : 0;
  return Math.round((kvalita + rychlost + kapacita + region) * 10) / 10;
}

export function doporuc(dodavatele, zakazka, dnes, limit = 3) {
  const kandidati = (dodavatele || [])
    .map((d) => ({ d, s: skore(d, zakazka, dnes) }))
    .filter((x) => x.s !== null);
  kandidati.sort((a, b) => {
    if (a.s !== b.s) return b.s - a.s;
    if (a.d.id < b.d.id) return -1;
    if (a.d.id > b.d.id) return 1;
    return 0;
  });
  return kandidati.slice(0, limit).map(({ d, s }) => ({ id: d.id, nazev: d.nazev, skore: s }));
}

export function hlidani(dodavatele, dnes, predstihDni = 30) {
  const polozky = [];
  for (const d of dodavatele || []) {
    if (!d || !d.aktivni) continue;
    const typy = [];
    for (const dok of d.dokumenty || []) {
      if (dok && !typy.includes(dok.typ)) typy.push(dok.typ);
    }
    for (const typ of typy) {
      const dok = nejlepsiDokument(d.dokumenty, typ);
      if (dok === null) continue;
      const stav = stavDokumentu(dok, dnes, predstihDni);
      if (stav === "vyprsi" || stav === "neplatny") {
        polozky.push({ id: d.id, nazev: d.nazev, typ, platnostDo: dok.platnostDo, stav });
      }
    }
  }
  polozky.sort((a, b) => {
    if (a.platnostDo !== b.platnostDo) {
      if (a.platnostDo === null) return -1;
      if (b.platnostDo === null) return 1;
      return a.platnostDo < b.platnostDo ? -1 : 1;
    }
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });
  return polozky;
}
