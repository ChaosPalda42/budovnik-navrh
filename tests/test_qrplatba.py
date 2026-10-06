"""Akceptační test C-017 – src/lib/qrplatba.mjs se musí chovat přesně jako reference/bypalda/qr.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

def test_iban_a_spd():
    ucty = ["19-2000145399/0800", "2000145399/0800", "000000-2000145399/0800", "123/0100", "CZ65 0800 0000 1920 0014 5399", "2000145399", "", "1-2/3", "abc/0800"]
    v = [["iban", [u]] for u in ucty]
    v += [["qrPlatbaText", [d]] for d in [
        {"ucet": "2000145399/0800", "castka": 1234550, "vs": "20260007", "splatnost": "2026-10-21", "zprava": "Faktura FA20260007 – správa domu Lipová"},
        {"ucet": "19-2000145399/0800", "castka": 0, "zprava": "Žluťoučký kůň * úpěl ďábelské ódy   a\tdalší text, který je delší než šedesát znaků celkem určitě"},
        {"ucet": "", "castka": 100},
        {"ucet": "2000145399/0800", "castka": 5, "vs": "  ", "splatnost": "", "zprava": ""},
        {"ucet": "2000145399/0800", "castka": 100000, "zprava": "„Uvozovky“ ‘a’ — pomlčky"},
    ]]
    v += [["czBezDiakritiky", [t]] for t in ["Příliš žluťoučký kůň úpěl ďábelské ódy", "ŘÍŠE ŮŽASNÁ", "bez", ""]]
    porovnej("qrplatba.mjs", "qr.php", v)

