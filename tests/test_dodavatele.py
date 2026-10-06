"""Akceptační test C-005 — src/lib/dodavatele.mjs. Hodnoty spočítané referenční implementací v Pythonu."""
from __future__ import annotations

import pytest

DNES = "2026-10-06"
DODAVATELE = [
 {
  "id": "D1",
  "nazev": "Elektro Novák",
  "obory": [
   "elektro"
  ],
  "kraje": [
   "praha"
  ],
  "aktivni": True,
  "odezvaHodin": 5,
  "vytizeni": 0.4,
  "hodnoceni": [
   5,
   4,
   5,
   4
  ],
  "dokumenty": [
   {
    "typ": "zivnostensky-list",
    "platnostDo": None
   },
   {
    "typ": "pojisteni",
    "platnostDo": "2027-03-31"
   },
   {
    "typ": "opravneni-elektro",
    "platnostDo": "2026-10-20"
   }
  ]
 },
 {
  "id": "D2",
  "nazev": "Voltík s.r.o.",
  "obory": [
   "elektro",
   "vytahy"
  ],
  "kraje": [
   "praha",
   "stredocesky"
  ],
  "aktivni": True,
  "odezvaHodin": 24,
  "vytizeni": 0.1,
  "hodnoceni": [
   3,
   4
  ],
  "dokumenty": [
   {
    "typ": "zivnostensky-list",
    "platnostDo": None
   },
   {
    "typ": "pojisteni",
    "platnostDo": "2026-12-31"
   },
   {
    "typ": "opravneni-elektro",
    "platnostDo": "2026-09-30"
   },
   {
    "typ": "opravneni-elektro",
    "platnostDo": "2029-09-30"
   },
   {
    "typ": "opravneni-vytahy",
    "platnostDo": "2026-09-01"
   }
  ]
 },
 {
  "id": "D3",
  "nazev": "Jiskra servis",
  "obory": [
   "elektro"
  ],
  "kraje": [
   "stredocesky"
  ],
  "aktivni": True,
  "odezvaHodin": 60,
  "vytizeni": 0.9,
  "hodnoceni": [],
  "dokumenty": [
   {
    "typ": "zivnostensky-list",
    "platnostDo": None
   },
   {
    "typ": "pojisteni",
    "platnostDo": "2027-01-31"
   },
   {
    "typ": "opravneni-elektro",
    "platnostDo": "2028-01-01"
   }
  ]
 },
 {
  "id": "D4",
  "nazev": "Instalatérství Brož",
  "obory": [
   "voda"
  ],
  "kraje": [
   "praha"
  ],
  "aktivni": True,
  "odezvaHodin": 2,
  "vytizeni": 0.5,
  "hodnoceni": [
   5
  ],
  "dokumenty": [
   {
    "typ": "zivnostensky-list",
    "platnostDo": None
   }
  ]
 },
 {
  "id": "D5",
  "nazev": "Elektro Spící",
  "obory": [
   "elektro"
  ],
  "kraje": [
   "praha"
  ],
  "aktivni": False,
  "odezvaHodin": 1,
  "vytizeni": 0,
  "hodnoceni": [
   5
  ],
  "dokumenty": [
   {
    "typ": "zivnostensky-list",
    "platnostDo": None
   },
   {
    "typ": "pojisteni",
    "platnostDo": "2026-10-01"
   },
   {
    "typ": "opravneni-elektro",
    "platnostDo": "2030-01-01"
   }
  ]
 }
]


@pytest.fixture()
def js():
    from tests.jsmod import run_js

    def call(body, **args):
        return run_js("dodavatele.mjs", body, args=dict(args, D=DODAVATELE, dnes=DNES))

    return call


def test_stav_dokumentu(js):
    r = js('out([{platnostDo: null}, {platnostDo: "2026-10-05"}, {platnostDo: "2026-10-06"}, {platnostDo: "2026-11-05"},'
           ' {platnostDo: "2026-11-06"}, {}].map(d => m.stavDokumentu(d, A.dnes)));')
    assert r == ["bez-omezeni", "neplatny", "vyprsi", "vyprsi", "platny", "bez-omezeni"]


def test_nejlepsi_dokument(js):
    assert js('out(m.nejlepsiDokument(A.D[1].dokumenty, "opravneni-elektro"));') == {
        "typ": "opravneni-elektro", "platnostDo": "2029-09-30"}
    assert js('out(m.nejlepsiDokument(A.D[0].dokumenty, "zivnostensky-list"));') == {
        "typ": "zivnostensky-list", "platnostDo": None}
    assert js('out(m.nejlepsiDokument(A.D[3].dokumenty, "pojisteni"));') is None


def test_kvalifikace(js):
    r = js('out(A.D.map(d => m.kvalifikace(d, "elektro", A.dnes)));')
    assert r[0] == {"zpusobily": True, "obor": True, "aktivni": True, "chybi": [], "neplatne": [], "vyprsi": ["opravneni-elektro"]}
    assert r[1] == {"zpusobily": True, "obor": True, "aktivni": True, "chybi": [], "neplatne": [], "vyprsi": []}
    assert r[3] == {"zpusobily": False, "obor": False, "aktivni": True, "chybi": ["pojisteni", "opravneni-elektro"], "neplatne": [], "vyprsi": []}
    assert r[4] == {"zpusobily": False, "obor": True, "aktivni": False, "chybi": [], "neplatne": ["pojisteni"], "vyprsi": []}
    assert js('out(m.kvalifikace(A.D[1], "vytahy", A.dnes));')["neplatne"] == ["opravneni-vytahy"]
    assert js('out(m.kvalifikace(A.D[3], "voda", A.dnes));') == {
        "zpusobily": False, "obor": True, "aktivni": True, "chybi": ["pojisteni"], "neplatne": [], "vyprsi": []}


def test_hodnoceni_a_skore(js):
    assert js("out(A.D.map(m.prumerHodnoceni));") == [4.5, 3.5, None, 5, 5]
    assert js('out(A.D.map(d => m.skore(d, {obor: "elektro", kraj: "praha"}, A.dnes)));') == [84.9, 71, 26, None, None]


def test_doporuc(js):
    assert js('out(m.doporuc(A.D, {obor: "elektro", kraj: "praha"}, A.dnes));') == [
        {"id": "D1", "nazev": "Elektro Novák", "skore": 84.9},
        {"id": "D2", "nazev": "Voltík s.r.o.", "skore": 71},
        {"id": "D3", "nazev": "Jiskra servis", "skore": 26}]
    assert [x["id"] for x in js('out(m.doporuc(A.D, {obor: "elektro", kraj: "praha"}, A.dnes, 2));')] == ["D1", "D2"]
    assert js('out(m.doporuc(A.D, {obor: "plyn", kraj: "praha"}, A.dnes));') == []
    # shoda skóre -> podle id
    r = js('const a = {...A.D[2], id: "Z9"}; const b = {...A.D[2], id: "A1"}; out(m.doporuc([a, b], {obor: "elektro", kraj: "x"}, A.dnes).map(x => x.id));')
    assert r == ["A1", "Z9"]


def test_hlidani(js):
    assert js("out(m.hlidani(A.D, A.dnes));") == [
        {"id": "D2", "nazev": "Voltík s.r.o.", "typ": "opravneni-vytahy", "platnostDo": "2026-09-01", "stav": "neplatny"},
        {"id": "D1", "nazev": "Elektro Novák", "typ": "opravneni-elektro", "platnostDo": "2026-10-20", "stav": "vyprsi"}]
    before = js("const c = JSON.parse(JSON.stringify(A.D)); m.hlidani(c, A.dnes); m.doporuc(c, {obor: 'elektro', kraj: 'praha'}, A.dnes); out(c);")
    assert before == DODAVATELE
