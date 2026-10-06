// C-003 — Zákonné revize: katalog, termíny, stav, kalendář objektů.
// Data jsou řetězce "YYYY-MM-DD"; všechny výpočty v UTC.

export const KATALOG = [
  { kod: "elektro", technologie: "elektro", nazev: "Revize elektroinstalace ve společných prostorách", periodaMesicu: 60, predpis: "ČSN 33 1500, ČSN 33 2000-6" },
  { kod: "hromosvod", technologie: "hromosvod", nazev: "Revize hromosvodu", periodaMesicu: 48, predpis: "ČSN EN 62305-3" },
  { kod: "plyn-revize", technologie: "plyn", nazev: "Revize plynového zařízení", periodaMesicu: 36, predpis: "vyhl. 85/1978 Sb., TPG 704 01" },
  { kod: "plyn-kontrola", technologie: "plyn", nazev: "Kontrola těsnosti plynového zařízení", periodaMesicu: 12, predpis: "vyhl. 85/1978 Sb., TPG 704 01" },
  { kod: "spalinove-cesty", technologie: "spaliny", nazev: "Kontrola spalinové cesty", periodaMesicu: 12, predpis: "vyhl. 34/2016 Sb." },
  { kod: "vytah-prohlidka", technologie: "vytah", nazev: "Odborná prohlídka výtahu", periodaMesicu: 3, predpis: "ČSN 27 4002" },
  { kod: "vytah-zkouska", technologie: "vytah", nazev: "Odborná zkouška výtahu", periodaMesicu: 36, predpis: "ČSN 27 4002" },
  { kod: "vytah-inspekce", technologie: "vytah", nazev: "Inspekční prohlídka výtahu", periodaMesicu: 72, predpis: "ČSN 27 4007" },
  { kod: "hasici-pristroje", technologie: "po", nazev: "Kontrola hasicích přístrojů", periodaMesicu: 12, predpis: "vyhl. 246/2001 Sb." },
  { kod: "hydranty", technologie: "po", nazev: "Kontrola požárních hydrantů", periodaMesicu: 12, predpis: "vyhl. 246/2001 Sb., ČSN 73 0873" },
  { kod: "hydranty-tlak", technologie: "po", nazev: "Tlaková zkouška hadic hydrantů", periodaMesicu: 60, predpis: "ČSN 73 0873" },
  { kod: "eps", technologie: "eps", nazev: "Kontrola elektrické požární signalizace", periodaMesicu: 12, predpis: "vyhl. 246/2001 Sb." },
  { kod: "nouzove-osvetleni", technologie: "nouzove-osvetleni", nazev: "Kontrola nouzového osvětlení", periodaMesicu: 12, predpis: "ČSN EN 50172" },
  { kod: "tlakove-nadoby", technologie: "kotelna", nazev: "Provozní revize tlakových nádob", periodaMesicu: 12, predpis: "ČSN 69 0012" },
  { kod: "kotle", technologie: "kotelna", nazev: "Kontrola kotlů a rozvodů tepla", periodaMesicu: 24, predpis: "zák. 406/2000 Sb." },
  { kod: "vzt", technologie: "vzt", nazev: "Kontrola vzduchotechniky", periodaMesicu: 12, predpis: "nař. vl. 361/2007 Sb." },
  { kod: "chlazeni", technologie: "chlazeni", nazev: "Kontrola těsnosti chladicího okruhu", periodaMesicu: 12, predpis: "nař. EU 2024/573" },
  { kod: "hriste", technologie: "hriste", nazev: "Kontrola dětského hřiště", periodaMesicu: 12, predpis: "ČSN EN 1176-7" },
];

export const TECHNOLOGIE = [...new Set(KATALOG.map((p) => p.technologie))];

export function revizeProTechnologie(technologie) {
  if (!Array.isArray(technologie) || technologie.length === 0) return [];
  const soubor = new Set(technologie);
  return KATALOG.filter((p) => soubor.has(p.technologie));
}

function parseDatum(d) {
  const [y, m, dd] = d.split("-").map(Number);
  return { y, m, dd };
}

function formatDatum(y, m, dd) {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

function dnuVMesici(y, m) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function pridejMesice(datum, n) {
  const { y, m, dd } = parseDatum(datum);
  const celkem = (y * 12 + (m - 1)) + n;
  const ny = Math.floor(celkem / 12);
  const nm = (celkem % 12) + 1;
  const nd = Math.min(dd, dnuVMesici(ny, nm));
  return formatDatum(ny, nm, nd);
}

export function dnuDo(dnes, termin) {
  const a = parseDatum(dnes);
  const b = parseDatum(termin);
  return Math.round((Date.UTC(b.y, b.m - 1, b.dd) - Date.UTC(a.y, a.m - 1, a.dd)) / 86400000);
}

export function pristiTermin(posledni, periodaMesicu) {
  if (!posledni) return null;
  return pridejMesice(posledni, periodaMesicu);
}

export function stav(termin, dnes, predstihDni = 30) {
  if (!termin) return "bez-terminu";
  const d = dnuDo(dnes, termin);
  if (d < 0) return "po-terminu";
  if (d <= predstihDni) return "blizi-se";
  return "v-poradku";
}

export function planObjektu(objekt, dnes, predstihDni = 30) {
  const provedene = (objekt && objekt.provedene) || {};
  const polozky = revizeProTechnologie(objekt ? objekt.technologie : undefined).map((p, i) => {
    const posledni = provedene[p.kod] || null;
    const termin = pristiTermin(posledni, p.periodaMesicu);
    return {
      kod: p.kod,
      nazev: p.nazev,
      technologie: p.technologie,
      periodaMesicu: p.periodaMesicu,
      predpis: p.predpis,
      posledni,
      termin,
      stav: stav(termin, dnes, predstihDni),
      dnu: termin ? dnuDo(dnes, termin) : null,
      _i: i,
    };
  });
  polozky.sort((a, b) => {
    if (a.termin === null && b.termin === null) return a._i - b._i;
    if (a.termin === null) return -1;
    if (b.termin === null) return 1;
    if (a.termin < b.termin) return -1;
    if (a.termin > b.termin) return 1;
    return a._i - b._i;
  });
  return polozky.map(({ _i, ...rest }) => rest);
}

export function souhrn(plan) {
  const s = { celkem: plan.length, poTerminu: 0, bliziSe: 0, vPoradku: 0, bezTerminu: 0 };
  for (const p of plan) {
    if (p.stav === "po-terminu") s.poTerminu++;
    else if (p.stav === "blizi-se") s.bliziSe++;
    else if (p.stav === "v-poradku") s.vPoradku++;
    else s.bezTerminu++;
  }
  return s;
}

export function kalendar(objekty, od, do_, dnes, predstihDni = 30) {
  const vysledky = [];
  (objekty || []).forEach((objekt, oi) => {
    planObjektu(objekt, dnes, predstihDni).forEach((p, pi) => {
      if (p.termin && p.termin >= od && p.termin <= do_) {
        vysledky.push({ ...p, objektId: objekt.id, objektNazev: objekt.nazev, _oi: oi, _pi: pi });
      }
    });
  });
  vysledky.sort((a, b) => {
    if (a.termin < b.termin) return -1;
    if (a.termin > b.termin) return 1;
    if (a._oi !== b._oi) return a._oi - b._oi;
    return a._pi - b._pi;
  });
  return vysledky.map(({ _oi, _pi, ...rest }) => rest);
}
