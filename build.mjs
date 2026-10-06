/** Sestavení statického webu do out/. Node 24, bez závislostí. */
import { readFile, writeFile, mkdir, rm, cp, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

import { stranka } from "./src/templates/layout.mjs";
import * as S from "./src/templates/stranky.mjs";
import { aplikace } from "./src/templates/aplikace.mjs";
import { SLUZBY, OBJEKTY, REFERENCE } from "./src/templates/obsah.mjs";

const KOREN = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(KOREN, "out");

function nazvyExportu(zdroj) {
  const jmena = new Set();
  const re = /export\s+(?:async\s+)?(?:function\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)/g;
  let m;
  while ((m = re.exec(zdroj))) jmena.add(m[1]);
  return [...jmena];
}

/** Moduly z src/lib se sesypou do jednoho klasického skriptu pod globální BV.<modul>. Importy mezi moduly se nahradí odkazem na BV. */
async function svazekKnihoven() {
  const dir = path.join(KOREN, "src", "lib");
  const vsechny = (await readdir(dir)).filter((f) => f.endsWith(".mjs")).sort();
  const zdroje = {};
  for (const f of vsechny) zdroje[f] = await readFile(path.join(dir, f), "utf8");
  // Moduly se řadí podle závislostí: kdo importuje, jde až po tom, koho importuje.
  const soubory = [];
  const navstiveno = new Set();
  const pridej = (f) => {
    if (navstiveno.has(f)) return;
    navstiveno.add(f);
    for (const m of zdroje[f].matchAll(/from\s*["']\.\/([\w-]+\.mjs)["']/g)) if (zdroje[m[1]]) pridej(m[1]);
    soubory.push(f);
  };
  vsechny.forEach(pridej);
  const kusy = [];
  for (const soubor of soubory) {
    let zdroj = zdroje[soubor];
    const jmena = nazvyExportu(zdroj);
    zdroj = zdroj.replace(/^\s*import\s*\{([^}]*)\}\s*from\s*["']\.\/([\w-]+)\.mjs["'];?[ \t]*$/gm,
      (_, co, mod) => `const {${co}} = BV.${mod.replace(/-/g, "_")};`);
    const telo = zdroj.replace(/^\s*export\s+(?=(?:async\s+)?(?:function|const|let|var|class)\s)/gm, "");
    kusy.push(`BV.${soubor.replace(/\.mjs$/, "").replace(/-/g, "_")} = (function () {\n${telo}\nreturn { ${jmena.join(", ")} };\n})();`);
  }
  return `(function (global) {\n"use strict";\nvar BV = global.BV = global.BV || {};\n${kusy.join("\n")}\n})(typeof window !== "undefined" ? window : globalThis);\n`;
}

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<rect width="32" height="32" rx="7" fill="#15171a"/>
<path d="M5 15 16 7l11 8" fill="none" stroke="#f2f1ec" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="8.5" y="17" width="15" height="7" rx="3.5" fill="#f2b300" stroke="#f2f1ec" stroke-width="1.4"/>
<circle cx="16" cy="20.5" r="2" fill="#b9e04a" stroke="#15171a" stroke-width=".8"/></svg>`;

async function main() {
  const firma = JSON.parse(await readFile(path.join(KOREN, "data/firma.json"), "utf8"));
  const demo = JSON.parse(await readFile(path.join(KOREN, "data/demo.json"), "utf8"));

  await rm(OUT, { recursive: true, force: true });
  await mkdir(path.join(OUT, "assets", "fonts"), { recursive: true });

  const knihovny = await svazekKnihoven();
  const web = await readFile(path.join(KOREN, "src/ui/web.js"), "utf8");
  const appJs = [knihovny, web].join("\n");
  const demoJs = [await readFile(path.join(KOREN, "src/ui/crm.js"), "utf8"), await readFile(path.join(KOREN, "src/ui/demo.js"), "utf8")].join("\n");
  const css = await readFile(path.join(KOREN, "src/assets/style.css"), "utf8");
  const fonty = await readFile(path.join(KOREN, "src/assets/fonts.css"), "utf8");
  const otisk = (s) => createHash("sha1").update(s).digest("hex").slice(0, 8);
  const otisky = { "style.css": otisk(css), "fonts.css": otisk(fonty), "app.js": otisk(appJs), "demo.js": otisk(demoJs), "favicon.svg": otisk(FAVICON) };

  await writeFile(path.join(OUT, "assets/style.css"), css);
  await writeFile(path.join(OUT, "assets/fonts.css"), fonty);
  await writeFile(path.join(OUT, "assets/app.js"), appJs);
  await writeFile(path.join(OUT, "assets/demo.js"), demoJs);
  await writeFile(path.join(OUT, "assets/favicon.svg"), FAVICON);
  await cp(path.join(KOREN, "src/assets/fonts"), path.join(OUT, "assets/fonts"), { recursive: true });
  await writeFile(path.join(OUT, "robots.txt"), "User-agent: *\nDisallow: /\n");
  await writeFile(path.join(OUT, ".nojekyll"), "");

  const ctx = {
    firma, rok: 2026,
    asset: (jmeno) => `assets/${jmeno}${otisky[jmeno] ? `?v=${otisky[jmeno]}` : ""}`,
  };

  let pocet = 0;
  const uloz = async (soubor, volby) => {
    await writeFile(path.join(OUT, soubor), stranka(ctx, volby));
    pocet += 1;
  };

  await uloz("index.html", { aktivni: "uvod", obsah: S.uvod(ctx) });
  await uloz("sluzby.html", { titulek: "Služby", aktivni: "sluzby", obsah: S.sluzby(ctx), popis: "Technická, provozní, ekonomická správa budov a energetický management." });
  for (const s of SLUZBY) await uloz(s.soubor, { titulek: s.nazev, aktivni: s.id, obsah: S.sluzbaDetail(ctx, s), popis: s.perex });
  await uloz("pro-koho.html", { titulek: "Pro koho pracujeme", aktivni: "prokoho", obsah: S.proKoho(ctx) });
  for (const o of OBJEKTY) await uloz(o.soubor, { titulek: `Správa: ${o.nazev}`, aktivni: o.id, obsah: S.objektDetail(ctx, o), popis: o.perex });
  await uloz("reference.html", { titulek: "Reference", aktivni: "reference", obsah: S.reference(ctx) });
  for (const r of REFERENCE) await uloz(r.soubor, { titulek: r.nazev, aktivni: "reference", obsah: S.referenceDetail(ctx, r), popis: r.perex });
  await uloz("system.html", { titulek: "Systém Budovník", aktivni: "system", obsah: S.system(ctx) });
  await uloz("revize.html", { titulek: "Průvodce revizemi", aktivni: "revize", obsah: S.revize(ctx), popis: "Jaké revize a kontroly potřebuje bytový dům nebo budova a jak často." });
  await uloz("kalkulacka.html", { titulek: "Kalkulačka ceny správy", aktivni: "kalkulacka", obsah: S.kalkulacka(ctx) });
  await uloz("kariera.html", { titulek: "Kariéra a spolupráce", aktivni: "dodavatele", obsah: S.dodavatele(ctx) });
  await uloz("o-nas.html", { titulek: "O nás", aktivni: "onas", obsah: S.oNas(ctx) });
  await uloz("kontakt.html", { titulek: "Kontakt a poptávka", aktivni: "kontakt", obsah: S.kontakt(ctx) });
  await uloz("o-ukazce.html", { titulek: "O ukázce", aktivni: "ukazka", obsah: S.oUkazce(ctx) });
  await uloz("ochrana-udaju.html", { titulek: "Ochrana osobních údajů", aktivni: "soukromi", obsah: S.soukromi(ctx) });
  await uloz("404.html", { titulek: "Stránka nenalezena", aktivni: "404", obsah: S.chyba404(ctx) });

  const demoSkript = (data) => `<script type="application/json" id="demo-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>\n<script src="${ctx.asset("demo.js")}" defer></script>`;
  // Portál vidí klient: jména a údaje dodavatelů se do jeho stránky vůbec nedostanou.
  const jmenaDodavatelu = new Set(demo.dodavatele.map((d) => d.nazev));
  const anonym = "technik Budovníku";
  const demoPortal = {
    ...demo,
    dodavatele: demo.dodavatele.map((d) => ({ id: d.id, nazev: anonym, obory: d.obory, kraje: [], aktivni: d.aktivni, odezvaHodin: 0, vytizeni: 0, hodnoceni: [], dokumenty: [] })),
    smlouvy: demo.smlouvy.filter((s) => s.strana === "klient"),
    zavady: demo.zavady.map((z) => ({ ...z, historie: (z.historie || []).map((h) => (jmenaDodavatelu.has(h.kdo) ? { ...h, kdo: anonym } : h)) })),
    pravidla: [], uzivatele: { portal: demo.uzivatele.portal, dispecink: [] },
  };
  await uloz("portal.html", { titulek: "Klientský portál (demo)", aktivni: "portal", aplikace: true, obsah: aplikace("portal"), skripty: demoSkript(demoPortal) });
  await uloz("dispecink.html", { titulek: "Interní systém (demo)", aktivni: "dispecink", aplikace: true, obsah: aplikace("dispecink"), skripty: demoSkript(demo) });

  console.log(`hotovo: ${pocet} stránek v out/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
