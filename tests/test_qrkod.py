"""Akceptační test C-022 – src/lib/qrkod.mjs se musí chovat přesně jako reference/bypalda/qrkod.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

def test_svg():
    v = [["qrSvg", [t, o]] for t, o in [
        ("HELLO", {}), ("SPD*1.0*ACC:CZ6508000000192000145399*AM:12345.50*CC:CZK*X-VS:20260007", {"velikost": 220, "okraj": 2}),
        ("Žluťoučký kůň", {"barva": "#15171a", "pozadi": ""}), ("x" * 120, {"znacka": "B&V"}), ("y" * 40, {"znacka": "BV"}), ("", {}), ("z" * 3000, {})]]
    porovnej("qrkod.mjs", "qrkod.php", v)

