/* Budovník – obchodní a administrativní část interního systému (rozsah jako CRM byPalda).
   Volá ji demo.js: window.BVCRM(ctx) vrátí pohledy a obsluhu. Logika je v BV.* (src/lib, převedeno z byPalda a ověřeno testy proti PHP). */
(function () {
  "use strict";
  window.BVCRM = function (c) {
    var BV = window.BV || {};
    var D = c.D, esc = c.esc, ik = c.ik, datum = c.datum, stav = c.stav, hlava = c.hlava, panel = c.panel, kpi = c.kpi, tabulka = c.tabulka, toast = c.toast;
    var DNES = c.DNES;
    var $ = function (s, k) { return (k || document).querySelector(s); };
    var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
    var S = function () { return c.S(); };
    function tvar(n, a, b, c) { return n === 1 ? a : n >= 2 && n <= 4 ? b : c; }

    /* ---------- peníze a data (logika z byPalda) ---------- */
    function kc(hal) { return BV.penize ? BV.penize.kc(Math.round(hal)).replace(/ Kč$/, " Kč") : (hal / 100) + " Kč"; }
    function kcK(hal) { return BV.penize ? BV.penize.kcKratce(Math.round(hal)) : kc(hal); }
    function lhuta(iso) { return BV.datum ? BV.datum.lhutaText(iso, DNES) : ""; }

    /* ---------- datové sady: základ z demo.json + změny v localStorage ---------- */
    function sada(nazev, klic) {
      klic = klic || "id";
      var st = S();
      var zmeny = (st.crm && st.crm[nazev]) || {};
      var zakl = (D[nazev] || []).map(function (x) { return zmeny[String(x[klic])] || x; });
      var nove = Object.keys(zmeny).filter(function (id) { return !(D[nazev] || []).some(function (x) { return String(x[klic]) === id; }); })
        .map(function (id) { return zmeny[id]; });
      return nove.concat(zakl).filter(function (x) { return !x._smazano; });
    }
    function ulozDo(nazev, zaznam, klic) {
      var st = S();
      st.crm = st.crm || {};
      st.crm[nazev] = st.crm[nazev] || {};
      st.crm[nazev][String(zaznam[klic || "id"])] = zaznam;
      c.uloz();
    }
    function nastaveni() { var n = (S().crm && S().crm._nastaveni) || {}; return Object.assign({}, D.nastaveni, n, { rady: Object.assign({}, D.nastaveni.rady, n.rady || {}) }); }
    function ulozNastaveni(zmena) { var st = S(); st.crm = st.crm || {}; st.crm._nastaveni = Object.assign({}, (st.crm._nastaveni || {}), zmena); c.uloz(); }
    function klient(id) { return sada("klienti").filter(function (k) { return String(k.id) === String(id); })[0]; }
    function noveId(nazev) { return sada(nazev).reduce(function (m, x) { return Math.max(m, Number(x.id) || 0); }, 0) + 1; }

    function doklady() {
      var n = nastaveni();
      return sada("doklady", "cislo").map(function (d) {
        var s = BV.doklady ? BV.doklady.souctyDokladu(d.polozky, n.platceDph) : { zaklad: 0, dph: 0, celkem: 0, sazby: {} };
        return Object.assign({}, d, { soucty: s, celkem: s.celkem });
      });
    }
    function dalsiCislo(druh, datumIso) {
      var format = nastaveni().rady[druh];
      var rok = Number(datumIso.slice(0, 4));
      var max = 0;
      sada("doklady", "cislo").forEach(function (d) {
        if (d.druh !== druh || !BV.cislovani) return;
        var r = BV.cislovani.rokZCisla(d.cislo, format);
        var p = BV.cislovani.poradiZCisla(d.cislo, format);
        if (p !== null && (r === null || r === rok)) max = Math.max(max, p);
      });
      return BV.cislovani ? BV.cislovani.vyrobCislo(format, datumIso, max + 1) : druh + (max + 1);
    }
    function stavDokladu(d) {
      if (d.druh === "nabidka") return d.stav === "prijata" ? stav("ok", "přijatá") : d.stav === "koncept" ? stav("neutral", "koncept") : d.stav === "fakturovana" ? stav("ok", "vyfakturovaná") : stav("info", "odeslaná");
      if (d.uhrazeno) return stav("ok", "uhrazeno " + datum(d.uhrazeno));
      var z = BV.datum ? BV.datum.zbyvaDni(d.splatnost, DNES) : 0;
      return z < 0 ? stav("chyba", lhuta(d.splatnost)) : stav("pozor", "splatné " + lhuta(d.splatnost));
    }
    var DRUHY = { faktura: "Faktura", proforma: "Zálohová faktura", nabidka: "Nabídka" };

    /* ---------- dialog ---------- */
    var dlg = document.createElement("dialog");
    dlg.className = "dialog dialog--siroky";
    document.body.appendChild(dlg);
    function otevri(nadpis, stitek, telo) {
      dlg.innerHTML = '<div class="dialog__hlava"><div><span class="stitek">' + stitek + "</span><h2>" + nadpis + '</h2></div><button type="button" class="zavrit" data-zavrit aria-label="Zavřít">' + ik("krizek") + '</button></div><div class="dialog__telo">' + telo + "</div>";
      if (!dlg.open) dlg.showModal();
    }
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest("[data-zavrit]")) dlg.close(); });
    window.addEventListener("hashchange", function () { if (dlg.open) dlg.close(); });

    /* =================== POPTÁVKY =================== */
    function poptavky() {
      var webove = (S().poptavkyWeb || []);
      return webove.concat(sada("poptavky")).sort(function (a, b) { return a.prijato < b.prijato ? 1 : -1; });
    }
    function viewPoptavky() {
      var P = poptavky();
      var radky = P.map(function (p) {
        var r = BV.rozpocet ? BV.rozpocet.rozpocetHalere(p.rozpocet || "") : 0;
        return '<tr data-poptavka="' + esc(p.id) + '" style="cursor:pointer"><td><strong>' + esc(p.firma || p.jmeno) + "</strong><small>" + esc(p.id) + " · " + esc(p.prijato) + "</small></td><td>" +
          esc(BV.poptavky ? BV.poptavky.SEGMENTY[BV.poptavky.poptavkaKategorie(p.segment)] : p.segment) + "</td><td>" + esc(p.adresa || "—") + "<small>" + esc(p.velikost || "") + '</small></td><td class="cislo">' +
          (r ? kcK(r) : "—") + "<small>" + esc(p.rozpocet || "") + "</small></td><td>" + (p.stav === "prevedena" ? stav("ok", "převedena") : stav("info", "nová")) + "</td></tr>";
      });
      return hlava("Obchod", "Poptávky", '<span class="stav stav--info">' + P.filter(function (p) { return p.stav !== "prevedena"; }).length + " nových</span>") +
        '<p class="tlumene" style="margin-top:-8px">Chodí z formuláře na webu (zkuste odeslat poptávku na stránce Kontakt, objeví se tu). Jedním tlačítkem z nich vznikne klient a zakázka. Rozpočet se čte z textu, který klient napsal.</p>' +
        panel("Došlé poptávky", tabulka(["Kdo", "Typ", "Objekt", ">Rozpočet", "Stav"], radky, "Zatím žádné poptávky."));
    }
    function otevriPoptavku(id) {
      var p = poptavky().filter(function (x) { return x.id === id; })[0];
      if (!p) return;
      var P = BV.poptavky;
      var zadani = P ? P.poptavkaZadani(p) : "";
      var shoda = P ? P.poptavkaShodaKlienta(p, sada("klienti"), {}) : null;
      var k = shoda !== null ? klient(shoda) : null;
      otevri(esc(P ? P.poptavkaNazevZakazky(p) : p.id), "Poptávka " + esc(p.id) + " · " + esc(p.prijato),
        '<pre class="dokument-nahled" style="max-height:260px">' + esc(zadani) + "</pre>" +
        '<div class="mala-pole"><div class="pole"><label>IČO pro dohledání v ARES</label><input type="text" data-ares-ico inputmode="numeric" placeholder="např. 02911973"></div><div class="pole" style="align-self:end"><button type="button" class="tl tl--maly tl--obrys" data-ares-nacti>' + ik("lupa") + ' Načíst z ARES</button></div></div>' +
        '<div data-ares-vysledek></div>' +
        '<div data-shoda>' + (k ? '<div class="hlaseni">' + ik("odkaz") + "<div><strong>Shoda s existujícím klientem: " + esc(k.nazev) + "</strong><br><small>Podle IČO, e-mailu nebo názvu. Zakázka se založí pod něj.</small></div></div>" : "") + "</div>" +
        (p.stav === "prevedena" ? stav("ok", "Poptávka už je převedená") : '<div class="akce-radek"><button type="button" class="tl" data-prevest="' + esc(p.id) + '">' + ik("plus") + " " + (k ? "Založit zakázku u klienta" : "Založit klienta a zakázku") + "</button></div>"));
      dlg.dataset.ares = "";
    }
    function nactiAres(ico, cil, hotovo) {
      if (!BV.ico || !BV.ico.platneIco(ico)) { cil.innerHTML = '<p class="pole__chyba">IČO nemá platný kontrolní součet.</p>'; return; }
      cil.innerHTML = '<p class="tlumene">Načítám z ARES…</p>';
      fetch("https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/" + BV.ico.normalizujIco(ico))
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) {
          var a = BV.ares.aresSubjekt(data);
          cil.innerHTML = '<div class="pasport"><div><span>Název</span><strong>' + esc(a.nazev) + "</strong></div><div><span>IČO / DIČ</span><strong>" + esc(a.ico) + " " + esc(a.dic) + "</strong></div><div><span>Adresa</span><strong>" + esc(a.ulice) + ", " + esc(a.psc) + " " + esc(a.mesto) + "</strong></div></div>";
          hotovo(a);
        })
        .catch(function () { cil.innerHTML = '<p class="pole__chyba">ARES teď neodpověděl (nebo subjekt neexistuje). Zkuste to znovu.</p>'; });
    }
    dlg.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ares-nacti]");
      if (b) {
        nactiAres($("[data-ares-ico]", dlg).value, $("[data-ares-vysledek]", dlg), function (a) {
          dlg.dataset.ares = JSON.stringify(a);
          var p = poptavky().filter(function (x) { return x.id === $("[data-prevest]", dlg) && $("[data-prevest]", dlg).getAttribute("data-prevest"); })[0];
          var pid = $("[data-prevest]", dlg) ? $("[data-prevest]", dlg).getAttribute("data-prevest") : null;
          p = poptavky().filter(function (x) { return x.id === pid; })[0];
          if (p && BV.poptavky) {
            var sh = BV.poptavky.poptavkaShodaKlienta(p, sada("klienti"), a);
            var k = sh !== null ? klient(sh) : null;
            $("[data-shoda]", dlg).innerHTML = k ? '<div class="hlaseni">' + ik("odkaz") + "<div><strong>Shoda s existujícím klientem: " + esc(k.nazev) + "</strong><br><small>Podle IČO, e-mailu nebo názvu. Zakázka se založí pod něj.</small></div></div>" : "";
          }
        });
        return;
      }
      var pr = e.target.closest("[data-prevest]");
      if (pr) {
        var p = poptavky().filter(function (x) { return x.id === pr.getAttribute("data-prevest"); })[0];
        var ares = dlg.dataset.ares ? JSON.parse(dlg.dataset.ares) : {};
        var P = BV.poptavky;
        var shoda = P.poptavkaShodaKlienta(p, sada("klienti"), ares);
        var kid = shoda;
        if (kid === null) {
          var kd = P.poptavkaKlientData(p, ares);
          kid = noveId("klienti");
          ulozDo("klienti", Object.assign(kd, { id: kid, kontakt: p.jmeno, pausal: false, vytvoreno: DNES, objekty: [], ulice: kd.ulice || p.adresa || "" }));
        }
        // Klient už má rozpracovanou poptávkovou zakázku → doplní se do ní, nevzniká duplicita.
        var stavajici = sada("zakazky").filter(function (z) { return String(z.klient) === String(kid) && z.stav === "poptavka"; })[0];
        if (stavajici) ulozDo("zakazky", Object.assign({}, stavajici, { zadani: P.poptavkaZadani(p) }));
        else ulozDo("zakazky", { id: noveId("zakazky"), klient: kid, nazev: P.poptavkaNazevZakazky(p), druh: P.poptavkaKategorie(p.segment) === "jine" ? "jednorazova" : "pausal", stav: "poptavka", hodnota: 0, od: "", zadani: P.poptavkaZadani(p) });
        ulozDo("denik", { id: "d" + Date.now(), klient: kid, datum: DNES + " " + c.TED.slice(11), kdo: c.uzivatel().jmeno, typ: "poptavka", text: "Založeno z poptávky " + p.id + "." }, "id");
        var upr = Object.assign({}, p, { stav: "prevedena" });
        if ((S().poptavkyWeb || []).some(function (x) { return x.id === p.id; })) { S().poptavkyWeb = S().poptavkyWeb.map(function (x) { return x.id === p.id ? upr : x; }); c.uloz(); }
        else ulozDo("poptavky", upr);
        dlg.close();
        toast(stavajici ? "Poptávka přiřazena ke klientovi a jeho rozpracované zakázce." : shoda !== null ? "Zakázka založena u stávajícího klienta." : "Hotovo: klient a zakázka „" + P.poptavkaNazevZakazky(p) + "“ založeny.");
        location.hash = "klienti";
        c.vykresli();
        setTimeout(function () { otevriKlienta(kid); }, 50);
      }
    });

    /* =================== KLIENTI =================== */
    function viewKlienti() {
      var dk = doklady();
      var radky = sada("klienti").map(function (k) {
        var fakt = dk.filter(function (d) { return d.druh === "faktura" && String(d.klientId) === String(k.id); });
        var obrat = fakt.filter(function (d) { return d.vystaveno.slice(0, 4) === DNES.slice(0, 4); }).reduce(function (s, d) { return s + d.celkem; }, 0);
        var dluh = fakt.filter(function (d) { return !d.uhrazeno && d.splatnost < DNES; }).reduce(function (s, d) { return s + d.celkem; }, 0);
        var ico = k.ico ? (BV.ico && BV.ico.platneIco(k.ico) ? esc(k.ico) : esc(k.ico) + " " + stav("chyba", "neplatné")) : "—";
        return '<tr data-klient="' + k.id + '" style="cursor:pointer"><td><strong>' + esc(k.nazev) + "</strong><small>" + esc(k.kontakt || "") + " · " + esc(k.mesto || "") + "</small></td><td>" + ico + "</td><td>" +
          (k.stav === "aktivni" ? stav("ok", "aktivní") : k.stav === "potencialni" ? stav("info", "potenciální") : stav("neutral", "bývalý")) + (k.pausal ? " " + stav("neutral", "paušál") : "") +
          '</td><td class="cislo">' + (obrat ? kcK(obrat) : "—") + '</td><td class="cislo">' + (dluh ? '<strong style="color:var(--havarie)">' + kcK(dluh) + "</strong>" : "—") + "</td></tr>";
      });
      return hlava("Obchod", "Klienti (" + radky.length + ")", c.muze("klienti.psat") ? '<button type="button" class="tl tl--maly" data-novy-klient>' + ik("plus") + " Nový klient</button>" : "") +
        panel("Všichni klienti", tabulka(["Klient", "IČO", "Stav", ">Obrat " + DNES.slice(0, 4), ">Po splatnosti"], radky));
    }
    function otevriKlienta(id) {
      var k = klient(id);
      if (!k) return;
      var denik = sada("denik").filter(function (x) { return String(x.klient) === String(k.id); }).sort(function (a, b) { return a.datum < b.datum ? 1 : -1; });
      var zak = sada("zakazky").filter(function (z) { return String(z.klient) === String(k.id); });
      var dk = doklady().filter(function (d) { return String(d.klientId) === String(k.id); }).sort(function (a, b) { return a.vystaveno < b.vystaveno ? 1 : -1; });
      var TYPY_DENIKU = { telefon: "telefon", email: "e-mail", schuzka: "schůzka", poznamka: "poznámka", poptavka: "poptávka" };
      otevri(esc(k.nazev), (k.stav === "aktivni" ? "Klient" : "Potenciální klient") + (k.ico ? " · IČO " + esc(k.ico) : ""),
        '<div class="pasport"><div><span>Kontakt</span><strong>' + esc(k.kontakt || "—") + "</strong></div><div><span>E-mail</span><strong>" + esc(k.email || "—") + "</strong></div><div><span>Telefon</span><strong>" + esc(k.telefon || "—") + "</strong></div><div><span>Adresa</span><strong>" + esc([k.ulice, [k.psc, k.mesto].filter(Boolean).join(" ")].filter(Boolean).join(", ") || "—") + "</strong></div>" +
        (k.dic ? "<div><span>DIČ</span><strong>" + esc(k.dic) + (BV.ico && !BV.ico.platneDic(k.dic) ? " ⚠" : "") + "</strong></div>" : "") + "</div>" +
        '<div><span class="stitek">Deník</span>' + (c.muze("klienti.psat") ? '<form class="akce-radek" data-denik="' + k.id + '" style="margin:8px 0" onsubmit="return false"><select name="typ" class="vstup" style="width:auto;min-height:40px"><option value="poznamka">Poznámka</option><option value="telefon">Telefon</option><option value="email">E-mail</option><option value="schuzka">Schůzka</option></select><input name="text" class="vstup" style="flex:1;min-width:200px;min-height:40px" placeholder="Co se stalo…"><button class="tl tl--maly" type="submit">Zapsat</button></form>' : "") +
        '<ul class="historie" style="margin-top:8px">' + (denik.length ? denik.map(function (d) { return "<li><div>" + esc(d.text) + "<br><small>" + esc(d.datum) + " · " + esc(d.kdo) + " · " + esc(TYPY_DENIKU[d.typ] || d.typ) + "</small></div></li>"; }).join("") : '<li><div class="tlumene">Zatím nic.</div></li>') + "</ul></div>" +
        '<div><span class="stitek">Zakázky</span>' + tabulka(["Zakázka", "Stav", ">Hodnota"], zak.map(function (z) { return "<tr><td>" + esc(z.nazev) + "</td><td>" + stavZakazky(z) + '</td><td class="cislo">' + hodnotaZakazky(z) + "</td></tr>"; }), "Žádné zakázky.") + "</div>" +
        '<div><span class="stitek">Doklady</span>' + tabulka(["Číslo", "Vystaveno", ">Celkem", "Stav"], dk.slice(0, 8).map(function (d) { return '<tr data-doklad="' + esc(d.cislo) + '" style="cursor:pointer"><td>' + esc(d.cislo) + "<small>" + DRUHY[d.druh] + "</small></td><td>" + datum(d.vystaveno) + '</td><td class="cislo">' + kc(d.celkem) + "</td><td>" + stavDokladu(d) + "</td></tr>"; }), "Žádné doklady.") + "</div>");
    }
    function formularKlienta() {
      otevri("Nový klient", "Klienti",
        '<form class="formular" data-novy-klient-form novalidate onsubmit="return false">' +
        '<div class="mala-pole"><div class="pole"><label>IČO</label><input type="text" name="ico" inputmode="numeric" placeholder="vyplňte a načtěte z ARES"></div><div class="pole" style="align-self:end"><button type="button" class="tl tl--maly tl--obrys" data-ares-klient>' + ik("lupa") + " Načíst z ARES</button></div></div>" +
        '<div data-ares-vysledek></div>' +
        '<div class="pole"><label>Název</label><input type="text" name="nazev"></div>' +
        '<div class="mala-pole"><div class="pole"><label>DIČ</label><input type="text" name="dic"></div><div class="pole"><label>Ulice</label><input type="text" name="ulice"></div><div class="pole"><label>PSČ</label><input type="text" name="psc"></div><div class="pole"><label>Město</label><input type="text" name="mesto"></div></div>' +
        '<div class="mala-pole"><div class="pole"><label>Kontaktní osoba</label><input type="text" name="kontakt"></div><div class="pole"><label>E-mail</label><input type="email" name="email"></div><div class="pole"><label>Telefon</label><input type="tel" name="telefon"></div></div>' +
        '<button class="tl" type="button" data-ulozit-klienta>Uložit klienta</button></form>');
    }
    dlg.addEventListener("click", function (e) {
      var f = $("[data-novy-klient-form]", dlg);
      if (e.target.closest("[data-ares-klient]") && f) {
        nactiAres(f.ico.value, $("[data-ares-vysledek]", dlg), function (a) {
          ["nazev", "dic", "ulice", "psc", "mesto"].forEach(function (k) { f[k].value = a[k]; });
          f.ico.value = a.ico;
        });
        return;
      }
      if (e.target.closest("[data-ulozit-klienta]") && f) {
        if (!f.nazev.value.trim()) { toast("Vyplňte aspoň název."); return; }
        if (f.ico.value.trim() && !BV.ico.platneIco(f.ico.value)) { toast("IČO nemá platný kontrolní součet."); return; }
        var id = noveId("klienti");
        ulozDo("klienti", { id: id, nazev: f.nazev.value.trim(), typ: "firma", ico: f.ico.value.trim() ? BV.ico.normalizujIco(f.ico.value) : "", dic: f.dic.value.trim(), ulice: f.ulice.value.trim(), psc: f.psc.value.trim(), mesto: f.mesto.value.trim(),
          kontakt: f.kontakt.value.trim(), email: f.email.value.trim(), telefon: f.telefon.value.trim(), stav: "potencialni", pausal: false, vytvoreno: DNES, objekty: [] });
        dlg.close(); toast("Klient uložen."); c.vykresli();
      }
    });
    dlg.addEventListener("submit", function (e) {
      var f = e.target.closest("[data-denik]");
      if (!f) return;
      e.preventDefault();
      if (!f.text.value.trim()) return;
      ulozDo("denik", { id: "d" + Date.now(), klient: Number(f.getAttribute("data-denik")), datum: DNES + " " + c.TED.slice(11), kdo: c.uzivatel().jmeno, typ: f.typ.value, text: f.text.value.trim() });
      otevriKlienta(f.getAttribute("data-denik"));
    });

    /* =================== ZAKÁZKY =================== */
    var STAVY_ZAKAZEK = { poptavka: ["info", "poptávka"], nabidka: ["pozor", "nabídka"], bezi: ["ok", "běží"], hotovo: ["neutral", "hotovo"], zrusena: ["neutral", "zrušená"] };
    function stavZakazky(z) { var s = STAVY_ZAKAZEK[z.stav] || ["neutral", z.stav]; return stav(s[0], s[1]); }
    function hodnotaZakazky(z) { return z.hodnota ? kc(z.hodnota) + (z.druh === "pausal" ? "<small>měsíčně</small>" : "") : "—"; }
    var filtrZakazek = "";
    function viewZakazky() {
      var Z = sada("zakazky").filter(function (z) { return !filtrZakazek || z.stav === filtrZakazek; });
      var chips = '<div class="akce-radek" style="margin-bottom:12px">' + [["", "Vše"], ["poptavka", "Poptávky"], ["nabidka", "Nabídky"], ["bezi", "Běží"], ["hotovo", "Hotové"]].map(function (x) {
        return '<button type="button" class="tl tl--maly ' + (filtrZakazek === x[0] ? "tl--tmavy" : "tl--obrys") + '" data-filtr-zakazek="' + x[0] + '">' + x[1] + "</button>";
      }).join("") + "</div>";
      var mesicne = sada("zakazky").filter(function (z) { return z.druh === "pausal" && z.stav === "bezi"; }).reduce(function (s, z) { return s + z.hodnota; }, 0);
      return hlava("Obchod", "Zakázky", '<span class="stav stav--ok">paušály ' + kcK(mesicne) + " měsíčně</span>") + chips +
        panel("Zakázky", tabulka(["Zakázka", "Klient", "Druh", "Stav", ">Hodnota", "Od"], Z.map(function (z) {
          var k = klient(z.klient) || {};
          return '<tr data-klient="' + z.klient + '" style="cursor:pointer"><td><strong>' + esc(z.nazev) + "</strong><small>#" + z.id + "</small></td><td>" + esc(k.nazev || "") + "</td><td>" + (z.druh === "pausal" ? "paušál" : "jednorázová") + "</td><td>" + stavZakazky(z) + '</td><td class="cislo">' + hodnotaZakazky(z) + "</td><td>" + datum(z.od) + "</td></tr>";
        }), "Žádné zakázky v tomto stavu."));
    }

    /* =================== VZORY SMLUV =================== */
    var vzorStav = { vzor: null, klient: null, udaje: {} };
    var POPISKY_ZNACEK = { cislo_smlouvy: "Číslo smlouvy", klient_zastoupeni: "Za klienta podepisuje", zacatek: "Začátek", doba: "Doba trvání", misto: "Místo podpisu",
      predmet: "Předmět objednávky", cislo_nabidky: "Číslo nabídky", cena_celkem: "Cena celkem (Kč)", termin: "Termín provedení", objekt_adresa: "Adresa objektu",
      cena_mesicne: "Cena měsíčně (Kč)", klient_ico: "IČO klienta", klient_adresa: "Adresa klienta", klient_nazev: "Název klienta", splatnost: "Splatnost (dní)" };
    function viewVzory() {
      var V = sada("vzory");
      if (!vzorStav.vzor) vzorStav.vzor = V[0].id;
      if (!vzorStav.klient) vzorStav.klient = sada("klienti")[0].id;
      return hlava("Obchod", "Vzory smluv") +
        '<p class="tlumene" style="margin-top:-8px">Vzor se vyplní údaji klienta a firmy. Co chybí, systém ukáže a nedovolí smlouvu odeslat (stejný mechanismus jako v CRM byPalda).</p>' +
        '<div class="apl-mrizka"><div class="s-5">' + panel("Vyplnit vzor", '<form class="formular" data-vzory onsubmit="return false">' +
          '<div class="pole"><label>Vzor</label><select name="vzor">' + V.map(function (v) { return '<option value="' + v.id + '"' + (v.id === vzorStav.vzor ? " selected" : "") + ">" + esc(v.nazev) + "</option>"; }).join("") + "</select></div>" +
          '<div class="pole"><label>Klient</label><select name="klient">' + sada("klienti").map(function (k) { return '<option value="' + k.id + '"' + (String(k.id) === String(vzorStav.klient) ? " selected" : "") + ">" + esc(k.nazev) + "</option>"; }).join("") + "</select></div>" +
          '<div data-vzory-pole class="formular"></div></form>') + "</div>" +
        '<div class="s-7">' + panel("Náhled", '<div data-vzory-stav></div><div class="dokument-nahled" data-vzory-nahled></div>') + "</div></div>";
    }
    function udajeVzoru() {
      var k = klient(vzorStav.klient) || {};
      var n = nastaveni();
      var o = (k.objekty && k.objekty[0]) ? D.objekty.filter(function (x) { return x.id === k.objekty[0]; })[0] : null;
      var zak = sada("zakazky").filter(function (z) { return String(z.klient) === String(k.id) && z.druh === "pausal"; })[0];
      var base = {
        klient_nazev: k.nazev || "", klient_ico: k.ico || "", klient_adresa: [k.ulice, [k.psc, k.mesto].filter(Boolean).join(" ")].filter(Boolean).join(", "),
        spravce_nazev: n.firma, spravce_ico: n.ico, spravce_adresa: n.adresa, objekt_adresa: o ? o.adresa : "", splatnost: String(n.splatnostDni),
        cena_mesicne: zak && zak.hodnota ? BV.penize.kc(zak.hodnota, false) : "", datum: datum(DNES),
      };
      return Object.assign(base, vzorStav.udaje);
    }
    function prekresliVzor() {
      var f = $("[data-vzory]");
      if (!f || !BV.vzory) return;
      var vzor = sada("vzory").filter(function (v) { return v.id === vzorStav.vzor; })[0];
      var udaje = udajeVzoru();
      var chybi = BV.vzory.chybejiciZnacky(vzor.text, udaje);
      var pole = $("[data-vzory-pole]", f);
      var znacky = BV.vzory.znackyVeVzoru(vzor.text);
      var rucni = znacky.filter(function (z) { return chybi.indexOf(z) >= 0 || vzorStav.udaje[z] !== undefined; });
      var fokus = document.activeElement && document.activeElement.name;
      pole.innerHTML = rucni.map(function (z) { return '<div class="pole"><label>' + esc(POPISKY_ZNACEK[z] || z.replace(/_/g, " ")) + '</label><input type="text" name="' + z + '" value="' + esc(vzorStav.udaje[z] || "") + '" placeholder="doplňte"></div>'; }).join("");
      if (fokus && pole[fokus]) { pole[fokus].focus(); var v = pole[fokus].value; pole[fokus].setSelectionRange(v.length, v.length); }
      var text = BV.vzory.vyplnVzor(vzor.text, udaje);
      $("[data-vzory-nahled]").innerHTML = esc(text).replace(/……/g, "<mark>……</mark>");
      $("[data-vzory-stav]").innerHTML = chybi.length ? '<div class="hlaseni" style="border-color:var(--varovani);background:color-mix(in srgb,var(--varovani) 10%,var(--plocha));margin-bottom:12px">' + ik("vystraha") + "<div><strong>Chybí " + chybi.length + "</strong><br><small>" + chybi.map(esc).join(", ") + "</small></div></div>" : '<div class="hlaseni" style="margin-bottom:12px">' + ik("fajfka") + "<div><strong>Vzor je kompletní.</strong><br><small>Smlouva může jít k podpisu.</small></div></div>";
    }

    /* =================== DOKLADY =================== */
    var druhDokladu = "faktura";
    function viewDoklady() {
      var dk = doklady().filter(function (d) { return d.druh === druhDokladu; }).sort(function (a, b) { return a.cislo < b.cislo ? 1 : -1; });
      var vse = doklady().filter(function (d) { return d.druh === "faktura"; });
      var poSpl = vse.filter(function (d) { return !d.uhrazeno && d.splatnost < DNES; });
      var kUhr = vse.filter(function (d) { return !d.uhrazeno; });
      var prace = c.zavady().filter(function (z) { return z.naklady && z.stav === "prevzata"; });
      var chips = '<div class="akce-radek" style="margin-bottom:12px">' + [["faktura", "Faktury"], ["proforma", "Zálohové"], ["nabidka", "Nabídky"]].map(function (x) {
        return '<button type="button" class="tl tl--maly ' + (druhDokladu === x[0] ? "tl--tmavy" : "tl--obrys") + '" data-druh-dokladu="' + x[0] + '">' + x[1] + "</button>";
      }).join("") + "</div>";
      return hlava("Peníze", "Doklady", c.muze("doklady.psat") ? '<button type="button" class="tl tl--maly" data-novy-doklad>' + ik("plus") + " Nový doklad</button>" : "") +
        '<div class="kpi">' + kpi(kcK(kUhr.reduce(function (s, d) { return s + d.celkem; }, 0)), kUhr.length + tvar(kUhr.length, " faktura k úhradě", " faktury k úhradě", " faktur k úhradě"), "dokument") +
        kpi(kcK(poSpl.reduce(function (s, d) { return s + d.celkem; }, 0)), poSpl.length + tvar(poSpl.length, " faktura po splatnosti", " faktury po splatnosti", " faktur po splatnosti"), "vystraha", poSpl.length ? "kpi__dlazdice--chyba" : "") +
        kpi(prace.length, tvar(prace.length, "práce k přefakturaci", "práce k přefakturaci", "prací k přefakturaci"), "kalkulacka", prace.length ? "kpi__dlazdice--pozor" : "") + kpi(esc(nastaveni().platceDph ? "plátce" : "neplátce"), "DPH", "stit") + "</div>" +
        (prace.length ? panel("Práce k vyfakturování (závady převzaté klientem)", tabulka(["Zakázka", "Objekt", ">K úhradě", ""], prace.map(function (z) {
          var f = BV.fakturace.prefakturuj(z.naklady, D.marze);
          return "<tr><td><strong>" + esc(z.nazev) + "</strong><small>" + esc(z.id) + "</small></td><td>" + esc((c.objekt(z.objekt) || {}).kratce || "") + '</td><td class="cislo">' + kc(f.kUhrade * 100) + '</td><td><button type="button" class="tl tl--maly" data-fakturovat-praci="' + esc(z.id) + '">Vystavit fakturu</button></td></tr>';
        }))) + '<div style="height:16px"></div>' : "") +
        chips + panel(DRUHY[druhDokladu] + " (" + dk.length + ")", tabulka(["Číslo", "Klient", "Vystaveno", ">Celkem", "Stav"], dk.map(function (d) {
          var k = klient(d.klientId) || {};
          return '<tr data-doklad="' + esc(d.cislo) + '" style="cursor:pointer"><td><strong>' + esc(d.cislo) + "</strong></td><td>" + esc(k.nazev || "") + "</td><td>" + datum(d.vystaveno) + '</td><td class="cislo">' + kc(d.celkem) + "</td><td>" + stavDokladu(d) + "</td></tr>";
        })));
    }
    function otevriDoklad(cislo) {
      var d = doklady().filter(function (x) { return x.cislo === cislo; })[0];
      if (!d) return;
      var k = klient(d.klientId) || {};
      var n = nastaveni();
      var s = d.soucty;
      var qr = "";
      if (d.druh !== "nabidka" && !d.uhrazeno && BV.qrplatba && BV.qrkod) {
        var text = BV.qrplatba.qrPlatbaText({ ucet: n.ucet, castka: s.celkem, vs: d.cislo.replace(/\D+/g, ""), splatnost: d.splatnost, zprava: DRUHY[d.druh] + " " + d.cislo });
        qr = '<div class="qr-platba">' + BV.qrkod.qrSvg(text, { velikost: 150, barva: "#15171a" }) + "<div><strong>QR platba</strong><small>účet " + esc(n.ucet) + "<br>IBAN " + esc(BV.qrplatba.iban(n.ucet)) + "<br>VS " + esc(d.cislo.replace(/\D+/g, "")) + "</small></div></div>";
      }
      var sazby = Object.keys(s.sazby || {}).map(function (sz) { return "<tr><td>DPH " + sz + ' %</td><td class="cislo">' + kc(s.sazby[sz].zaklad) + '</td><td class="cislo">' + kc(s.sazby[sz].dph) + "</td></tr>"; }).join("");
      var akce = "";
      if (c.muze("doklady.psat")) {
        if (d.druh !== "nabidka" && !d.uhrazeno) akce += '<button type="button" class="tl tl--maly" data-uhrazeno="' + esc(d.cislo) + '">' + ik("fajfka") + " Označit jako uhrazené</button>";
        if (d.druh === "nabidka" && d.stav !== "fakturovana") akce += '<button type="button" class="tl tl--maly" data-z-nabidky="' + esc(d.cislo) + '">Vystavit fakturu z nabídky</button>';
      }
      akce += '<button type="button" class="tl tl--maly tl--obrys" onclick="window.print()">' + ik("stahnout") + " Tisk / PDF</button>";
      otevri(DRUHY[d.druh] + " " + esc(d.cislo), esc(k.nazev || ""),
        '<div class="doklad">' +
        '<div class="doklad__strany"><div><span class="stitek">Dodavatel</span><strong>' + esc(n.firma) + "</strong><small>" + esc(n.adresa) + "<br>IČO " + esc(n.ico) + (n.platceDph ? " · DIČ " + esc(n.dic) : " · neplátce DPH") + "</small></div>" +
        '<div><span class="stitek">Odběratel</span><strong>' + esc(k.nazev || "") + "</strong><small>" + esc([k.ulice, [k.psc, k.mesto].filter(Boolean).join(" ")].filter(Boolean).join(", ")) + (k.ico ? "<br>IČO " + esc(k.ico) : "") + (k.dic ? " · DIČ " + esc(k.dic) : "") + "</small></div></div>" +
        '<div class="pasport"><div><span>Vystaveno</span><strong>' + datum(d.vystaveno) + "</strong></div><div><span>" + (d.druh === "nabidka" ? "Platnost do" : "Splatnost") + "</span><strong>" + datum(d.splatnost) + "</strong></div><div><span>Stav</span><strong>" + stavDokladu(d) + "</strong></div></div>" +
        tabulka(["Položka", ">Množství", ">Cena/j.", ">DPH", ">Celkem bez DPH"], d.polozky.map(function (p) {
          return "<tr><td>" + esc(p.popis) + '</td><td class="cislo">' + String(p.mnozstvi).replace(".", ",") + '</td><td class="cislo">' + kc(p.cena) + '</td><td class="cislo">' + (n.platceDph ? (p.dph || 0) + " %" : "—") + '</td><td class="cislo">' + kc(BV.doklady.soucetPolozky(p)) + "</td></tr>";
        })) +
        '<div class="doklad__soucty">' + qr + '<table class="tab" style="max-width:340px;margin-left:auto">' + sazby + '<tr><td><strong>Celkem k úhradě</strong></td><td></td><td class="cislo"><strong style="font-size:1.2rem">' + kc(s.celkem) + "</strong></td></tr></table></div>" +
        "</div>" + '<div class="akce-radek">' + akce + "</div>");
    }
    function vystavDoklad(druh, klientId, polozky, zakazka) {
      var n = nastaveni();
      var cislo = dalsiCislo(druh, DNES);
      var spl = BV.datum.posunDatum(DNES, druh === "nabidka" ? 30 : n.splatnostDni);
      ulozDo("doklady", { druh: druh, cislo: cislo, klientId: klientId, zakazka: zakazka || null, vystaveno: DNES, splatnost: spl, uhrazeno: null, polozky: polozky, stav: druh === "nabidka" ? "odeslana" : null }, "cislo");
      return cislo;
    }
    function formularDokladu() {
      var radek = function (i) { return '<div class="doklad-radek"><input class="vstup" name="popis' + i + '" placeholder="Popis položky"><input class="vstup" name="mnozstvi' + i + '" value="1" inputmode="decimal"><input class="vstup" name="cena' + i + '" placeholder="Cena/j. Kč" inputmode="decimal"><select class="vstup" name="dph' + i + '"><option>21</option><option>12</option><option>0</option></select></div>'; };
      otevri("Nový doklad", "Doklady",
        '<form class="formular" data-novy-doklad-form onsubmit="return false"><div class="mala-pole"><div class="pole"><label>Druh</label><select name="druh"><option value="faktura">Faktura</option><option value="proforma">Zálohová faktura</option><option value="nabidka">Nabídka</option></select></div>' +
        '<div class="pole"><label>Klient</label><select name="klient">' + sada("klienti").map(function (k) { return '<option value="' + k.id + '">' + esc(k.nazev) + "</option>"; }).join("") + "</select></div>" +
        '<div class="pole"><label>Číslo (další v řadě)</label><input type="text" name="cislo" readonly></div></div>' +
        '<div class="doklad-radek doklad-radek--hlava"><span>Popis</span><span>Množství</span><span>Cena/j. (Kč, jak to napíšete)</span><span>DPH %</span></div>' + [0, 1, 2].map(radek).join("") +
        '<div data-doklad-soucty class="hlaseni" style="background:var(--plocha-2);border-color:var(--cara)"></div><button class="tl" type="button" data-vystavit>Vystavit</button></form>');
      prepoctiDoklad();
    }
    function polozkyFormulare(f) {
      var p = [];
      for (var i = 0; i < 3; i += 1) {
        var popis = f["popis" + i].value.trim();
        var cena = BV.penize.naHalere(f["cena" + i].value);
        if (!popis && !cena) continue;
        var mn = parseFloat(String(f["mnozstvi" + i].value).replace(",", ".")) || 0;
        p.push({ popis: popis || "Položka", mnozstvi: mn, cena: cena, dph: Number(f["dph" + i].value) });
      }
      return p;
    }
    function prepoctiDoklad() {
      var f = $("[data-novy-doklad-form]", dlg);
      if (!f) return;
      f.cislo.value = dalsiCislo(f.druh.value, DNES);
      var s = BV.doklady.souctyDokladu(polozkyFormulare(f), nastaveni().platceDph);
      $("[data-doklad-soucty]", f).innerHTML = "<div>Základ <strong>" + kc(s.zaklad) + "</strong> · DPH <strong>" + kc(s.dph) + "</strong> · celkem <strong>" + kc(s.celkem) + "</strong></div>";
    }
    dlg.addEventListener("input", function (e) { if (e.target.closest("[data-novy-doklad-form]")) prepoctiDoklad(); });
    dlg.addEventListener("change", function (e) { if (e.target.closest("[data-novy-doklad-form]")) prepoctiDoklad(); });
    dlg.addEventListener("click", function (e) {
      var u = e.target.closest("[data-uhrazeno]");
      if (u) {
        var d = sada("doklady", "cislo").filter(function (x) { return x.cislo === u.getAttribute("data-uhrazeno"); })[0];
        ulozDo("doklady", Object.assign({}, d, { uhrazeno: DNES }), "cislo");
        toast("Doklad " + d.cislo + " uhrazen."); otevriDoklad(d.cislo); c.vykresli(); return;
      }
      var zn = e.target.closest("[data-z-nabidky]");
      if (zn) {
        var nab = sada("doklady", "cislo").filter(function (x) { return x.cislo === zn.getAttribute("data-z-nabidky"); })[0];
        var cislo = vystavDoklad("faktura", nab.klientId, nab.polozky, nab.zakazka);
        ulozDo("doklady", Object.assign({}, nab, { stav: "fakturovana" }), "cislo");
        toast("Faktura " + cislo + " vystavena z nabídky " + nab.cislo + "."); druhDokladu = "faktura"; otevriDoklad(cislo); c.vykresli(); return;
      }
      if (e.target.closest("[data-vystavit]")) {
        var f = $("[data-novy-doklad-form]", dlg);
        var pol = polozkyFormulare(f);
        if (!pol.length) { toast("Doplňte aspoň jednu položku."); return; }
        var c2 = vystavDoklad(f.druh.value, Number(f.klient.value), pol);
        druhDokladu = f.druh.value; toast(DRUHY[f.druh.value] + " " + c2 + " vystavena."); otevriDoklad(c2); c.vykresli();
      }
    });

    /* =================== STATISTIKY BYZNYSU =================== */
    var obdobi = "q3";
    var OBDOBI = { mesic: ["Tento měsíc", "2026-10-01", "2026-10-31"], q3: ["3. čtvrtletí", "2026-07-01", "2026-09-30"], rok: ["Rok 2026", "2026-01-01", "2026-12-31"], r12: ["12 měsíců", "2025-11-01", "2026-10-31"] };
    function viewStatistiky() {
      if (!BV.obchod) return '<div class="prazdne">Modul statistik se nenačetl.</div>';
      var o = OBDOBI[obdobi];
      var st = BV.obchod.statistiky(doklady(), sada("klienti"), o[1], o[2], DNES);
      var max = Math.max.apply(null, st.mesice.map(function (m) { return Math.max(m.vystaveno, m.uhrazeno); }).concat([1]));
      var chips = '<div class="akce-radek">' + Object.keys(OBDOBI).map(function (k) { return '<button type="button" class="tl tl--maly ' + (obdobi === k ? "tl--tmavy" : "tl--obrys") + '" data-obdobi-obchod="' + k + '">' + OBDOBI[k][0] + "</button>"; }).join("") + "</div>";
      return hlava("Obchod · " + datum(o[1]) + " – " + datum(o[2]), "Statistiky", chips) +
        '<div class="kpi">' + kpi(kcK(st.vystaveno.castka), st.vystaveno.pocet + tvar(st.vystaveno.pocet, " faktura vystavena", " faktury vystaveny", " faktur vystaveno"), "dokument") + kpi(kcK(st.uhrazeno.castka), st.uhrazeno.pocet + tvar(st.uhrazeno.pocet, " faktura uhrazena", " faktury uhrazeny", " faktur uhrazeno"), "fajfka") +
        kpi(kcK(st.poSplatnosti.castka), st.poSplatnosti.pocet + tvar(st.poSplatnosti.pocet, " faktura po splatnosti", " faktury po splatnosti", " faktur po splatnosti") + " (celkem)", "vystraha", st.poSplatnosti.pocet ? "kpi__dlazdice--chyba" : "") + kpi(kcK(st.nabidky.castka), st.nabidky.pocet + tvar(st.nabidky.pocet, " nabídka odeslána", " nabídky odeslány", " nabídek odesláno"), "obalka") + "</div>" +
        '<div class="kpi">' + kpi(st.stali, tvar(st.stali, "stálý klient (paušál)", "stálí klienti (paušál)", "stálých klientů (paušál)"), "parta") + kpi(st.novi, tvar(st.novi, "nový klient v období", "noví klienti v období", "nových klientů v období"), "plus") + kpi(kcK(st.kUhrade.castka), st.kUhrade.pocet + tvar(st.kUhrade.pocet, " faktura k úhradě", " faktury k úhradě", " faktur k úhradě"), "kalkulacka") + kpi(st.mesice.length, tvar(st.mesice.length, "měsíc v období", "měsíce v období", "měsíců v období"), "kalendar") + "</div>" +
        '<div class="apl-mrizka"><div class="s-8">' + panel("Vystaveno a uhrazeno po měsících", '<div class="dvojgraf">' + st.mesice.map(function (m, i) {
          return '<div class="dvojgraf__mesic" title="' + m.mesic + ": vystaveno " + kc(m.vystaveno) + ", uhrazeno " + kc(m.uhrazeno) + '"><div class="dvojgraf__sloupce"><i style="--i:' + i + ";height:" + (m.vystaveno / max * 100) + '%"></i><b style="--i:' + i + ";height:" + (m.uhrazeno / max * 100) + '%"></b></div><span>' + Number(m.mesic.slice(5)) + "/" + m.mesic.slice(2, 4) + "</span></div>";
        }).join("") + '</div><div class="akce-radek" style="margin-top:10px"><span class="legenda-bod" style="--b:var(--akcent)">vystaveno</span><span class="legenda-bod" style="--b:var(--inkoust)">uhrazeno</span></div>') + "</div>" +
        '<div class="s-4">' + panel("Největší klienti", tabulka(["Klient", ">Fakturováno"], st.nejvetsi.map(function (x) { return '<tr data-klient="' + x.klientId + '" style="cursor:pointer"><td>' + esc(x.nazev || "?") + '</td><td class="cislo">' + kcK(x.castka) + "</td></tr>"; }), "Nic nevyfakturováno.")) + "</div></div>" +
        '<p class="tlumene" style="font-size:.85rem;margin-top:12px">Čísla se počítají z dokladů, ne z ručně zadaných hodnot. Zálohové faktury se do obratu nepočítají.</p>';
    }

    /* =================== ÚKOLY =================== */
    function viewUkoly() {
      var U = sada("ukoly").sort(function (a, b) { return (a.hotovo - b.hotovo) || (a.termin < b.termin ? -1 : 1); });
      var radek = function (u) {
        var z = BV.datum ? BV.datum.zbyvaDni(u.termin, DNES) : 0;
        var k = u.klient ? klient(u.klient) : null;
        return '<div class="ukol' + (u.hotovo ? " je-hotovo" : "") + (!u.hotovo && z < 0 ? " ukol--eskalace" : !u.hotovo && z <= 1 ? " ukol--upozorneni" : "") + '"><span class="ukol__ikona">' + ik(u.hotovo ? "fajfka" : "kalendar") + '</span><div><span class="ukol__text">' + esc(u.text) + "</span><small>" + esc(u.kdo) + " · " + (u.hotovo ? "hotovo" : esc(lhuta(u.termin))) + (k ? " · " + esc(k.nazev) : "") + "</small></div>" +
          '<div class="akce-radek"><button type="button" class="tl tl--maly ' + (u.hotovo ? "tl--obrys" : "tl--tmavy") + '" data-ukol-prepni="' + u.id + '">' + (u.hotovo ? "Vrátit" : "Hotovo") + '</button><button type="button" class="zavrit" data-ukol-smaz="' + u.id + '" aria-label="Smazat">' + ik("kos") + "</button></div></div>";
      };
      return hlava("Provoz", "Úkoly") + '<div class="apl-mrizka"><div class="s-8">' + panel("Úkoly týmu", '<div class="ukoly">' + U.map(radek).join("") + "</div>") + "</div>" +
        '<div class="s-4">' + panel("Nový úkol", '<form class="formular" data-novy-ukol onsubmit="return false"><div class="pole"><label>Co</label><input type="text" name="text"></div><div class="pole"><label>Kdo</label><select name="kdo">' + sada("tym").map(function (t) { return "<option>" + esc(t.jmeno) + "</option>"; }).join("") + '</select></div><div class="pole"><label>Do kdy</label><input type="date" name="termin" value="' + BV.datum.posunDatum(DNES, 3) + '"></div><button class="tl" type="submit">Přidat</button></form>') + "</div></div>";
    }

    /* =================== NÁVŠTĚVNOST WEBU =================== */
    var navObdobi = 30, navRada = null;
    function viewNavstevnost() {
      var N = BV.statistiky;
      if (!N) return '<div class="prazdne">Modul návštěvnosti se nenačetl.</div>';
      if (!navRada) navRada = N.generuj(20261007, 120, DNES);
      var vyrez = N.vyrez(navRada, navObdobi), por = N.porovnani(navRada, navObdobi), su = N.souhrn(vyrez);
      var W = 640, H = 150;
      var k = N.krivka(vyrez, "navstevy", W, H);
      var osa = N.osa(vyrez, Math.min(6, vyrez.length));
      var zmena = function (z) { return '<small style="color:var(--' + (z > 0 ? "ok" : z < 0 ? "havarie" : "tlumene") + ')">' + (z > 0 ? "▲" : z < 0 ? "▼" : "–") + " " + Math.abs(z) + " % oproti minulému</small>"; };
      var dl = function (h, p, z) { return '<div class="kpi__dlazdice"><strong>' + h + "</strong><span>" + esc(p) + "</span>" + (z === null ? "" : zmena(z)) + "</div>"; };
      var cislo = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); };
      var pruh = function (nazev, podil, hodnota) { return '<div class="stat-pruh"><span>' + esc(nazev) + '</span><span class="stat-pruh__drazka"><i style="--podil:' + podil + '%"></i></span><span class="stat-pruh__hodnota">' + hodnota + "</span></div>"; };
      var NV = D.navstevnost;
      var celkemVah = NV.stranky.reduce(function (s, x) { return s + x.vaha; }, 0);
      return hlava("Web budovnik.cz · ukázková data", "Návštěvnost", '<div class="akce-radek">' + [[7, "7 dní"], [30, "30 dní"], [90, "90 dní"]].map(function (x) { return '<button type="button" class="tl tl--maly ' + (navObdobi === x[0] ? "tl--tmavy" : "tl--obrys") + '" data-nav-obdobi="' + x[0] + '">' + x[1] + "</button>"; }).join("") + "</div>") +
        '<div class="kpi">' + dl(cislo(por.navstevy.hodnota), "návštěv", por.navstevy.zmena) + dl(cislo(por.uzivatele.hodnota), "lidí", por.uzivatele.zmena) + dl(cislo(por.zobrazeni.hodnota), "zobrazení stránek", por.zobrazeni.zmena) + dl(cislo(por.poptavky.hodnota), "poptávek z webu", por.poptavky.zmena) + "</div>" +
        panel("Návštěvy po dnech", '<svg class="nav-graf" viewBox="0 0 ' + W + " " + (H + 20) + '" preserveAspectRatio="none" role="img" aria-label="Návštěvy po dnech"><path class="nav-graf__plocha" d="' + k.plocha + '"/><path class="nav-graf__cara" d="' + k.cesta + '"/>' +
          osa.map(function (o) { var x = vyrez.length === 1 ? 0 : (o.index / (vyrez.length - 1)) * W; return '<text x="' + x.toFixed(1) + '" y="' + (H + 15) + '" text-anchor="' + (o.index === 0 ? "start" : o.index === vyrez.length - 1 ? "end" : "middle") + '">' + Number(o.datum.slice(8)) + ". " + Number(o.datum.slice(5, 7)) + ".</text>"; }).join("") + "</svg>") +
        '<div style="height:16px"></div><div class="apl-mrizka"><div class="s-6">' + panel("Odkud lidé přišli", NV.zdroje.map(function (z) { return pruh(z.id, z.podil, cislo(Math.round(su.navstevy * z.podil / 100)) + " · " + z.podil + " %"); }).join("")) + "</div>" +
        '<div class="s-6">' + panel("Zařízení", NV.zarizeni.map(function (z) { return pruh(z.id, z.podil, z.podil + " %"); }).join("")) + "</div>" +
        '<div class="s-12">' + panel("Nejčtenější stránky", NV.stranky.map(function (s) { return pruh(s.nazev + " · " + s.cesta, Math.round(s.vaha / NV.stranky[0].vaha * 100), cislo(Math.round(su.zobrazeni * s.vaha / celkemVah))); }).join("")) + "</div></div>" +
        '<p class="tlumene" style="font-size:.85rem;margin-top:12px">Ukázková data. Ve skutečném provozu se měří bez cookies a bez posílání dat třetím stranám (jako na byPalda.cz).</p>';
    }

    /* =================== TÝM A OPRÁVNĚNÍ =================== */
    var NAZVY_AKCI = { "klienti.cist": "Klienti – číst", "klienti.psat": "Klienti – upravovat", "klienti.mazat": "Klienti – mazat", "objekty.cist": "Objekty – číst", "objekty.psat": "Objekty – upravovat",
      "zakazky.cist": "Zakázky – číst", "zakazky.psat": "Zakázky – upravovat", "zavady.cist": "Závady – číst", "zavady.psat": "Závady – řešit", "smlouvy.cist": "Smlouvy – číst", "smlouvy.psat": "Smlouvy – upravovat",
      "doklady.cist": "Doklady – číst", "doklady.psat": "Doklady – vystavovat", "doklady.mazat": "Doklady – mazat", "dodavatele.cist": "Dodavatelé – číst", "dodavatele.psat": "Dodavatelé – upravovat",
      "vyuctovani.cist": "Vyúčtování – číst", "vyuctovani.psat": "Vyúčtování – upravovat", "ukoly.psat": "Úkoly", statistiky: "Statistiky", uzivatele: "Tým a role", nastaveni: "Nastavení" };
    function viewTym() {
      var O = BV.opravneni;
      if (!O) return '<div class="prazdne">Modul oprávnění se nenačetl.</div>';
      var zap = nastaveni().pravaZapnuta;
      var jako = c.uzivatel();
      var role = Object.keys(O.ROLE);
      return hlava("Systém", "Tým a role", '<label class="souhlas" style="align-items:center"><span class="prepinac-pravidla"><input type="checkbox" data-prava-zapnuta' + (zap ? " checked" : "") + '><span></span></span> Hlídat oprávnění</label>') +
        panel("Uživatelé", tabulka(["Jméno", "E-mail", "Role", ""], sada("tym").map(function (t) {
          return "<tr><td><strong>" + esc(t.jmeno) + "</strong>" + (t.id === jako.id ? " " + stav("info", "přihlášen") : "") + "</td><td>" + esc(t.email) + '</td><td><select class="vstup" style="min-height:36px;width:auto" data-role-uzivatele="' + t.id + '">' + role.map(function (r) { return '<option value="' + r + '"' + (t.role === r ? " selected" : "") + ">" + O.ROLE[r] + "</option>"; }).join("") + "</select></td><td>" +
            (t.id === jako.id ? "" : '<button type="button" class="tl tl--maly tl--obrys" data-jako="' + t.id + '">Přihlásit se jako</button>') + "</td></tr>";
        }))) + '<div style="height:16px"></div>' +
        panel("Co smí která role", '<div class="tab-obal"><table class="tab"><thead><tr><th>Úkon</th>' + role.map(function (r) { return '<th class="cislo">' + O.ROLE[r] + "</th>"; }).join("") + "</tr></thead><tbody>" +
          O.AKCE.map(function (a) { return "<tr><td>" + esc(NAZVY_AKCI[a] || a) + "</td>" + role.map(function (r) { return '<td class="cislo">' + (O.muze({ role: r }, a, true) ? '<span style="color:var(--ok)">✓</span>' : '<span class="tlumene">·</span>') + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>") +
        '<p class="tlumene" style="font-size:.85rem;margin-top:12px">' + (zap ? "Oprávnění se hlídají: přihlaste se jako technik nebo účetní a podívejte se, co zmizí z menu." : "Hlídání je vypnuté: každý přihlášený smí všechno kromě týmu a nastavení (jako na začátku v CRM byPalda).") + "</p>";
    }

    /* =================== NASTAVENÍ =================== */
    function viewNastaveni() {
      var n = nastaveni();
      var nahled = function (druh) {
        var f = n.rady[druh];
        return BV.cislovani ? BV.cislovani.vyrobCislo(f, DNES, 7) : f;
      };
      return hlava("Systém", "Nastavení") + '<div class="apl-mrizka"><div class="s-6">' + panel("Fakturační údaje <span class=\"vzor\">vzor</span>",
        '<form class="formular" data-nastaveni onsubmit="return false"><div class="pole"><label>Firma</label><input type="text" name="firma" value="' + esc(n.firma) + '"></div>' +
        '<div class="mala-pole"><div class="pole"><label>IČO</label><input type="text" name="ico" value="' + esc(n.ico) + '"><small data-kontrola-ico></small></div><div class="pole"><label>DIČ</label><input type="text" name="dic" value="' + esc(n.dic) + '"><small data-kontrola-dic></small></div></div>' +
        '<div class="pole"><label>Adresa</label><input type="text" name="adresa" value="' + esc(n.adresa) + '"></div>' +
        '<div class="pole"><label>Bankovní účet</label><input type="text" name="ucet" value="' + esc(n.ucet) + '"><small data-iban></small></div>' +
        '<div class="mala-pole"><div class="pole"><label>Splatnost (dní)</label><input type="number" name="splatnostDni" value="' + n.splatnostDni + '"></div><label class="souhlas" style="align-self:end"><input type="checkbox" name="platceDph"' + (n.platceDph ? " checked" : "") + "> Plátce DPH</label></div></form>") + "</div>" +
        '<div class="s-6">' + panel("Číselné řady dokladů", '<form class="formular" data-rady onsubmit="return false">' + ["faktura", "proforma", "nabidka"].map(function (d) {
          return '<div class="mala-pole"><div class="pole"><label>' + DRUHY[d] + '</label><input type="text" name="' + d + '" value="' + esc(n.rady[d]) + '"></div><div class="pole"><label>Ukázka (7. doklad)</label><input type="text" readonly data-nahled-rady="' + d + '" value="' + esc(nahled(d)) + '"></div></div>';
        }).join("") + '<p class="tlumene" style="font-size:.84rem;margin:0">Značky: {rok}, {rok2}, {mesic}, {poradi}, {poradi2} až {poradi5} (doplní nuly zleva, delší pořadí nezkracuje). Další číslo v řadě se čte z posledního vystaveného dokladu.</p></form>') + "</div></div>";
    }
    function kontrolyNastaveni() {
      var f = $("[data-nastaveni]");
      if (!f || !BV.ico) return;
      var ok = function (el, platne, text) { el.innerHTML = platne ? '<span style="color:var(--ok)">✓ ' + text + "</span>" : '<span style="color:var(--havarie)">✗ ' + text + "</span>"; };
      ok($("[data-kontrola-ico]", f), BV.ico.platneIco(f.ico.value), BV.ico.platneIco(f.ico.value) ? "platné IČO" : "IČO nesedí na kontrolní součet");
      ok($("[data-kontrola-dic]", f), !f.dic.value || BV.ico.platneDic(f.dic.value), !f.dic.value || BV.ico.platneDic(f.dic.value) ? "DIČ v pořádku" : "DIČ nemá tvar CZ + 8–10 číslic");
      var ib = BV.qrplatba.iban(f.ucet.value);
      ok($("[data-iban]", f), !!ib, ib ? "IBAN " + ib : "číslo účtu nejde převést na IBAN");
    }

    /* =================== obsluha událostí v obsahu =================== */
    var koren = c.koren;
    koren.addEventListener("click", function (e) {
      var t;
      if ((t = e.target.closest("[data-poptavka]"))) { otevriPoptavku(t.getAttribute("data-poptavka")); return; }
      if ((t = e.target.closest("[data-klient]"))) { otevriKlienta(t.getAttribute("data-klient")); return; }
      if ((t = e.target.closest("[data-doklad]"))) { otevriDoklad(t.getAttribute("data-doklad")); return; }
      if (e.target.closest("[data-novy-klient]")) { formularKlienta(); return; }
      if (e.target.closest("[data-novy-doklad]")) { formularDokladu(); return; }
      if ((t = e.target.closest("[data-filtr-zakazek]"))) { filtrZakazek = t.getAttribute("data-filtr-zakazek"); c.vykresli(); return; }
      if ((t = e.target.closest("[data-druh-dokladu]"))) { druhDokladu = t.getAttribute("data-druh-dokladu"); c.vykresli(); return; }
      if ((t = e.target.closest("[data-obdobi-obchod]"))) { obdobi = t.getAttribute("data-obdobi-obchod"); c.vykresli(); return; }
      if ((t = e.target.closest("[data-nav-obdobi]"))) { navObdobi = Number(t.getAttribute("data-nav-obdobi")); c.vykresli(); return; }
      if ((t = e.target.closest("[data-ukol-prepni]"))) { var u = sada("ukoly").filter(function (x) { return String(x.id) === t.getAttribute("data-ukol-prepni"); })[0]; ulozDo("ukoly", Object.assign({}, u, { hotovo: !u.hotovo })); c.vykresli(); return; }
      if ((t = e.target.closest("[data-ukol-smaz]"))) { var u2 = sada("ukoly").filter(function (x) { return String(x.id) === t.getAttribute("data-ukol-smaz"); })[0]; ulozDo("ukoly", Object.assign({}, u2, { _smazano: true })); c.vykresli(); return; }
      if ((t = e.target.closest("[data-jako]"))) { var st = S(); st.jako = Number(t.getAttribute("data-jako")); c.uloz(); c.vykresli(); toast("Přihlášen jako " + c.uzivatel().jmeno + " (" + BV.opravneni.ROLE[c.uzivatel().role] + ")."); return; }
      if ((t = e.target.closest("[data-fakturovat-praci]"))) {
        var z = c.zavady().filter(function (x) { return x.id === t.getAttribute("data-fakturovat-praci"); })[0];
        var f = BV.fakturace.prefakturuj(z.naklady, D.marze);
        var k = sada("klienti").filter(function (x) { return (x.objekty || []).indexOf(z.objekt) >= 0; })[0];
        var cislo = vystavDoklad("faktura", k ? k.id : null, f.radky.map(function (r) { return { popis: r.popis + " (" + z.id + ")", mnozstvi: 1, cena: Math.round(r.prodej * 100), dph: r.sazbaDph }; }));
        c.akceZavady(z.id, "vyfakturovana");
        toast("Faktura " + cislo + " vystavena za " + z.id + "."); otevriDoklad(cislo); return;
      }
    });
    koren.addEventListener("change", function (e) {
      var t;
      if ((t = e.target.closest("[data-prava-zapnuta]"))) { ulozNastaveni({ pravaZapnuta: t.checked }); c.vykresli(); return; }
      if ((t = e.target.closest("[data-role-uzivatele]"))) { var u = sada("tym").filter(function (x) { return String(x.id) === t.getAttribute("data-role-uzivatele"); })[0]; ulozDo("tym", Object.assign({}, u, { role: t.value })); c.vykresli(); return; }
      var v = e.target.closest("[data-vzory]");
      if (v && (e.target.name === "vzor" || e.target.name === "klient")) { vzorStav[e.target.name] = e.target.value; vzorStav.udaje = {}; prekresliVzor(); return; }
      var n = e.target.closest("[data-nastaveni]");
      if (n) { ulozNastaveni({ firma: n.firma.value, ico: n.ico.value, dic: n.dic.value, adresa: n.adresa.value, ucet: n.ucet.value, splatnostDni: Number(n.splatnostDni.value) || 14, platceDph: n.platceDph.checked }); kontrolyNastaveni(); toast("Uloženo."); }
    });
    koren.addEventListener("input", function (e) {
      var v = e.target.closest("[data-vzory-pole]");
      if (v) { vzorStav.udaje[e.target.name] = e.target.value; prekresliVzor(); return; }
      var r = e.target.closest("[data-rady]");
      if (r) {
        var rady = {};
        ["faktura", "proforma", "nabidka"].forEach(function (d) { rady[d] = r[d].value; $('[data-nahled-rady="' + d + '"]', r).value = BV.cislovani.vyrobCislo(r[d].value, DNES, 7); });
        ulozNastaveni({ rady: rady }); return;
      }
      if (e.target.closest("[data-nastaveni]")) kontrolyNastaveni();
    });
    koren.addEventListener("submit", function (e) {
      var f = e.target.closest("[data-novy-ukol]");
      if (!f) return;
      e.preventDefault();
      if (!f.text.value.trim()) return;
      ulozDo("ukoly", { id: noveId("ukoly"), text: f.text.value.trim(), kdo: f.kdo.value, termin: f.termin.value || DNES, hotovo: false, klient: null });
      c.vykresli(); toast("Úkol přidán.");
    });

    /* =================== přehled: co dnes řešit =================== */
    function dnesResit() {
      var poSpl = doklady().filter(function (d) { return d.druh === "faktura" && !d.uhrazeno && d.splatnost < DNES; });
      var ukoly = sada("ukoly").filter(function (u) { return !u.hotovo && u.termin <= BV.datum.posunDatum(DNES, 1); });
      var nove = poptavky().filter(function (p) { return p.stav !== "prevedena"; });
      var polozky = nove.map(function (p) { return '<div class="ukol ukol--poptavka" data-poptavka="' + esc(p.id) + '" style="cursor:pointer"><span class="ukol__ikona">' + ik("obalka") + '</span><div><span class="ukol__text">Nová poptávka: ' + esc(p.firma || p.jmeno) + "</span><small>" + esc(p.adresa || "") + " · " + esc(p.rozpocet || "") + "</small></div><span></span></div>"; })
        .concat(poSpl.map(function (d) { var k = klient(d.klientId) || {}; return '<div class="ukol ukol--eskalace" data-doklad="' + esc(d.cislo) + '" style="cursor:pointer"><span class="ukol__ikona">' + ik("vystraha") + '</span><div><span class="ukol__text">Faktura ' + esc(d.cislo) + " – " + esc(k.nazev || "") + "</span><small>" + kc(d.celkem) + " · " + esc(lhuta(d.splatnost)) + "</small></div><span></span></div>"; }))
        .concat(ukoly.map(function (u) { return '<div class="ukol ukol--upozorneni"><span class="ukol__ikona">' + ik("kalendar") + '</span><div><span class="ukol__text">' + esc(u.text) + "</span><small>" + esc(u.kdo) + " · " + esc(lhuta(u.termin)) + '</small></div><a class="tl tl--maly tl--obrys" href="#ukoly">Úkoly</a></div>'; }));
      return { html: polozky.length ? '<div class="ukoly">' + polozky.join("") + "</div>" : '<div class="prazdne">Nic nehoří.</div>', pocet: polozky.length, poptavek: nove.length, poSplatnosti: poSpl };
    }

    return {
      views: { poptavky: viewPoptavky, klienti: viewKlienti, zakazky: viewZakazky, vzory: viewVzory, doklady: viewDoklady, statistiky: viewStatistiky, ukoly: viewUkoly, navstevnost: viewNavstevnost, tym: viewTym, nastaveni: viewNastaveni },
      po: { vzory: prekresliVzor, nastaveni: kontrolyNastaveni },
      dnesResit: dnesResit, nastaveni: nastaveni, sada: sada, poptavky: poptavky,
    };
  };
})();
