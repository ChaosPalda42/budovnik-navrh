// Kontrakt C-012 – Peníze v halířích (převod reference/bypalda/penize.php).
// Samostatný modul bez závislostí: převod částky z formuláře na haléře
// a český zápis peněz pro člověka.

const NBSP = "\u00a0";

/**
 * PHP-style round: zaokrouhlení od nuly (round(2.5)=3, round(-2.5)=-3).
 */
function phpRound(x) {
  return x >= 0 ? Math.round(x) : -Math.round(-x);
}

/**
 * number_format($cislo, 0, ',', NBSP): tisíce oddělené nezlomitelnou mezerou.
 */
function ciselTisice(cislo) {
  const s = String(Math.trunc(Math.abs(cislo)));
  let out = "";
  let rest = s;
  while (rest.length > 3) {
    out = NBSP + rest.slice(-3) + out;
    rest = rest.slice(0, -3);
  }
  return rest + out;
}

/**
 * Přečte částku, jak ji člověk napíše (nebo int/float v korunách),
 * a vrátí celé haléře.
 *
 * Ověří se, že vstup je platné číslo (s volitelnou minus/plus značkou),
 * aby se zabránilo zavádějícím výsledkům z řetězců jako "12abc34".
 */
export function naHalere(vstup) {
  if (typeof vstup === "number") {
    if (Number.isInteger(vstup)) {
      return vstup * 100;
    }
    return phpRound(vstup * 100);
  }

  let s = String(vstup);

  // Odstranění měny a mezer (včetně nezlomitelné U+00A0).
  s = s.replace(/kč|czk/giu, "");
  s = s.replace(/[\u00a0\u202f \t\n\r]/g, "");

  // Když v textu není žádná číslice, je to nesmysl -> 0.
  if (!/\d/.test(s)) {
    return 0;
  }

  // Celé číslo musí být rozpareované: "12abc34" je nesmysl, ne 1234.
  if (!/^[+-]?(?:\d{1,3}(?:[.,]\d{3})+|\d+)(?:[.,]\d+)?$/.test(s)) {
    return 0;
  }

  const negativni = s.startsWith("-");

  if (s.includes(",")) {
    // Čárka je desetinná oddělovačka (je-li jen jedna), tečky jsou tisíce.
    s = s.replace(/\./g, "");
    const tecky = (s.match(/,/g) || []).length;
    if (tecky > 1) {
      s = s.replace(/,/g, ""); // víc čárek = oddělovače tisíců
    } else {
      s = s.replace(/,/g, ".");
    }
  } else if ((s.match(/\./g) || []).length > 1) {
    // Víc teček = oddělovače tisíců ('1.500.000').
    s = s.replace(/\./g, "");
  }

  s = s.replace(/^[+-]+/, "");

  const casti = s.split(".");
  const koruny = parseInt(casti[0] ?? "0", 10);
  const desetinne = (casti[1] ?? "").slice(0, 3).padEnd(3, "0");
  let halere = koruny * 100 + parseInt(desetinne.slice(0, 2), 10);

  // Zaokrouhlení na celý haléř podle třetího desetinného místa.
  if (Number(desetinne[2]) >= 5) {
    halere++;
  }

  return negativni ? -halere : halere;
}

/**
 * Český zápis peněz: '15 000,50 Kč' (oddělovač tisíců je nezlomitelná mezera,
 * mezi číslem a 'Kč' obyčejná mezera).
 * Celé koruny se píšou bez ',00'.
 */
export function kc(halere, sMenou = true) {
  const zaporna = halere < 0;
  const abs = Math.abs(halere);

  const koruny = Math.floor(abs / 100);
  const hal = abs % 100;

  let cislo = ciselTisice(koruny);
  if (hal !== 0) {
    cislo += "," + String(hal).padStart(2, "0");
  }

  if (zaporna) {
    cislo = "-" + cislo;
  }

  return sMenou ? cislo + " Kč" : cislo;
}

/**
 * Krátký zápis do dlaždic statistik:
 * do 100 000 Kč celé koruny, do 1 mil. tisíce, nad to miliony
 * na jedno desetinné místo (',0' se zahodí).
 */
export function kcKratce(halere) {
  const absKoruny = Math.floor(Math.abs(halere) / 100);

  if (absKoruny < 100000) {
    return kc(phpRound(halere / 100) * 100);
  }

  const predpona = halere < 0 ? "-" : "";

  if (absKoruny < 1000000) {
    const tisice = Math.floor((absKoruny + 500) / 1000);
    return predpona + ciselTisice(tisice) + " tis.";
  }

  const desetiny = Math.floor((absKoruny + 50000) / 100000);
  let text = ciselTisice(Math.floor(desetiny / 10)) + "," + (desetiny % 10);
  text = text.replace(/,0$/, "");

  return predpona + text + " mil.";
}
