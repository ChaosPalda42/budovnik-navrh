export const SAZBY_DPH = [0, 12, 21];

export function prefakturuj(polozky, marzeProcent) {
  const radky = [];
  let nakupCelkemH = 0;
  let zakladH = 0;
  const poSazbach = new Map();

  for (const p of polozky) {
    if (!SAZBY_DPH.includes(p.sazbaDph)) {
      throw new Error("sazba");
    }
    const nakupH = Math.round(p.castkaBezDph * 100);
    const prodejH = Math.round(p.castkaBezDph * (100 + marzeProcent));
    radky.push({ popis: p.popis, sazbaDph: p.sazbaDph, nakup: nakupH / 100, prodej: prodejH / 100 });
    nakupCelkemH += nakupH;
    zakladH += prodejH;
    poSazbach.set(p.sazbaDph, (poSazbach.get(p.sazbaDph) ?? 0) + prodejH);
  }

  const rekapitulace = [];
  let dphH = 0;
  for (const sazba of [...poSazbach.keys()].sort((a, b) => a - b)) {
    const zaklad = poSazbach.get(sazba);
    const dph = Math.round(zaklad * sazba / 100);
    dphH += dph;
    rekapitulace.push({ sazba, zaklad: zaklad / 100, dph: dph / 100, celkem: (zaklad + dph) / 100 });
  }

  const celkemH = zakladH + dphH;
  const kUhrade = Math.round(celkemH / 100);
  const zaokrouhleni = (kUhrade * 100 - celkemH) / 100;
  const zisk = (zakladH - nakupCelkemH) / 100;
  const marzeSkutecna = zakladH === 0 ? 0 : Math.round((zakladH - nakupCelkemH) / zakladH * 1000) / 10;

  return {
    radky,
    rekapitulace,
    zaklad: zakladH / 100,
    dph: dphH / 100,
    celkemSDph: celkemH / 100,
    kUhrade,
    zaokrouhleni,
    nakup: nakupCelkemH / 100,
    zisk,
    marzeSkutecna,
  };
}

export function cisloFaktury(rok, poradi) {
  return `${rok}` + String(poradi).padStart(4, "0");
}

export function splatnost(datumVystaveni, dni) {
  const [y, m, d] = datumVystaveni.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d) + dni * 86400000;
  const dt = new Date(ms);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
