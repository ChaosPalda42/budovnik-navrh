"""Akceptační test C-024 – src/lib/vzory.mjs se musí chovat přesně jako reference/bypalda/vzory.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

VZOR = "Smlouva č. {cislo} mezi {klient_nazev} (IČO {klient_ico}) a {spravce}. {klient_nazev} platí {cena} Kč. {Velka} {nic_} {x-y}"

def test_vzory():
    udaje = [{"cislo": "SK-2027-001", "klient_nazev": "SVJ Lipová 1287", "klient_ico": "", "cena": "16 440"}, {}, {"cislo": "  ", "spravce": "Budovník s.r.o.", "nic_": "ok", "klient_nazev": "A {cena} B", "cena": "5"}, {"cena": 16440}]
    v = [["vyplnVzor", [VZOR, u]] for u in udaje] + [["znackyVeVzoru", [t]] for t in (VZOR, "bez značek", "{a}{a}{b}")]
    v += [["chybejiciZnacky", [VZOR, u]] for u in udaje]
    porovnej("vzory.mjs", "vzory.php", v)

