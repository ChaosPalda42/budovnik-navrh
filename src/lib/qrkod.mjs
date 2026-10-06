// Kontrakt C-022 – hotový QR kód jako SVG obrázek.
// Převod z reference/bypalda/qrkod.php.
//
// Vykresluje matici do SVG: jeden <rect> na každý tmavý modul, klidová
// zóna, volitelné pozadí a volitelná značka uprostřed (jen pro dostatečně
// velké kódy – malé by značka znečitelna). Samotný text se do SVG nikdy
// nevypisuje – putuje výš do modulů, ne do HTML.

import { qrNejmensiVerze } from "./qrtabulky.mjs";
import { qrKodovaSlova } from "./qrbity.mjs";
import { qrMatice } from "./qrmatice.mjs";

/** htmlspecialchars s ENT_QUOTES: & < > " ' */
function htmlEntita(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * QR kód jako SVG (bajtový režim, úroveň opravy M).
 *
 * Volby:
 *  - 'velikost' strana obrázku v pixelech (výchozí 180),
 *  - 'okraj'    klidová zóna v modulech (výchozí 4),
 *  - 'barva'    barva tmavých modulů (výchozí '#000000'),
 *  - 'pozadi'   barva podkladu (výchozí '#ffffff'; prázdný řetězec = bez podkladu),
 *  - 'znacka'   krátký text doprostřed (výchozí '' = bez značky). Značka se
 *               kreslí jen pro matice od 33 modulů (verze 4+).
 *
 * Když je text prázdný nebo se nevejde do žádné verze, vrací ''.
 */
export function qrSvg(text, volby = {}) {
    if (text === "") {
        return "";
    }
    const bajtu = new TextEncoder().encode(text).length;
    const verze = qrNejmensiVerze(bajtu);
    if (verze === 0) {
        return "";
    }

    const velikost = Math.trunc(volby["velikost"] ?? 180);
    const okraj = Math.trunc(volby["okraj"] ?? 4);
    const barva = String(volby["barva"] ?? "#000000");
    const pozadi = String(volby["pozadi"] ?? "#ffffff");
    const znacka = String(volby["znacka"] ?? "");

    // Číslo do SVG: nejvýš dvě desetinná místa, zbytečné nuly nesmí zůstat.
    const cislo = (hodnota) => {
        let s = hodnota.toFixed(2);
        s = s.replace(/0+$/, "");
        s = s.replace(/\.$/, "");
        return s;
    };

    const kodovaSlova = qrKodovaSlova(text, verze);
    const m = qrMatice(kodovaSlova, verze);

    const nMatice = m.length;
    const n = nMatice + 2 * okraj;

    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + velikost + '" height="' + velikost
        + '" viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges"'
        + ' role="img" aria-label="QR kód pro platbu">';

    if (pozadi !== "") {
        svg += '<rect width="' + n + '" height="' + n + '" fill="' + pozadi + '"/>';
    }

    // Tmavé moduly: jeden <rect> za každý, po řádcích odshora.
    for (let radek = 0; radek < nMatice; radek++) {
        for (let sloupec = 0; sloupec < nMatice; sloupec++) {
            if (m[radek][sloupec] === 1) {
                svg += '<rect x="' + (sloupec + okraj) + '" y="' + (radek + okraj)
                    + '" width="1" height="1" fill="' + barva + '"/>';
            }
        }
    }

    // Značka uprostřed – jen kódy, které ji opravnými kódy unesou (verze 4+).
    if (znacka !== "" && nMatice >= 33) {
        let strana = Math.round(nMatice * 0.2);
        if (strana % 2 === 0) {
            strana++; // lichá strana, ať je pole přesně vycentrované
        }
        const x = okraj + Math.floor((nMatice - strana) / 2);
        const y = x;
        const stred = x + strana / 2;
        const vypln = pozadi !== "" ? pozadi : "#ffffff";

        svg += '<rect x="' + x + '" y="' + y + '" width="' + strana + '" height="' + strana
            + '" rx="0.6" fill="' + vypln + '" stroke="' + barva + '" stroke-width="0.12"/>';
        svg += '<text x="' + cislo(stred) + '" y="' + cislo(stred)
            + '" text-anchor="middle" dominant-baseline="central"'
            + ' font-family="system-ui, sans-serif" font-weight="700"'
            + ' font-size="' + cislo(strana * 0.46) + '" fill="' + barva + '">'
            + htmlEntita(znacka)
            + '</text>';
    }

    return svg + '</svg>';
}
