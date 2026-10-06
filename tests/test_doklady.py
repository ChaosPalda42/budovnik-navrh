"""Akceptační test C-014 – src/lib/doklady.mjs se musí chovat přesně jako reference/bypalda/vypocty.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

POL = [{"mnozstvi": 2, "cena": 125050, "dph": 21}, {"mnozstvi": 1.5, "cena": 99999, "dph": 12}, {"mnozstvi": 0.333, "cena": 1001, "dph": 21},
       {"mnozstvi": 3, "cena": 5000, "dph": 0}, {"cena": 100}, {"mnozstvi": 10}, {"mnozstvi": "2,5", "cena": 100, "dph": 21}, {"mnozstvi": -1, "cena": 2505, "dph": 21}]

def test_polozky_a_soucty():
    v = [["soucetPolozky", [p]] for p in POL if p.get("mnozstvi") != "2,5"]
    v += [["souctyDokladu", [POL[:4], True]], ["souctyDokladu", [POL[:4], False]], ["souctyDokladu", [[], True]],
          ["souctyDokladu", [[POL[3]], True]], ["souctyDokladu", [[POL[7], POL[0]], True]], ["souctyDokladu", [[POL[1], POL[1], POL[2]], True]]]
    porovnej("doklady.mjs", "vypocty.php", v)

