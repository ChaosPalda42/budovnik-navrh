/* Budovník – demo klientského portálu a interního systému.
   Data: #demo-data (vymyšlená), logika: window.BV.* (src/lib, ověřeno testy). Změny se ukládají jen do localStorage. */
(function () {
  "use strict";
  var BV = window.BV || {};
  var doc = document;
  var $ = function (s, k) { return (k || doc).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || doc).querySelectorAll(s)); };
  var obal = $("[data-demo]");
  if (!obal) return;
  var DRUH = obal.getAttribute("data-demo");
  var KOREN = $("[data-demo-koren]", obal);
  var D = JSON.parse($("#demo-data").textContent);
  var IK = JSON.parse($("#demo-ikony").textContent);
  var DNES = D.dnes, TED = D.ted;
  var KLIC = "bv-demo-v1";

  /* ---------- Pomocníci ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ik(j) { return IK[j] || ""; }
  function kc(n, des) {
    var x = Number(n) || 0;
    var s = Math.abs(x).toFixed(des ? 2 : 0).split(".");
    return (x < 0 ? "−" : "") + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (s[1] && s[1] !== "00" ? "," + s[1] : "") + " Kč";
  }
  function datum(iso) { if (!iso) return "—"; var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso); return m ? Number(m[3]) + ". " + Number(m[2]) + ". " + m[1] : iso; }
  function cas(iso) { if (!iso) return "—"; var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso); return m ? Number(m[3]) + ". " + Number(m[2]) + ". " + m[4] + ":" + m[5] : datum(iso); }
  function dnyText(n) {
    if (n === null || n === undefined) return "—";
    if (n === 0) return "dnes";
    if (n < 0) return "před " + -n + (n === -1 ? " dnem" : " dny");
    return "za " + n + (n === 1 ? " den" : n < 5 ? " dny" : " dní");
  }
  function minutyText(m) {
    var neg = m < 0; m = Math.abs(m);
    var d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mi = m % 60;
    var t = d ? d + " d " + h + " h" : h ? h + " h " + mi + " min" : mi + " min";
    return neg ? "po termínu " + t : "zbývá " + t;
  }
  function stav(trida, text) { return '<span class="stav stav--' + trida + '">' + esc(text) + "</span>"; }
  var REV_STAV = { "po-terminu": ["chyba", "po termínu"], "bez-terminu": ["chyba", "chybí záznam"], "blizi-se": ["pozor", "blíží se"], "v-poradku": ["ok", "v pořádku"] };
  function revStav(p) { var s = REV_STAV[p.stav]; return stav(s[0], p.stav === "blizi-se" ? dnyText(p.dnu) : s[1]); }
  var ZAV_STAV = { nova: "Nová", prirazena: "Přiřazená", "v-reseni": "V řešení", "ceka-na-dil": "Čeká na díl", hotova: "Hotová", prevzata: "Převzatá", vyfakturovana: "Vyfakturovaná", zrusena: "Zrušená" };
  var ZAV_TRIDA = { nova: "info", prirazena: "info", "v-reseni": "pozor", "ceka-na-dil": "pozor", hotova: "ok", prevzata: "ok", vyfakturovana: "neutral", zrusena: "neutral" };
  var SLA_STAV = { poruseno: ["chyba", "porušeno"], ohrozeno: ["pozor", "ohroženo"], bezi: ["info", "běží"], splneno: ["ok", "splněno"], zruseno: ["neutral", "—"] };
  var PRIORITA = { havarie: "Havárie", urgentni: "Urgentní", bezna: "Běžná", planovana: "Plánovaná" };
  var OBOR_REVIZE = { elektro: "elektro", hromosvod: "elektro", "nouzove-osvetleni": "elektro", plyn: "plyn", spaliny: "plyn", kotelna: "topeni", vytah: "vytahy", po: "po", eps: "po", vzt: "vzt", chlazeni: "chlazeni", hriste: "stavebni" };

  function tvar(n, a, b, c) { return n === 1 ? a : n >= 2 && n <= 4 ? b : c; }
  function toast(text) {
    var t = $(".toast") || doc.body.appendChild(Object.assign(doc.createElement("div"), { className: "toast" }));
    t.innerHTML = ik("fajfka") + "<span>" + esc(text) + "</span>";
    t.classList.add("je-videt");
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { t.classList.remove("je-videt"); }, 3200);
  }

  /* ---------- Stav dema (localStorage) ---------- */
  function nacti() { try { return JSON.parse(localStorage.getItem(KLIC)) || {}; } catch (e) { return {}; } }
  function uloz() { try { localStorage.setItem(KLIC, JSON.stringify(S)); } catch (e) { /* bez ukládání */ } }
  var S = nacti();
  S.zavady = S.zavady || {};
  S.hotove = S.hotove || [];
  S.pravidla = S.pravidla || {};
  function zavady() {
    var zakl = D.zavady.map(function (z) { return S.zavady[z.id] || z; });
    var nove = Object.keys(S.zavady).filter(function (id) { return !D.zavady.some(function (z) { return z.id === id; }); }).map(function (id) { return S.zavady[id]; });
    return nove.concat(zakl);
  }
  function ulozZavadu(z) { S.zavady[z.id] = z; uloz(); }
  function objekt(id) { return D.objekty.filter(function (o) { return o.id === id; })[0]; }
  function dodavatel(id) { return D.dodavatele.filter(function (d) { return d.id === id; })[0]; }

  /* ---------- Odvozená data ---------- */
  function plany() {
    var vse = [];
    D.objekty.forEach(function (o) {
      BV.revize.planObjektu(o, DNES).forEach(function (p) {
        vse.push(Object.assign({}, p, { id: o.id + ":" + p.kod, objektId: o.id, objektNazev: o.kratce, terminText: datum(p.termin), stavText: REV_STAV[p.stav][1] }));
      });
    });
    return vse;
  }
  var HORSI = ["zruseno", "splneno", "bezi", "ohrozeno", "poruseno"];
  function zavadySla() {
    return zavady().map(function (z) {
      var sla = BV.zavady.slaStav(z, TED);
      var horsi = HORSI.indexOf(sla.reakce) > HORSI.indexOf(sla.vyreseni) ? sla.reakce : sla.vyreseni;
      var otevrena = ["nova", "prirazena", "v-reseni", "ceka-na-dil"].indexOf(z.stav) >= 0;
      return Object.assign({}, z, { sla: sla, slaHorsi: otevrena ? horsi : "splneno", slaText: SLA_STAV[horsi][1] });
    });
  }
  function doklady() {
    return BV.dodavatele.hlidani(D.dodavatele, DNES).map(function (x) {
      return Object.assign({}, x, { id: x.id + ":" + x.typ, dodavatelId: x.id, typText: D.dokumenty[x.typ] || x.typ, stavText: x.stav === "neplatny" ? "neplatné" : "brzy vyprší", platnostText: datum(x.platnostDo) });
    });
  }
  function smlouvy() {
    return D.smlouvy.map(function (s) {
      var t = BV.smlouvy ? BV.smlouvy.smluvniTerminy(s, DNES) : {};
      return Object.assign({}, s, t, { vypovedText: datum(t.posledniDenVypovedi) });
    });
  }
  function ukoly() {
    if (!BV.automatizace) return [];
    var pravidla = D.pravidla.filter(function (p) { return S.pravidla[p.id] !== undefined ? S.pravidla[p.id] : p.zapnuto; });
    return BV.automatizace.vyhodnot(pravidla, { revize: plany(), doklady: doklady(), zavady: zavadySla(), smlouvy: smlouvy() }, []);
  }

  /* ---------- Rám aplikace ---------- */
  var VIEWS = DRUH === "portal" ? [
    ["prehled", "dum", "Můj dům"], ["zavady", "vystraha", "Závady"], ["nahlasit", "plus", "Nahlásit závadu"], ["revize", "kalendar", "Revize"],
    ["dokumenty", "dokument", "Dokumenty"], ["vyuctovani", "kalkulacka", "Vyúčtování"], ["smlouva", "smlouva", "Smlouva"],
  ] : [
    // [id, ikona, název, potřebné oprávnění, sekce] – rozsah jako CRM byPalda + provoz správy budov
    ["prehled", "mriz", "Přehled", null, ""],
    ["poptavky", "obalka", "Poptávky", "klienti.cist", "Obchod"], ["klienti", "parta", "Klienti", "klienti.cist", "Obchod"],
    ["zakazky", "seznam", "Zakázky", "zakazky.cist", "Obchod"], ["smlouvy", "smlouva", "Smlouvy", "smlouvy.cist", "Obchod"],
    ["vzory", "dokument", "Vzory smluv", "smlouvy.cist", "Obchod"], ["doklady", "kalkulacka", "Doklady", "doklady.cist", "Obchod"],
    ["statistiky", "graf", "Statistiky", "statistiky", "Obchod"],
    ["zavady", "vystraha", "Závady", "zavady.cist", "Provoz"], ["revize", "kalendar", "Revize", "objekty.cist", "Provoz"],
    ["objekty", "dum", "Objekty", "objekty.cist", "Provoz"], ["dodavatele", "klic", "Dodavatelé", "dodavatele.cist", "Provoz"],
    ["ukoly", "fajfka", "Úkoly", null, "Provoz"], ["vyuctovani", "kalkulacka", "Vyúčtování", "vyuctovani.cist", "Provoz"],
    ["automatizace", "automat", "Automatizace", "zakazky.cist", "Systém"], ["navstevnost", "oko", "Návštěvnost webu", "statistiky", "Systém"],
    ["tym", "osoba", "Tým a role", "uzivatele", "Systém"], ["nastaveni", "ozubeni", "Nastavení", "nastaveni", "Systém"],
  ];
  var uzivatel = null;
  var CRM = null;
  // Smí přihlášený člen týmu tenhle úkon? (BV.opravneni – stejná logika jako opravneni.php v CRM byPalda)
  function muze(akce) {
    if (DRUH !== "dispecink" || !akce) return true;
    if (!BV.opravneni) return true;
    return BV.opravneni.muze(uzivatel, akce, CRM ? CRM.nastaveni().pravaZapnuta : true);
  }
  function clenTymu() {
    var tym = CRM ? CRM.sada("tym") : D.tym;
    var t = tym.filter(function (x) { return x.id === (S.jako || 1); })[0] || tym[0];
    var inicialy = t.jmeno.split(" ").map(function (c) { return c.charAt(0); }).join("").slice(0, 2);
    return Object.assign({}, t, { inicialy: inicialy, popisRole: (BV.opravneni ? BV.opravneni.ROLE[t.role] : t.role) + " · Budovník" });
  }

  function ram(obsahHtml, aktivni) {
    var odznaky = {};
    if (DRUH === "dispecink") {
      var zs = zavadySla();
      odznaky.zavady = zs.filter(function (z) { return z.stav === "nova"; }).length;
      odznaky.automatizace = ukoly().filter(function (u) { return S.hotove.indexOf(u.klic) < 0; }).length;
    }
    if (DRUH === "dispecink" && CRM) {
      odznaky.poptavky = CRM.poptavky().filter(function (p) { return p.stav !== "prevedena"; }).length;
    }
    var sekce = "";
    var tlacitko = function (v) {
      var o = odznaky[v[0]];
      return '<button type="button" data-view="' + v[0] + '"' + (v[0] === aktivni ? ' aria-current="page"' : "") + ">" + ik(v[1]) + "<span>" + esc(v[2]) + "</span>" + (o ? "<b>" + o + "</b>" : "") + "</button>";
    };
    var povolene = VIEWS.filter(function (v) { return muze(v[3]); });
    var navigace = povolene.map(function (v) {
      var nadpis = v[4] && v[4] !== sekce ? '<div class="apl__nav-nadpis">' + esc(v[4]) + "</div>" : "";
      sekce = v[4] || sekce;
      return nadpis + tlacitko(v);
    }).join("");
    var mobilni = povolene.map(tlacitko).join("");
    var jako = DRUH === "dispecink" && CRM ? '<select class="vstup" data-demo-jako aria-label="Demo: přihlášen jako" style="min-height:36px;padding:6px 8px">' +
      CRM.sada("tym").map(function (t) { return '<option value="' + t.id + '"' + (t.id === uzivatel.id ? " selected" : "") + ">" + esc(t.jmeno) + " (" + esc(BV.opravneni ? BV.opravneni.ROLE[t.role] : t.role) + ")</option>"; }).join("") + "</select>" : "";
    if (jako) mobilni = '<span class="apl__mobilnav-jako">' + jako + "</span>" + mobilni;
    KOREN.innerHTML = '<div class="apl">' +
      '<aside class="apl__bok"><div class="apl__kdo"><span class="apl__avatar">' + esc(uzivatel.inicialy) + "</span><div><strong>" + esc(uzivatel.jmeno) + "</strong><small>" + esc(uzivatel.popisRole || uzivatel.role) + "</small></div></div>" +
      '<nav class="apl__nav">' + navigace + "</nav>" +
      '<div class="apl__spodek"><span>Demo · dnes je ' + datum(DNES) + ', ' + TED.slice(11) + "</span>" +
      (jako ? '<label class="pole" style="gap:4px"><span style="font-size:.74rem">Demo: přihlášen jako</span>' + jako + "</label>" : "") +
      (DRUH === "portal" ? '<a href="dispecink.html">' + ik("mriz") + " Jak to vidí dispečink →</a>" : '<a href="portal.html">' + ik("zamek") + " Klientský portál →</a>") +
      '<button type="button" class="tl tl--obrys tl--maly" data-odhlasit>' + ik("odchod") + " " + (DRUH === "portal" ? "Odhlásit" : "Obnovit demo") + "</button></div></aside>" +
      '<div><nav class="apl__mobilnav">' + mobilni + '</nav><section class="apl__obsah">' + obsahHtml + "</section></div></div>";
  }

  /* ---------- Router ---------- */
  function aktualni() { var h = location.hash.replace("#", ""); return VIEWS.some(function (v) { return v[0] === h; }) ? h : "prehled"; }
  function vykresli() {
    if (!BV.revize || !BV.zavady || !BV.dodavatele) { KOREN.innerHTML = '<div class="obal" style="padding:40px 0">Moduly systému se nenačetly.</div>'; return; }
    if (DRUH === "portal" && !uzivatel) { prihlaseni(); return; }
    var v = aktualni();
    if (DRUH === "dispecink") uzivatel = clenTymu();
    var fn = (DRUH === "portal" ? PORTAL : DISPECINK)[v];
    var popis = VIEWS.filter(function (x) { return x[0] === v; })[0];
    if (popis && !muze(popis[3])) {
      ram(hlava("Oprávnění", "Sem nemáte přístup") + '<div class="prazdne">Role „' + esc(uzivatel.popisRole) + '“ tuhle část nevidí. Přepnout se dá v Týmu a rolích (jako správce), nebo vypnutím hlídání oprávnění.</div>', v);
      return;
    }
    ram(fn(), v);
    if (POVYKRESLENI[v]) POVYKRESLENI[v]();
    window.scrollTo({ top: 0 });
  }
  window.addEventListener("hashchange", function () { if (dialog.open) dialog.close(); vykresli(); });
  KOREN.addEventListener("click", function (e) {
    var b = e.target.closest("[data-view]");
    if (b) { location.hash = b.getAttribute("data-view"); return; }
    if (e.target.closest("[data-odhlasit]")) {
      if (DRUH === "portal") { try { sessionStorage.removeItem("bv-portal-role"); } catch (x) { /* nic */ } uzivatel = null; location.hash = ""; vykresli(); }
      else { if (confirm("Obnovit demo do výchozího stavu? Smaže se, co jste v demu změnili.")) { S = { zavady: {}, hotove: [], pravidla: {} }; try { localStorage.setItem(KLIC, "{}"); } catch (x) { /* nic */ } uloz(); vykresli(); toast("Demo obnoveno."); } }
    }
  });

  function hlava(stitek, nadpis, akce) {
    return '<div class="apl__hlava"><div><span class="stitek">' + esc(stitek) + "</span><h1>" + nadpis + "</h1></div>" + (akce ? '<div class="akce-radek">' + akce + "</div>" : "") + "</div>";
  }
  function panel(nadpis, telo, akce, trida) {
    return '<div class="panel ' + (trida || "") + '"><div class="panel__hlava"><h2>' + nadpis + "</h2>" + (akce || "") + "</div>" + telo + "</div>";
  }
  function kpi(cislo, popis, ikona, trida) {
    return '<div class="kpi__dlazdice ' + (trida || "") + '">' + ik(ikona) + "<strong>" + cislo + "</strong><span>" + esc(popis) + "</span></div>";
  }
  function tabulka(hlavicka, radky, prazdne) {
    if (!radky.length) return '<div class="prazdne">' + esc(prazdne || "Nic tu není.") + "</div>";
    return '<div class="tab-obal"><table class="tab"><thead><tr>' + hlavicka.map(function (h) { return "<th" + (h.charAt(0) === ">" ? ' class="cislo">' + h.slice(1) : ">" + h) + "</th>"; }).join("") + "</tr></thead><tbody>" + radky.join("") + "</tbody></table></div>";
  }
  function tiket(z, jmenoObjektu) {
    var o = objekt(z.objekt);
    var zb = BV.zavady.zbyva(z, TED);
    var otevrena = ["nova", "prirazena", "v-reseni", "ceka-na-dil"].indexOf(z.stav) >= 0;
    var hodiny = "";
    if (otevrena) {
      var druh = ["nova", "prirazena"].indexOf(z.stav) >= 0 ? "reakce" : "vyreseni";
      var s = z.sla[druh];
      hodiny = '<span class="odpocet' + (s === "poruseno" ? " odpocet--chyba" : s === "ohrozeno" ? " odpocet--pozor" : "") + '">' + (druh === "reakce" ? "reakce · " : "vyřešení · ") + minutyText(zb[druh]) + "</span>";
    }
    return '<button type="button" class="tiket' + (z.novaVDemu ? " je-novy" : "") + '" data-tiket="' + esc(z.id) + '">' +
      '<div class="tiket__radek"><span class="priorita priorita--' + z.priorita + '">' + PRIORITA[z.priorita] + "</span><small>" + esc(z.id) + "</small></div>" +
      "<strong>" + esc(z.nazev) + "</strong>" +
      '<div class="tiket__radek"><small>' + ik("dum") + " " + esc(o ? o.kratce : "") + "</small>" + (z.dodavatel ? "<small>" + esc(DRUH === "portal" ? "technik Budovníku" : (dodavatel(z.dodavatel) || {}).nazev || "") + "</small>" : "") + "</div>" +
      (hodiny ? '<div class="tiket__radek">' + hodiny + "</div>" : "") + "</button>";
  }

  /* ---------- Detail závady (dialog) ---------- */
  var dialog = doc.createElement("dialog");
  dialog.className = "dialog";
  doc.body.appendChild(dialog);
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog || e.target.closest("[data-zavrit]")) { dialog.close(); return; }
    var p = e.target.closest("[data-prirad]");
    if (p) { akceZavady(dialog.dataset.id, "prirad", p.getAttribute("data-prirad")); return; }
    var a = e.target.closest("[data-prechod]");
    if (a) akceZavady(dialog.dataset.id, a.getAttribute("data-prechod"));
  });
  // Klient v portálu nevidí, kdo zakázku fyzicky dělá – jen „technik Budovníku“.
  function kdoText(kdo) {
    if (DRUH === "portal" && D.dodavatele.some(function (d) { return d.nazev === kdo; })) return "technik Budovníku";
    return kdo;
  }
  var POPIS_PRECHODU = { prirazena: "Přiřadit", "v-reseni": "Technik na místě", "ceka-na-dil": "Čeká na díl", hotova: "Hotovo", prevzata: "Klient převzal", vyfakturovana: "Vyfakturovat", nova: "Vrátit mezi nové", zrusena: "Zrušit" };
  function akceZavady(id, akce, dodId) {
    var z = zavady().filter(function (x) { return x.id === id; })[0];
    var kdo = uzivatel ? uzivatel.jmeno : "dispečink";
    try {
      if (akce === "prirad") { z = BV.zavady.prirad(z, dodId, TED, kdo); toast("Přiřazeno: " + dodavatel(dodId).nazev + ". Dodavatel dostal zadání do aplikace."); }
      else {
        z = BV.zavady.prejdi(z, akce, TED, kdo);
        if (akce === "hotova" && !z.naklady) z = Object.assign({}, z, { naklady: [{ popis: "Práce technika", castkaBezDph: 1200, sazbaDph: 21 }, { popis: "Drobný materiál", castkaBezDph: 380, sazbaDph: 21 }] });
        toast(ZAV_STAV[akce] + ": " + z.id);
      }
    } catch (e) { toast("Tento krok teď nejde: " + e.message); return; }
    ulozZavadu(z);
    otevriZavadu(z.id);
    vykresli();
  }
  function otevriZavadu(id) {
    var z = zavadySla().filter(function (x) { return x.id === id; })[0];
    if (!z) return;
    var o = objekt(z.objekt);
    var t = BV.zavady.terminy(z);
    var prechody = (BV.zavady.PRECHODY[z.stav] || []).filter(function (s) { return s !== "prirazena"; });
    var akce = "";
    if (DRUH === "dispecink") {
      if (z.stav === "nova") {
        var dop = BV.dodavatele.doporuc(D.dodavatele, { obor: z.obor, kraj: o.kraj }, DNES, 3);
        akce = '<div><span class="stitek">Doporučení dodavatelé · ' + esc(D.obory[z.obor] || z.obor) + "</span>" +
          (dop.length ? '<div class="ukoly" style="margin-top:8px">' + dop.map(function (d, i) {
            var dd = dodavatel(d.id); var k = BV.dodavatele.kvalifikace(dd, z.obor, DNES);
            return '<div class="ukol"><span class="ukol__ikona">' + (i + 1) + '</span><div><strong>' + esc(d.nazev) + "</strong><small>skóre " + d.skore + " · odezva " + dd.odezvaHodin + " h · hodnocení " + (BV.dodavatele.prumerHodnoceni(dd) || "—") + (k.vyprsi.length ? " · ⚠ " + k.vyprsi.map(function (x) { return D.dokumenty[x]; }).join(", ") + " brzy vyprší" : "") + '</small></div><button type="button" class="tl tl--maly" data-prirad="' + d.id + '">Přiřadit</button></div>';
          }).join("") + "</div>" : '<div class="prazdne" style="margin-top:8px">Žádný způsobilý dodavatel pro tento obor a region.</div>') + "</div>";
      }
      if (prechody.length) akce += '<div class="akce-radek">' + prechody.map(function (s) { return '<button type="button" class="tl tl--maly ' + (s === "zrusena" || s === "nova" ? "tl--obrys" : "tl--tmavy") + '" data-prechod="' + s + '">' + POPIS_PRECHODU[s] + "</button>"; }).join("") + "</div>";
    } else if (z.stav === "hotova") {
      akce = '<div class="akce-radek"><button type="button" class="tl tl--maly" data-prechod="prevzata">Potvrdit převzetí práce</button><button type="button" class="tl tl--maly tl--obrys" data-prechod="v-reseni">Reklamovat</button></div>';
    }
    var naklady = z.naklady && BV.fakturace ? (function () {
      var f = BV.fakturace.prefakturuj(z.naklady, D.marze);
      return '<div><span class="stitek">Náklady ' + (DRUH === "dispecink" ? "(nákup → prodej s marží " + D.marze + " %)" : "") + "</span>" + tabulka(["Položka", ">Bez DPH", ">DPH"], f.radky.map(function (r) { return "<tr><td>" + esc(r.popis) + (DRUH === "dispecink" ? "<small>nákup " + kc(r.nakup, 1) + "</small>" : "") + '</td><td class="cislo">' + kc(r.prodej, 1) + '</td><td class="cislo">' + r.sazbaDph + " %</td></tr>"; })) + '<p style="margin:8px 0 0;text-align:right"><strong>Celkem s DPH ' + kc(f.kUhrade) + "</strong></p></div>";
    })() : "";
    dialog.dataset.id = z.id;
    dialog.innerHTML = '<div class="dialog__hlava"><div><span class="priorita priorita--' + z.priorita + '">' + PRIORITA[z.priorita] + '</span> <span class="stitek">' + esc(z.id) + "</span><h2>" + esc(z.nazev) + '</h2></div><button type="button" class="zavrit" data-zavrit aria-label="Zavřít">' + ik("krizek") + "</button></div>" +
      '<div class="dialog__telo">' +
      '<div class="pasport"><div><span>Objekt</span><strong>' + esc(o.kratce) + "</strong></div><div><span>Místo</span><strong>" + esc(z.misto || "—") + "</strong></div><div><span>Nahlásil</span><strong>" + esc(z.nahlasil) + "</strong></div><div><span>Stav</span><strong>" + stav(ZAV_TRIDA[z.stav], ZAV_STAV[z.stav]) + "</strong></div></div>" +
      (z.popis ? "<p style=\"margin:0\">" + esc(z.popis) + "</p>" : "") +
      '<div class="pasport"><div><span>Reakce do</span><strong>' + cas(t.reakce) + "</strong>" + stav(SLA_STAV[z.sla.reakce][0], SLA_STAV[z.sla.reakce][1]) + "</div><div><span>Vyřešení do</span><strong>" + cas(t.vyreseni) + "</strong>" + stav(SLA_STAV[z.sla.vyreseni][0], SLA_STAV[z.sla.vyreseni][1]) + "</div>" +
      (z.dodavatel ? (DRUH === "portal" ? "<div><span>Řeší</span><strong>technik Budovníku</strong></div>" : "<div><span>Dodavatel</span><strong>" + esc(dodavatel(z.dodavatel).nazev) + "</strong></div>") : "") + "</div>" +
      akce + naklady +
      '<div><span class="stitek">Historie</span><ul class="historie" style="margin-top:10px"><li><div>Nahlášeno<br><small>' + cas(z.nahlaseno) + " · " + esc(z.nahlasil) + "</small></div></li>" +
      (z.historie || []).map(function (h) { return "<li><div>" + esc(ZAV_STAV[h.na]) + "<br><small>" + cas(h.cas) + " · " + esc(kdoText(h.kdo)) + "</small></div></li>"; }).join("") + "</ul></div>" +
      "</div>";
    if (!dialog.open) dialog.showModal();
  }
  KOREN.addEventListener("click", function (e) {
    var t = e.target.closest("[data-tiket]");
    if (t) otevriZavadu(t.getAttribute("data-tiket"));
  });

  var POVYKRESLENI = {};

  /* =================== DISPEČINK =================== */
  var mesic = DNES.slice(0, 7);
  var DISPECINK = {
    prehled: function () {
      var zs = zavadySla(), pl = plany(), dk = doklady(), uk = ukoly();
      var otevrene = zs.filter(function (z) { return ["nova", "prirazena", "v-reseni", "ceka-na-dil"].indexOf(z.stav) >= 0; });
      var porusene = otevrene.filter(function (z) { return z.slaHorsi === "poruseno"; });
      var poTerminu = pl.filter(function (p) { return p.stav === "po-terminu" || p.stav === "bez-terminu"; });
      var blizi = pl.filter(function (p) { return p.stav === "blizi-se"; });
      var cekajici = uk.filter(function (u) { return S.hotove.indexOf(u.klic) < 0; });
      var dnes = CRM ? CRM.dnesResit() : null;
      return hlava("Interní systém · " + datum(DNES) + " · " + esc(uzivatel.jmeno), "Dnešní přehled", '<a class="tl tl--maly" href="#zavady">' + ik("vystraha") + " Závady</a>") +
        (dnes ? '<div class="apl-mrizka" style="margin-bottom:16px"><div class="s-12">' + panel("Co dnes řešit (" + dnes.pocet + ")", dnes.html) + "</div></div>" : "") +
        '<div class="kpi">' + kpi(otevrene.length, tvar(otevrene.length, "otevřená závada", "otevřené závady", "otevřených závad"), "vystraha") + kpi(porusene.length, tvar(porusene.length, "závada s porušenou lhůtou", "závady s porušenou lhůtou", "závad s porušenou lhůtou"), "hodiny", porusene.length ? "kpi__dlazdice--chyba" : "") +
        kpi(blizi.length, tvar(blizi.length, "revize do 30 dní", "revize do 30 dní", "revizí do 30 dní"), "kalendar", "kpi__dlazdice--pozor") + kpi(poTerminu.length + dk.length, "k nápravě: revize a doklady", "stit", "kpi__dlazdice--chyba") + "</div>" +
        '<div class="apl-mrizka">' +
        '<div class="s-7">' + panel("Úkoly od automatizace", cekajici.length ? '<div class="ukoly">' + cekajici.slice(0, 7).map(ukolHtml).join("") + "</div>" : '<div class="prazdne">Všechno hotovo.</div>', '<a class="tl tl--maly tl--obrys" href="#automatizace">Všechny (' + cekajici.length + ")</a>") + "</div>" +
        '<div class="s-5">' + panel("Hoří: lhůty závad", tabulka(["Závada", "Stav", "SLA"], otevrene.sort(function (a, b) { return HORSI.indexOf(b.slaHorsi) - HORSI.indexOf(a.slaHorsi); }).slice(0, 6).map(function (z) {
          return '<tr data-tiket="' + esc(z.id) + '" style="cursor:pointer"><td>' + esc(z.nazev) + "<small>" + esc(objekt(z.objekt).kratce) + " · " + PRIORITA[z.priorita] + "</small></td><td>" + stav(ZAV_TRIDA[z.stav], ZAV_STAV[z.stav]) + "</td><td>" + stav(SLA_STAV[z.slaHorsi][0], SLA_STAV[z.slaHorsi][1]) + "</td></tr>";
        }), "Žádné otevřené závady.")) + "</div>" +
        '<div class="s-6">' + panel("Revize v příštích 30 dnech", tabulka(["Revize", "Objekt", "Termín"], blizi.sort(function (a, b) { return a.termin < b.termin ? -1 : 1; }).map(function (p) {
          return "<tr><td>" + esc(p.nazev) + "</td><td>" + esc(p.objektNazev) + "</td><td>" + datum(p.termin) + " " + revStav(p) + "</td></tr>";
        })), '<a class="tl tl--maly tl--obrys" href="#revize">Kalendář</a>') + "</div>" +
        '<div class="s-6">' + panel("Doklady dodavatelů k obnově", tabulka(["Dodavatel", "Doklad", "Platnost"], dk.map(function (d) {
          return "<tr><td>" + esc(d.nazev) + "</td><td>" + esc(d.typText) + "</td><td>" + datum(d.platnostDo) + " " + stav(d.stav === "neplatny" ? "chyba" : "pozor", d.stavText) + "</td></tr>";
        }), "Všechny doklady platné."), '<a class="tl tl--maly tl--obrys" href="#dodavatele">Registr</a>') + "</div>" +
        "</div>";
    },
    zavady: function () {
      var zs = zavadySla();
      var sloupce = [["Nové", ["nova"]], ["Přiřazené", ["prirazena"]], ["V řešení", ["v-reseni", "ceka-na-dil"]], ["Hotové", ["hotova"]], ["Uzavřené", ["prevzata", "vyfakturovana", "zrusena"]]];
      var p = BV.zavady.prehled(zavady(), TED);
      var porusene = zs.filter(function (z) { return z.slaHorsi === "poruseno"; }).length;
      return hlava("Helpdesk a dispečink", "Závady", '<span class="stav stav--info">' + p.otevrene + tvar(p.otevrene, ' otevřená', ' otevřené', ' otevřených') + '</span><span class="stav stav--chyba">' + porusene + " s porušenou lhůtou</span>") +
        '<p class="tlumene" style="margin-top:-8px">Lhůty se počítají podle priority: havárie reakce do 2 h, urgentní do 24 h, běžná do 2 pracovních dnů (víkendy a svátky se nepočítají). Klikněte na kartu pro detail a přiřazení dodavatele.</p>' +
        '<div class="kanban">' + sloupce.map(function (s) {
          var v = zs.filter(function (z) { return s[1].indexOf(z.stav) >= 0; });
          return '<div class="kanban__sloupec"><h3>' + s[0] + "<span>" + v.length + "</span></h3>" + v.map(function (z) { return tiket(z); }).join("") + "</div>";
        }).join("") + "</div>";
    },
    revize: function () {
      var pl = plany();
      var rok = Number(mesic.slice(0, 4)), m = Number(mesic.slice(5, 7));
      var prvni = new Date(Date.UTC(rok, m - 1, 1));
      var posun = (prvni.getUTCDay() + 6) % 7;
      var dnu = new Date(Date.UTC(rok, m, 0)).getUTCDate();
      var nazvy = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];
      var od = mesic + "-01", do_ = mesic + "-" + String(dnu).padStart(2, "0");
      var kal = BV.revize.kalendar(D.objekty, od, do_, DNES);
      var bunky = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map(function (d) { return '<div class="kalendar-mesic__hlava">' + d + "</div>"; }).join("");
      for (var i = 0; i < posun; i += 1) bunky += '<div class="kalendar-mesic__den je-mimo"></div>';
      for (var d = 1; d <= dnu; d += 1) {
        var den = mesic + "-" + String(d).padStart(2, "0");
        var udalosti = kal.filter(function (k) { return k.termin === den; });
        var volno = !BV.pracovnidny.jePracovniDen(den);
        bunky += '<div class="kalendar-mesic__den' + (den === DNES ? " je-dnes" : "") + (volno ? " je-volno" : "") + '"><b>' + d + "</b>" + udalosti.map(function (u) {
          return '<button type="button" class="udalost udalost--' + u.stav + '" title="' + esc(u.nazev + " · " + u.objektNazev) + '" data-poptat="' + esc(u.objektId + ":" + u.kod) + '">' + esc(u.objektNazev) + ": " + esc(u.nazev) + "</button>";
        }).join("") + "</div>";
      }
      var problem = pl.filter(function (p) { return p.stav === "po-terminu" || p.stav === "bez-terminu"; });
      return hlava("Kalendář revizí a kontrol", nazvy[m - 1] + " " + rok, '<button type="button" class="tl tl--maly tl--obrys" data-mesic="-1">← Předchozí</button><button type="button" class="tl tl--maly tl--obrys" data-mesic="1">Další →</button>') +
        '<div class="apl-mrizka"><div class="s-12">' + panel("Měsíc", '<div class="kalendar-mesic">' + bunky + "</div>", '<span class="tlumene" style="font-size:.82rem">Šedé dny jsou víkendy a státní svátky. Kliknutím na revizi ji poptáte.</span>') + "</div>" +
        '<div class="s-12">' + panel("Po termínu nebo bez záznamu (" + problem.length + ")", tabulka(["Revize", "Objekt", "Poslední", "Termín", ""], problem.map(function (p) {
          return "<tr><td>" + esc(p.nazev) + "<small>" + esc(p.predpis) + "</small></td><td>" + esc(p.objektNazev) + "</td><td>" + datum(p.posledni) + "</td><td>" + revStav(p) + '</td><td><button type="button" class="tl tl--maly" data-poptat="' + esc(p.id) + '">Poptat</button></td></tr>';
        }), "Žádná revize po termínu.")) + "</div></div>";
    },
    objekty: function () {
      return hlava("Portfolio", "Objekty (" + D.objekty.length + ")") + '<div class="apl-mrizka">' + D.objekty.map(function (o) {
        var pl = BV.revize.planObjektu(o, DNES), su = BV.revize.souhrn(pl);
        var otevrene = zavady().filter(function (z) { return z.objekt === o.id && ["nova", "prirazena", "v-reseni", "ceka-na-dil"].indexOf(z.stav) >= 0; }).length;
        return '<div class="s-6">' + panel(esc(o.nazev), '<p class="tlumene" style="margin-top:-6px">' + esc(o.adresa) + " · " + esc(o.kontakt) + "</p>" +
          '<div class="pasport"><div><span>Typ</span><strong>' + esc({ svj: "SVJ", druzstvo: "Bytové družstvo", komercni: "Komerční", verejne: "Veřejná budova" }[o.typ]) + "</strong></div><div><span>" + (o.jednotek ? "Jednotek" : "Plocha") + "</span><strong>" + (o.jednotek || o.plocha.toLocaleString("cs-CZ") + " m²") + "</strong></div><div><span>Rok výstavby</span><strong>" + o.rok + "</strong></div><div><span>Otevřené závady</span><strong>" + otevrene + "</strong></div></div>" +
          '<div class="akce-radek" style="margin-top:12px">' + stav("ok", su.vPoradku + " v pořádku") + stav("pozor", su.bliziSe + " blíží se") + stav("chyba", su.poTerminu + su.bezTerminu + " k nápravě") + "</div>" +
          '<details style="margin-top:12px"><summary style="cursor:pointer;font-weight:600">Plán revizí (' + su.celkem + ")</summary>" + tabulka(["Revize", "Poslední", "Další termín"], pl.map(function (p) { return "<tr><td>" + esc(p.nazev) + "</td><td>" + datum(p.posledni) + "</td><td>" + datum(p.termin) + " " + revStav(p) + "</td></tr>"; })) + "</details>") + "</div>";
      }).join("") + "</div>";
    },
    dodavatele: function () {
      var dk = doklady();
      var radky = D.dodavatele.map(function (d) {
        var obor = d.obory[0];
        var k = BV.dodavatele.kvalifikace(d, obor, DNES);
        var stavHtml = !d.aktivni ? stav("neutral", "neaktivní") : k.neplatne.length || k.chybi.length ? stav("chyba", "blokován") : k.vyprsi.length ? stav("pozor", "doklad vyprší") : stav("ok", "způsobilý");
        var prum = BV.dodavatele.prumerHodnoceni(d);
        var dokl = d.dokumenty.map(function (x) { var s = BV.dodavatele.stavDokumentu(x, DNES); return '<span title="' + esc((D.dokumenty[x.typ] || x.typ) + " · " + (x.platnostDo ? "do " + datum(x.platnostDo) : "bez omezení")) + '" class="stav stav--' + { platny: "ok", "bez-omezeni": "ok", vyprsi: "pozor", neplatny: "chyba" }[s] + '">' + esc((D.dokumenty[x.typ] || x.typ).split(" ")[0]) + "</span>"; }).join(" ");
        return "<tr><td><strong>" + esc(d.nazev) + "</strong><small>" + esc(d.kontakt) + " · " + d.kraje.join(", ") + "</small></td><td>" + d.obory.map(function (o) { return esc(D.obory[o] || o); }).join(", ") + "</td><td>" + dokl + "</td><td class=\"cislo\">" + (prum ? "★ " + String(prum).replace(".", ",") : "—") + '</td><td class="cislo">' + d.odezvaHodin + " h</td><td class=\"cislo\">" + Math.round(d.vytizeni * 100) + " %</td><td>" + stavHtml + "</td></tr>";
      });
      return hlava("Registr subdodavatelů", "Dodavatelé (" + D.dodavatele.length + ")", '<a class="tl tl--maly tl--obrys" href="kariera.html">Registrační formulář</a>') +
        (dk.length ? panel("Hlídání platnosti dokladů", '<div class="ukoly">' + dk.map(function (x) { return '<div class="ukol ukol--' + (x.stav === "neplatny" ? "eskalace" : "upozorneni") + '"><span class="ukol__ikona">' + ik("stit") + "</span><div>" + esc(x.nazev) + ": " + esc(x.typText) + "<small>platnost " + datum(x.platnostDo) + " · " + x.stavText + '</small></div><button type="button" class="tl tl--maly tl--obrys" data-vyzadat="' + esc(x.nazev) + '">Vyžádat nový</button></div>'; }).join("") + "</div>", "", "") + '<div style="height:16px"></div>' : "") +
        panel("Všichni dodavatelé", tabulka(["Dodavatel", "Obory", "Doklady", ">Hodnocení", ">Odezva", ">Vytížení", "Stav"], radky)) +
        '<p class="tlumene" style="font-size:.85rem;margin-top:12px">Dodavatel s propadlým povinným dokladem nedostane zakázku: systém ho při doporučení k závadě vynechá. Skóre doporučení = kvalita 40 % + rychlost 30 % + volná kapacita 20 % + region 10 %.</p>';
    },
    smlouvy: function () {
      var sm = smlouvy();
      var radky = sm.map(function (s) {
        var o = s.objekt ? objekt(s.objekt) : null, dd = s.dodavatel ? dodavatel(s.dodavatel) : null;
        var st = s.skoncila ? stav("neutral", "skončila") : s.upozornit ? stav("pozor", "výpověď do " + datum(s.posledniDenVypovedi)) : s.typ === "neurcita" ? stav("info", "na dobu neurčitou") : stav("ok", "běží");
        return "<tr><td><strong>" + esc(s.nazev) + "</strong><small>" + esc(s.id) + " · " + (s.strana === "klient" ? "klient: " + esc(o.kratce) : "dodavatel: " + esc(dd.nazev)) + "</small></td><td>" + datum(s.zacatek) + "</td><td>" + (s.konec ? datum(s.konec) + (s.prodlouzeno ? "<small>prodlouženo " + s.prodlouzeno + "×</small>" : "") : "—") + "</td><td>" + (s.posledniDenVypovedi ? datum(s.posledniDenVypovedi) + "<small>" + dnyText(s.dnuDoVypovedi) + "</small>" : s.ucinnostVypovedi ? "<small>výpověď dnes → konec " + datum(s.ucinnostVypovedi) + "</small>" : "—") + '</td><td class="cislo">' + kc(s.castkaMesicne) + "</td><td>" + st + "</td></tr>";
      });
      var volby = D.objekty.map(function (o) { return '<option value="' + o.id + '">' + esc(o.nazev) + "</option>"; }).join("");
      return hlava("Smlouvy s klienty a dodavateli", "Smlouvy") +
        panel("Přehled a lhůty", tabulka(["Smlouva", "Od", "Konec", "Poslední den výpovědi", ">Měsíčně", "Stav"], radky)) + '<div style="height:16px"></div>' +
        '<div class="apl-mrizka"><div class="s-5">' + panel("Generátor smlouvy ze šablony", '<form class="formular" data-generator onsubmit="return false">' +
          '<div class="pole"><label>Objekt</label><select name="objekt">' + volby + "</select></div>" +
          '<div class="mala-pole"><div class="pole"><label>IČO klienta</label><input type="text" name="ico" placeholder="doplňte"></div><div class="pole"><label>Zastoupený</label><input type="text" name="zastoupeni" placeholder="doplňte"></div></div>' +
          '<div class="mala-pole"><div class="pole"><label>Začátek</label><input type="date" name="zacatek" value="2027-01-01"></div><div class="pole"><label>Splatnost (dní)</label><input type="number" name="splatnost" value="14"></div><div class="pole"><label>Místo podpisu</label><input type="text" name="misto" placeholder="doplňte"></div></div>' +
          '<label class="souhlas"><input type="checkbox" name="havarijni" checked> Včetně havarijní služby 24/7</label>' +
          '<div data-chybi></div></form>') + "</div>" +
        '<div class="s-7">' + panel("Náhled", '<div class="dokument-nahled" data-nahled></div>') + "</div></div>";
    },
    fakturace: function () {
      var zs = zavady().filter(function (z) { return z.naklady && ["hotova", "prevzata", "vyfakturovana"].indexOf(z.stav) >= 0; });
      var celkemZisk = 0, celkemProdej = 0;
      var radky = zs.map(function (z) {
        var f = BV.fakturace.prefakturuj(z.naklady, D.marze);
        celkemZisk += f.zisk; celkemProdej += f.zaklad;
        var o = objekt(z.objekt);
        var akce = z.stav === "prevzata" ? '<button type="button" class="tl tl--maly" data-fakturovat="' + esc(z.id) + '">Vystavit fakturu</button>' : z.stav === "hotova" ? stav("pozor", "čeká na převzetí") : stav("neutral", "vyfakturováno");
        return '<tr><td><strong>' + esc(z.nazev) + "</strong><small>" + esc(z.id) + " · " + esc(o.kratce) + " · " + esc((dodavatel(z.dodavatel) || {}).nazev || "") + '</small></td><td class="cislo">' + kc(f.nakup, 1) + '</td><td class="cislo">' + kc(f.zaklad, 1) + '</td><td class="cislo">' + kc(f.dph, 1) + '</td><td class="cislo"><strong>' + kc(f.kUhrade) + '</strong></td><td class="cislo">' + String(f.marzeSkutecna).replace(".", ",") + " %</td><td>" + akce + "</td></tr>";
      });
      return hlava("Přefakturace prací subdodavatelů", "Fakturace", '<span class="stav stav--info">marže ' + D.marze + " %</span>") +
        '<div class="kpi">' + kpi(kc(celkemProdej), "fakturováno bez DPH", "dokument") + kpi(kc(celkemZisk), "marže z prací", "graf") + kpi(zs.filter(function (z) { return z.stav === "prevzata"; }).length, "připraveno k fakturaci", "kalkulacka", "kpi__dlazdice--pozor") + kpi("14 dní", "splatnost faktur", "kalendar") + "</div>" +
        panel("Práce k přefakturaci", tabulka(["Zakázka", ">Nákup", ">Prodej", ">DPH", ">K úhradě", ">Marže", ""], radky, "Zatím žádné dokončené práce.")) +
        '<p class="tlumene" style="font-size:.85rem;margin-top:12px">Ceny se počítají v haléřích, DPH podle sazby u každé položky (12 % stavební práce v bytových domech, 21 % ostatní), k úhradě zaokrouhleno na celé koruny.</p>';
    },
    vyuctovani: function () { return vyuctovaniHtml(null); },
    automatizace: function () {
      var uk = ukoly();
      var skup = BV.automatizace.seskup(uk);
      var NAZVY = { poptavka: "Poptávky", upozorneni: "Upozornění", eskalace: "Eskalace" };
      return hlava("Pravidla a úkoly", "Automatizace") +
        '<div class="apl-mrizka" id="automatizace"><div class="s-5">' + panel("Pravidla", D.pravidla.map(function (p) {
          var zap = S.pravidla[p.id] !== undefined ? S.pravidla[p.id] : p.zapnuto;
          return '<div class="pravidlo"><div><strong>' + esc(p.nazev) + "</strong><br><code>" + esc(p.zdroj) + " · " + p.kdyz.map(function (k) { return k.pole + " " + k.op + " " + JSON.stringify(k.hodnota); }).join(" a ") + '</code></div><label class="prepinac-pravidla"><input type="checkbox" data-pravidlo="' + p.id + '"' + (zap ? " checked" : "") + ' aria-label="Zapnout pravidlo"><span></span></label></div>';
        }).join("")) + "</div>" +
        '<div class="s-7">' + (skup.length ? skup.map(function (g) {
          return panel(esc(NAZVY[g.typ] || g.typ) + " (" + g.pocet + ")", '<div class="ukoly">' + g.ukoly.map(ukolHtml).join("") + "</div>") + '<div style="height:16px"></div>';
        }).join("") : panel("Úkoly", '<div class="prazdne">Žádné pravidlo teď nic nehlásí.</div>')) + "</div></div>";
    },
  };

  function ukolHtml(u) {
    var hotovo = S.hotove.indexOf(u.klic) >= 0;
    var ikona = { poptavka: "obalka", upozorneni: "vystraha", eskalace: "sirena" }[u.typ] || "automat";
    return '<div class="ukol ukol--' + u.typ + (hotovo ? " je-hotovo" : "") + '"><span class="ukol__ikona">' + ik(ikona) + '</span><div><span class="ukol__text">' + esc(u.text) + "</span><small>" + esc(u.nazev) + '</small></div><button type="button" class="tl tl--maly ' + (hotovo ? "tl--obrys" : "tl--tmavy") + '" data-ukol="' + esc(u.klic) + '">' + (hotovo ? "Vrátit" : "Hotovo") + "</button></div>";
  }

  function vyuctovaniHtml(jednotkaId) {
    if (!BV.rozuctovani) return '<div class="prazdne">Modul vyúčtování se nenačetl.</div>';
    var v = D.vyuctovani, o = objekt(v.objekt);
    var r = BV.rozuctovani.vyuctuj(v.naklady, v.jednotky);
    var su = r.souhrn;
    if (jednotkaId) {
      var j = r.jednotky.filter(function (x) { return x.id === jednotkaId; })[0];
      var jd = v.jednotky.filter(function (x) { return x.id === jednotkaId; })[0];
      return hlava("Vyúčtování služeb za rok " + v.obdobi, "Byt " + jednotkaId + " · " + esc(o.kratce)) +
        '<div class="kpi">' + kpi(kc(j.naklady, 1), "náklady za rok", "kalkulacka") + kpi(kc(j.zalohy, 1), "zaplacené zálohy", "dokument") + kpi((j.vysledek >= 0 ? "+" : "") + kc(j.vysledek, 1), j.vysledek >= 0 ? "přeplatek, vrátíme do 30. 11." : "nedoplatek, splatný do 30. 11.", "graf") + kpi(String(jd.plocha).replace(".", ",") + " m²", jd.osoby + " osoby · podíl " + (jd.podil * 100).toFixed(2).replace(".", ",") + " %", "dum") + "</div>" +
        panel("Rozpis podle služeb", tabulka(["Služba", "Klíč", ">Dům celkem", ">Váš podíl"], v.naklady.map(function (n, i) {
          return "<tr><td>" + esc(n.sluzba) + "</td><td>" + esc(BV.rozuctovani.KLICE[n.klic]) + '</td><td class="cislo">' + kc(n.castka, 1) + '</td><td class="cislo"><strong>' + kc(j.polozky[i].castka, 1) + "</strong></td></tr>";
        }))) + '<p class="tlumene" style="font-size:.85rem;margin-top:12px">Rozúčtování metodou největšího zbytku: součet všech bytů sedí s náklady domu na haléř.</p>';
    }
    var max = Math.max.apply(null, r.jednotky.map(function (j) { return Math.abs(j.vysledek); }));
    return hlava("Vyúčtování služeb za rok " + v.obdobi, esc(o.nazev)) +
      '<div class="kpi">' + kpi(kc(su.naklady, 1), "náklady domu", "kalkulacka") + kpi(kc(su.zalohy, 1), "zálohy celkem", "dokument") + kpi(kc(su.preplatky, 1), "přeplatky", "graf") + kpi(kc(su.nedoplatky, 1), "nedoplatky", "vystraha", su.nedoplatky ? "kpi__dlazdice--pozor" : "") + "</div>" +
      '<div class="apl-mrizka"><div class="s-7">' + panel("Jednotky (ukázka 12 bytů)", tabulka(["Jednotka", ">Plocha", ">Osoby", ">Náklady", ">Zálohy", ">Výsledek"], r.jednotky.map(function (j, i) {
        var jd = v.jednotky[i];
        return "<tr><td>" + esc(jd.nazev) + "<small>" + esc(jd.vlastnik) + '</small></td><td class="cislo">' + String(jd.plocha).replace(".", ",") + ' m²</td><td class="cislo">' + jd.osoby + '</td><td class="cislo">' + kc(j.naklady, 1) + '</td><td class="cislo">' + kc(j.zalohy, 1) + '</td><td class="cislo"><strong style="color:var(--' + (j.vysledek >= 0 ? "ok" : "havarie") + ')">' + (j.vysledek >= 0 ? "+" : "") + kc(j.vysledek, 1) + "</strong></td></tr>";
      }))) + "</div>" +
      '<div class="s-5">' + panel("Přeplatky a nedoplatky", '<div class="sloupcovy" style="height:180px;align-items:center">' + r.jednotky.map(function (j, i) {
        var h = Math.max(3, Math.abs(j.vysledek) / max * 80);
        return '<div title="Byt ' + j.id + ": " + kc(j.vysledek, 1) + '" style="--i:' + i + ";height:" + h + "px;" + (j.vysledek < 0 ? "background:var(--havarie);transform-origin:top;align-self:flex-start;margin-top:90px" : "align-self:flex-end;margin-bottom:90px") + '"><span>' + j.id + "</span></div>";
      }).join("") + "</div>") + '<div style="height:16px"></div>' + panel("Náklady a klíče", tabulka(["Služba", "Klíč", ">Částka"], v.naklady.map(function (n) { return "<tr><td>" + esc(n.sluzba) + "</td><td>" + esc(BV.rozuctovani.KLICE[n.klic]) + '</td><td class="cislo">' + kc(n.castka, 1) + "</td></tr>"; }))) + "</div></div>";
  }

  /* Interakce dispečinku */
  KOREN.addEventListener("click", function (e) {
    var m = e.target.closest("[data-mesic]");
    if (m) {
      var r = Number(mesic.slice(0, 4)), mm = Number(mesic.slice(5, 7)) + Number(m.getAttribute("data-mesic"));
      if (mm < 1) { mm = 12; r -= 1; } if (mm > 12) { mm = 1; r += 1; }
      mesic = r + "-" + String(mm).padStart(2, "0");
      vykresli(); return;
    }
    var p = e.target.closest("[data-poptat]");
    if (p) {
      var cast = p.getAttribute("data-poptat").split(":");
      var o = objekt(cast[0]);
      var kat = BV.revize.KATALOG.filter(function (k) { return k.kod === cast[1]; })[0];
      var obor = OBOR_REVIZE[kat.technologie] || "elektro";
      var dop = BV.dodavatele.doporuc(D.dodavatele, { obor: obor, kraj: o.kraj }, DNES, 1)[0];
      toast(dop ? "Poptávka „" + kat.nazev + "“ (" + o.kratce + ") odeslána: " + dop.nazev + " (skóre " + dop.skore + ")." : "Pro tento obor a region není způsobilý dodavatel.");
      return;
    }
    var u = e.target.closest("[data-ukol]");
    if (u) {
      var k = u.getAttribute("data-ukol"), i = S.hotove.indexOf(k);
      if (i >= 0) S.hotove.splice(i, 1); else S.hotove.push(k);
      uloz(); vykresli(); if (i < 0) toast("Úkol vyřízen."); return;
    }
    var f = e.target.closest("[data-fakturovat]");
    if (f) { akceZavady(f.getAttribute("data-fakturovat"), "vyfakturovana"); dialog.close(); toast("Faktura " + BV.fakturace.cisloFaktury(2026, 87) + " vystavena, splatnost " + datum(BV.fakturace.splatnost(DNES, 14)) + "."); return; }
    var v = e.target.closest("[data-vyzadat]");
    if (v) { toast("Žádost o nový doklad odeslána: " + v.getAttribute("data-vyzadat") + "."); }
  });
  KOREN.addEventListener("change", function (e) {
    var j = e.target.closest("[data-demo-jako]");
    if (j) { S.jako = Number(j.value); uloz(); vykresli(); toast("Přihlášen jako " + clenTymu().jmeno + "."); return; }
    var p = e.target.closest("[data-pravidlo]");
    if (p) { S.pravidla[p.getAttribute("data-pravidlo")] = p.checked; uloz(); vykresli(); }
  });

  POVYKRESLENI.smlouvy = function () {
    var f = $("[data-generator]", KOREN);
    if (!f || !BV.smlouvy) return;
    function prepocti() {
      var o = objekt(f.objekt.value);
      var s = D.smlouvy.filter(function (x) { return x.objekt === o.id; })[0];
      var vstup = BV.kalkulacka ? BV.kalkulacka.spocitej({ typ: o.typ, jednotek: o.jednotek || 1, plocha: o.plocha, vytahu: o.vytahu, havarijni: f.havarijni.checked, stari: o.rok > 2014 ? "novostavba" : o.rok < 1950 ? "historicky" : "panel", sluzby: ["technicka", "administrativni", "uklid"] }) : { polozky: [], celkem: 0 };
      var data = {
        smlouva: { cislo: "SK-2027-" + o.id.slice(1).padStart(3, "0"), zacatek: datum(f.zacatek.value), doba: "neurčitou", lhuta: 3 },
        klient: { nazev: o.nazev, adresa: o.adresa, ico: f.ico.value.trim(), zastoupeni: f.zastoupeni.value.trim() },
        spravce: { nazev: "Budovník s.r.o.", adresa: "Ulice 000/00, Město", ico: "000 00 000" },
        objekt: { adresa: o.adresa, popis: o.jednotek ? o.jednotek + " bytových jednotek" : o.plocha.toLocaleString("cs-CZ") + " m²" },
        sluzby: vstup.polozky.map(function (p) { return { nazev: p.nazev, cena: p.castka.toLocaleString("cs-CZ") }; }),
        havarijni: f.havarijni.checked,
        cena: { celkem: (vstup.celkem || 0).toLocaleString("cs-CZ"), splatnost: f.splatnost.value },
        misto: f.misto.value.trim(), datum: datum(DNES),
      };
      var r = BV.smlouvy.vyplnSablonu(D.sablona, data);
      var html = esc(r.text).replace(/\[DOPLNIT: ([^\]]+)\]/g, '<mark>doplnit: $1</mark>');
      $("[data-nahled]", KOREN).innerHTML = html;
      $("[data-chybi]", f).innerHTML = r.chybi.length ? '<div class="hlaseni" style="border-color:var(--varovani);background:color-mix(in srgb,var(--varovani) 10%,var(--plocha))">' + ik("vystraha") + "<div><strong>Kontrola dokumentace: chybí " + r.chybi.length + " " + (r.chybi.length === 1 ? "údaj" : r.chybi.length < 5 ? "údaje" : "údajů") + "</strong><br><small>" + r.chybi.map(esc).join(", ") + "</small></div></div>" : '<div class="hlaseni">' + ik("fajfka") + "<div><strong>Smlouva je kompletní.</strong><br><small>Může jít k podpisu.</small></div></div>";
    }
    f.addEventListener("input", prepocti);
    f.addEventListener("change", prepocti);
    prepocti();
  };

  /* =================== PORTÁL =================== */
  function mojeObjekty() { return uzivatel.objekty.map(objekt); }
  var PORTAL = {
    prehled: function () {
      var o = mojeObjekty()[0];
      var pl = BV.revize.planObjektu(o, DNES), su = BV.revize.souhrn(pl);
      var mz = zavadySla().filter(function (z) { return z.objekt === o.id; });
      var otevrene = mz.filter(function (z) { return ["nova", "prirazena", "v-reseni", "ceka-na-dil"].indexOf(z.stav) >= 0; });
      var spotreba = o.id === "O1" ? panel("Spotřeba tepla (MWh) za 12 měsíců", '<div class="sloupcovy" style="margin-bottom:22px">' + D.spotreba.map(function (s, i) { return '<div style="--i:' + i + ";height:" + Math.max(3, s.teplo / 34 * 100) + '%" title="' + s.mesic + ": " + String(s.teplo).replace(".", ",") + ' MWh"><span>' + s.mesic.slice(0, 2) + "</span></div>"; }).join("") + "</div>") : "";
      return hlava(esc(uzivatel.role), esc(o.nazev), '<a class="tl tl--maly" href="#nahlasit">' + ik("plus") + " Nahlásit závadu</a>") +
        '<div class="kpi">' + kpi(su.vPoradku, tvar(su.vPoradku, "revize v pořádku", "revize v pořádku", "revizí v pořádku"), "fajfka") + kpi(su.bliziSe, tvar(su.bliziSe, "revize do 30 dní", "revize do 30 dní", "revizí do 30 dní"), "kalendar", su.bliziSe ? "kpi__dlazdice--pozor" : "") + kpi(otevrene.length, tvar(otevrene.length, "závada v řešení", "závady v řešení", "závad v řešení"), "vystraha") + kpi(o.jednotek ? o.jednotek : o.plocha.toLocaleString("cs-CZ"), o.jednotek ? "bytových jednotek" : "m² ploch", "dum") + "</div>" +
        '<div class="apl-mrizka"><div class="s-7">' + panel("Pasport domu", '<div class="pasport"><div><span>Adresa</span><strong>' + esc(o.adresa) + "</strong></div><div><span>Rok výstavby</span><strong>" + o.rok + "</strong></div><div><span>Podlaží</span><strong>" + o.podlazi + "</strong></div><div><span>Výtahy</span><strong>" + o.vytahu + "</strong></div><div><span>Technologie</span><strong>" + o.technologie.length + "</strong></div><div><span>Správce</span><strong>Eva Nováková</strong></div></div>") + '<div style="height:16px"></div>' +
        panel("Závady v domě", tabulka(["Závada", "Stav"], mz.slice(0, 5).map(function (z) { return '<tr data-tiket="' + esc(z.id) + '" style="cursor:pointer"><td>' + esc(z.nazev) + "<small>" + cas(z.nahlaseno) + " · " + esc(z.misto || "") + "</small></td><td>" + stav(ZAV_TRIDA[z.stav], ZAV_STAV[z.stav]) + "</td></tr>"; }), "Žádné závady."), '<a class="tl tl--maly tl--obrys" href="#zavady">Všechny</a>') + "</div>" +
        '<div class="s-5">' + panel("Nejbližší revize", tabulka(["Revize", "Termín"], pl.filter(function (p) { return p.termin; }).sort(function (a, b) { return a.termin < b.termin ? -1 : 1; }).slice(0, 5).map(function (p) { return "<tr><td>" + esc(p.nazev) + "</td><td>" + datum(p.termin) + " " + revStav(p) + "</td></tr>"; })), '<a class="tl tl--maly tl--obrys" href="#revize">Kalendář</a>') + (spotreba ? '<div style="height:16px"></div>' + spotreba : "") + "</div></div>";
    },
    zavady: function () {
      var o = mojeObjekty()[0];
      var mz = zavadySla().filter(function (z) { return z.objekt === o.id; });
      return hlava("Hlášení a jejich stav", "Závady", '<a class="tl tl--maly" href="#nahlasit">' + ik("plus") + " Nahlásit závadu</a>") +
        '<div class="apl-mrizka">' + (mz.length ? mz.map(function (z) { return '<div class="s-4">' + tiket(z) + "</div>"; }).join("") : '<div class="s-12"><div class="prazdne">Žádné závady.</div></div>') + "</div>";
    },
    nahlasit: function () {
      var o = mojeObjekty()[0];
      var obory = [["voda", "kapka", "Voda, odpady"], ["elektro", "blesk", "Elektřina, světla"], ["topeni", "plamen", "Topení"], ["vytahy", "vytah", "Výtah"], ["stavebni", "klic", "Dveře, okna, stavba"], ["uklid", "koste", "Úklid, okolí"]];
      return hlava(esc(o.nazev), "Nahlásit závadu") +
        '<div class="apl-mrizka"><div class="s-7"><form class="panel formular" data-nahlaseni novalidate>' +
        '<div class="pole"><span class="pole__nazev">Co se děje?</span><div class="segment">' + obory.map(function (x, i) { return '<label><input type="radio" name="obor" value="' + x[0] + '"' + (i === 0 ? " checked" : "") + "><span>" + ik(x[1]) + esc(x[2]) + "</span></label>"; }).join("") + "</div></div>" +
        '<div class="pole"><span class="pole__nazev">Jak je to naléhavé?</span><div class="segment">' +
        [["havarie", "Havárie", "teče, nejde proud, uvízlý výtah"], ["urgentni", "Spěchá", "do 24 hodin"], ["bezna", "Běžné", "do 2 pracovních dnů"]].map(function (x, i) { return '<label><input type="radio" name="priorita" value="' + x[0] + '"' + (i === 2 ? " checked" : "") + "><span>" + esc(x[1]) + "<small>" + esc(x[2]) + "</small></span></label>"; }).join("") + "</div></div>" +
        '<div data-havarie-rada hidden class="havarie-blok"><h3>Havárie? Volejte rovnou.</h3><a class="cislo" href="tel:+420000000000">+420 XXX XXX XXX</a><p>Formulář pošleme také, ale telefon je rychlejší. Do příjezdu technika uzavřete hlavní uzávěr vody nebo vypněte jistič.</p></div>' +
        '<div class="pole"><label for="n-nazev">Krátce, co nefunguje</label><input type="text" id="n-nazev" name="nazev" placeholder="např. Kape ventil u vodoměru"></div>' +
        '<div class="pole"><label for="n-misto">Kde přesně</label><input type="text" id="n-misto" name="misto" placeholder="např. suterén, sklep č. 12"></div>' +
        '<div class="pole"><label for="n-popis">Popis (nepovinné)</label><textarea id="n-popis" name="popis"></textarea></div>' +
        '<div class="pole"><label for="n-foto">Fotka (nepovinné)</label><input type="file" id="n-foto" name="foto" accept="image/*" capture="environment"><small>V ukázce se fotka nikam nenahrává.</small></div>' +
        '<button class="tl" type="submit">' + ik("sipka") + " Odeslat hlášení</button></form></div>" +
        '<div class="s-5">' + panel("Co se stane potom", '<ol class="casova-osa" style="margin-top:6px"><li><div><h3>Dispečink převezme hlášení</h3><p>Hned uvidí prioritu a lhůtu.</p></div></li><li><div><h3>Přidělíme technika</h3><p>S oprávněním pro danou profesi a znalostí vašeho domu.</p></div></li><li><div><h3>Sledujete stav</h3><p>Kdo přijede, kdy, a co udělal. I s fotkou.</p></div></li><li><div><h3>Potvrdíte převzetí</h3><p>Až pak jde práce do fakturace.</p></div></li></ol>') + "</div></div>";
    },
    revize: function () {
      var o = mojeObjekty()[0];
      var pl = BV.revize.planObjektu(o, DNES);
      return hlava(esc(o.nazev), "Revize a kontroly") + panel("Plán revizí (" + pl.length + ")", tabulka(["Revize / kontrola", "Jak často", "Poslední", "Další termín"], pl.map(function (p) {
        return "<tr><td>" + esc(p.nazev) + "<small>" + esc(p.predpis) + "</small></td><td>" + p.periodaMesicu + " měs.</td><td>" + datum(p.posledni) + "</td><td>" + datum(p.termin) + " " + revStav(p) + "</td></tr>";
      }))) + '<p class="tlumene" style="font-size:.85rem;margin-top:12px">Termíny hlídá správce. Revizi objedná sám 30 dní předem a protokol uloží do Dokumentů.</p>';
    },
    dokumenty: function () {
      var o = mojeObjekty()[0];
      var kat = BV.revize.KATALOG;
      var rev = Object.keys(o.provedene).map(function (k) { var x = kat.filter(function (c) { return c.kod === k; })[0]; return { nazev: "Protokol: " + (x ? x.nazev : k), datum: o.provedene[k], typ: "Revize" }; });
      var dalsi = [{ nazev: "Smlouva o správě", datum: "2024-01-01", typ: "Smlouva" }, { nazev: "Vyúčtování služeb 2025", datum: "2026-04-30", typ: "Vyúčtování" }, { nazev: "Pasport domu", datum: "2024-02-15", typ: "Pasport" }, { nazev: "Zápis ze shromáždění vlastníků", datum: "2026-05-20", typ: "Zápis" }, { nazev: "Pojistná smlouva domu", datum: "2025-12-01", typ: "Pojištění" }];
      var vse = dalsi.concat(rev).sort(function (a, b) { return a.datum < b.datum ? 1 : -1; });
      return hlava(esc(o.nazev), "Dokumenty (" + vse.length + ")") + panel("Všechny dokumenty", tabulka(["Dokument", "Typ", "Datum", ""], vse.map(function (d) {
        return "<tr><td>" + ik("dokument") + " " + esc(d.nazev) + "</td><td>" + stav("neutral", d.typ) + "</td><td>" + datum(d.datum) + '</td><td><button type="button" class="tl tl--maly tl--obrys" data-stahnout>' + ik("stahnout") + " PDF</button></td></tr>";
      })));
    },
    vyuctovani: function () {
      var o = mojeObjekty()[0];
      if (o.id !== D.vyuctovani.objekt) return hlava(esc(o.nazev), "Náklady") + '<div class="prazdne">U veřejných budov se vyúčtování služeb nájemníkům nedělá. Náklady na údržbu najdete ve fakturách v Dokumentech.</div>';
      return vyuctovaniHtml(uzivatel.jednotka);
    },
    smlouva: function () {
      var o = mojeObjekty()[0];
      var s = smlouvy().filter(function (x) { return x.objekt === o.id; })[0];
      return hlava(esc(o.nazev), esc(s.nazev)) + '<div class="apl-mrizka"><div class="s-7">' + panel("Smluvní údaje", '<div class="pasport"><div><span>Číslo</span><strong>' + esc(s.id) + "</strong></div><div><span>Platnost od</span><strong>" + datum(s.zacatek) + "</strong></div><div><span>Doba</span><strong>" + (s.dobaMesicu ? s.dobaMesicu + " měsíců" + (s.prodlouzeniMesicu ? ", auto. prodloužení o " + s.prodlouzeniMesicu : "") : "neurčitá") + "</strong></div><div><span>Výpovědní lhůta</span><strong>" + s.vypovedniLhutaMesicu + " měs.</strong></div><div><span>Měsíčně bez DPH</span><strong>" + kc(s.castkaMesicne) + "</strong></div><div><span>Aktuální konec</span><strong>" + (s.konec ? datum(s.konec) : "—") + "</strong></div></div>") + "</div>" +
        '<div class="s-5">' + panel("Rozsah služeb", '<ul class="seznam-sluzeb" style="margin:0"><li><strong>Technická správa</strong><span>údržba, revize, havarijní služba 24/7</span></li><li><strong>Ekonomická správa</strong><span>účetnictví, předpisy, vyúčtování</span></li><li><strong>Úklid</strong><span>společné prostory 2× týdně</span></li></ul>') + "</div></div>";
    },
  };

  KOREN.addEventListener("click", function (e) {
    if (e.target.closest("[data-stahnout]")) toast("V ukázce nejsou skutečné soubory.");
  });

  POVYKRESLENI.nahlasit = function () {
    var f = $("[data-nahlaseni]", KOREN);
    if (!f) return;
    var rada = $("[data-havarie-rada]", f);
    f.addEventListener("change", function () { rada.hidden = f.priorita.value !== "havarie"; });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      $$(".pole__chyba", f).forEach(function (x) { x.remove(); });
      if (!f.nazev.value.trim()) {
        var s = doc.createElement("span"); s.className = "pole__chyba"; s.textContent = "Napište prosím, co nefunguje.";
        f.nazev.closest(".pole").appendChild(s); f.nazev.focus(); return;
      }
      var cislo = 413 + Object.keys(S.zavady).filter(function (id) { return !D.zavady.some(function (z) { return z.id === id; }); }).length;
      var z = {
        id: "Z-2026-0" + cislo, objekt: uzivatel.objekty[0], nazev: f.nazev.value.trim(), obor: f.obor.value, priorita: f.priorita.value,
        nahlaseno: TED, nahlasil: "Portál – " + uzivatel.jmeno, misto: f.misto.value.trim(), popis: f.popis.value.trim(), stav: "nova", historie: [], novaVDemu: true,
      };
      ulozZavadu(z);
      var t = BV.zavady.terminy(z);
      location.hash = "zavady";
      toast("Hlášení " + z.id + " přijato. Reakce nejpozději " + cas(t.reakce) + ". Podívejte se, jak ho vidí dispečink.");
    });
  };

  /* ---------- Přihlášení do portálu ---------- */
  function prihlaseni() {
    KOREN.innerHTML = '<div class="prihlaseni"><div class="prihlaseni__karta"><span class="stitek">Klientský portál · demo</span><h1 style="font-size:1.9rem;margin:0">Přihlášení</h1>' +
      '<p class="tlumene" style="margin:0">V ostrém provozu se klient přihlásí e-mailem a jednorázovým kódem. V ukázce si vyberte, za koho se chcete podívat:</p>' +
      '<div class="role-volba">' + D.uzivatele.portal.map(function (u) { return '<button type="button" data-role="' + u.id + '"><span class="apl__avatar">' + esc(u.inicialy) + "</span><span><strong>" + esc(u.jmeno) + "</strong><small>" + esc(u.role) + "</small></span>" + ik("sipka") + "</button>"; }).join("") + "</div>" +
      '<p class="tlumene" style="font-size:.82rem;margin:0">Všechna data jsou vymyšlená. Co v demu změníte, zůstane jen ve vašem prohlížeči.</p></div></div>';
  }
  KOREN.addEventListener("click", function (e) {
    var r = e.target.closest("[data-role]");
    if (!r) return;
    uzivatel = D.uzivatele.portal.filter(function (u) { return u.id === r.getAttribute("data-role"); })[0];
    try { sessionStorage.setItem("bv-portal-role", uzivatel.id); } catch (x) { /* nic */ }
    location.hash = "prehled";
    vykresli();
  });

  if (DRUH === "dispecink" && window.BVCRM) {
    CRM = window.BVCRM({
      D: D, S: function () { return S; }, uloz: uloz, esc: esc, ik: ik, datum: datum, stav: stav, hlava: hlava, panel: panel, kpi: kpi, tabulka: tabulka, toast: toast,
      DNES: DNES, TED: TED, koren: KOREN, vykresli: vykresli, uzivatel: function () { return uzivatel || clenTymu(); }, muze: muze,
      zavady: zavady, objekt: objekt, akceZavady: function (id, akce) { akceZavady(id, akce); if (dialog.open) dialog.close(); },
    });
    Object.keys(CRM.views).forEach(function (k) { DISPECINK[k] = CRM.views[k]; });
    Object.keys(CRM.po).forEach(function (k) { POVYKRESLENI[k] = CRM.po[k]; });
    if (location.hash === "#fakturace") location.hash = "doklady";
  }
  if (DRUH === "portal") {
    var ulozenaRole = null;
    try { ulozenaRole = sessionStorage.getItem("bv-portal-role"); } catch (x) { /* nic */ }
    uzivatel = D.uzivatele.portal.filter(function (u) { return u.id === ulozenaRole; })[0] || null;
  } else {
    uzivatel = clenTymu();
  }
  vykresli();
})();
