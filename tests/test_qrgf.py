"""Akceptační test C-018 – src/lib/qrgf.mjs se musí chovat přesně jako reference/bypalda/qr/gf.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

def test_gf_a_rs():
    v = [["gfExp", [i]] for i in (0, 1, 7, 8, 254, 255, 300)] + [["gfLog", [x]] for x in (1, 2, 3, 29, 255)]
    v += [["gfMul", [a, b]] for a, b in ((0, 5), (3, 7), (255, 255), (29, 76), (1, 200))]
    v += [["rsGenerator", [n]] for n in (7, 10, 16, 26, 28)]
    v += [["rsKody", [d, n]] for d, n in (([32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17], 10), (list(range(1, 20)), 7), ([0] * 5, 4), ([255, 1, 2, 3], 16))]
    v += [["gfTabulky", []]]
    porovnej("qrgf.mjs", "qr/gf.php", v)

