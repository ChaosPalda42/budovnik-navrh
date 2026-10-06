// C-028: Statistiky byznysu z dokladů (jako statistiky v byPalda CRM)
// Čísla se počítají z dokladů, ne z ručně zadaných hodnot.
// Peníze v haléřích (celá čísla). Data 'RRRR-MM-DD' se porovnávají jako řetězce.

function mesicData(datum) {
  return String(datum).slice(0, 7);
}

function nasledujiciMesic(mesic) {
  const [rok, mes] = mesic.split("-").map(Number);
  const m = mes % 12;
  const r = rok + Math.floor(mes / 12);
  return String(r).padStart(4, "0") + "-" + String(m + 1).padStart(2, "0");
}

export function mesiceObdobi(od, do_) {
  if (String(do_) < String(od)) return [];
  const vysledek = [];
  let mesic = mesicData(od);
  const konec = mesicData(do_);
  while (mesic <= konec) {
    vysledek.push(mesic);
    mesic = nasledujiciMesic(mesic);
  }
  return vysledek;
}

export function statistiky(doklady, klienti, od, do_, dnes) {
  const faktury = doklady.filter((d) => d.druh === "faktura");
  const nabidky = doklady.filter((d) => d.druh === "nabidka");

  const vObdobi = (datum) => datum >= od && datum <= do_;

  const vystavenoFaktury = faktury.filter((d) => vObdobi(d.vystaveno));
  const uhrazenoFaktury = faktury.filter(
    (d) => d.uhrazeno !== null && d.uhrazeno !== undefined && vObdobi(d.uhrazeno)
  );
  const bezUhrady = faktury.filter((d) => d.uhrazeno === null || d.uhrazeno === undefined);
  const poSplatnosti = bezUhrady.filter((d) => d.splatnost < dnes);
  const nabidkyObdobi = nabidky.filter((d) => vObdobi(d.vystaveno));

  const soucet = (pole) => pole.reduce((t, d) => t + d.celkem, 0);

  const nazvy = new Map(klienti.map((k) => [k.id, k.nazev]));

  const mesice = mesiceObdobi(od, do_).map((mesic) => {
    const pred = mesic + "-";
    const v = vystavenoFaktury.filter((d) => d.vystaveno.startsWith(pred));
    const u = uhrazenoFaktury.filter((d) => d.uhrazeno.startsWith(pred));
    return { mesic, vystaveno: soucet(v), uhrazeno: soucet(u) };
  });

  const soucety = new Map();
  for (const d of vystavenoFaktury) {
    soucety.set(d.klientId, (soucety.get(d.klientId) || 0) + d.celkem);
  }
  const nejvetsi = [...soucety.entries()]
    .filter(([, castka]) => castka > 0)
    .map(([klientId, castka]) => ({ klientId, nazev: nazvy.get(klientId) ?? "", castka }))
    .sort(
      (a, b) => b.castka - a.castka || (String(a.klientId) < String(b.klientId) ? -1 : 1)
    )
    .slice(0, 5);

  return {
    vystaveno: { pocet: vystavenoFaktury.length, castka: soucet(vystavenoFaktury) },
    uhrazeno: { pocet: uhrazenoFaktury.length, castka: soucet(uhrazenoFaktury) },
    kUhrade: { pocet: bezUhrady.length, castka: soucet(bezUhrady) },
    poSplatnosti: { pocet: poSplatnosti.length, castka: soucet(poSplatnosti) },
    nabidky: { pocet: nabidkyObdobi.length, castka: soucet(nabidkyObdobi) },
    stali: klienti.filter((k) => k.stav === "aktivni" && k.pausal === true).length,
    novi: klienti.filter((k) => vObdobi(k.vytvoreno)).length,
    mesice,
    nejvetsi,
  };
}
