"""Akceptační test C-025 – src/lib/rozpocet.mjs se musí chovat přesně jako reference/bypalda/rozpocet.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

TEXTY = ["50 000 Kč", "50000", "do 100 tis.", "kolem 1,5 mil.", "cca 2 mil Kč", "1 mld", "1 miliarda", "30–40 tis. Kč", "20–50 000", "20 - 50 000 Kč",
         "rozpočet 250 000,- Kč", "max 80 000", "nevím", "", "15 000 až 20 000", "1,2 MIL.", "120 000 Kč", "3 500 Kč", "nejvýš 10 tisíc", "0", "12,5 tis", "asi 300 tisíc měsíčně",
         "100 000 Kč za rok, 8 000 měsíčně", "2.5 mil"]

def test_rozpocet():
    porovnej("rozpocet.mjs", "rozpocet.php", [["rozpocetHalere", [t]] for t in TEXTY])

