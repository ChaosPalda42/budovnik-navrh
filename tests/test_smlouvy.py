"""Akceptační test C-007 — src/lib/smlouvy.mjs. Termíny spočítané referenční implementací v Pythonu."""
from __future__ import annotations

import pytest

NB = " "


@pytest.fixture()
def js():
    from tests.jsmod import run_js

    def call(body, **args):
        return run_js("smlouvy.mjs", body, args=args)

    return call


DATA = {"klient": {"nazev": "SVJ Lipová 12", "ico": "", "adresa": {"mesto": "Kladno"}},
        "sluzby": [{"nazev": "Úklid", "cena": 4320}, {"nazev": "Revize", "cena": None}],
        "havarijni": True, "zimni": False, "pocet": 0, "jednotek": 48}


def test_hodnota(js):
    assert js('out([m.hodnota(A.d, "klient.adresa.mesto"), m.hodnota(A.d, "sluzby.0.nazev"), m.hodnota(A.d, "jednotek")]);', d=DATA) == [
        "Kladno", "Úklid", 48]
    assert js('out(m.hodnota(A.d, "klient.x.y") === undefined);', d=DATA) is True


def test_zastupne_znacky(js):
    r = js('out(m.vyplnSablonu("Objednatel: {{ klient.nazev }}, IČO {{klient.ico}}, {{klient.adresa.mesto}}\\n{{dic}} / {{ico2}} / {{dic}} ({{jednotek}} jednotek)", A.d));', d=DATA)
    assert r == {"text": "Objednatel: SVJ Lipová 12, IČO [DOPLNIT: klient.ico], Kladno\n[DOPLNIT: dic] / [DOPLNIT: ico2] / [DOPLNIT: dic] (48 jednotek)",
                 "chybi": ["klient.ico", "dic", "ico2"]}


def test_if(js):
    s = "A{{#if havarijni}}[24/7 {{klient.nazev}}]{{/if}}B{{#if zimni}}[zima {{nic}}]{{/if}}C{{#if pocet}}x{{/if}}{{#if sluzby}}S{{/if}}{{#if nikde}}N{{/if}}"
    assert js("out(m.vyplnSablonu(A.s, A.d));", s=s, d=DATA) == {"text": "A[24/7 SVJ Lipová 12]BCS", "chybi": []}


def test_each(js):
    s = "Služby:\n{{#each sluzby}}{{@cislo}}. {{.nazev}} – {{.cena}} Kč\n{{/each}}{{#each nic}}X{{/each}}Konec {{podpis}}"
    r = js("out(m.vyplnSablonu(A.s, A.d));", s=s, d=DATA)
    assert r["text"] == "Služby:\n1. Úklid – 4320 Kč\n2. Revize – [DOPLNIT: cena] Kč\nKonec [DOPLNIT: podpis]"
    assert r["chybi"] == ["sluzby[].cena", "podpis"]


def test_formaty(js):
    assert js("out([m.formatCastka(12345), m.formatCastka(1234.5), m.formatCastka(999), m.formatCastka(-500), m.formatCastka(1234567.891)]);") == [
        f"12{NB}345{NB}Kč", f"1{NB}234,50{NB}Kč", f"999{NB}Kč", f"-500{NB}Kč", f"1{NB}234{NB}567,89{NB}Kč"]
    assert js('out([m.formatDatum("2026-10-06"), m.formatDatum("2027-01-31")]);') == ["6. 10. 2026", "31. 1. 2027"]


def test_smluvni_terminy(js):
    smlouvy = [
        {"zacatek": "2024-01-01", "dobaMesicu": 24, "vypovedniLhutaMesicu": 3, "prodlouzeniMesicu": 12},
        {"zacatek": "2026-02-01", "dobaMesicu": 12, "vypovedniLhutaMesicu": 3, "prodlouzeniMesicu": 12},
        {"zacatek": "2025-03-15", "dobaMesicu": 12, "vypovedniLhutaMesicu": 2, "prodlouzeniMesicu": None},
        {"zacatek": "2026-01-01", "dobaMesicu": None, "vypovedniLhutaMesicu": 3},
        {"zacatek": "2020-07-01", "dobaMesicu": 36, "vypovedniLhutaMesicu": 6, "prodlouzeniMesicu": 12},
    ]
    r = js('out(A.s.map(s => m.smluvniTerminy(s, "2026-10-06")));', s=smlouvy)
    assert r[0] == {"typ": "urcita", "konec": "2026-12-31", "prodlouzeno": 1, "posledniDenVypovedi": "2026-09-30",
                    "dnuDoVypovedi": -6, "upozornit": False, "skoncila": False, "ucinnostVypovedi": None}
    assert r[1] == {"typ": "urcita", "konec": "2027-01-31", "prodlouzeno": 0, "posledniDenVypovedi": "2026-10-31",
                    "dnuDoVypovedi": 25, "upozornit": True, "skoncila": False, "ucinnostVypovedi": None}
    assert r[2] == {"typ": "urcita", "konec": "2026-03-14", "prodlouzeno": 0, "posledniDenVypovedi": None,
                    "dnuDoVypovedi": None, "upozornit": False, "skoncila": True, "ucinnostVypovedi": None}
    assert r[3] == {"typ": "neurcita", "konec": None, "prodlouzeno": 0, "posledniDenVypovedi": None,
                    "dnuDoVypovedi": None, "upozornit": False, "skoncila": False, "ucinnostVypovedi": "2027-01-31"}
    assert (r[4]["konec"], r[4]["prodlouzeno"], r[4]["posledniDenVypovedi"], r[4]["dnuDoVypovedi"], r[4]["upozornit"]) == (
        "2027-06-30", 4, "2026-12-31", 86, False)
    assert js('out(m.smluvniTerminy({zacatek: "2026-01-01", dobaMesicu: null, vypovedniLhutaMesicu: 3}, "2026-12-10").ucinnostVypovedi);') == "2027-03-31"
