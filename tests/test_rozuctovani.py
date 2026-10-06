"""Akceptační test C-008 — src/lib/rozuctovani.mjs. Hodnoty spočítané referenční implementací v Pythonu."""
from __future__ import annotations

import pytest

JEDNOTKY = [{"id": "1", "plocha": 54.3, "osoby": 2, "podil": 0.2, "zalohy": 14400},
            {"id": "2", "plocha": 71.2, "osoby": 4, "podil": 0.3, "zalohy": 16800},
            {"id": "3", "plocha": 38.9, "osoby": 1, "podil": 0.15, "zalohy": 9600},
            {"id": "4", "plocha": 88.6, "osoby": 3, "podil": 0.35, "zalohy": 12000.5}]
NAKLADY = [{"sluzba": "Teplo", "castka": 31234.56, "klic": "plocha"},
           {"sluzba": "Voda", "castka": 8930, "klic": "osoby"},
           {"sluzba": "Výtah", "castka": 2400, "klic": "jednotka"},
           {"sluzba": "Pojištění", "castka": 5001.01, "klic": "podil"}]


@pytest.fixture()
def js():
    from tests.jsmod import run_js

    def call(body, **args):
        return run_js("rozuctovani.mjs", body, args=dict(args, J=JEDNOTKY, N=NAKLADY))

    return call


def test_rozdel(js):
    assert js('out(m.rozdel(100, [{id: "a", vaha: 1}, {id: "b", vaha: 1}, {id: "c", vaha: 1}]));') == [
        {"id": "a", "halere": 34}, {"id": "b", "halere": 33}, {"id": "c", "halere": 33}]
    assert js('out(m.rozdel(1000, [{id: "a", vaha: 54.3}, {id: "b", vaha: 71.2}, {id: "c", vaha: 38.9}, {id: "d", vaha: 0}]));') == [
        {"id": "a", "halere": 330}, {"id": "b", "halere": 433}, {"id": "c", "halere": 237}, {"id": "d", "halere": 0}]
    assert js('try { m.rozdel(10, [{id: "a", vaha: 0}]); out("ne"); } catch (e) { out(e.message); }') == "nulove-vahy"
    assert js('out(m.rozdel(0, [{id: "a", vaha: 2}]));') == [{"id": "a", "halere": 0}]


def test_vyuctuj_jednotky(js):
    r = js("out(m.vyuctuj(A.N, A.J));")
    j = r["jednotky"]
    assert [x["id"] for x in j] == ["1", "2", "3", "4"]
    assert j[0]["polozky"] == [{"sluzba": "Teplo", "castka": 6703.7}, {"sluzba": "Voda", "castka": 1786},
                               {"sluzba": "Výtah", "castka": 600}, {"sluzba": "Pojištění", "castka": 1000.2}]
    assert [x["polozky"][0]["castka"] for x in j] == [6703.7, 8790.12, 4802.47, 10938.27]
    assert [(x["naklady"], x["zalohy"], x["vysledek"]) for x in j] == [
        (10089.9, 14400, 4310.1), (14462.42, 16800, 2337.58), (7045.62, 9600, 2554.38), (15967.63, 12000.5, -3967.13)]


def test_vyuctuj_souhrn(js):
    s = js("out(m.vyuctuj(A.N, A.J).souhrn);")
    assert s == {"naklady": 47565.57, "zalohy": 52800.5, "vysledek": 5234.93, "preplatky": 9202.06, "nedoplatky": 3967.13}


def test_chyby_a_nemutovani(js):
    assert js('try { m.vyuctuj([{sluzba: "x", castka: 1, klic: "barva"}], A.J); out("ne"); } catch (e) { out(e.message); }') == "klic"
    assert js("const n = JSON.parse(JSON.stringify(A.N)); const j = JSON.parse(JSON.stringify(A.J)); m.vyuctuj(n, j); out([n, j]);") == [NAKLADY, JEDNOTKY]
    assert js("out(Object.keys(m.KLICE));") == ["plocha", "osoby", "podil", "jednotka"]
