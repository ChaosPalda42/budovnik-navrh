"""Akceptační test C-009 — src/lib/fakturace.mjs. Hodnoty spočítané referenční implementací v Pythonu."""
from __future__ import annotations

import pytest

POLOZKY = [{"popis": "Oprava stoupačky", "castkaBezDph": 12480.5, "sazbaDph": 12},
           {"popis": "Materiál", "castkaBezDph": 3399.99, "sazbaDph": 21},
           {"popis": "Výjezd", "castkaBezDph": 650, "sazbaDph": 21},
           {"popis": "Správní poplatek", "castkaBezDph": 120, "sazbaDph": 0}]


@pytest.fixture()
def js():
    from tests.jsmod import run_js

    def call(body, **args):
        return run_js("fakturace.mjs", body, args=dict(args, P=POLOZKY))

    return call


def test_prefakturace(js):
    f = js("out(m.prefakturuj(A.P, 15));")
    assert f["radky"] == [
        {"popis": "Oprava stoupačky", "sazbaDph": 12, "nakup": 12480.5, "prodej": 14352.58},
        {"popis": "Materiál", "sazbaDph": 21, "nakup": 3399.99, "prodej": 3909.99},
        {"popis": "Výjezd", "sazbaDph": 21, "nakup": 650, "prodej": 747.5},
        {"popis": "Správní poplatek", "sazbaDph": 0, "nakup": 120, "prodej": 138}]
    assert f["rekapitulace"] == [
        {"sazba": 0, "zaklad": 138, "dph": 0, "celkem": 138},
        {"sazba": 12, "zaklad": 14352.58, "dph": 1722.31, "celkem": 16074.89},
        {"sazba": 21, "zaklad": 4657.49, "dph": 978.07, "celkem": 5635.56}]
    assert {k: f[k] for k in ("zaklad", "dph", "celkemSDph", "kUhrade", "zaokrouhleni", "nakup", "zisk", "marzeSkutecna")} == {
        "zaklad": 19148.07, "dph": 2700.38, "celkemSDph": 21848.45, "kUhrade": 21848, "zaokrouhleni": -0.45,
        "nakup": 16650.49, "zisk": 2497.58, "marzeSkutecna": 13}


def test_bez_marze_a_zaokrouhleni_nahoru(js):
    f = js('out(m.prefakturuj([{popis: "x", castkaBezDph: 99.99, sazbaDph: 21}], 0));')
    assert (f["celkemSDph"], f["kUhrade"], f["zaokrouhleni"], f["zisk"], f["marzeSkutecna"]) == (120.99, 121, 0.01, 0, 0)
    f = js("out(m.prefakturuj([], 10));")
    assert (f["radky"], f["rekapitulace"], f["kUhrade"], f["marzeSkutecna"]) == ([], [], 0, 0)


def test_chyby_a_pomocne(js):
    assert js('try { m.prefakturuj([{popis: "x", castkaBezDph: 1, sazbaDph: 15}], 10); out("ne"); } catch (e) { out(e.message); }') == "sazba"
    assert js("out([m.cisloFaktury(2026, 42), m.cisloFaktury(2027, 12345)]);") == ["20260042", "202712345"]
    assert js('out([m.splatnost("2026-10-06", 14), m.splatnost("2026-12-20", 14)]);') == ["2026-10-20", "2027-01-03"]
    assert js("const p = JSON.parse(JSON.stringify(A.P)); m.prefakturuj(p, 15); out(p);") == POLOZKY
