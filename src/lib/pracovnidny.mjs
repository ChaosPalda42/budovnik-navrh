// Pracovní dny v ČR — Velikonoce, státní svátky, posun o pracovní dny.
// Vše v UTC, data jako řetězce "YYYY-MM-DD".

const MS_PER_DAY = 86400000;

function parseDatum(s) {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function formatDatum(ms) {
  const dt = new Date(ms);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Datum Velikonoční neděle (Meeus/Jones/Butcher). */
export function velikonocniNedele(rok) {
  const a = rok % 19;
  const b = Math.floor(rok / 100);
  const c = rok % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = březen, 4 = duben
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return formatDatum(Date.UTC(rok, month - 1, day));
}

/** 13 dnů pracovního klidu v ČR, vzestupně seřazených. */
export function svatky(rok) {
  const easter = velikonocniNedele(rok);
  const velkyPatek = pridejDny(easter, -2);
  const velikonoce = pridejDny(easter, 1);
  const dny = [
    `${rok}-01-01`,
    velkyPatek,
    velikonoce,
    `${rok}-05-01`,
    `${rok}-05-08`,
    `${rok}-07-05`,
    `${rok}-07-06`,
    `${rok}-09-28`,
    `${rok}-10-28`,
    `${rok}-11-17`,
    `${rok}-12-24`,
    `${rok}-12-25`,
    `${rok}-12-26`,
  ];
  return dny.sort();
}

export function jePracovniDen(datum) {
  const ms = parseDatum(datum);
  const den = new Date(ms).getUTCDay();
  if (den === 0 || den === 6) return false;
  const rok = new Date(ms).getUTCFullYear();
  return !svatky(rok).includes(datum);
}

/** Posun o n kalendářních dnů (n může být záporné). */
export function pridejDny(datum, n) {
  return formatDatum(parseDatum(datum) + n * MS_PER_DAY);
}

/** Posun o n pracovních dnů dopředu; n = 0 vrátí datum beze změny. */
export function pridejPracovniDny(datum, n) {
  if (n === 0) return datum;
  let ms = parseDatum(datum);
  let pocet = 0;
  while (pocet < n) {
    ms += MS_PER_DAY;
    if (jePracovniDen(formatDatum(ms))) pocet += 1;
  }
  return formatDatum(ms);
}

/** Počet pracovních dnů d, kde od < d <= do_; do_ <= od -> 0. */
export function pracovniDnyMezi(od, do_) {
  const odMs = parseDatum(od);
  const doMs = parseDatum(do_);
  if (doMs <= odMs) return 0;
  let pocet = 0;
  for (let ms = odMs + MS_PER_DAY; ms <= doMs; ms += MS_PER_DAY) {
    if (jePracovniDen(formatDatum(ms))) pocet += 1;
  }
  return pocet;
}

/** Rozdíl v kalendářních dnech (do_ − od), může být záporný. */
export function dnuMezi(od, do_) {
  return Math.round((parseDatum(do_) - parseDatum(od)) / MS_PER_DAY);
}
