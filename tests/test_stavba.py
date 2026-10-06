"""Akceptační test C-011 — src/lib/stavba.mjs."""
from __future__ import annotations

import pytest

PRVKY = [{"id": "logo", "x": 24, "y": 18, "w": 160, "h": 40}, {"id": "menu", "x": 600, "y": 22, "w": 520, "h": 32},
         {"id": "tel", "x": 1180, "y": 10, "w": 220, "h": 48}, {"id": "h1", "x": 24, "y": 180, "w": 640.4, "h": 160},
         {"id": "rez", "x": 720, "y": 150, "w": 680, "h": 560}, {"id": "ikona", "x": 30, "y": 400, "w": 16, "h": 16},
         {"id": "cta", "x": 24, "y": 420, "w": 240, "h": 56}, {"id": "dole", "x": 24, "y": 1200, "w": 1200, "h": 300},
         {"id": "nad", "x": 0, "y": -200, "w": 100, "h": 100}]


@pytest.fixture()
def js():
    from tests.jsmod import run_js

    def call(body, **args):
        return run_js("stavba.mjs", body, args=dict(args, P=PRVKY))

    return call


def test_vychozi(js):
    assert js("out(m.VYCHOZI);") == {"rozestup": 60, "vytyceni": 520, "pauza": 120, "usazeni": 480, "max": 24,
                                    "minW": 24, "minH": 12, "radek": 40}


def test_casova_osa(js):
    r = js("out(m.casovaOsa(A.P, {vyska: 900}));")
    assert [p["id"] for p in r["plan"]] == ["logo", "menu", "tel", "rez", "h1", "cta"]
    assert r["mimo"] == ["ikona", "dole", "nad"]
    assert r["plan"][0] == {"id": "logo", "poradi": 0, "obrys": {"od": 0, "do": 520}, "usazeni": {"od": 940, "do": 1420}, "kota": "160"}
    assert r["plan"][4]["kota"] == "640" and r["plan"][4]["obrys"] == {"od": 240, "do": 760}
    assert r["plan"][5]["usazeni"] == {"od": 1240, "do": 1720}
    assert r["celkem"] == 1720


def test_max_a_prepisy(js):
    r = js("out(m.casovaOsa(A.P, {vyska: 900, max: 4}));")
    assert [p["id"] for p in r["plan"]] == ["logo", "menu", "tel", "rez"]
    assert r["mimo"] == ["h1", "ikona", "cta", "dole", "nad"]
    assert r["plan"][3]["usazeni"] == {"od": 1000, "do": 1480} and r["celkem"] == 1480
    r = js("out(m.casovaOsa(A.P, {vyska: 900, rozestup: 100, vytyceni: 200, pauza: 0, usazeni: 100}));")
    assert r["plan"][1]["obrys"] == {"od": 100, "do": 300} and r["plan"][0]["usazeni"] == {"od": 700, "do": 800}
    assert js("out(m.casovaOsa([], {vyska: 900}));") == {"plan": [], "mimo": [], "celkem": 0}


def test_prubeh_a_stav(js):
    assert js("out([m.prubeh({od: 100, do: 300}, 50), m.prubeh({od: 100, do: 300}, 150), m.prubeh({od: 100, do: 300}, 999)]);") == [0, 0.25, 1]
    assert js("out([m.zpomal(0), m.zpomal(0.5), m.zpomal(1), m.zpomal(2), m.zpomal(-1)]);") == [0, 0.875, 1, 1, 0]
    s = js("out(m.stavV(m.casovaOsa(A.P, {vyska: 900}).plan, 600));")
    assert [x["id"] for x in s][:4] == ["logo", "menu", "tel", "rez"]
    assert s[0] == {"id": "logo", "obrys": 1, "usazeni": 0}
    assert abs(s[2]["obrys"] - 480 / 520) < 1e-9 and abs(s[3]["obrys"] - 420 / 520) < 1e-9
    s = js("out(m.stavV(m.casovaOsa(A.P, {vyska: 900}).plan, 1180));")
    assert s[0]["usazeni"] == 0.875


def test_bublina(js):
    r = js("out([m.bublina(0), m.bublina(100), m.bublina(400), m.bublina(1000), m.bublina(-5), m.bublina(0, {amplituda: 6})]);")
    exp = [14.0, 4.049159, -0.711225, 0.000688, 14, 6]
    assert all(abs(a - b) < 1e-5 for a, b in zip(r, exp))
