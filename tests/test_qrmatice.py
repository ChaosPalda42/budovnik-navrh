"""Akceptační test C-021 – src/lib/qrmatice.mjs se musí chovat přesně jako reference/bypalda/qr/matice.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

from tests.phpref import REF, php

PRED = "require_once '%s';require_once '%s';require_once '%s';" % (REF / "qr/gf.php", REF / "qr/tabulky.php", REF / "qr/bity.php")

def slova(text, verze):
    return php("qr/bity.php", [["qrKodovaSlova", [text, verze]]], pred="require_once '%s';require_once '%s';" % (REF / "qr/gf.php", REF / "qr/tabulky.php"))[0]

def test_masky_a_vzory():
    v = [["qrMaskaPlati", [m, r, s]] for m in range(8) for r, s in ((0, 0), (1, 2), (5, 7), (10, 3))]
    v += [["qrPevneVzory", [n]] for n in (1, 2, 7)]
    porovnej("qrmatice.mjs", "qr/matice.php", v, pred=PRED)

def test_matice():
    s1, s5, s8 = slova("HELLO", 1), slova("SPD*1.0*ACC:CZ6508000000192000145399*AM:12345.50*CC:CZK*X-VS:20260007", 5), slova("Ahoj " * 20, 8)
    v = [["qrMaticeSMaskou", [s1, 1, m]] for m in range(8)]
    v += [["qrNejlepsiMaska", [s5, 5]], ["qrMatice", [s5, 5]], ["qrMatice", [s8, 8]], ["qrMatice", [s1, 1, 3]]]
    v += [["qrTrestneSkore", [php("qr/matice.php", [["qrMatice", [s5, 5]]], pred=PRED)[0]]]]
    porovnej("qrmatice.mjs", "qr/matice.php", v, pred=PRED)

