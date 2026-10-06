// C-011 — Časová osa úvodní animace „web se postaví“:
// vytyčení obrysů bloků, usazení bloků, bublina vodováhy. Čas v milisekundách.

export const VYCHOZI = { rozestup: 60, vytyceni: 520, pauza: 120, usazeni: 480, max: 24, minW: 24, minH: 12, radek: 40 };

export function casovaOsa(prvky, moznosti) {
  const { vyska, ...přepisy } = moznosti || {};
  const p = { ...VYCHOZI, ...přepisy };
  const kandidati = [];
  (prvky || []).forEach((prvek, poradI) => {
    const { id, x, y, w, h } = prvek;
    const viditelny = y < vyska && y + h > 0;
    const dostatecneVeli = w >= p.minW && h >= p.minH;
    if (viditelny && dostatecneVeli) {
      kandidati.push({ id, x, y, w, poradI });
    }
  });
  kandidati.sort((a, b) => {
    const ra = Math.floor(a.y / p.radek);
    const rb = Math.floor(b.y / p.radek);
    if (ra !== rb) return ra - rb;
    if (a.x !== b.x) return a.x - b.x;
    return a.poradI - b.poradI;
  });
  const vybrane = kandidati.slice(0, p.max);
  const n = vybrane.length;
  const konecVytyceni = n > 0 ? (n - 1) * p.rozestup + p.vytyceni : 0;
  const plan = vybrane.map((k, i) => ({
    id: k.id,
    poradi: i,
    obrys: { od: i * p.rozestup, do: i * p.rozestup + p.vytyceni },
    usazeni: {
      od: konecVytyceni + p.pauza + i * p.rozestup,
      do: konecVytyceni + p.pauza + i * p.rozestup + p.usazeni,
    },
    kota: String(Math.round(k.w)),
  }));
  const vPlanu = new Set(plan.map((polozka) => polozka.id));
  const mimo = (prvky || []).filter((prvek) => !vPlanu.has(prvek.id)).map((prvek) => prvek.id);
  const celkem = n > 0 ? plan[n - 1].usazeni.do : 0;
  return { plan, mimo, celkem };
}

export function prubeh(interval, t) {
  const { od, do: doKonec } = interval;
  if (t <= od) return 0;
  if (t >= doKonec) return 1;
  return (t - od) / (doKonec - od);
}

export function zpomal(p) {
  const q = Math.min(1, Math.max(0, p));
  return 1 - Math.pow(1 - q, 3);
}

export function stavV(plan, t) {
  return plan.map((polozka) => ({
    id: polozka.id,
    obrys: prubeh(polozka.obrys, t),
    usazeni: zpomal(prubeh(polozka.usazeni, t)),
  }));
}

export function bublina(t, { amplituda = 14, tlumeni = 0.0045, frekvence = 0.011 } = {}) {
  if (t < 0) return amplituda;
  return amplituda * Math.exp(-tlumeni * t) * Math.cos(frekvence * t);
}
