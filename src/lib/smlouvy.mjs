// Smlouvy — šablony s doplňováním údajů, formáty a smluvní termíny.
// Data "YYYY-MM-DD", počítá se v UTC (Date.UTC).

const MS_PER_DAY = 86400000;
const NB = "\u00a0"; // nezlomitelná mezera

function parseDatum(s) {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function toDatumStr(ms) {
  const dt = new Date(ms);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Hodnota podle tečkové cesty; cokoli po cestě chybí -> undefined. */
export function hodnota(data, cesta) {
  let v = data;
  for (const segment of String(cesta).split(".")) {
    if (v === null || v === undefined) return undefined;
    if (Array.isArray(v)) {
      const i = Number(segment);
      if (!Number.isInteger(i) || i < 0 || i >= v.length) return undefined;
      v = v[i];
    } else if (typeof v === "object") {
      v = v[segment];
    } else {
      return undefined;
    }
  }
  return v;
}

function jePravdiva(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.length > 0;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "boolean") return v;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return true;
}

function jeChybici(v) {
  return v === undefined || v === null || v === "";
}

/**
 * Vyplní šablonu daty. Tři kroky v pořadí: each bloky, if bloky, zástupné značky.
 * Vrací { text, chybi } — chybi bez duplicit, nejdřív hlášení z kroku 1, pak z kroku 3.
 */
export function vyplnSablonu(sablona, data) {
  const chybi = [];
  const hlasi = (cesta) => {
    if (!chybi.includes(cesta)) chybi.push(cesta);
  };

  // Krok 1: bloky {{#each cesta}}TĚLO{{/each}}
  let text = String(sablona).replace(
    /\{\{#each\s+([^\s{}]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_m, cesta, telo) => {
      const hod = hodnota(data, cesta);
      if (!Array.isArray(hod) || hod.length === 0) return "";
      return hod
        .map((item, i) =>
          telo
            .replace(/\{\{@cislo\}\}/g, String(i + 1))
            .replace(/\{\{\s*\.([^\s{}]+)\s*\}\}/g, (_mm, pole) => {
              const v = item === null || typeof item !== "object" ? undefined : item[pole];
              if (jeChybici(v)) {
                hlasi(`${cesta}[].${pole}`);
                return `[DOPLNIT: ${pole}]`;
              }
              return String(v);
            })
        )
        .join("");
    }
  );

  // Krok 2: bloky {{#if cesta}}TĚLO{{/if}}
  text = text.replace(
    /\{\{#if\s+([^\s{}]+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_m, cesta, telo) => (jePravdiva(hodnota(data, cesta)) ? telo : "")
  );

  // Krok 3: zástupné značky {{cesta}}
  text = text.replace(/\{\{\s*([^\s{}]+)\s*\}\}/g, (_m, cesta) => {
    const v = hodnota(data, cesta);
    if (jeChybici(v)) {
      hlasi(cesta);
      return `[DOPLNIT: ${cesta}]`;
    }
    return String(v);
  });

  return { text, chybi };
}

/** Kč s mezerou mezi tisíci; nezlomitelná mezera i před "Kč". */
export function formatCastka(castka) {
  const z = castka < 0;
  const cel = Math.round(Math.abs(castka) * 100) / 100;
  const celist = Math.floor(cel);
  const des = Math.round((cel - celist) * 100);
  const tisice = String(celist).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
  const cast = des === 0 ? "" : `,${String(des).padStart(2, "0")}`;
  return `${z ? "-" : ""}${tisice}${cast}${NB}Kč`;
}

/** "2026-10-06" -> "6. 10. 2026". */
export function formatDatum(datum) {
  const [y, m, d] = datum.split("-").map(Number);
  return `${d}. ${m}. ${y}`;
}

/** Posun o n měsíců s oříznutím dne na konec měsíce. */
function pridejMesice(d, n) {
  const [y, m, day] = d.split("-").map(Number);
  const celkem = y * 12 + (m - 1) + n;
  const ny = Math.floor(celkem / 12);
  const nm = (celkem % 12) + 1;
  const maxDen = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
  return toDatumStr(Date.UTC(ny, nm - 1, Math.min(day, maxDen)));
}

/** Posun o n kalendářních dnů (n může být záporné). */
function pridejDny(d, n) {
  return toDatumStr(parseDatum(d) + n * MS_PER_DAY);
}

/** Rozdíl v dnech (b − a), může být záporný. */
function dnuMezi(a, b) {
  return Math.round((parseDatum(b) - parseDatum(a)) / MS_PER_DAY);
}

/** Smluvní termíny: konec, prodloužení, výpovědní lhůty, upozornění. */
export function smluvniTerminy(smlouva, dnes) {
  const { zacatek, dobaMesicu, vypovedniLhutaMesicu, prodlouzeniMesicu } = smlouva;

  if (dobaMesicu === null || dobaMesicu === undefined) {
    // Doba neurčitá: P = 1. den měsíce následujícího po `dnes`.
    const [y, m] = dnes.split("-").map(Number);
    const P = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    return {
      typ: "neurcita",
      konec: null,
      prodlouzeno: 0,
      posledniDenVypovedi: null,
      dnuDoVypovedi: null,
      upozornit: false,
      skoncila: false,
      ucinnostVypovedi: pridejDny(pridejMesice(P, vypovedniLhutaMesicu), -1),
    };
  }

  let konec = pridejDny(pridejMesice(zacatek, dobaMesicu), -1);
  let prodlouzeno = 0;
  if (prodlouzeniMesicu > 0) {
    while (konec < dnes) {
      konec = pridejDny(pridejMesice(pridejDny(konec, 1), prodlouzeniMesicu), -1);
      prodlouzeno += 1;
    }
  }
  const posledniDenVypovedi =
    prodlouzeniMesicu > 0
      ? pridejDny(pridejMesice(pridejDny(konec, 1), -vypovedniLhutaMesicu), -1)
      : null;
  const dnuDoVypovedi = posledniDenVypovedi ? dnuMezi(dnes, posledniDenVypovedi) : null;
  const upozornit = dnuDoVypovedi !== null && dnuDoVypovedi >= 0 && dnuDoVypovedi <= 60;
  const skoncila = !(prodlouzeniMesicu > 0) && konec < dnes;

  return {
    typ: "urcita",
    konec,
    prodlouzeno,
    posledniDenVypovedi,
    dnuDoVypovedi,
    upozornit,
    skoncila,
    ucinnostVypovedi: null,
  };
}
