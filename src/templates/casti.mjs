/** Společné stavební bloky stránek. */
import { esc } from "./lib.mjs";
import { ikona } from "./ikony.mjs";
import { rez, pohled, TECHNOLOGIE_REZU, SCENY } from "./kresby.mjs";
import { odkaz } from "./layout.mjs";
import { DOTAZY } from "./obsah.mjs";

export function osa(znak, text) {
  return `<span class="osa"><span class="osa__bublina">${esc(znak)}</span>${esc(text)}</span>`;
}

export function hlavickaSekce(znak, stitek, nadpis, popis = "", stred = false) {
  return `<div class="hlavicka-sekce${stred ? " hlavicka-sekce--stred" : ""} odhal">
    ${osa(znak, stitek)}
    <h2>${nadpis}</h2>
    ${popis ? `<p>${popis}</p>` : ""}
  </div>`;
}

export function uvodStranky({ drobky = [], stitek = "", nadpis, lead = "", akce = "", bok = "" }) {
  const cesta = [`<a href="${odkaz("uvod")}">Budovník</a>`, ...drobky.map(([id, t]) => id ? `<span><a href="${odkaz(id)}">${esc(t)}</a></span>` : `<span>${esc(t)}</span>`)];
  return `<section class="uvod-stranky">
    <div class="obal ${bok ? "dve-kolony" : ""}">
      <div data-stavba>
        <nav class="drobky" aria-label="Drobečková navigace">${cesta.join("")}</nav>
        ${stitek ? `<span class="stitek">${esc(stitek)}</span>` : ""}
        <h1>${nadpis}</h1>
        ${lead ? `<p class="lead">${lead}</p>` : ""}
        ${akce ? `<div class="hero__akce">${akce}</div>` : ""}
      </div>
      ${bok ? `<div data-stavba>${bok}</div>` : ""}
    </div>
  </section>`;
}

export function ctaPas({ nadpis = "Pojďme se podívat na váš dům.", text = "Prohlídka objektu a návrh rozsahu správy jsou zdarma a nezávazné. Ozveme se do jednoho pracovního dne.", primarni = ["Získat nezávaznou nabídku", "kontakt", "#poptavka"], sekundarni = ["Spočítat orientační cenu", "kalkulacka", ""] } = {}) {
  return `<section class="sekce" style="padding-top:0">
    <div class="obal">
      <div class="cta-pas odhal">
        <div><h2>${nadpis}</h2><p>${esc(text)}</p></div>
        <div class="hero__akce" style="margin:0">
          <a class="tl tl--tmavy" href="${odkaz(primarni[1])}${primarni[2]}">${esc(primarni[0])} ${ikona("sipka", { trida: "ik--posun" })}</a>
          ${sekundarni ? `<a class="tl tl--obrys" href="${odkaz(sekundarni[1])}${sekundarni[2]}">${esc(sekundarni[0])}</a>` : ""}
        </div>
      </div>
    </div>
  </section>`;
}

export function panelRezu() {
  const prepinac = SCENY.map((s, i) => `<button type="button" data-scena-prepni="${s.id}" aria-pressed="${i === 0}">${esc(s.nazev)}</button>`).join("");
  const data = JSON.stringify(TECHNOLOGIE_REZU).replace(/</g, "\\u003c");
  return `<div class="rez-panel" data-rez>
    <div class="rez-ram">
      <div class="rez-ram__hlava">
        <span class="stitek">Řez A–A · co v domě hlídáme</span>
        <div class="prepinac" role="group" aria-label="Typ budovy">${prepinac}</div>
      </div>
      <div class="rez-ram__platno">${rez()}</div>
      <div class="rez-info" data-rez-info aria-live="polite">
        <span class="rez-info__cislo">?</span>
        <h3>Klikněte na číslo v řezu</h3>
        <p>Ukážeme, co u dané technologie zajišťujeme a jaké revize a kontroly hlídáme.</p>
        <div class="rez-info__revize"></div>
      </div>
      <div class="rez-legenda" data-rez-legenda></div>
    </div>
    <script type="application/json" data-rez-data>${data}</script>
  </div>`;
}

export function kartaObjektu(o, d = 0) {
  const meritko = { rezidencni: "POHLED JIŽNÍ · M 1:400", komercni: "POHLED ZÁPADNÍ · M 1:800", verejne: "POHLED HLAVNÍ · M 1:500" }[o.id];
  return `<a class="karta objekt-karta odhal" style="--d:${d}" href="${odkaz(o.id)}" data-kota>
    <div class="objekt-karta__kresba" data-meritko="${meritko}">${pohled(o.id)}</div>
    <div class="objekt-karta__telo">
      <span class="stitek">${esc(o.pro)}</span>
      <h3 style="margin:6px 0 8px">${esc(o.nazev)}</h3>
      <p>${esc(o.kratce)}</p>
      <ul class="objekt-karta__typy">${o.typy.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <span class="karta__pata">Jak to u nich děláme ${ikona("sipka")}</span>
    </div>
  </a>`;
}

export function kartaSluzby(s, d = 0) {
  return `<a class="karta odhal" style="--d:${d}" href="${odkaz(s.id)}" data-kota>
    <span class="stitek karta__kod">${esc(s.kod)}</span>
    <span class="karta__ikona">${ikona(s.ikona, { velikost: 22 })}</span>
    <h3>${esc(s.nazev)}</h3>
    <p>${esc(s.kratce)}</p>
    <span class="karta__pata">Co všechno zahrnuje ${ikona("sipka")}</span>
  </a>`;
}

export function duvera(firma) {
  const polozky = [
    ["stit", `Pojištění odpovědnosti do ${firma.pojisteni}`, "vzor"],
    ["certifikat", firma.certifikaty.join(" · "), "vzor"],
    ["hodiny", "Technik u havárie do 2 hodin", "SLA"],
    ["sirena", "Dispečink 24/7, 365 dní v roce", ""],
    ["kalendar", "Revize hlídané systémem, ne sešitem", ""],
    ["parta", "Ověření řemeslníci s oprávněním a pojištěním", ""],
    ["smlouva", "Jedna smlouva, jedna faktura", ""],
  ];
  const kus = polozky.map(([ik, t, s]) => `<span class="duvera__polozka">${ikona(ik)}${esc(t)}${s ? `<small>${esc(s)}</small>` : ""}</span>`).join("");
  return `<div class="duvera" aria-label="Proč nám věřit"><div class="duvera__pas">${kus}${kus.replace(/<span class="duvera__polozka">/g, '<span class="duvera__polozka" aria-hidden="true">')}</div></div>`;
}

export function dotazy(polozky = DOTAZY) {
  return `<div class="dotazy">${polozky.map(([q, a], i) => `<details class="odhal" style="--d:${i % 4}"${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>`;
}

export function portalNahled() {
  return `<div class="zarizeni odhal" aria-hidden="true">
    <div class="zarizeni__lista"><i></i><i></i><i></i><span>portal.budovnik.cz · SVJ Lipová 1287</span></div>
    <div class="zarizeni__telo">
      <div class="mini-kpi">
        <div><strong data-pocitadlo="14">14</strong><span>revizí v kalendáři</span></div>
        <div><strong data-pocitadlo="2">2</strong><span>závady v řešení</span></div>
        <div><strong>+921</strong><span>Kč přeplatek, byt 12</span></div>
      </div>
      <div class="mini-seznam">
        <div>${ikona("vytah", { velikost: 18 })}<span>Odborná prohlídka výtahu</span><span class="stav stav--pozor">za 14 dní</span></div>
        <div>${ikona("kapka", { velikost: 18 })}<span>Kape ventil ve sklepě<em>technik dorazí dnes 14:30</em></span><span class="stav stav--info">v řešení</span></div>
        <div>${ikona("blesk", { velikost: 18 })}<span>Revize elektro – společné prostory</span><span class="stav stav--ok">v pořádku</span></div>
        <div>${ikona("dokument", { velikost: 18 })}<span>Vyúčtování služeb 2025</span><span class="stav stav--neutral">PDF</span></div>
      </div>
    </div>
  </div>`;
}
