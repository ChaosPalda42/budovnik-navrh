"""Akceptační test C-028 – src/lib/obchod.mjs. Hodnoty spočítané referenční implementací v Pythonu."""
from __future__ import annotations

import json

import pytest

FIX = json.loads('{"K": [{"id": "K1", "nazev": "SVJ Lipová", "vytvoreno": "2024-01-01", "stav": "aktivni", "pausal": true}, {"id": "K2", "nazev": "BD Jasmínová", "vytvoreno": "2026-08-15", "stav": "aktivni", "pausal": true}, {"id": "K3", "nazev": "Karlín Point", "vytvoreno": "2026-09-30", "stav": "potencialni", "pausal": false}, {"id": "K4", "nazev": "ZŠ", "vytvoreno": "2025-05-05", "stav": "byvaly", "pausal": true}], "D": [{"cislo": "FA1", "druh": "faktura", "klientId": "K1", "vystaveno": "2026-07-01", "splatnost": "2026-07-15", "uhrazeno": "2026-07-10", "celkem": 1644000}, {"cislo": "FA2", "druh": "faktura", "klientId": "K1", "vystaveno": "2026-08-01", "splatnost": "2026-08-15", "uhrazeno": "2026-09-02", "celkem": 1644000}, {"cislo": "FA3", "druh": "faktura", "klientId": "K2", "vystaveno": "2026-09-01", "splatnost": "2026-09-15", "uhrazeno": null, "celkem": 3450500}, {"cislo": "FA4", "druh": "faktura", "klientId": "K2", "vystaveno": "2026-10-01", "splatnost": "2026-10-15", "uhrazeno": null, "celkem": 3450500}, {"cislo": "FA5", "druh": "faktura", "klientId": "K9", "vystaveno": "2026-06-30", "splatnost": "2026-07-14", "uhrazeno": "2026-07-01", "celkem": 500000}, {"cislo": "FA6", "druh": "faktura", "klientId": "K3", "vystaveno": "2026-09-20", "splatnost": "2026-10-04", "uhrazeno": "2026-10-01", "celkem": 3288000}, {"cislo": "PF1", "druh": "proforma", "klientId": "K3", "vystaveno": "2026-09-10", "splatnost": "2026-09-20", "uhrazeno": null, "celkem": 999900}, {"cislo": "NA1", "druh": "nabidka", "klientId": "K3", "vystaveno": "2026-09-05", "splatnost": "2026-09-19", "uhrazeno": null, "celkem": 11040900}, {"cislo": "NA2", "druh": "nabidka", "klientId": "K4", "vystaveno": "2026-05-05", "splatnost": "2026-05-19", "uhrazeno": null, "celkem": 100}], "r": {"vystaveno": {"pocet": 4, "castka": 10026500}, "uhrazeno": {"pocet": 3, "castka": 3788000}, "kUhrade": {"pocet": 2, "castka": 6901000}, "poSplatnosti": {"pocet": 1, "castka": 3450500}, "nabidky": {"pocet": 1, "castka": 11040900}, "stali": 2, "novi": 2, "mesice": [{"mesic": "2026-07", "vystaveno": 1644000, "uhrazeno": 2144000}, {"mesic": "2026-08", "vystaveno": 1644000, "uhrazeno": 0}, {"mesic": "2026-09", "vystaveno": 6738500, "uhrazeno": 1644000}], "nejvetsi": [{"klientId": "K2", "nazev": "BD Jasmínová", "castka": 3450500}, {"klientId": "K1", "nazev": "SVJ Lipová", "castka": 3288000}, {"klientId": "K3", "nazev": "Karlín Point", "castka": 3288000}]}, "r2": {"vystaveno": {"pocet": 1, "castka": 3450500}, "uhrazeno": {"pocet": 1, "castka": 3288000}, "kUhrade": {"pocet": 2, "castka": 6901000}, "poSplatnosti": {"pocet": 1, "castka": 3450500}, "nabidky": {"pocet": 0, "castka": 0}, "stali": 2, "novi": 0, "mesice": [{"mesic": "2026-10", "vystaveno": 3450500, "uhrazeno": 3288000}], "nejvetsi": [{"klientId": "K2", "nazev": "BD Jasmínová", "castka": 3450500}]}, "m": [["2025-11", "2025-12", "2026-01", "2026-02"], []]}')


@pytest.fixture()
def js():
    from tests.jsmod import run_js

    def call(body, **args):
        return run_js("obchod.mjs", body, args=dict(args, K=FIX["K"], D=FIX["D"]))

    return call


def test_mesice(js):
    assert js('out([m.mesiceObdobi("2025-11-15", "2026-02-01"), m.mesiceObdobi("2026-03-01", "2026-02-01")]);') == FIX["m"]


def test_statistiky_obdobi(js):
    assert js('out(m.statistiky(A.D, A.K, "2026-07-01", "2026-09-30", "2026-10-07"));') == FIX["r"]


def test_statistiky_rijen(js):
    assert js('out(m.statistiky(A.D, A.K, "2026-10-01", "2026-10-31", "2026-10-07"));') == FIX["r2"]


def test_nemutuje(js):
    assert js('const d = JSON.parse(JSON.stringify(A.D)); m.statistiky(d, A.K, "2026-01-01", "2026-12-31", "2026-10-07"); out(d);') == FIX["D"]
