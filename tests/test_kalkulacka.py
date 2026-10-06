"""Akceptační test C-004 — src/lib/kalkulacka.mjs. Hodnoty spočítané referenční implementací v Pythonu."""
from __future__ import annotations

import pytest


@pytest.fixture()
def js():
    from tests.jsmod import run_js

    def call(body, **args):
        return run_js("kalkulacka.mjs", body, args=args)

    return call


def spocitej(js, vstup):
    return js("out(m.spocitej(A.v));", v=vstup)


def test_konstanty(js):
    s = js("out(m.SLUZBY);")
    assert [x["kod"] for x in s] == ["technicka", "administrativni", "energetika", "uklid", "zelen", "zimni", "ostraha"]
    assert s[3] == {"kod": "uklid", "nazev": "Úklid společných prostor", "cenaZaJednotku": 90, "cenaZaM2": 9.0}
    assert js("out([m.MINIMUM, m.KOEFICIENT_STARI.historicky]);") == [2500, 1.15]


def test_svj_stredni(js):
    r = spocitej(js, {"typ": "svj", "jednotek": 48, "sluzby": ["uklid", "technicka", "administrativni"],
                      "vytahu": 2, "havarijni": True, "stari": "panel"})
    assert [(p["kod"], p["castka"]) for p in r["polozky"]] == [
        ("technicka", 4560), ("administrativni", 5760), ("uklid", 4320), ("vytahy", 900), ("havarijni", 900)]
    assert r["polozky"][3]["nazev"] == "Servis a prohlídky výtahů"
    assert {k: r[k] for k in ("mezisoucet", "slevaProcent", "sleva", "celkem", "minimumPouzito", "rozpeti", "naJednotku", "sDph")} == {
        "mezisoucet": 16440, "slevaProcent": 0, "sleva": 0, "celkem": 16440, "minimumPouzito": False,
        "rozpeti": {"od": 14800, "do": 18900}, "naJednotku": 343, "sDph": 19892}


def test_druzstvo_velke_historicke(js):
    r = spocitej(js, {"typ": "druzstvo", "jednotek": 120,
                      "sluzby": ["technicka", "administrativni", "energetika", "zelen", "zimni"],
                      "vytahu": 4, "havarijni": True, "stari": "historicky"})
    assert [p["castka"] for p in r["polozky"]] == [13110, 14400, 3600, 3000, 2400, 1800, 900]
    assert (r["mezisoucet"], r["slevaProcent"], r["sleva"], r["celkem"]) == (39210, 12, 4705, 34505)
    assert r["rozpeti"] == {"od": 31100, "do": 39700}
    assert (r["naJednotku"], r["sDph"]) == (288, 41751)


def test_minimum(js):
    r = spocitej(js, {"typ": "svj", "jednotek": 6, "sluzby": ["administrativni"], "stari": "novostavba"})
    assert r["mezisoucet"] == 720 and r["celkem"] == 2500 and r["minimumPouzito"] is True
    assert r["rozpeti"] == {"od": 2300, "do": 2900} and r["naJednotku"] == 417 and r["sDph"] == 3025
    r = spocitej(js, {"typ": "svj", "jednotek": 10, "sluzby": []})
    assert r["polozky"] == [] and r["celkem"] == 2500


def test_komercni(js):
    r = spocitej(js, {"typ": "komercni", "plocha": 6200, "sluzby": ["technicka", "uklid", "ostraha", "xyz"],
                      "havarijni": True, "stari": "novostavba"})
    assert [(p["kod"], p["castka"]) for p in r["polozky"]] == [
        ("technicka", 25110), ("uklid", 55800), ("ostraha", 37200), ("havarijni", 1900)]
    assert (r["mezisoucet"], r["slevaProcent"], r["sleva"], r["celkem"]) == (120010, 8, 9601, 110409)
    assert r["naJednotku"] is None and r["rozpeti"] == {"od": 99400, "do": 127000} and r["sDph"] == 133595


def test_verejne_desetinna_plocha(js):
    r = spocitej(js, {"typ": "verejne", "plocha": 2400.5, "sluzby": ["technicka", "zelen"], "vytahu": 1})
    assert [p["castka"] for p in r["polozky"]] == [10802, 1920, 450]
    assert (r["celkem"], r["rozpeti"], r["sDph"]) == (13172, {"od": 11900, "do": 15100}, 15938)


def test_chyby(js):
    assert spocitej(js, {"typ": "svj", "jednotek": 0, "sluzby": ["technicka"]}) == {"chyba": "jednotek"}
    assert spocitej(js, {"typ": "svj", "jednotek": 12.5}) == {"chyba": "jednotek"}
    assert spocitej(js, {"typ": "komercni", "plocha": 0}) == {"chyba": "plocha"}
    assert spocitej(js, {"typ": "hrad"}) == {"chyba": "typ"}
