/** Obsah jednotlivých stránek webu. */
import { esc } from "./lib.mjs";
import { ikona } from "./ikony.mjs";
import { odkaz } from "./layout.mjs";
import { pohled } from "./kresby.mjs";
import { SLUZBY, OBJEKTY, REFERENCE, KROKY, DOTAZY } from "./obsah.mjs";
import { hlavickaSekce, uvodStranky, ctaPas, panelRezu, kartaObjektu, kartaSluzby, duvera, dotazy, portalNahled, osa } from "./casti.mjs";

/* ---------- Úvod ---------- */
export function uvod(ctx) {
  const f = ctx.firma;
  const zalozky = SLUZBY.map((s, i) => `<button type="button" role="tab" id="z-${s.id}" aria-controls="p-${s.id}" aria-selected="${i === 0}">${ikona(s.ikona, { velikost: 22 })}<strong>${esc(s.nazev)}</strong><span>${esc(s.kod)}</span></button>`).join("");
  const panely = SLUZBY.map((s, i) => `<div class="zalozky__panel" role="tabpanel" id="p-${s.id}" aria-labelledby="z-${s.id}"${i ? " hidden" : ""}>
      <span class="stitek">${esc(s.kod)} · ${String(i + 1).padStart(2, "0")}/04</span>
      <h3 style="font-size:1.7rem;margin:8px 0 10px">${esc(s.nazev)}</h3>
      <p class="tlumene" style="max-width:62ch">${esc(s.perex)}</p>
      <ul class="seznam-sluzeb">${s.polozky.map(([n, t]) => `<li><strong>${esc(n)}</strong><span>${esc(t)}</span></li>`).join("")}</ul>
      <a class="tl tl--obrys" style="margin-top:20px" href="${odkaz(s.id)}">Detail: ${esc(s.nazev.toLowerCase())} ${ikona("sipka", { trida: "ik--posun" })}</a>
    </div>`).join("");

  return `
<section class="hero" data-hero>
  <div class="hero__osnova" aria-hidden="true"></div>
  <div class="laser" aria-hidden="true"><div class="laser__h"></div><div class="laser__v"></div><div class="laser__bod"></div><div class="laser__cteni"></div></div>
  <div class="obal hero__mrizka">
    <div>
      <div data-stavba>${osa("A", "Facility management · SVJ · firmy · obce")}</div>
      <h1 data-stavba>Správa budov,<br>která drží <span class="zvyrazneni">v libele.</span></h1>
      <p class="lead" data-stavba>Technická, provozní i ekonomická správa bytových domů, komerčních a veřejných budov. Jeden kontakt, jedna smlouva, jedna faktura. A všechno, co se v domě děje, vidíte online.</p>
      <div class="hero__akce" data-stavba>
        <a class="tl" href="${odkaz("kontakt")}#poptavka">Získat nezávaznou nabídku ${ikona("sipka", { trida: "ik--posun" })}</a>
        <a class="tl tl--obrys" href="${odkaz("kalkulacka")}">${ikona("kalkulacka")} Spočítat orientační cenu</a>
      </div>
      <div class="hero__fakta" data-stavba>
        <div><strong>24/7</strong><span>havarijní dispečink</span></div>
        <div><strong>&lt; 2 h</strong><span>technik u havárie</span></div>
        <div><strong data-pocitadlo="18">18</strong><span>druhů revizí hlídáme</span></div>
      </div>
    </div>
    <div data-stavba>${panelRezu()}</div>
  </div>
</section>
${duvera(f)}

<section class="sekce">
  <div class="obal">
    ${hlavickaSekce("B", "Pro koho pracujeme", "Panelák, kancelářská budova i&nbsp;škola. Každá potřebuje něco jiného.", "Správu stavíme podle typu objektu a toho, kdo o něm rozhoduje: výbor SVJ, majitel, nebo zřizovatel.")}
    <div class="mrizka mrizka--3">${OBJEKTY.map((o, i) => kartaObjektu(o, i)).join("")}</div>
  </div>
</section>

<section class="sekce sekce--plocha">
  <div class="obal">
    ${hlavickaSekce("C", "Co děláme", "Všechno, co budova potřebuje, pod jednou střechou.", "Facility management rozdělený do čtyř celků. Převezmeme celý, nebo jen to, co potřebujete.")}
    <div class="zalozky" data-zalozky>
      <div class="zalozky__seznam" role="tablist" aria-label="Oblasti služeb">${zalozky}</div>
      <div>${panely}</div>
    </div>
  </div>
</section>

<section class="sekce">
  <div class="obal">
    ${hlavickaSekce("D", "Jak to funguje", "Vy máte jeden kontakt. My zajistíme všechno ostatní.", "Technika, úklid, revize, termíny, smlouvy i faktury jsou naše starost. Vy vidíte výsledek.")}
    <div class="model odhal">
      <div class="model__uzel">
        <span class="stitek">Vy</span>
        <h3>Výbor, majitel, ředitel</h3>
        <p>Nahlásíte závadu, schválíte nabídku, podíváte se na stav domu. Z mobilu nebo počítače.</p>
      </div>
      <div class="model__spoj" aria-hidden="true"></div>
      <div class="model__uzel model__uzel--stred">
        <span class="stitek">Budovník</span>
        <h3>Správce a dispečink</h3>
        <p>Plánujeme, objednáváme, kontrolujeme a ručíme za výsledek.</p>
        <div class="model__trojice">
          <span>${ikona("telefon")} Jeden kontakt</span>
          <span>${ikona("smlouva")} Jedna smlouva</span>
          <span>${ikona("dokument")} Jedna faktura</span>
        </div>
      </div>
      <div class="model__spoj model__spoj--zpet" aria-hidden="true"></div>
      <div class="model__uzel">
        <span class="stitek">Technici a specialisté</span>
        <div class="model__dodavatele" style="margin-top:10px">
          <span>${ikona("blesk", { velikost: 16 })} Elektro a revize<b>✓ oprávnění</b></span>
          <span>${ikona("kapka", { velikost: 16 })} Instalatéři<b>✓ pojištění</b></span>
          <span>${ikona("vytah", { velikost: 16 })} Výtahy<b>✓ servis</b></span>
          <span>${ikona("koste", { velikost: 16 })} Úklid a zeleň<b>✓ kontrola</b></span>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sekce sekce--tmava">
  <div class="obal portal-ukazka">
    <div class="odhal">
      ${osa("E", "Systém Budovník")}
      <h2 style="margin-top:14px">Dům, který vidíte online.</h2>
      <p class="lead">Klientský portál pro výbor, vlastníky i nájemníky. Pod ním interní systém, který hlídá revize, oprávnění techniků, smlouvy a termíny, a sám připomene, co je potřeba udělat.</p>
      <ul class="vyhody">
        <li>${ikona("fajfka")}<span>Nahlášení závady z mobilu i s fotkou, se sledováním stavu</span></li>
        <li>${ikona("fajfka")}<span>Kalendář revizí a kontrol každého domu, s protokoly</span></li>
        <li>${ikona("fajfka")}<span>Vyúčtování, předpisy, smlouvy a dokumenty na jednom místě</span></li>
        <li>${ikona("fajfka")}<span>Automatická upozornění: termíny, expirace, výpovědní lhůty</span></li>
      </ul>
      <div class="hero__akce">
        <a class="tl" href="${odkaz("portal")}">${ikona("zamek")} Vyzkoušet klientský portál</a>
        <a class="tl tl--obrys" href="${odkaz("system")}">Jak systém funguje</a>
      </div>
    </div>
    ${portalNahled()}
  </div>
</section>

<section class="sekce">
  <div class="obal">
    ${hlavickaSekce("F", "Průvodce revizemi", "Jaké revize potřebuje váš dům?", "Zaškrtněte, co v domě máte. Ukážeme, které revize a kontroly vás čekají a jak často.")}
    ${pruvodceRevizi()}
  </div>
</section>

<section class="sekce sekce--plocha">
  <div class="obal">
    ${hlavickaSekce("G", "Reference", "Domy, které už drží v libele.", "Ukázky z praxe. V tomto návrhu webu jsou reference smyšlené a slouží jako vzor.")}
    <div class="mrizka mrizka--3">${REFERENCE.slice(0, 3).map((r, i) => kartaReference(r, i)).join("")}</div>
    <div class="loga odhal" style="margin-top:40px">${Array.from({ length: 6 }, (_, i) => `<div>Logo klienta ${i + 1}</div>`).join("")}</div>
  </div>
</section>

<section class="sekce">
  <div class="obal">
    ${hlavickaSekce("H", "Převzetí správy", "Od první prohlídky k běžícímu provozu za 4 až 8 týdnů.")}
    <ol class="kroky">${KROKY.map(([n, t], i) => `<li class="odhal" style="--d:${i}"><h3>${esc(n)}</h3><p>${esc(t)}</p></li>`).join("")}</ol>
  </div>
</section>

<section class="sekce" style="padding-top:0">
  <div class="obal dve-kolony">
    <div>${hlavickaSekce("I", "Časté dotazy", "Na co se nás ptají předsedové SVJ i majitelé.")}</div>
    ${dotazy(DOTAZY.slice(0, 5))}
  </div>
</section>
${ctaPas()}`;
}

export function kartaReference(r, d = 0) {
  return `<a class="karta odhal" style="--d:${d}" href="${odkaz(r.soubor)}" data-kota>
    <span class="stitek">${esc(r.misto)} · vzor</span>
    <h3 style="margin:8px 0 10px">${esc(r.nazev)}</h3>
    <p>${esc(r.perex)}</p>
    <div class="stitky" style="margin-top:6px">${r.rozsah.slice(0, 3).map((x) => `<span>${esc(x)}</span>`).join("")}</div>
    <span class="karta__pata">Případová studie ${ikona("sipka")}</span>
  </a>`;
}

export function pruvodceRevizi() {
  const volby = [
    ["elektro", "Elektroinstalace"], ["hromosvod", "Hromosvod"], ["plyn", "Plyn"], ["spaliny", "Komín / kotel"],
    ["vytah", "Výtah"], ["po", "Hasicí přístroje, hydranty"], ["eps", "Požární signalizace"], ["nouzove-osvetleni", "Nouzové osvětlení"],
    ["kotelna", "Kotelna"], ["vzt", "Vzduchotechnika"], ["chlazeni", "Klimatizace"], ["hriste", "Dětské hřiště"],
  ];
  const vychozi = ["elektro", "hromosvod", "vytah", "po"];
  return `<div class="pruvodce" data-pruvodce>
    <div class="panel odhal">
      <span class="stitek">1 · Co v domě máte</span>
      <div class="volby" style="margin-top:14px">${volby.map(([k, n]) => `<label class="volba"><input type="checkbox" value="${k}"${vychozi.includes(k) ? " checked" : ""}><span>${esc(n)}</span></label>`).join("")}</div>
      <p class="tlumene" style="font-size:.86rem;margin:18px 0 0">Lhůty jsou orientační podle běžné praxe a uvedených předpisů. Konkrétní interval u vašeho zařízení určí revizní technik, výrobce nebo dokumentace.</p>
    </div>
    <div class="panel odhal" style="--d:1">
      <div class="panel__hlava"><span class="stitek">2 · Co vás čeká</span><span class="stav stav--info" data-pruvodce-pocet>—</span></div>
      <div class="tab-obal"><table class="tabulka-revizi"><thead><tr><th>Revize / kontrola</th><th>Jak často</th></tr></thead><tbody data-pruvodce-vystup></tbody></table></div>
      <div class="akce-radek" style="margin-top:18px">
        <a class="tl tl--maly" href="${odkaz("kontakt")}#poptavka">Chci, aby to hlídal Budovník ${ikona("sipka", { trida: "ik--posun" })}</a>
        <a class="tl tl--maly tl--obrys" href="${odkaz("revize")}">Víc o revizích</a>
      </div>
    </div>
  </div>`;
}

/* ---------- Služby ---------- */
export function sluzby(ctx) {
  return `${uvodStranky({
    drobky: [[null, "Služby"]], stitek: "Facility management", nadpis: "Služby pro budovy, které mají fungovat.",
    lead: "Čtyři oblasti správy: technická, provozní, ekonomická a energetická. Převezmeme kompletní správu, nebo jen část, kterou potřebujete.",
    akce: `<a class="tl" href="${odkaz("kontakt")}#poptavka">Poptat správu</a><a class="tl tl--obrys" href="${odkaz("kalkulacka")}">Orientační cena</a>`,
  })}
  <section class="sekce"><div class="obal"><div class="mrizka mrizka--2">${SLUZBY.map((s, i) => kartaSluzby(s, i)).join("")}</div></div></section>
  <section class="sekce sekce--plocha"><div class="obal">
    ${hlavickaSekce("B", "Co v domě hlídáme", "Klikněte na technologii v řezu.", "U každé ukážeme, co zajišťujeme a jaké revize a kontroly hlídáme.")}
    <div style="max-width:880px">${panelRezu()}</div>
  </div></section>
  ${ctaPas()}`;
}

export function sluzbaDetail(ctx, s) {
  const ostatni = SLUZBY.filter((x) => x.id !== s.id);
  return `${uvodStranky({
    drobky: [["sluzby", "Služby"], [null, s.nazev]], stitek: s.kod, nadpis: esc(s.nazev), lead: esc(s.perex),
    akce: `<a class="tl" href="${odkaz("kontakt")}#poptavka">Poptat ${esc(s.nazev.toLowerCase())}</a><a class="tl tl--obrys" href="tel:${esc(ctx.firma.havarijniOdkaz)}">${ikona("telefon")} Havárie 24/7</a>`,
  })}
  <section class="sekce"><div class="obal dve-kolony">
    <div>
      ${hlavickaSekce("A", "Co zahrnuje", "Rozsah služeb")}
      <ul class="seznam-sluzeb odhal">${s.polozky.map(([n, t]) => `<li><strong>${esc(n)}</strong><span>${esc(t)}</span></li>`).join("")}</ul>
    </div>
    <aside class="bok">
      ${s.proc.map(([n, t], i) => `<div class="bolest odhal" style="--d:${i}"><strong style="font-style:normal">${esc(n)}</strong><span>${esc(t)}</span></div>`).join("")}
    </aside>
  </div></section>
  ${s.id === "technicka" ? `<section class="sekce sekce--plocha"><div class="obal">${hlavickaSekce("B", "Revize", "Jaké revize potřebuje váš dům?", "Vyberte technologie a podívejte se na lhůty.")}${pruvodceRevizi()}</div></section>` : ""}
  <section class="sekce"><div class="obal">
    ${hlavickaSekce("C", "Další služby", "Správa domu jako celek")}
    <div class="mrizka mrizka--3">${ostatni.map((x, i) => kartaSluzby(x, i)).join("")}</div>
  </div></section>
  ${ctaPas()}`;
}

/* ---------- Pro koho ---------- */
export function proKoho(ctx) {
  return `${uvodStranky({
    drobky: [[null, "Pro koho pracujeme"]], stitek: "Typy objektů", nadpis: "Pro koho pracujeme.",
    lead: "Spravujeme bytové domy pro SVJ a družstva, komerční objekty pro majitele a investory a veřejné budovy pro obce a instituce. Každý typ má jiné priority, jiné předpisy a jiné rozhodovací procesy.",
  })}
  <section class="sekce"><div class="obal"><div class="mrizka mrizka--3">${OBJEKTY.map((o, i) => kartaObjektu(o, i)).join("")}</div></div></section>
  <section class="sekce sekce--plocha"><div class="obal">
    ${hlavickaSekce("B", "Vše na jednom místě", "Co dostane každý klient", "", false)}
    <div class="mrizka mrizka--4">
      ${[["sirena", "Havarijní dispečink 24/7", "Jedno číslo pro havárie, technik do 2 hodin."], ["kalendar", "Kalendář revizí", "Termíny hlídá systém a revize objedná sám."], ["zamek", "Klientský portál", "Závady, dokumenty, vyúčtování, smlouvy."], ["graf", "Měsíční report", "Co se v domě dělo a kolik to stálo."]]
        .map(([ik, n, t], i) => `<div class="karta odhal" style="--d:${i}"><span class="karta__ikona">${ikona(ik, { velikost: 22 })}</span><h3>${esc(n)}</h3><p>${esc(t)}</p></div>`).join("")}
    </div>
  </div></section>
  ${ctaPas()}`;
}

export function objektDetail(ctx, o) {
  const ref = REFERENCE.filter((r) => r.typ === o.id);
  return `${uvodStranky({
    drobky: [["prokoho", "Pro koho"], [null, o.nazev]], stitek: o.pro, nadpis: esc(o.nazev), lead: esc(o.perex),
    akce: `<a class="tl" href="${odkaz("kontakt")}#poptavka">${esc(o.cta)} ${ikona("sipka", { trida: "ik--posun" })}</a><a class="tl tl--obrys" href="${odkaz("kalkulacka")}">Orientační cena</a>`,
    bok: `<div class="objekt-karta__kresba" style="border:1px solid var(--cara);border-radius:14px;background:var(--plocha)">${pohled(o.id)}</div>`,
  })}
  <section class="sekce"><div class="obal">
    ${hlavickaSekce("A", "Co řešíte", "Známe to. A máme na to postup.")}
    <div class="mrizka mrizka--2">${o.bolesti.map(([b, r], i) => `<div class="bolest odhal" style="--d:${i}"><strong>${esc(b)}</strong><span>${esc(r)}</span></div>`).join("")}</div>
  </div></section>
  <section class="sekce sekce--plocha"><div class="obal">
    ${hlavickaSekce("B", "Typy objektů", "Co spravujeme")}
    <div class="mrizka mrizka--4">${o.typy.map((t, i) => `<div class="karta odhal" style="--d:${i}"><span class="karta__ikona">${ikona(["dum", "budova", "skola", "klic"][i % 4], { velikost: 22 })}</span><h3 style="font-size:1.08rem">${esc(t)}</h3></div>`).join("")}</div>
  </div></section>
  <section class="sekce"><div class="obal">
    ${hlavickaSekce("C", "Služby", "Co pro vás můžeme převzít")}
    <div class="mrizka mrizka--2">${SLUZBY.map((s, i) => kartaSluzby(s, i)).join("")}</div>
  </div></section>
  ${ref.length ? `<section class="sekce sekce--plocha"><div class="obal">${hlavickaSekce("D", "Reference", "Jak to vypadá v praxi")}<div class="mrizka mrizka--3">${ref.map((r, i) => kartaReference(r, i)).join("")}</div></div></section>` : ""}
  ${ctaPas({ primarni: [o.cta, "kontakt", "#poptavka"] })}`;
}

/* ---------- Reference ---------- */
export function reference(ctx) {
  return `${uvodStranky({
    drobky: [[null, "Reference"]], stitek: "Případové studie", nadpis: "Reference a případové studie.",
    lead: "Jak vypadá převzetí správy v praxi: výchozí stav, co jsme udělali a jak to běží dnes. <strong>V tomto návrhu webu jsou všechny reference smyšlené</strong> a slouží jako vzor struktury.",
  })}
  <section class="sekce"><div class="obal"><div class="mrizka mrizka--2">${REFERENCE.map((r, i) => kartaReference(r, i)).join("")}</div>
    <div class="loga odhal" style="margin-top:48px">${Array.from({ length: 6 }, (_, i) => `<div>Logo klienta ${i + 1}</div>`).join("")}</div>
  </div></section>
  ${ctaPas()}`;
}

export function referenceDetail(ctx, r) {
  const o = OBJEKTY.find((x) => x.id === r.typ);
  return `${uvodStranky({
    drobky: [["reference", "Reference"], [null, r.nazev]], stitek: `${o.nazev} · ${r.misto} · vzorová reference`, nadpis: esc(r.nazev), lead: esc(r.perex),
  })}
  <section class="sekce"><div class="obal">
    <div class="cisla odhal">${r.cisla.map(([c, t]) => `<div><strong>${esc(c)}</strong><span>${esc(t)}</span></div>`).join("")}</div>
  </div></section>
  <section class="sekce" style="padding-top:0"><div class="obal dve-kolony">
    <ol class="casova-osa">${r.pribeh.map(([n, t], i) => `<li class="odhal" style="--d:${i}"><div><h3>${esc(n)}</h3><p>${esc(t)}</p></div></li>`).join("")}</ol>
    <aside class="bok"><div class="panel odhal"><span class="stitek">Rozsah správy</span><div class="stitky" style="margin-top:12px">${r.rozsah.map((x) => `<span>${esc(x)}</span>`).join("")}</div>
      <p class="tlumene" style="font-size:.86rem;margin:16px 0 0">Reference je smyšlená pro účely návrhu webu.</p></div></aside>
  </div></section>
  ${ctaPas({ nadpis: "Chcete podobný výsledek?" })}`;
}

/* ---------- Systém ---------- */
export function system(ctx) {
  const moduly = [
    ["dum", "Pasport objektu", "Technologie, dokumentace, výkresy a historie všech zásahů ke každé budově. Zůstává klientovi, i kdyby od nás odešel."],
    ["kalendar", "Kalendář revizí", "Ke každému zařízení lhůty podle předpisů. 30 dní před termínem systém sám osloví revizního technika a klientovi pošle protokol."],
    ["vystraha", "Hlášení závad a dispečink", "Závada z portálu, telefonu nebo e-mailu dostane prioritu a lhůtu (SLA). Systém vybere technika s oprávněním a hlídá, aby se stihla."],
    ["parta", "Kvalifikace techniků", "Oprávnění, pojištění a osvědčení každého technika s datem platnosti. Kdo nemá platné doklady, k zakázce se nedostane."],
    ["smlouva", "Smlouvy ze šablon", "Smlouvy se skládají ze šablon a dat. Systém hlídá výročí, prodloužení a výpovědní lhůty."],
    ["kalkulacka", "Fakturace a vyúčtování", "Přefakturace prací s marží a rekapitulací DPH, roční vyúčtování služeb rozúčtované na haléř."],
    ["automat", "Automatizace", "Pravidla typu „když se blíží revize, objednej technika“. Úkoly se tvoří samy, lidé jen schvalují."],
    ["zamek", "Klientský portál", "Výbor, vlastníci i nájemníci vidí, co se v domě děje. Bez telefonování a bez e-mailového ping-pongu."],
  ];
  return `${uvodStranky({
    drobky: [[null, "Systém Budovník"]], stitek: "Technologie pod správou", nadpis: "Systém, který hlídá dům, i&nbsp;když nikdo nevolá.",
    lead: "Obor správy budov dnes běží na telefonech, e-mailech a tabulkách. Náš systém propojuje klienty, dispečink a techniky v terénu: termíny, doklady, smlouvy i peníze hlídá stroj, lidé rozhodují.",
    akce: `<a class="tl" href="${odkaz("portal")}">${ikona("zamek")} Klientský portál (demo)</a><a class="tl tl--obrys" href="${odkaz("dispecink")}">${ikona("mriz")} Interní systém (demo)</a>`,
  })}
  <section class="sekce"><div class="obal">
    ${hlavickaSekce("A", "Moduly", "Co systém umí")}
    <div class="mrizka mrizka--4">${moduly.map(([ik, n, t], i) => `<div class="karta karta--hover odhal" style="--d:${i % 4}" data-kota><span class="karta__ikona">${ikona(ik, { velikost: 22 })}</span><h3 style="font-size:1.1rem">${esc(n)}</h3><p>${esc(t)}</p></div>`).join("")}</div>
  </div></section>
  <section class="sekce sekce--tmava"><div class="obal portal-ukazka">
    <div class="odhal">${osa("B", "Automatizace")}<h2 style="margin-top:14px">Úkoly, které se zadají samy.</h2>
      <p class="lead">Pravidla běží nad daty všech domů. Když se blíží revize, systém ji naplánuje a objedná. Když technikovi končí platnost oprávnění, upozorní na obnovu dřív, než by vypršelo. Když hrozí porušení lhůty u závady, eskaluje ji dispečerovi.</p>
      <div class="hero__akce"><a class="tl" href="${odkaz("dispecink")}#automatizace">Ukázka pravidel ${ikona("sipka", { trida: "ik--posun" })}</a></div></div>
    <div class="panel odhal" style="--d:1">
      <div class="pravidlo"><div><strong>Revize do 30 dní → naplánovat technika</strong><br><code>kdyz revize.dnu ≤ 30 · akce poptávka</code></div><span class="stav stav--ok">zapnuto</span></div>
      <div class="pravidlo"><div><strong>Oprávnění technika vyprší → zajistit obnovu</strong><br><code>kdyz doklad.stav ∈ {vyprší, neplatný}</code></div><span class="stav stav--ok">zapnuto</span></div>
      <div class="pravidlo"><div><strong>Lhůta závady ohrožena → eskalovat</strong><br><code>kdyz sla.reakce = ohroženo</code></div><span class="stav stav--ok">zapnuto</span></div>
      <div class="pravidlo" style="border:0"><div><strong>Výpovědní lhůta smlouvy do 60 dní</strong><br><code>kdyz smlouva.dnuDoVypovedi ≤ 60</code></div><span class="stav stav--ok">zapnuto</span></div>
    </div>
  </div></section>
  <section class="sekce"><div class="obal">
    ${hlavickaSekce("C", "Data", "Vaše data zůstávají vaše.", "Pasport, dokumenty a historie domu patří klientovi. Při ukončení spolupráce je předáme v otevřených formátech.")}
    <div class="mrizka mrizka--3">
      ${[["stit", "Bezpečnost", "Šifrovaný přenos, přístupová práva podle rolí, záznam o tom, kdo co změnil."], ["stahnout", "Export kdykoli", "Dokumenty v PDF, data v CSV a XLSX. Žádné uzamčení u nás."], ["ozubeni", "Napojení", "Účetnictví, odečty měřidel, datové schránky a bankovní výpisy."]]
        .map(([ik, n, t], i) => `<div class="karta odhal" style="--d:${i}"><span class="karta__ikona">${ikona(ik, { velikost: 22 })}</span><h3>${esc(n)}</h3><p>${esc(t)}</p></div>`).join("")}
    </div>
  </div></section>
  ${ctaPas({ nadpis: "Vyzkoušejte si portál na vlastní kůži.", text: "Demo běží celé v prohlížeči s vymyšlenými daty. Nahlaste závadu jako vlastník a pak se podívejte, jak ji vidí dispečink.", primarni: ["Otevřít klientský portál", "portal", ""], sekundarni: ["Interní systém", "dispecink", ""] })}`;
}

/* ---------- Revize ---------- */
export function revize(ctx) {
  return `${uvodStranky({
    drobky: [["sluzby", "Služby"], [null, "Průvodce revizemi"]], stitek: "Zákonné revize a kontroly", nadpis: "Průvodce revizemi pro bytové domy a budovy.",
    lead: "Elektro, plyn, hromosvod, komíny, výtahy, požární ochrana. Každá technologie má svou lhůtu a svůj předpis. Vyberte, co máte, a podívejte se, co vás čeká.",
  })}
  <section class="sekce"><div class="obal">${pruvodceRevizi()}</div></section>
  <section class="sekce sekce--plocha"><div class="obal dve-kolony">
    <div>
      ${hlavickaSekce("B", "Proč na tom záleží", "Propadlá revize je problém až ve chvíli, kdy se něco stane.")}
      <p class="lead odhal">Při škodní události se pojišťovna jako první ptá na revizní zprávy. Statutární orgán SVJ nebo majitel odpovídá za bezpečný provoz domu. A hasiči nebo inspekce při kontrole chtějí doklady hned.</p>
    </div>
    <aside class="bok">
      ${[["Hlídáme termíny", "Každé zařízení má v systému svou lhůtu. Upozornění jde 30 dní předem."], ["Objednáme technika", "Revizního technika s platným oprávněním pro dané zařízení."], ["Archivujeme protokoly", "Revizní zprávy jsou v pasportu domu a v portálu, kdykoli k předložení."], ["Řešíme závady z revizí", "Co revize najde, to opravíme. Až pak je dům opravdu v libele."]]
        .map(([n, t], i) => `<div class="bolest odhal" style="--d:${i}"><strong style="font-style:normal">${esc(n)}</strong><span>${esc(t)}</span></div>`).join("")}
    </aside>
  </div></section>
  ${ctaPas({ nadpis: "Ať revize hlídá systém, ne sešit." })}`;
}

/* ---------- Kalkulačka ---------- */
export function kalkulacka(ctx) {
  const sluzby = [["technicka", "Technická správa a údržba", true], ["administrativni", "Účetnictví, předpisy a vyúčtování", true], ["energetika", "Energetický management", false], ["uklid", "Úklid společných prostor", true], ["zelen", "Péče o zeleň a okolí", false], ["zimni", "Zimní údržba", false], ["ostraha", "Ostraha a recepce", false]];
  return `${uvodStranky({
    drobky: [[null, "Kalkulačka ceny"]], stitek: "Orientační cena", nadpis: "Kolik stojí správa vašeho domu?",
    lead: "Orientační měsíční cenu spočítáte za minutu. Přesnou nabídku připravíme po prohlídce objektu, zdarma a nezávazně.",
  })}
  <section class="sekce"><div class="obal kalk" data-kalkulacka>
    <form class="panel formular" onsubmit="return false">
      <div class="pole"><span class="pole__nazev">Typ objektu</span>
        <div class="segment">
          ${[["svj", "dum", "SVJ", "společenství vlastníků"], ["druzstvo", "parta", "Družstvo", "bytové družstvo"], ["komercni", "budova", "Komerční", "kanceláře, haly, retail"], ["verejne", "skola", "Veřejná", "škola, úřad, nemocnice"]]
            .map(([v, ik, n, p], i) => `<label><input type="radio" name="typ" value="${v}"${i === 0 ? " checked" : ""}><span>${ikona(ik)}${esc(n)}<small>${esc(p)}</small></span></label>`).join("")}
        </div></div>
      <div class="pole" data-pro="rez"><label for="k-jednotek">Počet bytových jednotek</label>
        <div class="posuvnik"><input type="range" id="k-jednotek" name="jednotek" min="4" max="200" value="48"><output data-vystup="jednotek">48</output></div></div>
      <div class="pole" data-pro="plocha" hidden><label for="k-plocha">Podlahová plocha (m²)</label>
        <div class="posuvnik"><input type="range" id="k-plocha" name="plocha" min="300" max="30000" step="100" value="4000"><output data-vystup="plocha">4 000</output></div></div>
      <div class="dvojice">
        <div class="pole"><label for="k-stari">Stáří a typ budovy</label>
          <select id="k-stari" name="stari"><option value="novostavba">Novostavba (do 10 let)</option><option value="panel" selected>Panelový / běžný dům</option><option value="historicky">Historický / činžovní dům</option></select></div>
        <div class="pole"><label for="k-vytahu">Počet výtahů</label>
          <select id="k-vytahu" name="vytahu">${[0, 1, 2, 3, 4, 6, 8].map((n) => `<option value="${n}"${n === 2 ? " selected" : ""}>${n}</option>`).join("")}</select></div>
      </div>
      <div class="pole"><span class="pole__nazev">Služby</span>
        <div class="volby">${sluzby.map(([v, n, z]) => `<label class="volba"><input type="checkbox" name="sluzby" value="${v}"${z ? " checked" : ""}><span>${esc(n)}</span></label>`).join("")}
        <label class="volba"><input type="checkbox" name="havarijni" value="1" checked><span>Havarijní služba 24/7</span></label></div></div>
    </form>
    <aside class="kalk__vysledek" id="kalk-vysledek" aria-live="polite">
      <span class="stitek" style="color:var(--akcent)">Orientační cena / měsíc bez DPH</span>
      <div class="kalk__cena" data-k="celkem">—</div>
      <div class="kalk__pod" data-k="pod">—</div>
      <div class="kalk__radky" data-k="radky"></div>
      <a class="tl tl--plne" href="${odkaz("kontakt")}#poptavka" data-k="odkaz">Chci přesnou nabídku ${ikona("sipka", { trida: "ik--posun" })}</a>
      <p class="kalk__pozn">Výpočet je orientační a nezávazný. Ceny v návrhu webu jsou ilustrativní, skutečný ceník doplní Budovník.</p>
    </aside>
    <a class="kalk__lista" href="#kalk-vysledek" aria-hidden="true" tabindex="-1"><span>Orientačně / měsíc</span><strong data-k="lista">—</strong><span>Detail ↓</span></a>
  </div></section>
  ${ctaPas({ nadpis: "Cena je jedna věc. Stav domu druhá.", text: "Po prohlídce víme, co dům opravdu potřebuje. Pak teprve dává smysl mluvit o přesné ceně." })}`;
}

/* ---------- Pro dodavatele ---------- */
export function dodavatele(ctx) {
  const obory = ["Elektro a revize", "Instalatéři a topenáři", "Plyn", "Výtahy", "Požární ochrana", "Úklid", "Zeleň a zimní údržba", "Stavební a řemeslné práce", "Malíři a natěrači", "Zámečníci", "Ostraha", "Revizní technici"];
  return `${uvodStranky({
    drobky: [[null, "Kariéra"]], stitek: "Kariéra a spolupráce", nadpis: "Hledáme techniky a řemeslníky.",
    lead: "Rozšiřujeme tým pro pravidelnou údržbu, revize i havarijní výjezdy. Stálá práce na stálých objektech, jasné zadání a férové peníze. V zaměstnaneckém poměru i na IČO.",
    akce: `<a class="tl" href="#registrace">Chci se ozvat ${ikona("sipka", { trida: "ik--posun" })}</a>`,
  })}
  <section class="sekce"><div class="obal">
    ${hlavickaSekce("A", "Proč u nás", "Co nabízíme")}
    <div class="mrizka mrizka--4">${[["kalendar", "Plánovaná práce", "Pravidelné zakázky na stálých objektech, ne jednorázové výjezdy."], ["dokument", "Jasné zadání", "Popis, fotky, přístup do objektu a kontakt na místě v aplikaci."], ["kalkulacka", "Peníze včas", "Mzda nebo faktura vždy v termínu. Bez honění."], ["graf", "Růst", "Školení, nová oprávnění a odpovědnější práce pro ty, kdo chtějí."]]
      .map(([ik, n, t], i) => `<div class="karta odhal" style="--d:${i}"><span class="karta__ikona">${ikona(ik, { velikost: 22 })}</span><h3 style="font-size:1.1rem">${esc(n)}</h3><p>${esc(t)}</p></div>`).join("")}</div>
  </div></section>
  <section class="sekce sekce--plocha"><div class="obal dve-kolony">
    <div>
      ${hlavickaSekce("B", "Koho hledáme", "Co byste měli mít")}
      <ul class="seznam-sluzeb odhal">
        <li><strong>Praxi v oboru</strong><span>Vyučení nebo zkušenost v profesi, kterou chcete dělat.</span></li>
        <li><strong>Odborná oprávnění</strong><span>Podle oboru: elektro (vyhl. 50/1978 Sb. a navazující předpisy), plyn, výtahy, požární ochrana, revizní technik.</span></li>
        <li><strong>Řidičský průkaz sk. B</strong><span>Jezdíme po objektech v regionu, auto zajistíme.</span></li>
      </ul>
      <p class="tlumene odhal" style="margin-top:16px">Platnost oprávnění a školení hlídá systém a obnovu zajistíme s předstihem.</p>
    </div>
    <form class="panel formular" id="registrace" data-formular="dodavatel" novalidate>
      <h3 style="margin:0">Ozvěte se nám</h3>
      <div class="dvojice">
        <div class="pole"><label for="d-firma">Firma / jméno</label><input type="text" id="d-firma" name="firma" autocomplete="organization"></div>
        <div class="pole"><label for="d-ico">IČO (pokud pracujete na živnost)</label><input type="text" id="d-ico" name="ico" inputmode="numeric"></div>
      </div>
      <div class="dvojice">
        <div class="pole"><label for="d-email">E-mail</label><input type="email" id="d-email" name="email" autocomplete="email"></div>
        <div class="pole"><label for="d-tel">Telefon</label><input type="tel" id="d-tel" name="telefon" autocomplete="tel"></div>
      </div>
      <div class="pole"><span class="pole__nazev">Profese</span><div class="volby">${obory.map((o) => `<label class="volba"><input type="checkbox" name="obory" value="${esc(o)}"><span>${esc(o)}</span></label>`).join("")}</div></div>
      <div class="pole"><label for="d-region">Region působnosti</label><input type="text" id="d-region" name="region" placeholder="např. Praha, Středočeský kraj"></div>
      <label class="souhlas"><input type="checkbox" name="souhlas"> Souhlasím se zpracováním údajů pro účely výběrového řízení.</label>
      <button class="tl" type="submit">Odeslat</button>
      <div data-formular-vysledek></div>
    </form>
  </div></section>`;
}

/* ---------- O nás ---------- */
export function oNas(ctx) {
  const f = ctx.firma;
  return `${uvodStranky({
    drobky: [[null, "O nás"]], stitek: "Budovník", nadpis: "Správce, který stojí na straně domu.",
    lead: "Budovník vznikl z jednoduchého pozorování: správa domu se dnes drobí mezi desítky firem a nikdo neručí za celek. My přebíráme techniku, provoz, peníze i papíry pod jednou střechou a s jasnou odpovědností.",
  })}
  <section class="sekce"><div class="obal">
    ${hlavickaSekce("A", "Na čem stavíme", "Tři pravidla, která držíme")}
    <div class="mrizka mrizka--3">${[["vodovaha", "V libele", "Revize, doklady a smlouvy v pořádku. Ne „nějak to dopadne“, ale ověřené a zdokumentované."], ["oko", "Průhledně", "Klient vidí stav domu, nabídky, faktury i to, kdo a kdy co udělal."], ["klic", "Odpovědně", "Za výsledek ručíme my. Když něco nefunguje, řešíte to s jedním člověkem."]]
      .map(([ik, n, t], i) => `<div class="karta odhal" style="--d:${i}"><span class="karta__ikona">${ikona(ik, { velikost: 22 })}</span><h3>${esc(n)}</h3><p>${esc(t)}</p></div>`).join("")}</div>
  </div></section>
  <section class="sekce sekce--plocha"><div class="obal dve-kolony">
    <div>
      ${hlavickaSekce("B", "Jistoty", "Pojištění, certifikace a garance")}
      <dl class="udaje odhal">
        <div><dt>Pojištění odpovědnosti</dt><dd>do ${esc(f.pojisteni)}<span class="vzor">vzor</span></dd></div>
        <div><dt>Certifikace</dt><dd>${esc(f.certifikaty.join(", "))}<span class="vzor">vzor</span></dd></div>
        <div><dt>Havarijní reakce</dt><dd>technik na místě do 2 hodin</dd></div>
        <div><dt>Dispečink</dt><dd>nonstop, 365 dní v roce</dd></div>
        <div><dt>Kvalifikace techniků</dt><dd>oprávnění a osvědčení hlídané systémem</dd></div>
      </dl>
    </div>
    <aside class="bok">
      <div class="panel odhal"><span class="stitek">Firemní údaje</span>
        <dl class="udaje" style="margin-top:10px">
          <div><dt>Název</dt><dd>${esc(f.nazev)}<span class="vzor">vzor</span></dd></div>
          <div><dt>IČO / DIČ</dt><dd>${esc(f.ico)} / ${esc(f.dic)}</dd></div>
          <div><dt>Sídlo</dt><dd>${esc(f.adresa.ulice)}, ${esc(f.adresa.psc)} ${esc(f.adresa.mesto)}</dd></div>
          <div><dt>Zápis</dt><dd>${esc(f.spisovaZnacka)}</dd></div>
        </dl>
      </div>
    </aside>
  </div></section>
  ${ctaPas()}`;
}

/* ---------- Kontakt ---------- */
export function kontakt(ctx) {
  const f = ctx.firma;
  return `${uvodStranky({
    drobky: [[null, "Kontakt"]], stitek: "Kontakt a poptávka", nadpis: "Ozvěte se. U havárie hned.",
    lead: "Poptávku zpracujeme do jednoho pracovního dne. Prohlídka objektu a návrh rozsahu správy jsou zdarma.",
  })}
  <section class="sekce"><div class="obal dve-kolony">
    <form class="panel formular" id="poptavka" data-formular="poptavka" novalidate>
      <h2 style="font-size:1.6rem;margin:0">Nezávazná poptávka</h2>
      <div class="pole"><span class="pole__nazev">Jaký objekt spravujete?</span>
        <div class="segment">${[["svj", "dum", "SVJ / družstvo"], ["komercni", "budova", "Komerční objekt"], ["verejne", "skola", "Veřejná budova"], ["jine", "klic", "Jednorázová zakázka"]]
          .map(([v, ik, n], i) => `<label><input type="radio" name="segment" value="${v}"${i === 0 ? " checked" : ""}><span>${ikona(ik)}${esc(n)}</span></label>`).join("")}</div></div>
      <div class="dvojice">
        <div class="pole"><label for="p-jmeno">Jméno a příjmení</label><input type="text" id="p-jmeno" name="jmeno" autocomplete="name"></div>
        <div class="pole"><label for="p-role">Vaše role</label><select id="p-role" name="role"><option>Předseda / člen výboru SVJ</option><option>Představenstvo družstva</option><option>Majitel / investor</option><option>Facility / property manažer</option><option>Starosta / ředitel / zřizovatel</option><option>Jiná</option></select></div>
      </div>
      <div class="dvojice">
        <div class="pole"><label for="p-email">E-mail</label><input type="email" id="p-email" name="email" autocomplete="email"></div>
        <div class="pole"><label for="p-tel">Telefon</label><input type="tel" id="p-tel" name="telefon" autocomplete="tel"></div>
      </div>
      <div class="dvojice">
        <div class="pole"><label for="p-adresa">Adresa objektu</label><input type="text" id="p-adresa" name="adresa"></div>
        <div class="pole"><label for="p-velikost">Velikost</label><input type="text" id="p-velikost" name="velikost" placeholder="např. 48 bytů / 4 000 m²"></div>
      </div>
      <div class="pole"><label for="p-rozpocet">Představa o rozpočtu <small>(nepovinné)</small></label><input type="text" id="p-rozpocet" name="rozpocet" placeholder="např. do 15 tis. měsíčně"></div>
      <div class="pole"><label for="p-zprava">Co potřebujete?</label><textarea id="p-zprava" name="zprava" placeholder="Např. převzetí kompletní správy od ledna, nebo jen revize a technická správa."></textarea></div>
      <label class="souhlas"><input type="checkbox" name="souhlas"> Souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky.</label>
      <button class="tl" type="submit">Odeslat poptávku ${ikona("sipka", { trida: "ik--posun" })}</button>
      <div data-formular-vysledek></div>
    </form>
    <aside class="bok">
      <div class="havarie-blok">
        <span class="stitek" style="color:rgba(255,255,255,.8)">Havarijní dispečink · nonstop</span>
        <h3>Teče voda, nejde proud, uvízl výtah?</h3>
        <a class="cislo" href="tel:${esc(f.havarijniOdkaz)}">${esc(f.havarijni)}</a>
        <p>Do příjezdu technika: uzavřete hlavní uzávěr vody nebo plynu, vypněte jistič a zajistěte místo.</p>
      </div>
      <div class="panel">
        <dl class="udaje">
          <div><dt>Kancelář</dt><dd>${esc(f.telefon)}</dd></div>
          <div><dt>E-mail</dt><dd><a href="mailto:${esc(f.email)}">${esc(f.email)}</a></dd></div>
          <div><dt>Dispečink</dt><dd><a href="mailto:${esc(f.dispecink)}">${esc(f.dispecink)}</a></dd></div>
          <div><dt>Adresa</dt><dd>${esc(f.adresa.ulice)}, ${esc(f.adresa.psc)} ${esc(f.adresa.mesto)}</dd></div>
          <div><dt>Úřední hodiny</dt><dd>Po–Pá 8:00–17:00</dd></div>
          <div><dt>IČO / DIČ</dt><dd>${esc(f.ico)} / ${esc(f.dic)}</dd></div>
          <div><dt>Účet</dt><dd>${esc(f.banka)}</dd></div>
        </dl>
      </div>
    </aside>
  </div></section>`;
}

/* ---------- Ostatní ---------- */
export function oUkazce(ctx) {
  return `${uvodStranky({ drobky: [[null, "O ukázce"]], stitek: "Návrh webu", nadpis: "Co je v ukázce smyšlené.", lead: "Tohle je návrh webu a klikací ukázka systému. Aby šel posoudit celek, jsou v něm vzorová data." })}
  <section class="sekce"><div class="obal dve-kolony">
    <div class="panel">
      <h3>Vzorové nebo smyšlené</h3>
      <ul class="seznam-sluzeb">
        <li><strong>Firemní údaje</strong><span>Název, IČO, DIČ, adresa, telefony, e-maily a bankovní účet jsou zástupné hodnoty.</span></li>
        <li><strong>Pojištění a certifikace</strong><span>Částka pojištění a ISO certifikáty jsou vzor; doplní se podle skutečnosti.</span></li>
        <li><strong>Reference a čísla</strong><span>Všechny čtyři případové studie, loga klientů a čísla v nich jsou vymyšlené.</span></li>
        <li><strong>Ceny v kalkulačce</strong><span>Ceník je ilustrativní, skutečné sazby doplní Budovník.</span></li>
        <li><strong>Demo portálu a interního systému</strong><span>Objekty, lidé, dodavatelé, závady a smlouvy jsou vymyšlené. Demo běží jen v prohlížeči a nic nikam neodesílá.</span></li>
      </ul>
    </div>
    <aside class="bok"><div class="panel">
      <h3>Skutečné</h3>
      <p class="tlumene">Struktura služeb a typů objektů podle zadání, lhůty revizí podle uvedených předpisů (orientačně), logika systému: výpočty termínů, lhůt SLA, pracovních dnů včetně svátků, rozúčtování nákladů a přefakturace. Ta je ověřená automatickými testy.</p>
      <p class="tlumene" style="margin:0">Formuláře v ukázce nic neodesílají.</p>
    </div></aside>
  </div></section>`;
}

export function soukromi(ctx) {
  const f = ctx.firma;
  return `${uvodStranky({ drobky: [[null, "Ochrana osobních údajů"]], nadpis: "Ochrana osobních údajů.", lead: "Zjednodušená informace pro návrh webu. Plné znění doplní správce údajů." })}
  <section class="sekce"><div class="obal" style="max-width:820px">
    <div class="panel">
      <p><strong>Správce:</strong> ${esc(f.nazev)}, IČO ${esc(f.ico)}, ${esc(f.adresa.ulice)}, ${esc(f.adresa.psc)} ${esc(f.adresa.mesto)}.</p>
      <p><strong>Co zpracováváme:</strong> údaje z poptávkového formuláře (jméno, kontakt, adresa objektu, zpráva) za účelem vyřízení poptávky a jednání o smlouvě; u klientů údaje nutné ke správě objektu.</p>
      <p><strong>Jak dlouho:</strong> poptávky 2 roky od posledního kontaktu, smluvní údaje po dobu trvání smlouvy a zákonných lhůt.</p>
      <p style="margin:0"><strong>Vaše práva:</strong> přístup, oprava, výmaz, omezení zpracování, námitka a stížnost u ÚOOÚ. Kontakt: ${esc(f.email)}.</p>
    </div>
  </div></section>`;
}

export function chyba404(ctx) {
  return `<section class="uvod-stranky" style="min-height:60vh;display:grid;align-items:center"><div class="obal">
    <span class="stitek">Chyba 404 · bublina mimo rysky</span>
    <h1 style="max-width:16ch">Tahle stránka není v libele.</h1>
    <p class="lead">Adresa neexistuje nebo se přestěhovala. Zkuste úvod, nebo nám rovnou zavolejte.</p>
    <div class="hero__akce"><a class="tl" href="index.html" data-koren>Na úvod</a><a class="tl tl--obrys" href="kontakt.html" data-koren>Kontakt</a></div>
  </div></section>`;
}
