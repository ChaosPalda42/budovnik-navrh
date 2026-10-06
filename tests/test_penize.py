"""Akceptační test C-012 – src/lib/penize.mjs se musí chovat přesně jako reference/bypalda/penize.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

VSTUPY = ["1500", "1 500", "1 500,50", "15 000 Kč", "12,5", "12.5", "1.500.000", "1,500,000", "-250,75", "+30",
          "12abc34", "", "kč", "0,005", "0,004", "99,999", "1.234,56", "1,234.56", "2 000 000 CZK", 15, 0, -3, 12.345, 0.1, 2.675]

def test_na_halere():
    porovnej("penize.mjs", "penize.php", [["naHalere", [v]] for v in VSTUPY])

def test_kc():
    hal = [0, 1, 99, 100, 150050, -150050, 123456789, -5, 1000000, 99999999]
    porovnej("penize.mjs", "penize.php", [["kc", [h]] for h in hal] + [["kc", [h, False]] for h in hal])

def test_kc_kratce():
    hal = [0, 4999950, 9999949, 9999950, 10000000, 12345678, 99949999, 99950000, 100000000, 123456789, 999949999, 1500000000, -12345678, -250000000, 100000049]
    porovnej("penize.mjs", "penize.php", [["kcKratce", [h]] for h in hal])

