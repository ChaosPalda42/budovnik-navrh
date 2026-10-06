/* Budovník – chování webu. Logika (revize, kalkulačka, časová osa, validace) je v BV.* z src/lib. */
(function () {
  "use strict";
  var BV = window.BV || {};
  var doc = document;
  var root = doc.documentElement;
  var $ = function (s, k) { return (k || doc).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || doc).querySelectorAll(s)); };
  var klid = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ulozeno = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  var relace = function (k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } };
  var cislo = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " "); };

  /* ---------- Téma ---------- */
  $$("[data-tema]").forEach(function (b) {
    b.addEventListener("click", function () {
      var tmavy = root.dataset.tema ? root.dataset.tema === "tmavy" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      var nove = tmavy ? "svetly" : "tmavy";
      var prepni = function () { root.dataset.tema = nove; ulozeno("bv-tema", nove); };
      if (doc.startViewTransition && !klid) doc.startViewTransition(prepni); else prepni();
    });
  });

  /* ---------- Navigace ---------- */
  var ham = $(".hamburger");
  var nav = $("#navigace");
  if (ham && nav) {
    ham.addEventListener("click", function () {
      var otevrit = !nav.hasAttribute("data-otevreno");
      nav.toggleAttribute("data-otevreno", otevrit);
      ham.setAttribute("aria-expanded", String(otevrit));
      doc.body.style.overflow = otevrit ? "hidden" : "";
    });
  }
  $$("[data-rozbal]").forEach(function (r) {
    var b = $("button", r);
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var otevrit = !r.hasAttribute("data-otevreno");
      $$("[data-rozbal][data-otevreno]").forEach(function (x) { if (x !== r) { x.removeAttribute("data-otevreno"); $("button", x).setAttribute("aria-expanded", "false"); } });
      r.toggleAttribute("data-otevreno", otevrit);
      b.setAttribute("aria-expanded", String(otevrit));
    });
  });
  doc.addEventListener("click", function (e) {
    if (!e.target.closest || e.target.closest("[data-rozbal]")) return;
    $$("[data-rozbal][data-otevreno]").forEach(function (x) { x.removeAttribute("data-otevreno"); $("button", x).setAttribute("aria-expanded", "false"); });
  });
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    $$("[data-rozbal][data-otevreno]").forEach(function (x) { x.removeAttribute("data-otevreno"); });
    if (nav && nav.hasAttribute("data-otevreno")) { nav.removeAttribute("data-otevreno"); ham.setAttribute("aria-expanded", "false"); doc.body.style.overflow = ""; }
  });

  /* ---------- Metr a libela v logu (reaguje na rychlost rolování) ---------- */
  var metr = $(".metr");
  var bubliny = $$(".hlavicka .logo__bublina");
  var posledniY = window.scrollY, posledniT = performance.now(), vychylka = 0, rychlost = 0, bezi = false;
  function krokLibely() {
    // pružina: vrací bublinu do středu, tlumí kmitání
    rychlost += -vychylka * 0.16;
    rychlost *= 0.78;
    vychylka += rychlost;
    if (Math.abs(vychylka) < 0.02 && Math.abs(rychlost) < 0.02) { vychylka = 0; bezi = false; }
    bubliny.forEach(function (b) { b.style.setProperty("--bublina", vychylka.toFixed(2) + "px"); });
    if (bezi) requestAnimationFrame(krokLibely);
  }
  function naRolovani() {
    var h = doc.documentElement.scrollHeight - window.innerHeight;
    if (metr) metr.style.setProperty("--postup", h > 0 ? (window.scrollY / h).toFixed(4) : 0);
    var t = performance.now();
    var v = (window.scrollY - posledniY) / Math.max(16, t - posledniT);
    posledniY = window.scrollY; posledniT = t;
    if (!klid && bubliny.length) {
      vychylka = Math.max(-3.4, Math.min(3.4, vychylka + v * 1.6));
      if (!bezi) { bezi = true; requestAnimationFrame(krokLibely); }
    }
  }
  window.addEventListener("scroll", naRolovani, { passive: true });
  naRolovani();

  /* ---------- Odhalování a počítadla ---------- */
  function pocitej(el) {
    var cil = parseFloat(el.getAttribute("data-pocitadlo"));
    if (klid || !isFinite(cil)) { el.textContent = cislo(cil); return; }
    var start = performance.now(), delka = 1100;
    (function snimek(t) {
      var p = Math.min(1, (t - start) / delka);
      el.textContent = cislo(cil * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(snimek);
    })(start);
  }
  if ("IntersectionObserver" in window) {
    var pozor = new IntersectionObserver(function (zaznamy) {
      zaznamy.forEach(function (z) {
        if (!z.isIntersecting) return;
        z.target.classList.add("je-videt");
        $$("[data-pocitadlo]", z.target).forEach(pocitej);
        if (z.target.hasAttribute("data-pocitadlo")) pocitej(z.target);
        pozor.unobserve(z.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$(".odhal").forEach(function (el) { pozor.observe(el); });
    $$("[data-pocitadlo]").forEach(function (el) { if (!el.closest(".odhal")) pozor.observe(el); });
  } else {
    root.classList.add("bez-js");
  }

  /* ---------- Kóty nad kartami ---------- */
  $$("[data-kota]").forEach(function (el) {
    el.addEventListener("pointerenter", function () {
      el.setAttribute("data-kota", cislo(el.getBoundingClientRect().width * 10));
    });
  });

  /* ---------- Záložky služeb ---------- */
  $$("[data-zalozky]").forEach(function (z) {
    var tlacitka = $$("[role=tab]", z);
    tlacitka.forEach(function (b, i) {
      b.addEventListener("click", function () { vyber(i); });
      b.addEventListener("keydown", function (e) {
        var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        var n = (i + d + tlacitka.length) % tlacitka.length;
        vyber(n); tlacitka[n].focus();
      });
    });
    function vyber(i) {
      tlacitka.forEach(function (b, j) {
        b.setAttribute("aria-selected", String(i === j));
        b.tabIndex = i === j ? 0 : -1;
        var p = doc.getElementById(b.getAttribute("aria-controls"));
        if (!p) return;
        p.hidden = i !== j;
        if (i === j) { p.classList.remove("je-novy"); void p.offsetWidth; p.classList.add("je-novy"); }
      });
    }
  });

  /* ---------- Lhůty revizí slovy ---------- */
  function periodaText(m) {
    if (m < 12) return m === 1 ? "každý měsíc" : "každé " + m + " měsíce";
    var r = m / 12;
    if (r === 1) return "každý rok";
    if (r >= 2 && r <= 4) return "každé " + r + " roky";
    return "každých " + r + " let";
  }

  /* ---------- Řez budovou ---------- */
  $$("[data-rez]").forEach(function (panel) {
    var svg = $(".rez", panel);
    var info = $("[data-rez-info]", panel);
    var legenda = $("[data-rez-legenda]", panel);
    var data = {};
    try { data = JSON.parse($("[data-rez-data]", panel).textContent); } catch (e) { /* bez popisů */ }
    var aktivni = $(".rez-scena.je-aktivni", panel);
    var vybrana = null, prohlidka = null, interakce = false;

    function revizeText(tech) {
      var kat = BV.revize && BV.revize.revizeProTechnologie ? BV.revize.revizeProTechnologie([tech]) : [];
      if (!kat.length) return '<span>Bez zákonné revize · <b>pravidelná údržba</b></span>';
      return kat.map(function (k) { return "<span>" + k.nazev + " · <b>" + periodaText(k.periodaMesicu) + "</b></span>"; }).join("");
    }
    function vyber(tech, sam) {
      if (!sam) { interakce = true; zastavProhlidku(); }
      vybrana = tech;
      var body = $$(".rez-bod", aktivni);
      var bod = body.filter(function (b) { return b.getAttribute("data-tech") === tech; })[0];
      $$(".rez-bod", svg).forEach(function (b) { b.classList.toggle("je-vybrany", b === bod); });
      svg.setAttribute("data-vyber", tech);
      $$(".rez-sit", svg).forEach(function (s) { s.classList.toggle("je-vybrana", s.getAttribute("data-sit") === tech); });
      info.innerHTML = infoHtml(tech, bod ? $("text", bod).textContent : "•");
      $$("button", legenda).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-tech") === tech)); });
    }
    function infoHtml(tech, cislo) {
      var d = data[tech] || { nazev: tech, text: "" };
      return '<span class="rez-info__cislo">' + cislo + "</span><h3>" + d.nazev + "</h3><p>" + d.text + '</p><div class="rez-info__revize">' + revizeText(tech) + "</div>";
    }
    function legendaHtml(scena) {
      var poradi = (scena.getAttribute("data-legenda") || "").split(",").filter(Boolean);
      return poradi.map(function (t, i) {
        return '<button type="button" data-tech="' + t + '" aria-pressed="' + (t === vybrana) + '"><i>' + (i + 1) + "</i>" + ((data[t] || {}).nazev || t) + "</button>";
      }).join("");
    }
    function kresliLegendu() { legenda.innerHTML = legendaHtml(aktivni); }
    // Panel nesmí skákat: výška popisu a legendy se zarovná na nejdelší variantu ze všech scén.
    function zarovnejVysky() {
      var puvodniInfo = info.innerHTML, puvodniLegenda = legenda.innerHTML;
      info.style.minHeight = ""; legenda.style.minHeight = "";
      var maxInfo = 0, maxLegenda = 0;
      $$(".rez-scena", panel).forEach(function (sc) {
        legenda.innerHTML = legendaHtml(sc);
        maxLegenda = Math.max(maxLegenda, Math.ceil(legenda.getBoundingClientRect().height));
        (sc.getAttribute("data-legenda") || "").split(",").filter(Boolean).forEach(function (t) {
          info.innerHTML = infoHtml(t, "10");
          maxInfo = Math.max(maxInfo, Math.ceil(info.getBoundingClientRect().height));
        });
      });
      info.innerHTML = puvodniInfo; legenda.innerHTML = puvodniLegenda;
      info.style.minHeight = maxInfo + "px"; legenda.style.minHeight = maxLegenda + "px";
    }
    function prepniScenu(id) {
      var nova = $('.rez-scena[data-scena="' + id + '"]', panel);
      if (!nova || nova === aktivni) return;
      aktivni.classList.remove("je-aktivni");
      nova.classList.add("je-aktivni");
      aktivni = nova;
      $$("[data-scena-prepni]", panel).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-scena-prepni") === id)); });
      svg.removeAttribute("data-vyber");
      kresliLegendu();
      var prvni = (aktivni.getAttribute("data-legenda") || "").split(",")[0];
      if (prvni) vyber(prvni, true);
    }
    function zastavProhlidku() { if (prohlidka) { clearInterval(prohlidka); prohlidka = null; } }
    function spustProhlidku() {
      if (klid || interakce || prohlidka) return;
      prohlidka = setInterval(function () {
        var poradi = (aktivni.getAttribute("data-legenda") || "").split(",");
        var i = poradi.indexOf(vybrana);
        vyber(poradi[(i + 1) % poradi.length], true);
      }, 3600);
    }
    svg.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest(".rez-bod");
      if (b) vyber(b.getAttribute("data-tech"));
    });
    svg.addEventListener("keydown", function (e) {
      var b = e.target.closest && e.target.closest(".rez-bod");
      if (b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); vyber(b.getAttribute("data-tech")); }
    });
    legenda.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b) vyber(b.getAttribute("data-tech"));
    });
    $$("[data-scena-prepni]", panel).forEach(function (b) {
      b.addEventListener("click", function () { interakce = true; zastavProhlidku(); prepniScenu(b.getAttribute("data-scena-prepni")); });
    });
    kresliLegendu();
    zarovnejVysky();
    var sirkaPanelu = panel.offsetWidth, casovac = null;
    window.addEventListener("resize", function () {
      clearTimeout(casovac);
      casovac = setTimeout(function () { if (panel.offsetWidth !== sirkaPanelu) { sirkaPanelu = panel.offsetWidth; zarovnejVysky(); } }, 150);
    });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(zarovnejVysky);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (z) {
        z.forEach(function (x) { if (x.isIntersecting) spustProhlidku(); else zastavProhlidku(); });
      }, { threshold: 0.35 }).observe(panel);
    }
    setTimeout(function () { if (!vybrana) vyber((aktivni.getAttribute("data-legenda") || "").split(",")[0], true); }, 400);
  });

  /* ---------- Křížový laser v hero ---------- */
  $$("[data-hero]").forEach(function (hero) {
    var laser = $(".laser", hero);
    var cteni = $(".laser__cteni", hero);
    if (!laser || klid) return;
    var ramec = null;
    function pohyb(x, y) {
      var r = hero.getBoundingClientRect();
      var lx = x - r.left, ly = y - r.top;
      if (ramec) cancelAnimationFrame(ramec);
      ramec = requestAnimationFrame(function () {
        laser.style.setProperty("--lx", lx + "px");
        laser.style.setProperty("--ly", ly + "px");
        var vyska = (r.height - ly) / 100;
        cteni.textContent = (vyska >= 0 ? "+" : "") + vyska.toFixed(3).replace(".", ",") + " m";
      });
    }
    hero.addEventListener("pointermove", function (e) {
      if (e.target.closest && e.target.closest(".rez-ram, a, button")) { laser.classList.remove("je-zapnuty"); return; }
      laser.classList.add("je-zapnuty");
      pohyb(e.clientX, e.clientY);
    });
    hero.addEventListener("pointerleave", function () { laser.classList.remove("je-zapnuty"); });
  });

  /* ---------- Průvodce revizemi ---------- */
  $$("[data-pruvodce]").forEach(function (p) {
    var vystup = $("[data-pruvodce-vystup]", p);
    var pocet = $("[data-pruvodce-pocet]", p);
    function prepocti() {
      var tech = $$("input:checked", p).map(function (i) { return i.value; });
      var seznam = BV.revize ? BV.revize.revizeProTechnologie(tech) : [];
      pocet.textContent = seznam.length + (seznam.length === 1 ? " revize" : seznam.length >= 2 && seznam.length <= 4 ? " revize" : " revizí");
      if (!seznam.length) { vystup.innerHTML = '<tr><td colspan="2"><div class="prazdne">Vyberte aspoň jednu technologii.</div></td></tr>'; return; }
      vystup.innerHTML = seznam.map(function (k, i) {
        return '<tr style="animation-delay:' + i * 30 + 'ms"><td>' + k.nazev + "<small>" + k.predpis + '</small></td><td class="perioda">' + periodaText(k.periodaMesicu) + "</td></tr>";
      }).join("");
    }
    p.addEventListener("change", prepocti);
    prepocti();
  });

  /* ---------- Kalkulačka ---------- */
  $$("[data-kalkulacka]").forEach(function (k) {
    var form = $("form", k);
    var vystup = function (n) { return $('[data-k="' + n + '"]', k); };
    var zobrazeno = 0;
    function animujCenu(cil) {
      var el = vystup("celkem"), start = zobrazeno, t0 = performance.now();
      if (klid) { el.textContent = cislo(cil) + " Kč"; zobrazeno = cil; return; }
      (function snimek(t) {
        var p = Math.min(1, (t - t0) / 450);
        var v = start + (cil - start) * (1 - Math.pow(1 - p, 3));
        el.textContent = cislo(v) + " Kč";
        if (p < 1) requestAnimationFrame(snimek); else zobrazeno = cil;
      })(t0);
    }
    function prepocti() {
      var typ = $("input[name=typ]:checked", form).value;
      var rez = typ === "svj" || typ === "druzstvo";
      $('[data-pro="rez"]', form).hidden = !rez;
      $('[data-pro="plocha"]', form).hidden = rez;
      var jednotek = parseInt(form.jednotek.value, 10);
      var plocha = parseInt(form.plocha.value, 10);
      $('[data-vystup="jednotek"]', form).textContent = jednotek;
      $('[data-vystup="plocha"]', form).textContent = cislo(plocha);
      if (!BV.kalkulacka) return;
      var r = BV.kalkulacka.spocitej({
        typ: typ, jednotek: jednotek, plocha: plocha, stari: form.stari.value, vytahu: parseInt(form.vytahu.value, 10),
        havarijni: form.havarijni.checked,
        sluzby: $$("input[name=sluzby]:checked", form).map(function (i) { return i.value; }),
      });
      if (r.chyba) return;
      animujCenu(r.celkem);
      vystup("pod").textContent = "rozpětí " + cislo(r.rozpeti.od) + "–" + cislo(r.rozpeti.do) + " Kč · s DPH " + cislo(r.sDph) + " Kč" + (r.naJednotku ? " · " + cislo(r.naJednotku) + " Kč na byt" : "");
      var radky = r.polozky.map(function (p) { return "<div><span>" + p.nazev + "</span><span>" + cislo(p.castka) + " Kč</span></div>"; });
      if (r.sleva) radky.push('<div class="je-sleva"><span>Množstevní sleva ' + r.slevaProcent + " %</span><span>−" + cislo(r.sleva) + " Kč</span></div>");
      if (r.minimumPouzito) radky.push("<div><span>Minimální měsíční paušál</span><span>" + cislo(r.celkem) + " Kč</span></div>");
      vystup("radky").innerHTML = radky.join("");
    }
    form.addEventListener("input", prepocti);
    form.addEventListener("change", prepocti);
    prepocti();
  });

  /* ---------- Formuláře (ukázka: nic se neodesílá) ---------- */
  var PRAVIDLA = {
    poptavka: { jmeno: ["required"], email: ["required", "email"], telefon: ["telefon"], adresa: ["required"], souhlas: ["souhlas"] },
    dodavatel: { firma: ["required"], ico: ["ico"], email: ["required", "email"], telefon: ["required", "telefon"], obory: [{ typ: "min", hodnota: 1 }], souhlas: ["souhlas"] },
  };
  var HLASKY = { required: "Vyplňte prosím.", email: "Zkontrolujte e-mail.", telefon: "Zkontrolujte telefon.", ico: "IČO nesedí (8 číslic s kontrolním součtem).", souhlas: "Bez souhlasu to nepůjde.", min: "Vyberte aspoň jednu možnost." };
  $$("[data-formular]").forEach(function (f) {
    var druh = f.getAttribute("data-formular");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var hodnoty = {};
      Object.keys(PRAVIDLA[druh]).forEach(function (k) {
        var pole = f.elements[k];
        if (!pole) return;
        if (pole.type === "checkbox") hodnoty[k] = pole.checked;
        else if (pole.length !== undefined && pole[0] && pole[0].type === "checkbox") hodnoty[k] = $$('input[name="' + k + '"]:checked', f).map(function (x) { return x.value; });
        else hodnoty[k] = pole.value;
      });
      $$(".pole__chyba", f).forEach(function (x) { x.remove(); });
      $$(".je-chyba", f).forEach(function (x) { x.classList.remove("je-chyba"); });
      var vysledek = BV.validace ? BV.validace.validuj(hodnoty, PRAVIDLA[druh]) : { ok: true, errors: {} };
      var prvni = null;
      Object.keys(vysledek.errors).forEach(function (k) {
        var pole = f.elements[k];
        var el = pole && (pole.length !== undefined && !pole.tagName ? pole[0] : pole);
        var obal = el && (el.closest(".pole") || el.closest(".souhlas"));
        if (!obal) return;
        obal.classList.add("je-chyba");
        var s = doc.createElement("span");
        s.className = "pole__chyba";
        s.textContent = HLASKY[vysledek.errors[k]] || "Zkontrolujte prosím.";
        obal.appendChild(s);
        if (!prvni) prvni = el;
      });
      if (prvni) { prvni.focus(); return; }
      $("[data-formular-vysledek]", f).innerHTML = '<div class="hlaseni"><svg class="ik" width="20" height="20" viewBox="0 0 20 20"><path d="m4 10.4 4 4L16 5.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><div><strong>Děkujeme, máme to.</strong><br>V ukázce se nic neodesílá. Ve skutečném provozu se ozveme do jednoho pracovního dne' + (druh === "poptavka" ? " a domluvíme prohlídku objektu." : " a domluvíme si schůzku.") + "</div></div>";
      f.reset();
    });
  });

  /* ---------- 404: odkazy vůči kořeni webu ---------- */
  $$("[data-koren]").forEach(function (a) {
    var casti = location.pathname.split("/").filter(Boolean);
    var koren = /github\.io$/.test(location.hostname) && casti.length ? "/" + casti[0] + "/" : "/";
    if (location.protocol === "file:") return;
    a.setAttribute("href", koren + a.getAttribute("href"));
  });

  /* ---------- Úvodní animace: web se postaví ---------- */
  function postav() {
    if (!root.classList.contains("stavi-se")) return;
    var vyska = window.innerHeight, sirka = window.innerWidth;
    var prvky = $$("[data-stavba]").filter(function (el) {
      var r = el.getBoundingClientRect();
      var s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && r.right > 0 && r.left < sirka && s.visibility !== "hidden";
    });
    var podklad = prvky.map(function (el, i) {
      var r = el.getBoundingClientRect();
      return { id: String(i), x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height };
    });
    if (!BV.stavba || !podklad.length) { hotovo(); return; }
    var osa = BV.stavba.casovaOsa(podklad, { vyska: vyska, rozestup: 55, vytyceni: 440, pauza: 90, usazeni: 440 });
    var NS = "http://www.w3.org/2000/svg";
    var vrstva = doc.createElement("div");
    vrstva.className = "stavba";
    vrstva.setAttribute("aria-hidden", "true");
    vrstva.innerHTML = '<div class="stavba__pozadi"></div><div class="stavba__osnova"></div><svg></svg>' +
      '<div class="stavba__libela"><div class="stavba__libela-tubus"><div class="stavba__bublina"></div></div><div class="stavba__popis">Vyrovnávám…</div></div>';
    doc.body.appendChild(vrstva);
    var svg = $("svg", vrstva);
    var bublina = $(".stavba__bublina", vrstva);
    var popis = $(".stavba__popis", vrstva);
    var mapa = {};
    osa.plan.forEach(function (p) {
      var d = podklad[Number(p.id)];
      var y = d.y - window.scrollY;
      var g = doc.createElementNS(NS, "g");
      var obvod = 2 * (d.w + d.h);
      g.innerHTML = '<rect class="stavba__obrys" x="' + d.x + '" y="' + y + '" width="' + d.w + '" height="' + d.h + '" pathLength="' + Math.round(obvod) + '"/>' +
        '<g class="stavba__kota"><line x1="' + d.x + '" y1="' + (y - 8) + '" x2="' + (d.x + d.w) + '" y2="' + (y - 8) + '"/><line x1="' + d.x + '" y1="' + (y - 12) + '" x2="' + d.x + '" y2="' + (y - 4) + '"/><line x1="' + (d.x + d.w) + '" y1="' + (y - 12) + '" x2="' + (d.x + d.w) + '" y2="' + (y - 4) + '"/>' +
        '<text x="' + (d.x + d.w / 2) + '" y="' + (y - 11) + '">' + p.kota + "</text></g>" +
        '<circle class="stavba__roh" cx="' + d.x + '" cy="' + y + '" r="2.5"/><circle class="stavba__roh" cx="' + (d.x + d.w) + '" cy="' + (y + d.h) + '" r="2.5"/>';
      svg.appendChild(g);
      var rect = g.querySelector("rect");
      rect.style.strokeDasharray = obvod;
      rect.style.strokeDashoffset = obvod;
      g.style.opacity = "0";
      mapa[p.id] = { g: g, rect: rect, obvod: obvod, el: prvky[Number(p.id)] };
      var el = prvky[Number(p.id)];
      el.style.transform = "translateY(16px) scale(.985)";
    });
    osa.mimo.forEach(function (id) { prvky[Number(id)].classList.add("stavba-hotovo"); });
    requestAnimationFrame(function () { vrstva.classList.add("je-osnova"); });
    var konec = osa.celkem + 700;
    var t0 = performance.now();
    var pozadiPryc = false;
    (function snimek(t) {
      var cas = t - t0;
      var stavy = BV.stavba.stavV(osa.plan, cas);
      stavy.forEach(function (s) {
        var m = mapa[s.id];
        if (s.obrys > 0) m.g.style.opacity = String(Math.max(0, 1 - s.usazeni));
        m.rect.style.strokeDashoffset = String(m.obvod * (1 - s.obrys));
        if (s.usazeni > 0) {
          m.rect.classList.add("stavba__obrys--plny");
          m.el.style.opacity = String(s.usazeni);
          m.el.style.transform = "translateY(" + (16 * (1 - s.usazeni)).toFixed(2) + "px) scale(" + (0.985 + 0.015 * s.usazeni).toFixed(4) + ")";
        }
      });
      var prvniUsazeni = osa.plan.length ? osa.plan[0].usazeni.od : 0;
      if (!pozadiPryc && cas >= prvniUsazeni - 60) { pozadiPryc = true; $(".stavba__pozadi", vrstva).style.opacity = "0"; vrstva.classList.remove("je-osnova"); }
      var tb = cas - (prvniUsazeni - 200);
      var bx = tb < 0 ? 60 : BV.stavba.bublina(tb, { amplituda: 60, tlumeni: 0.0052, frekvence: 0.012 });
      bublina.style.setProperty("--bx", bx.toFixed(1) + "px");
      bubliny.forEach(function (b) { b.style.setProperty("--bublina", (bx / 14).toFixed(2) + "px"); });
      if (cas > osa.celkem) popis.textContent = "V libele.";
      if (cas < konec) requestAnimationFrame(snimek);
      else {
        vrstva.style.transition = "opacity .35s ease";
        vrstva.style.opacity = "0";
        setTimeout(function () { vrstva.remove(); }, 380);
        hotovo();
      }
    })(t0);

    function hotovo() {
      prvky.forEach(function (el) { el.style.opacity = ""; el.style.transform = ""; el.classList.remove("stavba-hotovo"); });
      bubliny.forEach(function (b) { b.style.removeProperty("--bublina"); });
      root.classList.remove("stavi-se");
    }
  }
  if (root.classList.contains("stavi-se")) {
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { requestAnimationFrame(postav); }); else postav();
    // pojistka: web se nesmí zaseknout neviditelný
    setTimeout(function () { if (root.classList.contains("stavi-se") && !$(".stavba")) root.classList.remove("stavi-se"); }, 2500);
  }
})();
