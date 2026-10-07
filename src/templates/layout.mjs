/** Kostra stránky: havarijní linka, hlavička, navigace, patička. */
import { esc, atr } from "./lib.mjs";
import { ikona } from "./ikony.mjs";
import { logo } from "./kresby.mjs";
import { SLUZBY, OBJEKTY } from "./obsah.mjs";

export const STRANKY = {
  uvod: "index.html",
  sluzby: "sluzby.html",
  prokoho: "pro-koho.html",
  reference: "reference.html",
  system: "system.html",
  revize: "revize.html",
  kalkulacka: "kalkulacka.html",
  dodavatele: "kariera.html",
  onas: "o-nas.html",
  kontakt: "kontakt.html",
  portal: "portal.html",
  dispecink: "dispecink.html",
  ukazka: "o-ukazce.html",
  soukromi: "ochrana-udaju.html",
  chyba404: "404.html",
};

export function odkaz(id) {
  if (STRANKY[id]) return STRANKY[id];
  const s = SLUZBY.find((x) => x.id === id);
  if (s) return s.soubor;
  const o = OBJEKTY.find((x) => x.id === id);
  if (o) return o.soubor;
  return id;
}

function navigace(ctx, aktivni) {
  const polozka = (id, popisek) =>
    `<a href="${odkaz(id)}"${atr({ "aria-current": id === aktivni ? "page" : null })}>${esc(popisek)}</a>`;
  const panelOdkaz = (id, ik, nazev, popis) =>
    `<a href="${odkaz(id)}"${atr({ "aria-current": id === aktivni ? "page" : null })}>${ikona(ik)}<span><strong>${esc(nazev)}</strong><small>${esc(popis)}</small></span></a>`;
  const rozbal = (popisek, obsah, jeAktivni) => `
    <div class="navigace__vice${jeAktivni ? " je-aktivni" : ""}" data-rozbal>
      <button type="button" aria-expanded="false">${esc(popisek)}${ikona("sipkaDolu", { velikost: 14 })}</button>
      <div class="navigace__panel">${obsah}</div>
    </div>`;
  const sluzby = [panelOdkaz("sluzby", "mriz", "Všechny služby", "Přehled facility managementu"),
    ...SLUZBY.map((s) => panelOdkaz(s.id, s.ikona, s.nazev, s.kratce.split(".")[0]))].join("");
  const ikonyObjektu = { rezidencni: "dum", komercni: "budova", verejne: "skola" };
  const objekty = [panelOdkaz("prokoho", "mriz", "Pro koho pracujeme", "Rozcestník typů objektů"),
    ...OBJEKTY.map((o) => panelOdkaz(o.id, ikonyObjektu[o.id], o.nazev, o.pro))].join("");
  const nastroje = [
    panelOdkaz("system", "automat", "Systém Budovník", "Portál, dispečink a automatizace"),
    panelOdkaz("revize", "kalendar", "Průvodce revizemi", "Jaké revize váš dům potřebuje"),
    panelOdkaz("kalkulacka", "kalkulacka", "Kalkulačka ceny", "Orientační cena správy za minutu"),
  ].join("");
  const jeSluzba = aktivni === "sluzby" || SLUZBY.some((s) => s.id === aktivni);
  const jeObjekt = aktivni === "prokoho" || OBJEKTY.some((o) => o.id === aktivni);
  const jeNastroj = ["system", "revize", "kalkulacka"].includes(aktivni);
  return `<nav class="navigace" id="navigace" data-stavba aria-label="Hlavní navigace">
    ${rozbal("Služby", sluzby, jeSluzba)}
    ${rozbal("Pro koho", objekty, jeObjekt)}
    ${polozka("reference", "Reference")}
    ${rozbal("Systém a nástroje", nastroje, jeNastroj)}
    ${polozka("onas", "O nás")}
    ${polozka("kontakt", "Kontakt")}
  </nav>`;
}

function patka(ctx) {
  const f = ctx.firma;
  const sloupec = (nadpis, polozky) => `<div><h3>${esc(nadpis)}</h3><ul>${polozky.map(([id, p]) => `<li><a href="${odkaz(id)}">${esc(p)}</a></li>`).join("")}</ul></div>`;
  return `<footer class="patka">
  <div class="obal">
    <div class="patka__mrizka">
      <div>
        <a class="znacka" href="${odkaz("uvod")}">${logo()}<span class="znacka__text"><span class="znacka__jmeno">${esc(f.znacka)}</span><span class="znacka__pod">${esc(f.podtitul)}</span></span></a>
        <p style="max-width:34ch">Technická, provozní i ekonomická správa bytových domů, komerčních a veřejných budov. Jeden kontakt, jedna smlouva, všechno online.</p>
        <a class="patka__havarie" href="tel:${esc(f.havarijniOdkaz)}">${ikona("sirena")} Havárie 24/7: ${esc(f.havarijni)}</a>
      </div>
      ${sloupec("Služby", [["technicka", "Technická správa"], ["provozni", "Provozní správa"], ["ekonomicka", "Ekonomická správa"], ["energetika", "Energetický management"], ["revize", "Průvodce revizemi"]])}
      ${sloupec("Budovník", [["prokoho", "Pro koho pracujeme"], ["reference", "Reference"], ["system", "Systém Budovník"], ["kalkulacka", "Kalkulačka ceny"], ["onas", "O nás"], ["dodavatele", "Kariéra"]])}
      <div>
        <h3>Kontakt</h3>
        <ul>
          <li><a href="tel:${esc(f.havarijniOdkaz)}">${esc(f.telefon)}</a></li>
          <li><a href="mailto:${esc(f.email)}">${esc(f.email)}</a></li>
          <li>${esc(f.adresa.ulice)}, ${esc(f.adresa.psc)} ${esc(f.adresa.mesto)}</li>
          <li>IČO ${esc(f.ico)} · DIČ ${esc(f.dic)}</li>
          <li><a href="${odkaz("portal")}">Klientský portál</a> · <a href="${odkaz("dispecink")}">Interní systém</a></li>
        </ul>
      </div>
    </div>
    <div class="patka__spodek">
      <span>© ${ctx.rok} ${esc(f.nazev)} · <a href="${odkaz("soukromi")}">Ochrana osobních údajů</a></span>
      <span><a href="${odkaz("ukazka")}">Návrh webu – co je v ukázce smyšlené</a> · systém a web: byPalda</span>
    </div>
  </div>
</footer>`;
}

export function stranka(ctx, { titulek, popis, aktivni, obsah, aplikace = false, skripty = "" }) {
  const f = ctx.firma;
  const celyTitulek = titulek ? `${titulek} | ${f.znacka} – správa budov` : `${f.znacka} – správa budov, která drží v libele`;
  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(celyTitulek)}</title>
<meta name="description" content="${esc(popis || "Facility management pro SVJ, bytová družstva, komerční a veřejné budovy. Technická, provozní a ekonomická správa, revize, havarijní služba 24/7 a klientský portál.")}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#15171a">
<link rel="icon" href="${ctx.asset("favicon.svg")}" type="image/svg+xml">
<link rel="preload" href="assets/fonts/archivo-100_900-latin-ext.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${ctx.asset("fonts.css")}">
<link rel="stylesheet" href="${ctx.asset("style.css")}">
<script>try{var t=localStorage.getItem("bv-tema");if(t)document.documentElement.dataset.tema=t;}catch(e){}document.documentElement.classList.add("js");${aplikace ? "" : 'try{if(!sessionStorage.getItem("bv-postaveno")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("stavi-se");sessionStorage.setItem("bv-postaveno","1");}}catch(e){}'}</script>
</head>
<body${aplikace ? ' class="je-aplikace"' : ""}>
<a class="preskocit" href="#obsah">Přeskočit na obsah</a>
<div class="metr" aria-hidden="true"></div>
<header class="hlavicka">
  <div class="havarijni" data-stavba>
    <div class="obal havarijni__obal">
      <span class="havarijni__puls" aria-hidden="true"></span>
      <span class="havarijni__text"><span>Havárie? Nonstop dispečink</span>
        <a class="havarijni__tel" href="tel:${esc(f.havarijniOdkaz)}">${ikona("telefon", { velikost: 15 })}${esc(f.havarijni)}</a></span>
      <span class="havarijni__dalsi">
        <a href="${odkaz("dodavatele")}">Kariéra</a>
        <a href="${odkaz("dispecink")}">Interní systém</a>
        <a href="mailto:${esc(f.email)}">${esc(f.email)}</a>
      </span>
    </div>
  </div>
  <div class="lista">
    <div class="obal lista__obal">
      <a class="znacka" data-stavba href="${odkaz("uvod")}" aria-label="${esc(f.znacka)} – úvod">${logo()}<span class="znacka__text"><span class="znacka__jmeno">${esc(f.znacka)}</span><span class="znacka__pod">${esc(f.podtitul)}</span></span></a>
      ${navigace(ctx, aktivni)}
      <div class="lista__akce" data-stavba>
        <a class="tl tl--obrys tl--maly tl--portal" href="${odkaz("portal")}">${ikona("zamek", { velikost: 16 })}<span>Portál</span></a>
        <a class="tl tl--maly tl--nabidka" href="${odkaz("kontakt")}#poptavka">Nabídka</a>
        <button class="tema" type="button" data-prepni-tema aria-label="Přepnout světlý a tmavý režim" title="Světlý / tmavý režim">
          <span class="slunce">${ikona("slunce", { velikost: 18 })}</span><span class="mesic">${ikona("mesic", { velikost: 18 })}</span>
        </button>
        <button class="hamburger" type="button" aria-label="Menu" aria-controls="navigace" aria-expanded="false"><span class="hamburger__otevrit">${ikona("hamburger")}</span><span class="hamburger__zavrit">${ikona("krizek")}</span></button>
      </div>
    </div>
  </div>
</header>
<div class="ukazka" data-stavba><div class="ukazka__obal"><span class="ukazka__dlouze">Návrh webu – údaje firmy, reference a čísla jsou zatím vzorové.</span><span class="ukazka__kratce">Návrh webu, údaje jsou vzorové.</span><a href="${odkaz("ukazka")}">Co je v ukázce smyšlené</a></div></div>
<main id="obsah">
${obsah}
</main>
${aplikace ? "" : patka(ctx)}
<div class="mobil-havarie">
  <a class="tl tl--havarie" href="tel:${esc(f.havarijniOdkaz)}">${ikona("telefon")} Havárie 24/7</a>
  <a class="tl" href="${odkaz("kontakt")}#poptavka">Nabídka</a>
</div>
<script src="${ctx.asset("app.js")}" defer></script>
${skripty}
</body>
</html>`;
}
