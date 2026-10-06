// Kontrakt C-020 – z textu vytvoří kódová slova QR kódu (vždy bajtový
// režim 0b0100, úroveň opravy M) – nejdřív samotná datová slova, potom
// včetně Reed–Solomonových opravných kódů a proložení bloků.
// Převod z reference/bypalda/qr/bity.php.

import { rsKody } from "./qrgf.mjs";
import { qrCelkemKodu, qrEcKodu, qrRozdeleniBloku } from "./qrtabulky.mjs";

/**
 * Datová kódová slova (bajty 0–255) před opravnými kódy, vyplněná
 * až do konce kapacity verze.
 *
 * Postup proudu bitů:
 *  - 4 bity režimu (0b0100 = bajtový),
 *  - délka textu v bajtech na 8 bitů (verze 1–9) nebo 16 bitů (verze 10+),
 *  - každý bajt textu na 8 bitech,
 *  - pokud se ještě vejde, až 4 nulové bity ukončení,
 *  - doplnění nulami na celý bajt,
 *  - zbytek kapacity střídavě bajty 236 a 17 (první je 236).
 *
 * Kapacita je (qrCelkemKodu(verze) - qrEcKodu(verze)) kódových slov.
 *
 * @returns {number[]}
 */
export function qrDatovaSlova(text, verze) {
  const kapacita = qrCelkemKodu(verze) - qrEcKodu(verze);
  const bajty = new TextEncoder().encode(text);

  const bity = [];

  // 4 bity režimu: bajtový (0b0100)
  for (const bit of [0, 1, 0, 0]) {
    bity.push(bit);
  }

  // délka textu v bajtech: 8 bitů pro verze 1–9, jinak 16 bitů
  const delkaBitu = verze <= 9 ? 8 : 16;
  const delka = bajty.length;
  for (let i = delkaBitu - 1; i >= 0; i--) {
    bity.push((delka >> i) & 1);
  }

  // data: každý bajt na 8 bitech
  for (const bajt of bajty) {
    for (let i = 7; i >= 0; i--) {
      bity.push((bajt >> i) & 1);
    }
  }

  // ukončení: až 4 nulové bity, pokud se ještě vejdou
  const pocetUkonceni = Math.min(4, kapacita * 8 - bity.length);
  for (let i = 0; i < pocetUkonceni; i++) {
    bity.push(0);
  }

  // doplnit nulami do celého bajtu
  while (bity.length % 8 !== 0) {
    bity.push(0);
  }

  const slova = [];
  for (let i = 0; i < bity.length; i += 8) {
    let hodnota = 0;
    for (let j = 0; j < 8; j++) {
      hodnota = (hodnota << 1) | bity[i + j];
    }
    slova.push(hodnota);
  }

  // zbytek kapacity vyplnit střídavě 236 a 17
  const vypln = [236, 17];
  let i = 0;
  while (slova.length < kapacita) {
    slova.push(vypln[i % 2]);
    i++;
  }

  return slova;
}

/**
 * Hotová kódová slova k rozmístění do matice: datová slova rozdělená
 * na bloky podle qrRozdeleniBloku(), ke každému bloku Reed–Solomonovy
 * opravné kódy a všechno proložené po jednom slovu z bloku
 * (nejdřív data, za tím opravné kódy).
 *
 * Výsledek má přesně qrCelkemKodu(verze) čísel.
 *
 * @returns {number[]}
 */
export function qrKodovaSlova(text, verze) {
  const datova = qrDatovaSlova(text, verze);

  const datBloky = [];
  const ecBloky = [];

  let offset = 0;
  for (const blok of qrRozdeleniBloku(verze)) {
    const data = datova.slice(offset, offset + blok.dat);
    offset += blok.dat;
    datBloky.push(data);
    ecBloky.push(rsKody(data, blok.ec));
  }

  let maxDat = 0;
  let maxEc = 0;
  for (const blok of datBloky) {
    maxDat = Math.max(maxDat, blok.length);
  }
  for (const blok of ecBloky) {
    maxEc = Math.max(maxEc, blok.length);
  }

  const vysledek = [];

  // proložená datová slova: nejdřív první z každého bloku, pak druhé…
  for (let i = 0; i < maxDat; i++) {
    for (const blok of datBloky) {
      if (i < blok.length) {
        vysledek.push(blok[i]);
      }
    }
  }

  // proložené opravné kódy, stejným způsobem
  for (let i = 0; i < maxEc; i++) {
    for (const blok of ecBloky) {
      if (i < blok.length) {
        vysledek.push(blok[i]);
      }
    }
  }

  return vysledek;
}
