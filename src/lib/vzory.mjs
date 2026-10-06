/**
 * Nahradí každou značku {klic} hodnotou z udaje. Chybějící nebo prázdná
 * hodnota se nahradí '……' (dva znaky U+2026). Hodnoty se dosazují tak,
 * jak jsou, a znovu se neprohledávají.
 */
export function vyplnVzor(vzor, udaje) {
  return vzor.replace(/\{([a-z0-9_]+)\}/g, (celo, klic) => {
    const hodnota = udaje[klic];
    if (typeof hodnota === 'string' && hodnota.trim() !== '') {
      return hodnota;
    }
    return '……';
  });
}

/**
 * Seznam značek použitých ve vzoru (bez závorek), v pořadí prvního výskytu
 * a bez opakování.
 */
export function znackyVeVzoru(vzor) {
  const znacky = [];
  const re = /\{([a-z0-9_]+)\}/g;
  let m;
  while ((m = re.exec(vzor)) !== null) {
    if (!znacky.includes(m[1])) {
      znacky.push(m[1]);
    }
  }
  return znacky;
}

/**
 * Značky ze vzoru, pro které v udaje není hodnota nebo je prázdná.
 */
export function chybejiciZnacky(vzor, udaje) {
  const chybejici = [];
  for (const klic of znackyVeVzoru(vzor)) {
    const hodnota = udaje[klic];
    if (typeof hodnota !== 'string' || hodnota.trim() === '') {
      chybejici.push(klic);
    }
  }
  return chybejici;
}
