export const SLUZBY = [
  { kod: "technicka", nazev: "Technická správa a údržba", cenaZaJednotku: 95, cenaZaM2: 4.5 },
  { kod: "administrativni", nazev: "Účetnictví, předpisy a vyúčtování", cenaZaJednotku: 120, cenaZaM2: 2.0 },
  { kod: "energetika", nazev: "Energetický management", cenaZaJednotku: 30, cenaZaM2: 1.2 },
  { kod: "uklid", nazev: "Úklid společných prostor", cenaZaJednotku: 90, cenaZaM2: 9.0 },
  { kod: "zelen", nazev: "Péče o zeleň a okolí", cenaZaJednotku: 25, cenaZaM2: 0.8 },
  { kod: "zimni", nazev: "Zimní údržba", cenaZaJednotku: 20, cenaZaM2: 0.6 },
  { kod: "ostraha", nazev: "Ostraha a recepce", cenaZaJednotku: 150, cenaZaM2: 6.0 },
];

export const KOEFICIENT_STARI = { novostavba: 0.9, panel: 1.0, historicky: 1.15 };
export const MINIMUM = 2500;

export function spocitej(vstup) {
  const typ = vstup && vstup.typ;
  if (typ !== "svj" && typ !== "druzstvo" && typ !== "komercni" && typ !== "verejne") {
    return { chyba: "typ" };
  }
  const rezidencni = typ === "svj" || typ === "druzstvo";

  let mnozstvi;
  let cena;
  if (rezidencni) {
    const jednotek = vstup.jednotek;
    if (!Number.isInteger(jednotek) || jednotek < 1) {
      return { chyba: "jednotek" };
    }
    mnozstvi = jednotek;
    cena = (s) => s.cenaZaJednotku;
  } else {
    const plocha = vstup.plocha;
    if (typeof plocha !== "number" || !Number.isFinite(plocha) || plocha <= 0) {
      return { chyba: "plocha" };
    }
    mnozstvi = plocha;
    cena = (s) => s.cenaZaM2;
  }

  const stari = vstup.stari;
  const koef = KOEFICIENT_STARI[stari] !== undefined ? KOEFICIENT_STARI[stari] : 1.0;

  const vybrane = Array.isArray(vstup.sluzby) ? vstup.sluzby : [];
  const polozky = [];
  for (const s of SLUZBY) {
    if (!vybrane.includes(s.kod)) continue;
    const c = cena(s);
    const castka = s.kod === "technicka" ? Math.round(c * mnozstvi * koef) : Math.round(c * mnozstvi);
    polozky.push({ kod: s.kod, nazev: s.nazev, castka });
  }

  const vytahu = vstup.vytahu;
  if (typeof vytahu === "number" && vytahu > 0) {
    polozky.push({ kod: "vytahy", nazev: "Servis a prohlídky výtahů", castka: 450 * vytahu });
  }

  if (vstup.havarijni === true) {
    polozky.push({ kod: "havarijni", nazev: "Havarijní služba 24/7", castka: rezidencni ? 900 : 1900 });
  }

  const mezisoucet = polozky.reduce((soucet, p) => soucet + p.castka, 0);

  let slevaProcent = 0;
  if (rezidencni) {
    if (vstup.jednotek >= 120) slevaProcent = 12;
    else if (vstup.jednotek >= 60) slevaProcent = 8;
  } else {
    if (vstup.plocha >= 15000) slevaProcent = 12;
    else if (vstup.plocha >= 5000) slevaProcent = 8;
  }
  const sleva = Math.round((mezisoucet * slevaProcent) / 100);

  let celkem = mezisoucet - sleva;
  let minimumPouzito = false;
  if (celkem < MINIMUM) {
    celkem = MINIMUM;
    minimumPouzito = true;
  }

  const rozpeti = {
    od: Math.round((celkem * 0.9) / 100) * 100,
    do: Math.round((celkem * 1.15) / 100) * 100,
  };

  const naJednotku = rezidencni ? Math.round(celkem / vstup.jednotek) : null;
  const sDph = Math.round(celkem * 1.21);

  return { polozky, mezisoucet, slevaProcent, sleva, celkem, minimumPouzito, rozpeti, naJednotku, sDph };
}
