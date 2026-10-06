// Kontrakt C-019 – tabulky a vzorečky z normy QR pro úroveň opravy M
// (verze 1 až 20, bajtový režim). Převod z reference/bypalda/qr/tabulky.php.

/**
 * Hrana symbolu v modulech: 4 * verze + 17.
 */
export function qrVelikost(verze) {
    return 4 * verze + 17;
}

/**
 * Celkový počet kódových slov (data + opravné kódy) pro verzi 1–20, úroveň M.
 * Mimo rozsah vrací 0.
 */
export function qrCelkemKodu(verze) {
    const t = [26, 44, 70, 100, 134, 172, 196, 242, 292, 346, 404, 466, 532, 581, 655, 733, 815, 901, 991, 1085];
    if (verze < 1 || verze > 20) {
        return 0;
    }
    return t[verze - 1];
}

/**
 * Počet opravných kódů celkem pro verzi 1–20, úroveň M. Mimo rozsah vrací 0.
 */
export function qrEcKodu(verze) {
    const t = [10, 16, 26, 36, 48, 64, 72, 88, 110, 130, 150, 176, 198, 216, 240, 280, 308, 338, 364, 416];
    if (verze < 1 || verze > 20) {
        return 0;
    }
    return t[verze - 1];
}

/**
 * Počet bloků pro verzi 1–20, úroveň M. Mimo rozsah vrací 0.
 */
export function qrBloku(verze) {
    const t = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16];
    if (verze < 1 || verze > 20) {
        return 0;
    }
    return t[verze - 1];
}

/**
 * Rozdělení na bloky v pořadí: každý blok jako {dat, ec}.
 * Prvních (bloku - celkem % bloku) bloků má dat1 datových kódů, zbytek dat1 + 1.
 * Opravných kódů je na blok stejně: Math.floor(celkem / bloku) - dat1.
 * Mimo rozsah vrací prázdné pole.
 *
 * @returns {Array<{dat: number, ec: number}>}
 */
export function qrRozdeleniBloku(verze) {
    const celkem = qrCelkemKodu(verze);
    const ecCelkem = qrEcKodu(verze);
    const bloku = qrBloku(verze);
    if (celkem === 0 || ecCelkem === 0 || bloku === 0) {
        return [];
    }
    const vDruhSkupine = celkem % bloku;
    const vPrvniSkupine = bloku - vDruhSkupine;
    const dat1 = Math.floor((celkem - ecCelkem) / bloku);
    const dat2 = dat1 + 1;
    const ec = Math.floor(celkem / bloku) - dat1;

    const bloky = [];
    for (let i = 0; i < bloku; i++) {
        bloky.push({dat: i < vPrvniSkupine ? dat1 : dat2, ec});
    }
    return bloky;
}

/**
 * Souřadnice středů zarovnávacích vzorů vzestupně. Verze 1 → prázdné pole.
 *
 * @returns {number[]}
 */
export function qrZarovnani(verze) {
    if (verze < 2) {
        return [];
    }
    const pocet = Math.floor(verze / 7) + 2;
    const velikost = qrVelikost(verze);
    const krok = (velikost === 145) ? 26 : Math.ceil((velikost - 13) / (2 * pocet - 2)) * 2;

    const souradnice = [velikost - 7];
    for (let i = 1; i < pocet - 1; i++) {
        souradnice.push(souradnice[souradnice.length - 1] - krok);
    }
    souradnice.reverse();
    souradnice.unshift(6);
    return souradnice;
}

/**
 * 15 bitů informace o formátu (úroveň M, maska 0–7): BCH přes polynom
 * 0b10100110111, výsledek XOR maska 0b101010000010010.
 */
export function qrFormatBity(maska) {
    const data = (0b00 << 3) | (maska & 0b111);
    let hodnota = data << 10;
    const generator = 0b10100110111;
    // dělení polynomem v GF(2): zbytek po dělení generátorem
    for (let i = 14; i >= 10; i--) {
        if ((hodnota & (1 << i)) !== 0) {
            hodnota ^= generator << (i - 10);
        }
    }
    return ((data << 10) | hodnota) ^ 0b101010000010010;
}

/**
 * 18 bitů informace o verzi; pro verze < 7 vrací 0.
 * Verze << 12 plus zbytek po dělení polynomem 0b1111100100101.
 */
export function qrVerzeBity(verze) {
    if (verze < 7) {
        return 0;
    }
    let hodnota = verze << 12;
    const generator = 0b1111100100101;
    // stupeň generátoru je 12
    for (let i = 17; i >= 12; i--) {
        if ((hodnota & (1 << i)) !== 0) {
            hodnota ^= generator << (i - 12);
        }
    }
    return (verze << 12) | hodnota;
}

/**
 * Nejmenší verze 1–20, do které se v bajtovém režimu vejde $bajtu bajtů.
 * Hlavička: 4 bity režimu + 8 bitů délka (verze 1–9) / 16 bitů (verze 10–20).
 * Když se údaj nevejde do žádné verze, vrací 0.
 */
export function qrNejmensiVerze(bajtu) {
    for (let verze = 1; verze <= 20; verze++) {
        const hlavickaBitu = 4 + (verze <= 9 ? 8 : 16);
        const kapacitaBitu = (qrCelkemKodu(verze) - qrEcKodu(verze)) * 8;
        if (hlavickaBitu + bajtu * 8 <= kapacitaBitu) {
            return verze;
        }
    }
    return 0;
}
