"""Akceptační test C-023 – src/lib/ares.mjs se musí chovat přesně jako reference/bypalda/ares.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

S1 = {"ico": "02911973", "obchodniJmeno": "FOFRMONT CZ s.r.o.", "dic": " cz02911973 ", "sidlo": {"nazevObce": "Praha", "nazevUlice": "Roháčova", "cisloDomovni": 145, "cisloOrientacni": "14", "psc": 13000, "kodStatu": "CZ"},
      "adresaDorucovaci": {"radekAdresy1": "Roháčova 145/14", "radekAdresy2": "Žižkov", "radekAdresy3": "130 00 Praha 3"}}
S2 = {"ico": "19667531", "obchodniJmeno": "Green Air Tech s.r.o.", "sidlo": {"nazevObce": "Praha", "cisloDomovni": "394", "psc": "18000"}}
S3 = {"ico": 12345678, "sidlo": {"nazevObce": "Lhota", "nazevUlice": "  ", "cisloDomovni": "7", "psc": "1800"}}
S4 = {}

def test_ares():
    v = [["aresPsc", [p]] for p in (17000, "17000", "170 00", "1700", None, "abcde", 1234567)]
    v += [["aresSubjekt", [s]] for s in (S1, S2, S3, S4)]
    v += [["aresSeznam", [o]] for o in ({"ekonomickeSubjekty": [S1, S2, "nic", S3]}, {"pocetCelkem": 0}, {"ekonomickeSubjekty": "x"})]
    porovnej("ares.mjs", "ares.php", v)

