// C-027: Role a oprávnění v interním systému (podle opravneni.php z byPalda CRM).
// Jedno místo, kde se rozhoduje „smí to?“ – role a úkony pro správu budov.

export const ROLE = {
  spravce: "Správce",
  dispecer: "Dispečer",
  ucetni: "Účetní",
  technik: "Technik",
};

export const AKCE = [
  "klienti.cist",
  "klienti.psat",
  "klienti.mazat",
  "objekty.cist",
  "objekty.psat",
  "zakazky.cist",
  "zakazky.psat",
  "zavady.cist",
  "zavady.psat",
  "smlouvy.cist",
  "smlouvy.psat",
  "doklady.cist",
  "doklady.psat",
  "doklady.mazat",
  "dodavatele.cist",
  "dodavatele.psat",
  "vyuctovani.cist",
  "vyuctovani.psat",
  "ukoly.psat",
  "statistiky",
  "uzivatele",
  "nastaveni",
];

export const PRAVA_ROLI = {
  dispecer: [
    "klienti.cist",
    "klienti.psat",
    "objekty.cist",
    "objekty.psat",
    "zakazky.cist",
    "zakazky.psat",
    "zavady.cist",
    "zavady.psat",
    "smlouvy.cist",
    "doklady.cist",
    "dodavatele.cist",
    "dodavatele.psat",
    "ukoly.psat",
    "statistiky",
  ],
  ucetni: [
    "klienti.cist",
    "objekty.cist",
    "zakazky.cist",
    "smlouvy.cist",
    "smlouvy.psat",
    "doklady.cist",
    "doklady.psat",
    "vyuctovani.cist",
    "vyuctovani.psat",
    "statistiky",
  ],
  technik: ["objekty.cist", "zavady.cist", "zavady.psat", "ukoly.psat"],
};

export const JEN_SPRAVCE = ["uzivatele", "nastaveni"];

/**
 * Smí uživatel danou akci?
 * 1. uzivatel null/undefined -> false.
 * 2. akce v JEN_SPRAVCE -> uzivatel.role === "spravce" (platí i při vypnutých právech).
 * 3. akce není v AKCE -> false.
 * 4. !pravaZapnuta -> true.
 * 5. role "spravce" -> true.
 * 6. jinak PRAVA_ROLI[role] obsahuje akce (neznámá role -> false).
 */
export function muze(uzivatel, akce, pravaZapnuta = true) {
  if (uzivatel === null || uzivatel === undefined) return false;
  if (JEN_SPRAVCE.includes(akce)) return uzivatel.role === "spravce";
  if (!AKCE.includes(akce)) return false;
  if (!pravaZapnuta) return true;
  if (uzivatel.role === "spravce") return true;
  const prava = PRAVA_ROLI[uzivatel.role];
  return Array.isArray(prava) && prava.includes(akce);
}

/** AKCE v pořadí AKCE, pro které muze() vrací true. */
export function pravaUzivatele(uzivatel, pravaZapnuta = true) {
  return AKCE.filter((akce) => muze(uzivatel, akce, pravaZapnuta));
}
