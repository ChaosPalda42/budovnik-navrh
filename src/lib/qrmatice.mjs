// Kontrakt C-021 – matice QR kódu: pevné vzory, rozmístění dat, maskování
// a výběr nejlepší masky. Převod z reference/bypalda/qr/matice.php.
//
// Pořadí kroků je závazné a odpovídá normě:
//   1. hledáčky s oddělovači, časovací řady, zarovnávací vzory
//   2. místa pro informaci o formátu (a u verzí 7+ o verzi) se REZERVUJÍ
//      ještě před daty, jinak by se data nasypala i tam
//   3. data po dvousloupcích zprava doleva, cikcak
//   4. maska jen na nerezervované moduly
//   5. skutečná informace o formátu až nakonec
//
// Matice je pole řádků, každý řádek pole 0/1: m[radek][sloupec].

import { qrVelikost, qrZarovnani, qrFormatBity, qrVerzeBity } from "./qrtabulky.mjs";

/** Překlápí maska tenhle modul? */
export function qrMaskaPlati(maska, r, s) {
    switch (maska) {
        case 0: return (r + s) % 2 === 0;
        case 1: return r % 2 === 0;
        case 2: return s % 3 === 0;
        case 3: return (r + s) % 3 === 0;
        case 4: return (Math.floor(r / 2) + Math.floor(s / 3)) % 2 === 0;
        case 5: return (r * s) % 2 + (r * s) % 3 === 0;
        case 6: return ((r * s) % 2 + (r * s) % 3) % 2 === 0;
        default: return ((r + s) % 2 + (r * s) % 3) % 2 === 0;
    }
}

/**
 * Pevné vzory. Vrací [matice, rezervace] – rezervace říká, kam se nesmí
 * sypat data ani sahat maskou.
 */
export function qrPevneVzory(verze) {
    const n = qrVelikost(verze);
    const m = Array.from({length: n}, () => new Array(n).fill(0));
    const rez = Array.from({length: n}, () => new Array(n).fill(false));

    const poloz = (r, s, hodnota) => {
        if (r >= 0 && r < n && s >= 0 && s < n) {
            m[r][s] = hodnota;
            rez[r][s] = true;
        }
    };

    // Hledáčky i s bílým oddělovačem okolo (proto -1 až 7)
    for (const [r0, s0] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
        for (let r = -1; r <= 7; r++) {
            for (let s = -1; s <= 7; s++) {
                const tmavy = (r >= 0 && r <= 6 && (s === 0 || s === 6))
                    || (s >= 0 && s <= 6 && (r === 0 || r === 6))
                    || (r >= 2 && r <= 4 && s >= 2 && s <= 4);
                poloz(r0 + r, s0 + s, tmavy ? 1 : 0);
            }
        }
    }

    // Časovací řady (mezi hledáčky)
    for (let i = 8; i < n - 8; i++) {
        poloz(i, 6, i % 2 === 0 ? 1 : 0);
        poloz(6, i, i % 2 === 0 ? 1 : 0);
    }

    // Zarovnávací vzory – kromě tří kombinací, které by padly na hledáčky
    const sour = qrZarovnani(verze);
    const posl = sour.length - 1;
    for (let i = 0; i < sour.length; i++) {
        for (let j = 0; j < sour.length; j++) {
            if ((i === 0 && j === 0) || (i === 0 && j === posl) || (i === posl && j === 0)) {
                continue;
            }
            for (let r = -2; r <= 2; r++) {
                for (let s = -2; s <= 2; s++) {
                    const tmavy = r === -2 || r === 2 || s === -2 || s === 2 || (r === 0 && s === 0);
                    poloz(sour[i] + r, sour[j] + s, tmavy ? 1 : 0);
                }
            }
        }
    }

    return [m, rez];
}

/** Zapíše 15 bitů informace o formátu (a rovnou je rezervuje). */
export function qrZapisFormat(m, rez, verze, maska) {
    const n = qrVelikost(verze);
    const bity = qrFormatBity(maska);
    for (let i = 0; i < 15; i++) {
        const bit = (bity >> i) & 1;
        // svislá kopie u levého horního hledáčku, zbytek dole vlevo
        if (i < 6) {
            m[i][8] = bit;
            rez[i][8] = true;
        } else if (i < 8) {
            m[i + 1][8] = bit;
            rez[i + 1][8] = true;
        } else {
            m[n - 15 + i][8] = bit;
            rez[n - 15 + i][8] = true;
        }
        // vodorovná kopie
        if (i < 8) {
            m[8][n - i - 1] = bit;
            rez[8][n - i - 1] = true;
        } else if (i < 9) {
            m[8][15 - i] = bit;
            rez[8][15 - i] = true;
        } else {
            m[8][14 - i] = bit;
            rez[8][14 - i] = true;
        }
    }
    // Tmavý modul – je tam vždycky, ať maska dopadne jakkoli
    m[n - 8][8] = 1;
    rez[n - 8][8] = true;
}

/** Zapíše 18 bitů informace o verzi (jen verze 7 a vyšší). */
export function qrZapisVerzi(m, rez, verze) {
    if (verze < 7) {
        return;
    }
    const n = qrVelikost(verze);
    const bity = qrVerzeBity(verze);
    for (let i = 0; i < 18; i++) {
        const bit = (bity >> i) & 1;
        const r = Math.floor(i / 3);
        const s = i % 3 + n - 11;
        m[r][s] = bit;
        rez[r][s] = true;
        m[s][r] = bit;
        rez[s][r] = true;
    }
}

/** Nasype kódová slova do volných modulů: dvousloupce zprava, cikcak. */
export function qrZapisData(m, rez, kodovaSlova, verze) {
    const n = qrVelikost(verze);
    let smer = -1;
    let radek = n - 1;
    let bit = 7;
    let bajt = 0;

    for (let s = n - 1; s > 0; s -= 2) {
        if (s === 6) {
            s--;           // sloupec 6 je časovací
        }
        while (true) {
            for (let c = 0; c < 2; c++) {
                if (!rez[radek][s - c]) {
                    let tmavy = 0;
                    if (bajt < kodovaSlova.length) {
                        tmavy = (kodovaSlova[bajt] >> bit) & 1;
                    }
                    m[radek][s - c] = tmavy;
                    bit--;
                    if (bit === -1) {
                        bajt++;
                        bit = 7;
                    }
                }
            }
            radek += smer;
            if (radek < 0 || radek >= n) {
                radek -= smer;
                smer = -smer;
                break;
            }
        }
    }
}

/** Překlopí nerezervované moduly podle masky (dvakrát = zpátky). */
export function qrPouzijMasku(m, rez, maska) {
    const n = m.length;
    for (let r = 0; r < n; r++) {
        for (let s = 0; s < n; s++) {
            if (!rez[r][s] && qrMaskaPlati(maska, r, s)) {
                m[r][s] ^= 1;
            }
        }
    }
}

/** Trestné skóre masky podle normy – čím míň, tím líp se to čte. */
export function qrTrestneSkore(m) {
    const n = m.length;
    let body = 0;

    // N1: souvislé řady pěti a víc stejných modulů
    for (let r = 0; r < n; r++) {
        let stejnycR = 0;
        let stejnycS = 0;
        let posledniR = -1;
        let posledniS = -1;
        for (let s = 0; s < n; s++) {
            const vRadku = m[r][s];
            if (vRadku === posledniR) {
                stejnycR++;
            } else {
                if (stejnycR >= 5) {
                    body += 3 + (stejnycR - 5);
                }
                posledniR = vRadku;
                stejnycR = 1;
            }
            const vSloupci = m[s][r];
            if (vSloupci === posledniS) {
                stejnycS++;
            } else {
                if (stejnycS >= 5) {
                    body += 3 + (stejnycS - 5);
                }
                posledniS = vSloupci;
                stejnycS = 1;
            }
        }
        if (stejnycR >= 5) {
            body += 3 + (stejnycR - 5);
        }
        if (stejnycS >= 5) {
            body += 3 + (stejnycS - 5);
        }
    }

    // N2: čtverce 2×2 stejné barvy
    let ctvercu = 0;
    for (let r = 0; r < n - 1; r++) {
        for (let s = 0; s < n - 1; s++) {
            const soucet = m[r][s] + m[r][s + 1] + m[r + 1][s] + m[r + 1][s + 1];
            if (soucet === 0 || soucet === 4) {
                ctvercu++;
            }
        }
    }
    body += ctvercu * 3;

    // N3: vzor 1011101 se čtyřmi světlými před nebo za (plete se s hledáčkem)
    let nalezu = 0;
    for (let r = 0; r < n; r++) {
        let oknoR = 0;
        let oknoS = 0;
        for (let s = 0; s < n; s++) {
            oknoR = ((oknoR << 1) & 0x7FF) | m[r][s];
            if (s >= 10 && (oknoR === 0x5D0 || oknoR === 0x05D)) {
                nalezu++;
            }
            oknoS = ((oknoS << 1) & 0x7FF) | m[s][r];
            if (s >= 10 && (oknoS === 0x5D0 || oknoS === 0x05D)) {
                nalezu++;
            }
        }
    }
    body += nalezu * 40;

    // N4: jak daleko je podíl tmavých modulů od poloviny
    let tmavych = 0;
    for (const radek of m) {
        for (const v of radek) {
            tmavych += v;
        }
    }
    const vsech = n * n;
    const k = Math.abs(Math.ceil((tmavych * 100) / vsech / 5) - 10);
    body += k * 10;

    return body;
}

/** Postaví matici s danou maskou (bez výběru). */
export function qrMaticeSMaskou(kodovaSlova, verze, maska) {
    const [m, rez] = qrPevneVzory(verze);
    // Formát se nejdřív jen rezervuje (hodnoty se přepíšou na konci),
    // aby se do jeho míst nenasypala data a nesáhla na ně maska.
    qrZapisFormat(m, rez, verze, maska);
    qrZapisVerzi(m, rez, verze);
    qrZapisData(m, rez, kodovaSlova, verze);
    qrPouzijMasku(m, rez, maska);
    qrZapisFormat(m, rez, verze, maska);
    return m;
}

/** Vybere masku s nejnižším trestným skóre (0–7). */
export function qrNejlepsiMaska(kodovaSlova, verze) {
    let nejlepsi = 0;
    let nejnizsi = Number.MAX_SAFE_INTEGER;
    for (let maska = 0; maska < 8; maska++) {
        const skore = qrTrestneSkore(qrMaticeSMaskou(kodovaSlova, verze, maska));
        if (skore < nejnizsi) {
            nejnizsi = skore;
            nejlepsi = maska;
        }
    }
    return nejlepsi;
}

/** Postaví matici; bez masky vybere tu nejlepší. */
export function qrMatice(kodovaSlova, verze, maska = null) {
    if (maska === null) {
        maska = qrNejlepsiMaska(kodovaSlova, verze);
    }
    return qrMaticeSMaskou(kodovaSlova, verze, maska);
}
