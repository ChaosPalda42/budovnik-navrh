// Kontrakt C-026 – co se dá z poptávky z webu vyčíst, než z ní vznikne
// klient a zakázka. Samé čisté funkce: žádná databáze, žádné volání ARESu,
// nic se netiskne. Část A je věrný převod reference/bypalda/poptavky.php;
// část B přidává správu budov (segmenty SVJ/komerční/veřejná/jiné).

/**
 * Podklady pro založení klienta z poptávky a (volitelně) z ARESu.
 */
export function poptavkaKlientData(p, ares = {}) {
  const firma = String(p.firma ?? "").trim();
  const jmeno = String(p.jmeno ?? "").trim();
  const aresNazev = String(ares.nazev ?? "").trim();

  const nazev = aresNazev !== "" ? aresNazev : firma !== "" ? firma : jmeno;

  return {
    nazev,
    typ: firma !== "" || Object.keys(ares).length > 0 ? "firma" : "osoba",
    ico: String(ares.ico ?? "").trim(),
    dic: String(ares.dic ?? "").trim(),
    ulice: String(ares.ulice ?? "").trim(),
    mesto: String(ares.mesto ?? "").trim(),
    psc: String(ares.psc ?? "").trim(),
    zeme: String(ares.zeme ?? "").trim() !== "" ? String(ares.zeme ?? "").trim() : "CZ",
    email: String(p.email ?? "").trim(),
    telefon: String(p.telefon ?? "").trim(),
    web: "",
    stav: "potencialni",
    zdroj: "web",
  };
}

/**
 * Normalizace názvu klienta: malá písmena, skupiny bílých znaků jednou mezerou, ořez.
 */
export function poptavkaNormalizaceNazvu(nazev) {
  const nizke = String(nazev).toLowerCase();
  return nizke.replace(/\s+/g, " ").trim();
}

/**
 * Najde id prvního klienta, který se shoduje (IČO, e-mail, název), jinak null.
 */
export function poptavkaShodaKlienta(p, klienti, ares = {}) {
  const ico = String(ares.ico ?? "").trim();
  if (ico !== "") {
    for (const klient of klienti) {
      if (String(klient.ico ?? "").trim() === ico) {
        return Number(klient.id);
      }
    }
  }

  const email = String(p.email ?? "").trim().toLowerCase();
  if (email !== "") {
    for (const klient of klienti) {
      if (String(klient.email ?? "").trim().toLowerCase() === email) {
        return Number(klient.id);
      }
    }
  }

  const aresNazev = String(ares.nazev ?? "").trim();
  let hledany = aresNazev !== "" ? aresNazev : String(p.firma ?? "").trim();
  if (hledany !== "") {
    hledany = poptavkaNormalizaceNazvu(hledany);
    for (const klient of klienti) {
      if (poptavkaNormalizaceNazvu(String(klient.nazev ?? "")) === hledany) {
        return Number(klient.id);
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Část B – správa budov: segmenty, název a zadání zakázky.
// ---------------------------------------------------------------------------

/**
 * Segmenty poptávek na správu budov a názvy zakázek pro ně.
 */
export const SEGMENTY = {
  svj: "Správa SVJ a družstva",
  komercni: "Správa komerčního objektu",
  verejne: "Správa veřejné budovy",
  jine: "Jednorázová zakázka",
};

/**
 * Klíč segmentu z formuláře; neznámý nebo chybějící -> "jine".
 */
export function poptavkaKategorie(segment) {
  const klic = String(segment ?? "").trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(SEGMENTY, klic) ? klic : "jine";
}

/**
 * Název nové zakázky: 'Segment – Kdo', bez pomlčky, když není nikdo.
 */
export function poptavkaNazevZakazky(p) {
  const nazev = SEGMENTY[poptavkaKategorie(p.segment)];

  let kdo = String(p.firma ?? "").trim();
  if (kdo === "") {
    kdo = String(p.adresa ?? "").trim();
  }
  if (kdo === "") {
    kdo = String(p.jmeno ?? "").trim();
  }
  if (kdo === "") {
    return nazev;
  }
  return nazev + " – " + kdo;
}

/**
 * Text, který se vloží do zadání zakázky.
 */
export function poptavkaZadani(p) {
  const zprava = String(p.zprava ?? "").trim();

  const radky = [];
  const pridat = (popisek, hodnota) => {
    if (hodnota !== "") {
      radky.push(popisek + ": " + hodnota);
    }
  };
  pridat("Kontakt", String(p.jmeno ?? "").trim());
  pridat("Role", String(p.role ?? "").trim());
  pridat("E-mail", String(p.email ?? "").trim());
  pridat("Telefon", String(p.telefon ?? "").trim());
  pridat("Firma", String(p.firma ?? "").trim());
  pridat("Adresa objektu", String(p.adresa ?? "").trim());
  pridat("Velikost", String(p.velikost ?? "").trim());
  radky.push("Typ: " + SEGMENTY[poptavkaKategorie(p.segment)]);
  pridat("Rozpočet podle klienta", String(p.rozpocet ?? "").trim());
  pridat("Odesláno ze stránky", String(p.stranka ?? "").trim());

  const casti = [];
  if (zprava !== "") {
    casti.push(zprava);
  }
  casti.push("--- Z poptávky z webu ---\n" + radky.join("\n"));
  return casti.join("\n\n");
}
