/** Kresby: logo, pohledy budov pro rozcestník a interaktivní řez budovou. Čistě SVG, barvy přes CSS třídy. */
import { esc } from "./lib.mjs";

export function logo({ trida = "logo" } = {}) {
  return `<svg class="${trida}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
  <path class="logo__strecha" d="M3.5 14.5 16 5l12.5 9.5"/>
  <path class="logo__steny" d="M7 12.4V27h18V12.4"/>
  <rect class="logo__libela" x="9.6" y="17.2" width="12.8" height="5.4" rx="2.7"/>
  <path class="logo__ryska" d="M14.2 17.2v5.4M17.8 17.2v5.4"/>
  <circle class="logo__bublina" cx="16" cy="19.9" r="1.55"/>
</svg>`;
}

/* ---------- Pohledy budov (rozcestník typů objektů) ---------- */

function okna(x, y, sloupcu, radku, w, h, mx, my, trida = "pohled__okno") {
  let s = "";
  for (let r = 0; r < radku; r += 1) {
    for (let c = 0; c < sloupcu; c += 1) {
      const i = r * sloupcu + c;
      s += `<rect class="${trida}" style="--i:${(i * 7) % 23}" x="${x + c * (w + mx)}" y="${y + r * (h + my)}" width="${w}" height="${h}"/>`;
    }
  }
  return s;
}

function kotaVodorovna(x1, x2, y, text) {
  return `<g class="kota"><path d="M${x1} ${y - 5}v10M${x2} ${y - 5}v10M${x1} ${y}H${x2}"/>
    <path class="kota__sikma" d="M${x1 - 3} ${y + 3}l6-6M${x2 - 3} ${y + 3}l6-6"/>
    <text x="${(x1 + x2) / 2}" y="${y - 6}">${esc(text)}</text></g>`;
}

function kotaSvisla(x, y1, y2, text) {
  return `<g class="kota"><path d="M${x - 5} ${y1}h10M${x - 5} ${y2}h10M${x} ${y1}V${y2}"/>
    <path class="kota__sikma" d="M${x - 3} ${y1 + 3}l6-6M${x - 3} ${y2 + 3}l6-6"/>
    <text x="${x - 8}" y="${(y1 + y2) / 2}" transform="rotate(-90 ${x - 8} ${(y1 + y2) / 2})">${esc(text)}</text></g>`;
}

function teren(x1, x2, y) {
  let s = `<path class="pohled__teren" d="M${x1} ${y}H${x2}"/>`;
  for (let x = x1 + 4; x < x2; x += 9) s += `<path class="pohled__srafa" d="M${x} ${y + 1}l-6 7"/>`;
  return s;
}

export function pohled(typ) {
  if (typ === "rezidencni") {
    return `<svg class="pohled" viewBox="0 0 300 220" aria-hidden="true">
      ${kotaSvisla(40, 32, 186, "+18,6")}
      <rect class="pohled__obrys" x="70" y="32" width="160" height="154"/>
      <path class="pohled__atika" d="M66 32h168M70 40h160"/>
      ${okna(82, 50, 6, 6, 16, 12, 9, 10)}
      <rect class="pohled__dvere" x="140" y="166" width="20" height="20"/>
      <path class="pohled__obrys" d="M132 166h36"/>
      ${teren(20, 280, 186)}
      ${kotaVodorovna(70, 230, 206, "24 000")}
    </svg>`;
  }
  if (typ === "komercni") {
    return `<svg class="pohled" viewBox="0 0 300 220" aria-hidden="true">
      ${kotaSvisla(30, 20, 186, "+42,0")}
      <rect class="pohled__obrys" x="52" y="20" width="96" height="166"/>
      ${okna(58, 28, 4, 11, 18, 9, 4, 5, "pohled__okno pohled__okno--pas")}
      <rect class="pohled__obrys" x="148" y="110" width="124" height="76"/>
      <path class="pohled__obrys" d="M148 124h124"/>
      ${okna(156, 132, 8, 2, 11, 12, 4, 8)}
      <rect class="pohled__dvere" x="88" y="168" width="24" height="18"/>
      <rect class="pohled__vzt" x="64" y="10" width="26" height="10"/><rect class="pohled__vzt" x="100" y="12" width="20" height="8"/>
      ${teren(10, 290, 186)}
      ${kotaVodorovna(52, 272, 206, "56 000")}
    </svg>`;
  }
  return `<svg class="pohled" viewBox="0 0 300 220" aria-hidden="true">
    ${kotaSvisla(30, 62, 186, "+12,4")}
    <path class="pohled__obrys" d="M50 100 110 62l60 38"/>
    <rect class="pohled__obrys" x="56" y="100" width="108" height="86"/>
    ${okna(64, 112, 5, 3, 13, 14, 7, 9)}
    <circle class="pohled__obrys" cx="110" cy="84" r="8"/><path class="pohled__obrys" d="M110 79v5l3 2"/>
    <rect class="pohled__obrys" x="164" y="120" width="104" height="66"/>
    <path class="pohled__obrys" d="M164 120q52-26 104 0"/>
    ${okna(172, 132, 6, 1, 10, 30, 6.6, 0)}
    <rect class="pohled__dvere" x="100" y="168" width="20" height="18"/>
    ${teren(14, 290, 186)}
    ${kotaVodorovna(56, 268, 206, "48 600")}
  </svg>`;
}

/* ---------- Řez budovou ---------- */

/** Technologie v řezu: popis + vazba na katalog revizí (technologie z revize.mjs). */
export const TECHNOLOGIE_REZU = {
  elektro: { nazev: "Elektroinstalace", text: "Rozvaděče, stoupací vedení, osvětlení společných prostor. Revize, termovize rozvaděčů, opravy." },
  hromosvod: { nazev: "Hromosvod", text: "Jímače, svody a uzemnění. Revize a měření zemního odporu, opravy po bouřkách." },
  plyn: { nazev: "Plynové zařízení", text: "Hlavní uzávěr plynu, rozvody a spotřebiče. Kontroly těsnosti, revize, havarijní uzavření." },
  spaliny: { nazev: "Spalinové cesty", text: "Komíny a kouřovody kotlů a spotřebičů. Kontroly a čištění podle vyhlášky." },
  vytah: { nazev: "Výtahy", text: "Servisní smlouva, odborné prohlídky, zkoušky a inspekce. Vyproštění osob nonstop." },
  po: { nazev: "Požární ochrana", text: "Hasicí přístroje, hydranty, požární dveře a únikové cesty. Kontroly, dokumentace, školení." },
  eps: { nazev: "Požární signalizace (EPS)", text: "Hlásiče, ústředna a návaznosti. Pravidelné kontroly provozuschopnosti." },
  "nouzove-osvetleni": { nazev: "Nouzové osvětlení", text: "Svítidla únikových cest. Kontroly funkce a doby svícení na baterie." },
  kotelna: { nazev: "Kotelna a vytápění", text: "Kotle, tlakové nádoby, čerpadla, regulace. Servis, revize, seřízení a optimalizace spotřeby." },
  vzt: { nazev: "Vzduchotechnika", text: "Větrací jednotky, filtry, potrubí. Servis, výměna filtrů, čištění a měření výkonů." },
  chlazeni: { nazev: "Chlazení a klimatizace", text: "Kondenzační jednotky a chladicí okruhy. Kontroly úniku chladiva, servis." },
  hriste: { nazev: "Dětské hřiště", text: "Herní prvky a dopadové plochy. Provozní kontroly a roční hlavní kontrola." },
  voda: { nazev: "Voda a kanalizace", text: "Stoupačky, ventily, vodoměry a kanalizace. Odečty, hlídání úniků, opravy a výměny." },
};

const r1 = (n) => Math.round(n * 10) / 10;

function bod(tech, x, y, cislo) {
  return `<g class="rez-bod" data-tech="${tech}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="${esc(TECHNOLOGIE_REZU[tech].nazev)}">
    <circle class="rez-bod__vlna" r="10"/><circle class="rez-bod__kruh" r="10"/><text class="rez-bod__cislo" y="3.6">${cislo}</text></g>`;
}

function srafaDesky(x1, x2, y, t) {
  return `<rect class="rez-deska" x="${x1}" y="${y}" width="${x2 - x1}" height="${t}"/>`;
}

function stena(x, y1, y2, t) {
  return `<rect class="rez-stena" x="${x}" y="${y1}" width="${t}" height="${y2 - y1}"/>`;
}

function okno(x, y, t, h) {
  return `<g class="rez-okno"><rect x="${x}" y="${y}" width="${t}" height="${h}"/><path d="M${x + t / 2} ${y}v${h}"/></g>`;
}

function schody(x1, x2, yHorni, yDolni) {
  const stupnu = 7;
  const kroky = [];
  const sirka = (x2 - x1) / 2;
  const vyska = (yDolni - yHorni) / 2;
  let x = x1;
  let y = yDolni;
  kroky.push(`M${r1(x)} ${r1(y)}`);
  for (let i = 0; i < stupnu; i += 1) {
    y -= vyska / stupnu; kroky.push(`V${r1(y)}`);
    x += sirka / stupnu; kroky.push(`H${r1(x)}`);
  }
  for (let i = 0; i < stupnu; i += 1) {
    y -= vyska / stupnu; kroky.push(`V${r1(y)}`);
    x += sirka / stupnu; kroky.push(`H${r1(x)}`);
  }
  return `<path class="rez-schody" d="${kroky.join("")}"/>`;
}

function radiator(x, y) {
  return `<g class="rez-radiator"><rect x="${x}" y="${y}" width="22" height="12" rx="1.5"/><path d="M${x + 5.5} ${y}v12M${x + 11} ${y}v12M${x + 16.5} ${y}v12"/></g>`;
}

function strom(x, zem, v = 1) {
  return `<g class="rez-strom"><path d="M${x} ${zem}v-${22 * v}"/><circle cx="${x}" cy="${zem - 36 * v}" r="${18 * v}"/><circle cx="${x - 9 * v}" cy="${zem - 28 * v}" r="${10 * v}"/></g>`;
}

function terenRezu(x1, x2, zem, odX, doX, hloubka) {
  // zem kolem budovy + šrafa zeminy pod úrovní terénu mimo suterén
  let s = `<path class="rez-teren" d="M${x1} ${zem}H${odX}M${doX} ${zem}H${x2}"/>`;
  for (let x = x1 + 6; x < x2; x += 12) {
    if (x > odX - 4 && x < doX + 4) continue;
    s += `<path class="rez-zemina" d="M${x} ${zem + 4}l-8 10"/>`;
  }
  s += `<path class="rez-teren rez-teren--spodek" d="M${odX} ${zem + hloubka}H${doX}"/>`;
  return s;
}

function sit(trida, d, vrstva) {
  return `<path class="rez-sit rez-sit--${trida}" data-sit="${vrstva}" d="${d}"/>`;
}

function kabina(x, w, yDolni, yHorni) {
  // kabina výtahu jezdí mezi přízemím a horním podlažím (CSS animace přes --draha)
  const h = 34;
  return `<g class="rez-kabina" style="--draha:${r1(yDolni - yHorni)}px">
    <rect x="${x + 4}" y="${yDolni - h}" width="${w - 8}" height="${h - 4}" rx="2"/></g>`;
}

function umyvadlo(x, y) {
  return `<path class="rez-umyvadlo" d="M${x} ${y}h16q0 8-8 8t-8-8zM${x + 8} ${y - 6}v6"/>`;
}

/** Bytový dům: 6 podlaží, suterén s kotelnou, výtah, hřiště. */
function rezBytovy() {
  const zem = 450, x0 = 110, x1 = 530, patra = 6, h = 54, t = 7, sklep = 66;
  const vrch = zem - patra * h;
  const jadroX = 268, vytahX = 318, vytahW = 40;
  let s = "";
  s += terenRezu(0, 680, zem, x0, x1, sklep);
  s += strom(46, zem, 1) + strom(84, zem, 0.7);
  // hřiště
  s += `<g class="rez-hriste"><path d="M572 ${zem}l14-48 14 48M586 ${zem - 48}h40M612 ${zem}l14-48"/><path d="M600 ${zem - 48}v26M598 ${zem - 22}h6"/><path d="M640 ${zem}c0-18 8-30 26-34"/></g>`;
  // stěny a desky
  s += stena(x0, vrch - 14, zem + sklep, 10) + stena(x1 - 10, vrch - 14, zem + sklep, 10);
  for (let p = 0; p <= patra; p += 1) s += srafaDesky(x0, x1, zem - p * h - (p ? t : 0), t);
  s += srafaDesky(x0, x1, zem + sklep, t);
  s += stena(jadroX - 4, vrch, zem + sklep, 4) + stena(vytahX, vrch, zem + sklep, 4) + stena(vytahX + vytahW, vrch, zem + sklep, 4);
  for (let p = 0; p < patra; p += 1) {
    const yPodlaha = zem - p * h - (p ? t : 0);
    const yStrop = zem - (p + 1) * h;
    s += okno(x0, yStrop + 12, 10, 26) + okno(x1 - 10, yStrop + 12, 10, 26);
    s += schody(jadroX + 2, vytahX - 2, yStrop + t, yPodlaha);
    s += radiator(x0 + 18, yPodlaha - 22) + radiator(x1 - 44, yPodlaha - 22);
    // požární ochrana na podestě + nouzové osvětlení
    s += `<g class="rez-hasicak"><rect x="${jadroX + 4}" y="${yPodlaha - 20}" width="6" height="12" rx="2"/></g>`;
    s += `<rect class="rez-nouzove" x="${jadroX + 20}" y="${yStrop + t + 1}" width="10" height="4" rx="1"/>`;
    s += `<rect class="rez-elbox" x="${x1 - 150}" y="${yPodlaha - 34}" width="10" height="14"/>`;
  }
  // výtah: strojovna + kabina
  s += `<rect class="rez-obrys" x="${vytahX - 4}" y="${vrch - 26}" width="${vytahW + 12}" height="26"/>`;
  s += kabina(vytahX + 4, vytahW - 4, zem, vrch + 30);
  // atika
  s += `<path class="rez-obrys" d="M${x0} ${vrch - 14}h10M${x1 - 10} ${vrch - 14}h10"/>`;
  // suterén: kotelna, rozvaděč, HUP
  s += `<g class="rez-kotel"><rect x="150" y="${zem + 14}" width="40" height="46" rx="3"/><path d="M158 ${zem + 26}h24M158 ${zem + 34}h24"/><circle cx="170" cy="${zem + 48}" r="5"/></g>`;
  s += `<g class="rez-nadoba"><rect x="202" y="${zem + 22}" width="16" height="38" rx="8"/></g>`;
  s += `<g class="rez-rozvadec"><rect x="${x1 - 150}" y="${zem + 18}" width="26" height="40"/><path d="M${x1 - 145} ${zem + 26}h16M${x1 - 145} ${zem + 34}h16M${x1 - 145} ${zem + 42}h16"/></g>`;
  s += `<g class="rez-hup"><rect x="70" y="${zem - 30}" width="20" height="24" rx="2"/><path d="M76 ${zem - 18}h8"/></g>`;
  // sítě
  const yV = zem + 54;
  s += sit("voda", `M236 ${yV}V${vrch + 20}` + Array.from({ length: patra }, (_, p) => `M236 ${zem - p * h - 30}H${x0 + 100}`).join(""), "voda");
  for (let p = 0; p < patra; p += 1) s += umyvadlo(x0 + 84, zem - p * h - 30);
  s += sit("tepla", `M244 ${yV - 6}V${vrch + 20}`, "voda");
  s += sit("teplo", `M190 ${zem + 30}H252V${vrch + 20}` + Array.from({ length: patra }, (_, p) => `M252 ${zem - p * h - 16}H${x0 + 40}`).join(""), "kotelna");
  s += sit("elektro", `M${x1 - 137} ${zem + 18}V${vrch + 16}` + Array.from({ length: patra }, (_, p) => `M${x1 - 137} ${zem - p * h - 27}H${x1 - 140}`).join(""), "elektro");
  s += sit("plyn", `M80 ${zem - 6}V${zem + 8}H170V${zem + 14}`, "plyn");
  s += sit("spaliny", `M128 ${zem + 20}H${x0 + 14}V${vrch - 40}`, "spaliny");
  s += `<rect class="rez-komin" x="${x0 + 10}" y="${vrch - 46}" width="10" height="32"/>`;
  // hromosvod
  s += sit("hromosvod", `M470 ${vrch - 14}V${vrch - 70}M${x0 + 30} ${vrch - 16}H${x1 - 4}V${zem + 4}l10 18`, "hromosvod");
  s += `<path class="rez-jimac" d="M466 ${vrch - 70}h8"/>`;
  // body
  const bodPatro = (p) => zem - p * h - h / 2;
  s += bod("elektro", x1 - 112, zem + 38, 1);
  s += bod("hromosvod", 492, vrch - 62, 2);
  s += bod("plyn", 80, zem - 50, 3);
  s += bod("spaliny", x0 + 15, vrch - 64, 4);
  s += bod("vytah", vytahX + 20, vrch - 40, 5);
  s += bod("po", jadroX + 8, bodPatro(2) + 6, 6);
  s += bod("nouzove-osvetleni", jadroX + 26, bodPatro(4) - 14, 7);
  s += bod("kotelna", 170, zem + 70, 8);
  s += bod("voda", 236, bodPatro(1) - 8, 9);
  s += bod("hriste", 626, zem - 66, 10);
  return { s, legenda: ["elektro", "hromosvod", "plyn", "spaliny", "vytah", "po", "nouzove-osvetleni", "kotelna", "voda", "hriste"] };
}

/** Kancelářská budova: 7 podlaží, garáže, VZT a chlazení na střeše, EPS. */
function rezKancelare() {
  const zem = 450, x0 = 130, x1 = 540, patra = 7, h = 44, t = 6, sklep = 66;
  const vrch = zem - patra * h;
  const jadroX = 300, vytahX = 340, vytahW = 36;
  let s = "";
  s += terenRezu(0, 680, zem, x0, x1, sklep);
  s += strom(40, zem, 0.8) + strom(620, zem, 0.9);
  s += `<g class="rez-auto"><path d="M60 ${zem}"/></g>`;
  s += stena(x0, vrch - 10, zem + sklep, 8) + stena(x1 - 8, vrch - 10, zem + sklep, 8);
  for (let p = 0; p <= patra; p += 1) s += srafaDesky(x0, x1, zem - p * h - (p ? t : 0), t);
  s += srafaDesky(x0, x1, zem + sklep, t);
  s += stena(jadroX - 4, vrch, zem + sklep, 4) + stena(vytahX, vrch, zem + sklep, 4) + stena(vytahX + vytahW, vrch, zem + sklep, 4) + stena(vytahX + vytahW * 2 + 4, vrch, zem + sklep, 4);
  for (let p = 0; p < patra; p += 1) {
    const yPodlaha = zem - p * h - (p ? t : 0);
    const yStrop = zem - (p + 1) * h;
    s += okno(x0, yStrop + 6, 8, 32) + okno(x1 - 8, yStrop + 6, 8, 32);
    s += schody(jadroX + 2, vytahX - 2, yStrop + t, yPodlaha);
    s += `<circle class="rez-eps" cx="${x0 + 70}" cy="${yStrop + t + 3}" r="3"/><circle class="rez-eps" cx="${x1 - 70}" cy="${yStrop + t + 3}" r="3"/>`;
    s += `<rect class="rez-nouzove" x="${jadroX + 14}" y="${yStrop + t + 1}" width="10" height="4" rx="1"/>`;
    s += `<g class="rez-hasicak"><rect x="${jadroX + 4}" y="${yPodlaha - 18}" width="6" height="11" rx="2"/></g>`;
    // pracovní místa
    s += `<path class="rez-nabytek" d="M${x0 + 30} ${yPodlaha - 14}h40M${x0 + 34} ${yPodlaha - 14}v14M${x0 + 66} ${yPodlaha - 14}v14M${x1 - 110} ${yPodlaha - 14}h40M${x1 - 106} ${yPodlaha - 14}v14M${x1 - 74} ${yPodlaha - 14}v14"/>`;
  }
  s += kabina(vytahX + 4, vytahW - 4, zem, vrch + 30);
  s += `<rect class="rez-obrys" x="${vytahX - 4}" y="${vrch - 22}" width="${vytahW * 2 + 12}" height="22"/>`;
  // garáže
  s += `<g class="rez-auto"><path d="M${x0 + 30} ${zem + 58}h70l-8-14h-18l-8-8h-20l-10 8h-6z"/><circle cx="${x0 + 46}" cy="${zem + 58}" r="5"/><circle cx="${x0 + 86}" cy="${zem + 58}" r="5"/></g>`;
  s += `<g class="rez-rozvadec"><rect x="${x1 - 70}" y="${zem + 16}" width="26" height="42"/><path d="M${x1 - 65} ${zem + 24}h16M${x1 - 65} ${zem + 32}h16M${x1 - 65} ${zem + 40}h16"/></g>`;
  // střecha: VZT jednotky + chlazení
  s += `<g class="rez-vzt"><rect x="${x0 + 30}" y="${vrch - 34}" width="86" height="28" rx="2"/><circle cx="${x0 + 52}" cy="${vrch - 20}" r="9"/><circle cx="${x0 + 94}" cy="${vrch - 20}" r="9"/></g>`;
  s += `<g class="rez-chlazeni"><rect x="${x1 - 130}" y="${vrch - 24}" width="34" height="18"/><rect x="${x1 - 90}" y="${vrch - 24}" width="34" height="18"/><circle cx="${x1 - 113}" cy="${vrch - 15}" r="6"/><circle cx="${x1 - 73}" cy="${vrch - 15}" r="6"/></g>`;
  s += sit("vzt", `M${x0 + 72} ${vrch - 6}V${zem - 30}` + Array.from({ length: patra }, (_, p) => `M${x0 + 72} ${zem - p * h - h + 12}H${x1 - 180}`).join(""), "vzt");
  s += sit("chlazeni", `M${x1 - 100} ${vrch - 6}V${zem - 12}`, "chlazeni");
  s += sit("elektro", `M${x1 - 57} ${zem + 16}V${vrch + 14}`, "elektro");
  s += sit("hromosvod", `M${x1 - 30} ${vrch - 10}V${vrch - 62}M${x0 + 10} ${vrch - 12}H${x1 - 4}V${zem + 4}l10 18`, "hromosvod");
  s += `<path class="rez-jimac" d="M${x1 - 34} ${vrch - 62}h8"/>`;
  const bodPatro = (p) => zem - p * h - h / 2;
  s += bod("vzt", x0 + 73, vrch - 50, 1);
  s += bod("chlazeni", x1 - 93, vrch - 42, 2);
  s += bod("hromosvod", x1 - 10, vrch - 56, 3);
  s += bod("vytah", vytahX + 40, vrch - 36, 4);
  s += bod("eps", x0 + 70, bodPatro(5) - 4, 5);
  s += bod("nouzove-osvetleni", jadroX + 20, bodPatro(3) - 6, 6);
  s += bod("po", jadroX + 8, bodPatro(1) + 6, 7);
  s += bod("elektro", x1 - 34, zem + 72, 8);
  return { s, legenda: ["vzt", "chlazeni", "hromosvod", "vytah", "eps", "nouzove-osvetleni", "po", "elektro"] };
}

/** Škola s tělocvičnou: šikmá střecha, kotelna na plyn, hřiště. */
function rezSkola() {
  const zem = 450, x0 = 70, x1 = 380, patra = 3, h = 64, t = 7, sklep = 60;
  const vrch = zem - patra * h;
  const hrebenY = vrch - 74;
  const tx0 = 380, tx1 = 620, tvrch = zem - 128;
  let s = "";
  s += terenRezu(0, 680, zem, x0, x1, sklep);
  s += strom(30, zem, 0.8) + strom(650, zem, 0.7);
  s += stena(x0, vrch, zem + sklep, 10) + stena(x1 - 6, vrch, zem + sklep, 6);
  for (let p = 0; p <= patra; p += 1) s += srafaDesky(x0, x1, zem - p * h - (p ? t : 0), t);
  s += srafaDesky(x0, x1, zem + sklep, t);
  // krov
  s += `<path class="rez-krov" d="M${x0 - 14} ${vrch + 4}L${(x0 + x1) / 2} ${hrebenY}L${x1 + 14} ${vrch + 4}"/>`;
  s += `<path class="rez-krokve" d="M${x0 + 40} ${vrch - 6}l${((x0 + x1) / 2 - x0 - 40) * 0}  0"/>`;
  for (let i = 1; i < 6; i += 1) {
    const xx = x0 + ((x1 - x0) / 6) * i;
    const yy = vrch - (1 - Math.abs(xx - (x0 + x1) / 2) / ((x1 - x0) / 2 + 14)) * (vrch - hrebenY);
    s += `<path class="rez-krokve" d="M${r1(xx)} ${vrch}V${r1(yy + 4)}"/>`;
  }
  const jadroX = 200, jadroX2 = 250;
  s += stena(jadroX - 4, vrch, zem + sklep, 4) + stena(jadroX2, vrch, zem + sklep, 4);
  for (let p = 0; p < patra; p += 1) {
    const yPodlaha = zem - p * h - (p ? t : 0);
    const yStrop = zem - (p + 1) * h;
    s += okno(x0, yStrop + 14, 10, 34);
    s += schody(jadroX + 2, jadroX2 - 2, yStrop + t, yPodlaha);
    s += `<circle class="rez-eps" cx="${x0 + 70}" cy="${yStrop + t + 3}" r="3"/><circle class="rez-eps" cx="${x1 - 60}" cy="${yStrop + t + 3}" r="3"/>`;
    s += `<rect class="rez-nouzove" x="${jadroX + 16}" y="${yStrop + t + 1}" width="10" height="4" rx="1"/>`;
    s += `<g class="rez-hasicak"><rect x="${jadroX + 4}" y="${yPodlaha - 20}" width="6" height="12" rx="2"/></g>`;
    s += radiator(x0 + 18, yPodlaha - 22);
    s += `<path class="rez-nabytek" d="M${x0 + 60} ${yPodlaha - 16}h26M${x0 + 64} ${yPodlaha - 16}v16M${x0 + 82} ${yPodlaha - 16}v16M${x0 + 100} ${yPodlaha - 16}h26M${x0 + 104} ${yPodlaha - 16}v16M${x0 + 122} ${yPodlaha - 16}v16M${x1 - 100} ${yPodlaha - 34}h40v-8h-40z"/>`;
  }
  // tělocvična
  s += stena(tx1 - 8, tvrch, zem + 6, 8);
  s += `<path class="rez-krov" d="M${tx0 - 6} ${tvrch}Q${(tx0 + tx1) / 2} ${tvrch - 40} ${tx1 + 6} ${tvrch}"/>`;
  s += srafaDesky(tx0, tx1, zem, 7);
  s += okno(tx1 - 8, tvrch + 30, 8, 60);
  s += `<g class="rez-telocvicna"><path d="M${tx0 + 40} ${zem}V${zem - 70}h18M${tx1 - 40} ${zem}V${zem - 70}h-18"/><circle cx="${tx0 + 64}" cy="${zem - 62}" r="7"/><circle cx="${tx1 - 64}" cy="${zem - 62}" r="7"/><path d="M${(tx0 + tx1) / 2} ${zem}v-6"/></g>`;
  s += `<g class="rez-vzt"><rect x="${tx0 + 20}" y="${tvrch + 4}" width="56" height="20" rx="2"/><circle cx="${tx0 + 36}" cy="${tvrch + 14}" r="6"/></g>`;
  s += sit("vzt", `M${tx0 + 76} ${tvrch + 14}H${tx1 - 30}`, "vzt");
  // kotelna, plyn, komín
  s += `<g class="rez-kotel"><rect x="${x0 + 30}" y="${zem + 12}" width="40" height="42" rx="3"/><path d="M${x0 + 38} ${zem + 24}h24M${x0 + 38} ${zem + 32}h24"/><circle cx="${x0 + 50}" cy="${zem + 44}" r="5"/></g>`;
  s += `<g class="rez-nadoba"><rect x="${x0 + 82}" y="${zem + 20}" width="16" height="34" rx="8"/></g>`;
  s += `<g class="rez-hup"><rect x="30" y="${zem - 30}" width="20" height="24" rx="2"/><path d="M36 ${zem - 18}h8"/></g>`;
  s += sit("plyn", `M40 ${zem - 6}V${zem + 6}H${x0 + 50}V${zem + 12}`, "plyn");
  s += sit("spaliny", `M${x0 + 70} ${zem + 18}H${x0 + 140}V${hrebenY + 30}`, "spaliny");
  s += `<rect class="rez-komin" x="${x0 + 134}" y="${hrebenY + 20}" width="12" height="40"/>`;
  s += sit("teplo", `M${x0 + 70} ${zem + 30}H${x0 + 150}V${vrch + 20}` + Array.from({ length: patra }, (_, p) => `M${x0 + 150} ${zem - p * h - 16}H${x0 + 40}`).join(""), "kotelna");
  s += `<g class="rez-rozvadec"><rect x="${x1 - 60}" y="${zem + 14}" width="24" height="38"/><path d="M${x1 - 55} ${zem + 22}h14M${x1 - 55} ${zem + 30}h14M${x1 - 55} ${zem + 38}h14"/></g>`;
  s += sit("elektro", `M${x1 - 48} ${zem + 14}V${vrch + 14}`, "elektro");
  s += sit("hromosvod", `M${(x0 + x1) / 2} ${hrebenY}V${hrebenY - 40}M${x0 - 10} ${vrch + 2}L${(x0 + x1) / 2} ${hrebenY - 2}L${x1 + 10} ${vrch + 2}M${tx1} ${tvrch}V${zem + 4}l10 18`, "hromosvod");
  s += `<path class="rez-jimac" d="M${(x0 + x1) / 2 - 4} ${hrebenY - 40}h8"/>`;
  const bodPatro = (p) => zem - p * h - h / 2;
  s += bod("hromosvod", (x0 + x1) / 2 + 22, hrebenY - 36, 1);
  s += bod("spaliny", x0 + 140, hrebenY + 6, 2);
  s += bod("vzt", tx0 + 48, tvrch + 42, 3);
  s += bod("eps", x0 + 70, bodPatro(2) - 8, 4);
  s += bod("nouzove-osvetleni", jadroX + 22, bodPatro(1) - 12, 5);
  s += bod("po", jadroX + 8, bodPatro(0) + 8, 6);
  s += bod("kotelna", x0 + 50, zem + 70, 7);
  s += bod("plyn", 40, zem - 50, 8);
  s += bod("elektro", x1 - 24, zem + 66, 9);
  return { s, legenda: ["hromosvod", "spaliny", "vzt", "eps", "nouzove-osvetleni", "po", "kotelna", "plyn", "elektro"] };
}

export const SCENY = [
  { id: "bytovy", nazev: "Bytový dům", fn: rezBytovy },
  { id: "kancelare", nazev: "Kanceláře", fn: rezKancelare },
  { id: "skola", nazev: "Škola", fn: rezSkola },
];

export function rez() {
  const vrstvy = SCENY.map((sc, i) => {
    const { s, legenda } = sc.fn();
    return `<g class="rez-scena${i === 0 ? " je-aktivni" : ""}" data-scena="${sc.id}" data-legenda="${legenda.join(",")}">${s}</g>`;
  }).join("");
  return `<svg class="rez" viewBox="0 0 680 540" role="img" aria-label="Řez budovou s technologiemi, které spravujeme">
    <defs>
      <pattern id="srafa" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0v6" class="rez-srafa"/></pattern>
    </defs>
    ${vrstvy}
  </svg>`;
}
