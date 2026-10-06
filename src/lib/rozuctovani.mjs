export const KLICE = {
  plocha: "podle plochy (m²)",
  osoby: "podle počtu osob",
  podil: "podle spoluvlastnického podílu",
  jednotka: "rovným dílem na jednotku",
};

export function rozdel(celkemHalere, vahy) {
  let suma = 0;
  for (const v of vahy) {
    suma += v.vaha;
  }
  if (suma <= 0) {
    throw new Error("nulove-vahy");
  }
  const presne = vahy.map((v) => celkemHalere * v.vaha / suma);
  const zaklady = presne.map((p) => Math.floor(p));
  const zbytky = presne.map((p, i) => p - zaklady[i]);
  let zbyva = celkemHalere - zaklady.reduce((s, z) => s + z, 0);
  const poradí = zbytky
    .map((z, i) => [z, i])
    .sort((a, b) => (b[0] - a[0]) || (a[1] - b[1]));
  const prirazeni = new Array(vahy.length).fill(0);
  for (let k = 0; k < zbyva; k++) {
    prirazeni[poradí[k][1]] += 1;
  }
  return vahy.map((v, i) => ({ id: v.id, halere: zaklady[i] + prirazeni[i] }));
}

export function vyuctuj(naklady, jednotky) {
  const nakladyHalere = new Array(jednotky.length).fill(0);
  const polozky = jednotky.map(() => []);
  for (const naklad of naklady) {
    if (!(naklad.klic in KLICE)) {
      throw new Error("klic");
    }
    const halere = Math.round(naklad.castka * 100);
    const vahy = jednotky.map((j) => ({
      id: j.id,
      vaha: naklad.klic === "jednotka" ? 1 : (j[naklad.klic] ?? 0),
    }));
    const dil = rozdel(halere, vahy);
    dil.forEach((d, i) => {
      nakladyHalere[i] += d.halere;
      polozky[i].push({ sluzba: naklad.sluzba, castka: d.halere / 100 });
    });
  }
  const zalohyHalere = jednotky.map((j) => Math.round(j.zalohy * 100));
  const jednotkyVysledky = jednotky.map((j, i) => ({
    id: j.id,
    polozky: polozky[i],
    naklady: nakladyHalere[i] / 100,
    zalohy: zalohyHalere[i] / 100,
    vysledek: (zalohyHalere[i] - nakladyHalere[i]) / 100,
  }));
  const soucetNaklady = nakladyHalere.reduce((s, h) => s + h, 0);
  const soucetZaloh = zalohyHalere.reduce((s, h) => s + h, 0);
  let preplatky = 0;
  let nedoplatky = 0;
  for (const j of jednotkyVysledky) {
    const h = Math.round(j.vysledek * 100);
    if (h > 0) preplatky += h;
    else nedoplatky += -h;
  }
  return {
    jednotky: jednotkyVysledky,
    souhrn: {
      naklady: soucetNaklady / 100,
      zalohy: soucetZaloh / 100,
      vysledek: (soucetZaloh - soucetNaklady) / 100,
      preplatky: preplatky / 100,
      nedoplatky: nedoplatky / 100,
    },
  };
}
