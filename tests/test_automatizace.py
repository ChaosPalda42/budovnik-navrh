"""Akceptační test C-010 — src/lib/automatizace.mjs."""
from __future__ import annotations

import pytest

ZDROJE = {
    "revize": [
        {"id": "R1", "nazev": "Odborná prohlídka výtahu", "objekt": {"nazev": "Lipová 12"}, "stav": "blizi-se", "dnu": 14},
        {"id": "R2", "nazev": "Revize hromosvodu", "objekt": {"nazev": "Školní 4"}, "stav": "po-terminu", "dnu": -3},
        {"id": "R3", "nazev": "Kontrola EPS", "objekt": {"nazev": "Lipová 12"}, "stav": "v-poradku", "dnu": 120},
        {"id": "R4", "nazev": "Kontrola kotlů", "objekt": {"nazev": "Školní 4"}, "stav": "bez-terminu", "dnu": None},
    ],
    "doklady": [
        {"id": "D1:pojisteni", "nazev": "Elektro Novák", "typ": "pojisteni", "stav": "vyprsi", "obory": ["elektro", "voda"]},
    ],
}
PRAVIDLA = [
    {"id": "poptat", "nazev": "Poptat revizi", "zdroj": "revize",
     "kdyz": [{"pole": "dnu", "op": "<=", "hodnota": 30}],
     "akce": {"typ": "poptavka", "text": "Poptat {{ nazev }} – {{objekt.nazev}} ({{dnu}} dní)"}},
    {"id": "eskalace", "nazev": "Eskalovat", "zdroj": "revize",
     "kdyz": [{"pole": "stav", "op": "in", "hodnota": ["po-terminu", "bez-terminu"]}],
     "akce": {"typ": "upozorneni", "text": "{{objekt.nazev}}: {{nazev}} chybí, {{dnu}}"}},
    {"id": "doklad", "nazev": "Vyžádat doklad", "zdroj": "doklady",
     "kdyz": [{"pole": "obory", "op": "obsahuje", "hodnota": "elektro"}, {"pole": "stav", "op": "!=", "hodnota": "platny"}],
     "akce": {"typ": "upozorneni", "text": "{{nazev}}: obnovit {{typ}}"}},
    {"id": "nic", "nazev": "Nic", "zdroj": "smlouvy", "kdyz": [], "akce": {"typ": "x", "text": "x"}},
]


@pytest.fixture()
def js():
    from tests.jsmod import run_js

    def call(body, **args):
        return run_js("automatizace.mjs", body, args=dict(args, Z=ZDROJE, P=PRAVIDLA))

    return call


def test_splnuje(js):
    r = js('const p = {a: 5, s: "Lipová 12", l: ["x"], n: null, o: {b: 2}};'
           'out([["a", "==", 5], ["a", "!=", 5], ["a", "<", 6], ["n", "<", 6], ["chybi", ">=", 0], ["o.b", ">=", 2],'
           ' ["a", "in", [1, 5]], ["a", "in", 5], ["l", "obsahuje", "x"], ["s", "obsahuje", "ová"], ["a", "obsahuje", 5]]'
           '.map(([pole, op, hodnota]) => m.splnuje(p, {pole, op, hodnota})));')
    assert r == [True, False, True, False, False, True, True, False, True, True, False]
    assert js('try { m.splnuje({}, {pole: "a", op: "~", hodnota: 1}); out("ne"); } catch (e) { out(e.message); }') == "operator"


def test_vypln_text(js):
    assert js('out(m.vyplnText("{{ a }}/{{b.c}}/{{x}}/{{n}}", {a: 1, b: {c: "C"}, n: null}));') == "1/C/?/?"


def test_vyhodnot(js):
    u = js("out(m.vyhodnot(A.P, A.Z));")
    assert [x["klic"] for x in u] == ["poptat:R1", "poptat:R2", "eskalace:R2", "eskalace:R4", "doklad:D1:pojisteni"]
    assert u[0] == {"klic": "poptat:R1", "pravidlo": "poptat", "nazev": "Poptat revizi", "typ": "poptavka", "polozka": "R1",
                    "text": "Poptat Odborná prohlídka výtahu – Lipová 12 (14 dní)"}
    assert u[3]["text"] == "Školní 4: Kontrola kotlů chybí, ?"
    assert u[4]["text"] == "Elektro Novák: obnovit pojisteni"
    u = js('out(m.vyhodnot(A.P, A.Z, ["poptat:R2", "doklad:D1:pojisteni"]).map(x => x.klic));')
    assert u == ["poptat:R1", "eskalace:R2", "eskalace:R4"]


def test_seskup(js):
    s = js("out(m.seskup(m.vyhodnot(A.P, A.Z)).map(g => [g.typ, g.pocet, g.ukoly.map(u => u.klic)]));")
    assert s == [["poptavka", 2, ["poptat:R1", "poptat:R2"]],
                 ["upozorneni", 3, ["eskalace:R2", "eskalace:R4", "doklad:D1:pojisteni"]]]
