"""Akceptační test C-016 – src/lib/ico.mjs se musí chovat přesně jako reference/bypalda/ico.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

def test_ico_dic():
    ico = ["02911973", "2911973", "029 119 73", "19667531", "00000019", "12345678", "1234567890", "abc", "", "25596641", "45274649", "00006947"]
    dic = ["CZ02911973", "cz 02911973", " CZ02911974 ", "CZ8501011234", "CZ850101123", "CZ12345", "SK2020202020", "CZ", "", "CZ19667531 "]
    porovnej("ico.mjs", "ico.php", [["normalizujIco", [i]] for i in ico] + [["platneIco", [i]] for i in ico] + [["platneDic", [d]] for d in dic])

