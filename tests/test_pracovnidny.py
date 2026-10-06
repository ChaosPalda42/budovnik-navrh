"""Akceptační test C-002 — src/lib/pracovnidny.mjs. Hodnoty spočítané referenční implementací v Pythonu."""
from __future__ import annotations

import pytest


@pytest.fixture()
def js():
    from tests.jsmod import run_js

    def call(body, **args):
        return run_js("pracovnidny.mjs", body, args=args)

    return call


def test_velikonoce(js):
    assert js("out([2024, 2025, 2026, 2027].map(m.velikonocniNedele));") == [
        "2024-03-31", "2025-04-20", "2026-04-05", "2027-03-28"]


def test_svatky(js):
    assert js("out(m.svatky(2026));") == [
        "2026-01-01", "2026-04-03", "2026-04-06", "2026-05-01", "2026-05-08", "2026-07-05",
        "2026-07-06", "2026-09-28", "2026-10-28", "2026-11-17", "2026-12-24", "2026-12-25", "2026-12-26"]
    s25 = js("out(m.svatky(2025));")
    assert len(s25) == 13 and "2025-04-18" in s25 and "2025-04-21" in s25


def test_je_pracovni_den(js):
    dny = ["2026-10-28", "2026-04-03", "2026-04-06", "2026-10-06", "2026-10-10", "2026-10-11"]
    assert js("out(A.d.map(m.jePracovniDen));", d=dny) == [False, False, False, True, False, False]


def test_pridej_pracovni_dny(js):
    assert js('out([m.pridejPracovniDny("2026-12-23", 1), m.pridejPracovniDny("2026-12-23", 3),'
              ' m.pridejPracovniDny("2026-04-02", 1), m.pridejPracovniDny("2026-10-27", 2),'
              ' m.pridejPracovniDny("2026-10-06", 0), m.pridejPracovniDny("2026-10-10", 0)]);') == [
        "2026-12-28", "2026-12-30", "2026-04-07", "2026-10-30", "2026-10-06", "2026-10-10"]


def test_pracovni_dny_mezi(js):
    assert js('out([m.pracovniDnyMezi("2026-12-23", "2027-01-04"), m.pracovniDnyMezi("2026-10-05", "2026-10-09"),'
              ' m.pracovniDnyMezi("2026-10-09", "2026-10-05"), m.pracovniDnyMezi("2026-10-06", "2026-10-06")]);') == [5, 4, 0, 0]


def test_kalendarni_dny(js):
    assert js('out([m.dnuMezi("2026-10-06", "2026-10-09"), m.dnuMezi("2026-10-09", "2026-10-06"),'
              ' m.dnuMezi("2026-03-28", "2026-03-30"), m.dnuMezi("2026-12-31", "2027-01-01")]);') == [3, -3, 2, 1]
    assert js('out([m.pridejDny("2026-10-30", 3), m.pridejDny("2026-03-01", -1), m.pridejDny("2024-02-28", 1)]);') == [
        "2026-11-02", "2026-02-28", "2024-02-29"]
