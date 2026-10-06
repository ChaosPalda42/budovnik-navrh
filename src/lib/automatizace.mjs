// C-010 — Automatizační pravidla: podmínky nad daty, úkoly, šablony textu.

export const OPERATORY = ["==", "!=", "<", "<=", ">", ">=", "in", "obsahuje"];

/** Vyhledá hodnotu podle tečkové cesty; chybí -> undefined. */
export function hodnota(polozka, pole) {
  let v = polozka;
  for (const castka of String(pole).split(".")) {
    if (v === null || v === undefined || typeof v !== "object") return undefined;
    v = v[castka];
  }
  return v;
}

/** Zkontroluje jednu podmínku { pole, op, hodnota } proti položce. */
export function splnuje(polozka, podminka) {
  const v = hodnota(polozka, podminka.pole);
  const h = podminka.hodnota;
  switch (podminka.op) {
    case "==":
      return v === h;
    case "!=":
      return v !== h;
    case "<":
      return v === null || v === undefined ? false : v < h;
    case "<=":
      return v === null || v === undefined ? false : v <= h;
    case ">":
      return v === null || v === undefined ? false : v > h;
    case ">=":
      return v === null || v === undefined ? false : v >= h;
    case "in":
      return Array.isArray(h) && h.includes(v);
    case "obsahuje":
      return Array.isArray(v) ? v.includes(h) : typeof v === "string" && v.includes(h);
    default:
      throw new Error("operator");
  }
}

/** Nahradí {{pole}} (tečková cesta, mezery se ořezávají) hodnotou; chybí -> "?". */
export function vyplnText(text, polozka) {
  return String(text).replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (celo, pole) => {
    const v = hodnota(polozka, pole);
    return v === undefined || v === null ? "?" : String(v);
  });
}

/** Vyhodnotí pravidla nad zdroji a vyrobí úkoly (bez hotových, bez duplicit klíče). */
export function vyhodnot(pravidla, zdroje, hotove = []) {
  const hotoveSet = new Set(hotove);
  const videne = new Set();
  const ukoly = [];
  for (const pravidlo of pravidla) {
    const polozky = (zdroje && zdroje[pravidlo.zdroj]) || [];
    for (const polozka of polozky) {
      const klic = pravidlo.id + ":" + polozka.id;
      if (hotoveSet.has(klic) || videne.has(klic)) continue;
      const splnujeVse = (pravidlo.kdyz || []).every((podminka) => splnuje(polozka, podminka));
      if (!splnujeVse) continue;
      videne.add(klic);
      ukoly.push({
        klic,
        pravidlo: pravidlo.id,
        nazev: pravidlo.nazev,
        typ: pravidlo.akce.typ,
        polozka: polozka.id,
        text: vyplnText(pravidlo.akce.text, polozka),
      });
    }
  }
  return ukoly;
}

/** Seskupí úkoly podle typ v pořadí prvního výskytu. */
export function seskup(ukoly) {
  const map = new Map();
  for (const u of ukoly) {
    if (!map.has(u.typ)) map.set(u.typ, { typ: u.typ, pocet: 0, ukoly: [] });
    const g = map.get(u.typ);
    g.pocet += 1;
    g.ukoly.push(u);
  }
  return [...map.values()];
}
