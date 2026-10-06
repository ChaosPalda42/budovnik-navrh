"""Akceptační test C-003 — src/lib/revize.mjs. Hodnoty spočítané referenční implementací v Pythonu."""
from __future__ import annotations

import pytest


@pytest.fixture()
def js():
    from tests.jsmod import run_js

    def call(body, **args):
        return run_js("revize.mjs", body, args=args)

    return call


def test_katalog(js):
    k = js("out(m.KATALOG);")
    assert len(k) == 18
    assert k[0] == {"kod": "elektro", "technologie": "elektro",
                    "nazev": "Revize elektroinstalace ve společných prostorách",
                    "periodaMesicu": 60, "predpis": "ČSN 33 1500, ČSN 33 2000-6"}
    assert [x["kod"] for x in k][5:8] == ["vytah-prohlidka", "vytah-zkouska", "vytah-inspekce"]
    assert k[5]["periodaMesicu"] == 3
    assert js("out(m.TECHNOLOGIE);") == ["elektro", "hromosvod", "plyn", "spaliny", "vytah", "po", "eps",
                                         "nouzove-osvetleni", "kotelna", "vzt", "chlazeni", "hriste"]


def test_revize_pro_technologie(js):
    assert js('out(m.revizeProTechnologie(["po", "plyn", "xyz", "plyn"]).map(x => x.kod));') == [
        "plyn-revize", "plyn-kontrola", "hasici-pristroje", "hydranty", "hydranty-tlak"]
    assert js("out(m.revizeProTechnologie([]));") == []
    assert js("out(m.revizeProTechnologie(undefined));") == []


def test_mesice_a_dny(js):
    assert js('out([m.pridejMesice("2024-01-31", 1), m.pridejMesice("2025-01-31", 1), m.pridejMesice("2026-03-31", -1),'
              ' m.pridejMesice("2026-11-15", 3), m.pridejMesice("2026-10-06", 60)]);') == [
        "2024-02-29", "2025-02-28", "2026-02-28", "2027-02-15", "2031-10-06"]
    assert js('out([m.dnuDo("2026-10-06", "2026-10-20"), m.dnuDo("2026-10-06", "2026-09-01")]);') == [14, -35]
    assert js('out([m.pristiTermin("2025-10-20", 12), m.pristiTermin(null, 12), m.pristiTermin("", 3)]);') == [
        "2026-10-20", None, None]


def test_stav(js):
    assert js('out([m.stav(null, "2026-10-06"), m.stav("2026-10-05", "2026-10-06"), m.stav("2026-10-06", "2026-10-06"),'
              ' m.stav("2026-11-05", "2026-10-06"), m.stav("2026-11-06", "2026-10-06"), m.stav("2026-10-20", "2026-10-06", 7)]);') == [
        "bez-terminu", "po-terminu", "blizi-se", "blizi-se", "v-poradku", "v-poradku"]


OBJEKT = {"technologie": ["vytah", "elektro", "po", "neznama"],
          "provedene": {"elektro": "2021-11-01", "vytah-prohlidka": "2026-08-10", "vytah-zkouska": "2024-01-15",
                        "hasici-pristroje": "2025-10-20", "hydranty": "2025-09-01"}}


def test_plan_objektu(js):
    p = js('out(m.planObjektu(A.o, "2026-10-06"));', o=OBJEKT)
    assert [(x["kod"], x["termin"], x["stav"], x["dnu"]) for x in p] == [
        ("vytah-inspekce", None, "bez-terminu", None),
        ("hydranty-tlak", None, "bez-terminu", None),
        ("hydranty", "2026-09-01", "po-terminu", -35),
        ("hasici-pristroje", "2026-10-20", "blizi-se", 14),
        ("elektro", "2026-11-01", "blizi-se", 26),
        ("vytah-prohlidka", "2026-11-10", "v-poradku", 35),
        ("vytah-zkouska", "2027-01-15", "v-poradku", 101),
    ]
    assert p[2]["posledni"] == "2025-09-01" and p[2]["nazev"] == "Kontrola požárních hydrantů"
    assert p[0]["posledni"] is None and p[2]["periodaMesicu"] == 12 and p[2]["technologie"] == "po"
    assert "predpis" in p[0]
    # vstup se nemutuje
    assert js('const o = JSON.parse(JSON.stringify(A.o)); m.planObjektu(o, "2026-10-06"); out(o);', o=OBJEKT) == OBJEKT


def test_plan_bez_provedenych_a_souhrn(js):
    p = js('out(m.planObjektu({technologie: ["spaliny"]}, "2026-10-06"));')
    assert [(x["kod"], x["stav"]) for x in p] == [("spalinove-cesty", "bez-terminu")]
    s = js('out(m.souhrn(m.planObjektu(A.o, "2026-10-06")));', o=OBJEKT)
    assert s == {"celkem": 7, "poTerminu": 1, "bliziSe": 2, "vPoradku": 2, "bezTerminu": 2}


def test_kalendar(js):
    objekty = [
        {"id": "A", "nazev": "Dům A", "technologie": ["vytah", "po"],
         "provedene": {"vytah-prohlidka": "2026-08-10", "hasici-pristroje": "2025-11-10", "hydranty": "2025-11-30"}},
        {"id": "B", "nazev": "Dům B", "technologie": ["plyn", "spaliny"],
         "provedene": {"plyn-kontrola": "2025-11-10", "spalinove-cesty": "2025-12-01", "plyn-revize": "2023-10-30"}},
    ]
    k = js('out(m.kalendar(A.o, "2026-10-01", "2026-11-30", "2026-10-06"));', o=objekty)
    assert [(x["termin"], x["objektId"], x["kod"]) for x in k] == [
        ("2026-10-30", "B", "plyn-revize"), ("2026-11-10", "A", "vytah-prohlidka"),
        ("2026-11-10", "A", "hasici-pristroje"), ("2026-11-10", "B", "plyn-kontrola"),
        ("2026-11-30", "A", "hydranty")]
    assert k[0]["objektNazev"] == "Dům B" and k[0]["stav"] == "blizi-se"
