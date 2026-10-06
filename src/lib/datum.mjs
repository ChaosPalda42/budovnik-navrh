// Kontrakt C-013 – Datumy a periody fakturace (převod reference/bypalda/datum.php).
// Datumy v databázi jsou texty 'RRRR-MM-DD', časy 'RRRR-MM-DD HH:MM:SS'.
// Vše se počítá v UTC (Date.UTC) – výsledek nezávisí na časové zóně.

const DEN_MS = 86400000;

/**
 * Načte datum (případně i čas) z textu 'RRRR-MM-DD[ HH:MM[:SS]]'.
 * Vrací {rok, mesic, den, hod, min, sek, maCas} nebo null, pokud text
 * datum neobsahuje.
 */
function datumParse(iso) {
  if (typeof iso !== "string" && typeof iso !== "number") {
    return null;
  }
  const text = String(iso).trim();
  let m =
    /^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/.exec(text) ||
    /^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2})$/.exec(text) ||
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  if (!m) {
    return null;
  }
  const rok = Number(m[1]);
  const mesic = Number(m[2]);
  const den = Number(m[3]);
  const hod = m[4] !== undefined ? Number(m[4]) : 0;
  const min = m[5] !== undefined ? Number(m[5]) : 0;
  const sek = m[6] !== undefined ? Number(m[6]) : 0;
  // Jako PHP createFromFormat: mimořádné hodnoty (13. měsíc, 40. den…)
  // se nepřerovnávají, ale přetékají do dalšího měsíce/roku.
  const ms = Date.UTC(rok, mesic - 1, den, hod, min, sek);
  const d = new Date(ms);
  return {
    rok: d.getUTCFullYear(),
    mesic: d.getUTCMonth() + 1,
    den: d.getUTCDate(),
    hod: d.getUTCHours(),
    min: d.getUTCMinutes(),
    sek: d.getUTCSeconds(),
    maCas: m[4] !== undefined,
  };
}

/**
 * Počet dní v měsíci daného roku/měsíce (1–12).
 */
export function pocetDniMesice(rok, mesic) {
  return new Date(Date.UTC(rok, mesic, 0)).getUTCDate();
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function isoFormat(rok, mesic, den) {
  return `${String(rok).padStart(4, "0")}-${pad2(mesic)}-${pad2(den)}`;
}

/**
 * Datum bez číselných doplnění: '7. 10. 2026'.
 */
export function datumCz(iso) {
  const dt = datumParse(iso);
  if (dt === null) {
    return "";
  }
  return `${dt.den}. ${dt.mesic}. ${dt.rok}`;
}

/**
 * Datum s časem: '7. 10. 2026 14:05'.
 * Když vstup nemá čas, vrátí jen datum.
 */
export function datumCasCz(iso) {
  const dt = datumParse(iso);
  if (dt === null) {
    return "";
  }
  const den = `${dt.den}. ${dt.mesic}. ${dt.rok}`;
  if (!String(iso ?? "").includes(":")) {
    return den;
  }
  return `${den} ${pad2(dt.hod)}:${pad2(dt.min)}`;
}

/**
 * Posun data o počet dní (může být záporný).
 */
export function posunDatum(iso, dni) {
  const dt = datumParse(iso);
  if (dt === null) {
    return "";
  }
  const ms = Date.UTC(dt.rok, dt.mesic - 1, dt.den) + Number(dni) * DEN_MS;
  const d = new Date(ms);
  return isoFormat(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/**
 * Posun data o počet měsíců. Den se ořízne na poslední den cílového
 * měsíce (nikdy nepřeteče do dalšího měsíce).
 */
export function posunMesice(iso, mesicu) {
  const dt = datumParse(iso);
  if (dt === null) {
    return "";
  }
  const celkem = dt.rok * 12 + (dt.mesic - 1) + Number(mesicu);
  const novyRok = Math.trunc(celkem / 12);
  const novyMesic = ((celkem % 12) + 12) % 12 + 1;
  const novyDen = Math.min(dt.den, pocetDniMesice(novyRok, novyMesic));
  return isoFormat(novyRok, novyMesic, novyDen);
}

/**
 * Délka fakturační periody v měsících (0 = neplatná perioda).
 */
export function periodaMesicu(perioda) {
  switch (perioda) {
    case "mesicne":
      return 1;
    case "ctvrtletne":
      return 3;
    case "pololetne":
      return 6;
    case "rocne":
      return 12;
    default:
      return 0;
  }
}

/**
 * Datum další fakturace: posun o periodu a den oříznutý na délku měsíce.
 */
export function dalsiFakturace(odIso, perioda, denFakturace) {
  const mesice = periodaMesicu(perioda);
  if (mesice === 0) {
    return "";
  }
  const posunuty = posunMesice(odIso, mesice);
  if (posunuty === "") {
    return "";
  }
  const rok = Number(posunuty.slice(0, 4));
  const mesic = Number(posunuty.slice(5, 7));
  const den = Math.max(1, Math.min(Number(denFakturace), pocetDniMesice(rok, mesic)));
  return isoFormat(rok, mesic, den);
}

/**
 * Kolik dní zbývá do data (kladné = v budoucnu, záporné = po termínu).
 * 'dnes' se předává jako parametr 'RRRR-MM-DD' (PHP ho bere z hodin).
 */
export function zbyvaDni(iso, dnes) {
  const dt = datumParse(iso);
  if (dt === null) {
    return null;
  }
  const d = datumParse(dnes);
  if (d === null) {
    return null;
  }
  const cil = Date.UTC(dt.rok, dt.mesic - 1, dt.den);
  const dnesMs = Date.UTC(d.rok, d.mesic - 1, d.den);
  return Math.round((cil - dnesMs) / DEN_MS);
}

/**
 * Člověkem čitelný text lhůty: 'dnes', 'zítra', 'za 3 dny', 'po termínu o 5 dní'.
 */
export function lhutaText(iso, dnes) {
  const dny = zbyvaDni(iso, dnes);
  if (dny === null) {
    return "";
  }
  if (dny === 0) {
    return "dnes";
  }
  if (dny === 1) {
    return "zítra";
  }
  if (dny >= 2 && dny <= 4) {
    return `za ${dny} dny`;
  }
  if (dny >= 5) {
    return `za ${dny} dní`;
  }
  if (dny === -1) {
    return "po termínu o 1 den";
  }
  if (dny >= -4) {
    return `po termínu o ${Math.abs(dny)} dny`;
  }
  return `po termínu o ${Math.abs(dny)} dní`;
}
