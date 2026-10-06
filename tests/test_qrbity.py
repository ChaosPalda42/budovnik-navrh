"""Akceptační test C-020 – src/lib/qrbity.mjs se musí chovat přesně jako reference/bypalda/qr/bity.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

TEXTY = [("HELLO", 1), ("SPD*1.0*ACC:CZ6508000000192000145399*AM:12345.50*CC:CZK*X-VS:20260007", 5), ("Žluťoučký kůň", 2), ("x" * 300, 14), ("a" * 30, 10)]

def test_slova():
    v = [["qrDatovaSlova", [t, n]] for t, n in TEXTY] + [["qrKodovaSlova", [t, n]] for t, n in TEXTY]
    porovnej("qrbity.mjs", "qr/bity.php", v, pred="require_once '%s';require_once '%s';" % tuple(str(__import__("tests.phpref", fromlist=["REF"]).REF / f) for f in ("qr/gf.php", "qr/tabulky.php")))

