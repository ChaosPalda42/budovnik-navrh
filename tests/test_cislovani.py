"""Akceptační test C-015 – src/lib/cislovani.mjs se musí chovat přesně jako reference/bypalda/cislovani.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

FORMATY = ["FA{rok}{poradi4}", "NAB{rok}{poradi3}", "PF-{rok2}-{mesic}-{poradi}", "{rok}/{poradi5}", "Z{poradi2}.{rok}", "BEZ-PORADI-{rok}", "{poradi}", "a.b+c(x){rok2}{poradi3}"]

def test_vyrob_a_cti():
    v = []
    for f in FORMATY:
        for d, p in [("2026-10-07", 7), ("2027-01-02", 1234), ("2026-03-31", 99999)]:
            v.append(["vyrobCislo", [f, d, p]])
    v.append(["vyrobCislo", ["FA{rok}{poradi4}", "nesmysl", 3]])
    cisla = ["FA20260007", "FA2026123456", "NAB2026007", "PF-26-10-7", "2026/00007", "Z07.2026", "BEZ-PORADI-2026", "42", "a.b+c(x)26007", "FA2026", "XFA20260007", "fa20260007"]
    for c in cisla:
        for f in FORMATY:
            v.append(["poradiZCisla", [c, f]])
            v.append(["rokZCisla", [c, f]])
    porovnej("cislovani.mjs", "cislovani.php", v)

