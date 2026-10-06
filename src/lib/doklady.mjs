// Kontrakt C-014 – součty dokladu (převod reference/bypalda/vypocty.php).
// Peníze jsou celá čísla v halířích, množství může být desetinné.

/** Zaokrouhlení jako PHP round(): na nejbližší, půlky od nuly. */
function phpRound(x) {
  return Math.sign(x) * Math.round(Math.abs(x));
}

/**
 * Součet jednoho řádku dokladu v halířích.
 * Chybějící 'mnozstvi' nebo 'cena' se bere jako 0.
 */
export function soucetPolozky(polozka) {
  const mnozstvi = polozka?.mnozstvi ?? 0;
  const cena = polozka?.cena ?? 0;

  return Math.trunc(phpRound(Number(mnozstvi) * Number(cena)));
}

/**
 * Součty celého dokladu.
 * @param {Array<object>} polozky
 * @param {boolean} platceDph
 * @returns {{zaklad:number, dph:number, celkem:number, sazby:object}}
 */
export function souctyDokladu(polozky, platceDph) {
  let zaklad = 0;
  let dph = 0;
  const sazby = {};

  for (const polozka of polozky) {
    const radek = soucetPolozky(polozka);
    zaklad += radek;

    if (!platceDph) {
      continue;
    }

    const sazba = Math.trunc(Number(polozka?.dph ?? 0));
    const dphRadku = Math.trunc(phpRound((radek * sazba) / 100));
    dph += dphRadku;

    if (!(sazba in sazby)) {
      sazby[sazba] = { zaklad: 0, dph: 0 };
    }
    sazby[sazba].zaklad += radek;
    sazby[sazba].dph += dphRadku;
  }

  const vysledneSazby = platceDph ? sazby : {};

  return {
    zaklad,
    dph,
    celkem: zaklad + dph,
    sazby: vysledneSazby,
  };
}
