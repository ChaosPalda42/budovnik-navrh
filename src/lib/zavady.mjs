// Hlášení závad — stavový stroj, lhůty SLA podle priority, přehled.
// Časy jako "YYYY-MM-DDTHH:MM" bez časové zóny; počítá se přes Date.UTC.

import { pridejPracovniDny } from "./pracovnidny.mjs";

export const STAVY = ["nova", "prirazena", "v-reseni", "ceka-na-dil", "hotova", "prevzata", "vyfakturovana", "zrusena"];

export const PRECHODY = {
  "nova": ["prirazena", "zrusena"],
  "prirazena": ["v-reseni", "nova", "zrusena"],
  "v-reseni": ["ceka-na-dil", "hotova"],
  "ceka-na-dil": ["v-reseni"],
  "hotova": ["prevzata", "v-reseni"],
  "prevzata": ["vyfakturovana"],
  "vyfakturovana": [],
  "zrusena": [],
};

export const PRIORITY = {
  "havarie": { "nazev": "Havárie", "reakce": { "hodiny": 2 }, "vyreseni": { "hodiny": 24 } },
  "urgentni": { "nazev": "Urgentní", "reakce": { "hodiny": 24 }, "vyreseni": { "hodiny": 72 } },
  "bezna": { "nazev": "Běžná", "reakce": { "pracovniDny": 2 }, "vyreseni": { "pracovniDny": 10 } },
  "planovana": { "nazev": "Plánovaná", "reakce": { "pracovniDny": 10 }, "vyreseni": { "pracovniDny": 30 } },
};

const MS_PER_MIN = 60000;

function parseCas(s) {
  const [d, t] = s.split("T");
  const [y, m, dd] = d.split("-").map(Number);
  const [hh, mm] = t.split(":").map(Number);
  return Date.UTC(y, m - 1, dd, hh, mm);
}

function formatCas(ms) {
  const dt = new Date(ms);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  const hh = String(dt.getUTCHours()).padStart(2, "0");
  const mm = String(dt.getUTCMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

/** Přičte lhůtu k času: { hodiny: h } nebo { pracovniDny: n }. */
export function pridejLhutu(cas, lhuta) {
  if (lhuta.hodiny != null) {
    return formatCas(parseCas(cas) + lhuta.hodiny * 60 * MS_PER_MIN);
  }
  if (lhuta.pracovniDny != null) {
    const datum = cas.slice(0, 10);
    const casovaCast = cas.slice(11);
    return pridejPracovniDny(datum, lhuta.pracovniDny) + "T" + casovaCast;
  }
  throw new Error("neznama-lhuta");
}

/** Termíny reakce a vyřešení pro závadu. */
export function terminy(zavada) {
  const p = PRIORITY[zavada.priorita];
  if (!p) throw new Error("priorita");
  return {
    reakce: pridejLhutu(zavada.nahlaseno, p.reakce),
    vyreseni: pridejLhutu(zavada.nahlaseno, p.vyreseni),
  };
}

/** Je přechod ze stavu z do stavu na povolen? */
export function muzePrejit(z, na) {
  const cile = PRECHODY[z];
  return !!cile && cile.includes(na);
}

/** Provede přechod a vrátí NOVOU závadu (vstup se nemutuje). */
export function prejdi(zavada, na, cas, kdo) {
  if (!muzePrejit(zavada.stav, na)) throw new Error("neplatny-prechod");
  if (na === "prirazena" && zavada.dodavatel == null) throw new Error("chybi-dodavatel");
  return {
    ...zavada,
    stav: na,
    historie: [...(zavada.historie || []), { z: zavada.stav, na, cas, kdo }],
  };
}

/** Přiřadí dodavatele a provede přechod do "prirazena". */
export function prirad(zavada, dodavatelId, cas, kdo) {
  return prejdi({ ...zavada, dodavatel: dodavatelId }, "prirazena", cas, kdo);
}

/** Čas PRVNÍHO záznamu historie s daným `na`, jinak null. */
export function casPrechodu(zavada, na) {
  const h = (zavada.historie || []).find((x) => x.na === na);
  return h ? h.cas : null;
}

function slaJedno(splneni, termin, ted, nahlaseno) {
  if (splneni != null) {
    return parseCas(splneni) <= parseCas(termin) ? "splneno" : "poruseno";
  }
  const tedMs = parseCas(ted);
  const terminMs = parseCas(termin);
  if (tedMs > terminMs) return "poruseno";
  const nahMs = parseCas(nahlaseno);
  if (tedMs >= nahMs + 0.75 * (terminMs - nahMs)) return "ohrozeno";
  return "bezi";
}

/** Stav SLA (reakce, vyřešení) k času ted. */
export function slaStav(zavada, ted) {
  if (zavada.stav === "zrusena") return { reakce: "zruseno", vyreseni: "zruseno" };
  const t = terminy(zavada);
  return {
    reakce: slaJedno(casPrechodu(zavada, "v-reseni"), t.reakce, ted, zavada.nahlaseno),
    vyreseni: slaJedno(casPrechodu(zavada, "hotova"), t.vyreseni, ted, zavada.nahlaseno),
  };
}

/** Zbývající minuty (celé, může být záporné) do termínů. */
export function zbyva(zavada, ted) {
  const t = terminy(zavada);
  const tedMs = parseCas(ted);
  return {
    reakce: Math.round((parseCas(t.reakce) - tedMs) / MS_PER_MIN),
    vyreseni: Math.round((parseCas(t.vyreseni) - tedMs) / MS_PER_MIN),
  };
}

const OTEVRENE_STAVY = ["nova", "prirazena", "v-reseni", "ceka-na-dil"];

/** Přehled závad k času ted. */
export function prehled(zavady, ted) {
  const podleStavu = {};
  for (const s of STAVY) podleStavu[s] = 0;
  let otevrene = 0;
  let poruseneSla = 0;
  for (const z of zavady) {
    if (z.stav in podleStavu) podleStavu[z.stav] += 1;
    if (OTEVRENE_STAVY.includes(z.stav)) otevrene += 1;
    const sla = slaStav(z, ted);
    if (sla.reakce === "poruseno" || sla.vyreseni === "poruseno") poruseneSla += 1;
  }
  return { podleStavu, otevrene, poruseneSla };
}
