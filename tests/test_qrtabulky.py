"""Akceptační test C-019 – src/lib/qrtabulky.mjs se musí chovat přesně jako reference/bypalda/qr/tabulky.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

def test_tabulky():
    verze = [1, 2, 6, 7, 10, 14, 20, 27, 34, 40]
    v = []
    for f in ("qrVelikost", "qrCelkemKodu", "qrEcKodu", "qrBloku", "qrRozdeleniBloku", "qrZarovnani", "qrVerzeBity"):
        v += [[f, [n]] for n in verze if not (f == "qrVerzeBity" and n < 7)]
    v += [["qrFormatBity", [m]] for m in range(8)]
    v += [["qrNejmensiVerze", [b]] for b in (0, 1, 14, 15, 26, 100, 200, 500, 1000, 2331, 2332, 5000)]
    porovnej("qrtabulky.mjs", "qr/tabulky.php", v)

