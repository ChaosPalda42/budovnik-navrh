/** Kostra demo aplikací. Obsah vykresluje src/ui/demo.js nad daty z data/demo.json a logikou z src/lib. */
import { ikona } from "./ikony.mjs";
import { IKONY } from "./ikony.mjs";

export function aplikace(druh) {
  // sada ikon pro klienta, aby demo.js nemuselo nést vlastní kresby
  const sada = Object.fromEntries(IKONY.map((j) => [j, ikona(j, { velikost: 18 })]));
  return `<div class="demo" data-demo="${druh}">
    <noscript><div class="obal" style="padding:40px 0">Demo potřebuje zapnutý JavaScript.</div></noscript>
    <div data-demo-koren></div>
  </div>
  <script type="application/json" id="demo-ikony">${JSON.stringify(sada).replace(/</g, "\\u003c")}</script>`;
}
