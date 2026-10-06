"""Akceptační test C-027 – src/lib/opravneni.mjs."""
from __future__ import annotations

import pytest


@pytest.fixture()
def js():
    from tests.jsmod import run_js

    def call(body, **args):
        return run_js("opravneni.mjs", body, args=args)

    return call


def test_konstanty(js):
    assert js("out([Object.keys(m.ROLE), m.AKCE.length, m.JEN_SPRAVCE]);") == [["spravce", "dispecer", "ucetni", "technik"], 22, ["uzivatele", "nastaveni"]]


def test_muze(js):
    r = js("""const s = {role: "spravce"}, d = {role: "dispecer"}, u = {role: "ucetni"}, t = {role: "technik"}, x = {role: "host"};
    out([m.muze(null, "klienti.cist"), m.muze(s, "nastaveni"), m.muze(d, "nastaveni"), m.muze(d, "nastaveni", false),
         m.muze(s, "neexistuje"), m.muze(d, "klienti.mazat", false), m.muze(d, "klienti.mazat"), m.muze(d, "zavady.psat"),
         m.muze(u, "doklady.psat"), m.muze(u, "zavady.psat"), m.muze(t, "zavady.psat"), m.muze(t, "doklady.cist"),
         m.muze(x, "klienti.cist"), m.muze(x, "klienti.cist", false), m.muze(s, "doklady.mazat"), m.muze(undefined, "uzivatele", false)]);""")
    assert r == [False, True, False, False, False, True, False, True, True, False, True, False, False, True, True, False]


def test_prava_uzivatele(js):
    assert js('out(m.pravaUzivatele({role: "technik"}));') == ["objekty.cist", "zavady.cist", "zavady.psat", "ukoly.psat"]
    assert js('out(m.pravaUzivatele({role: "technik"}, false).length);') == 20
    assert js('out(m.pravaUzivatele({role: "spravce"}).length);') == 22
