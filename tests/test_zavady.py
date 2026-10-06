"""Akceptační test C-006 — src/lib/zavady.mjs. Hodnoty spočítané referenční implementací v Pythonu."""
from __future__ import annotations

import pytest

ZAVADY = [
 {
  "id": "Z1",
  "priorita": "havarie",
  "nahlaseno": "2026-10-06T22:30",
  "stav": "v-reseni",
  "historie": [
   {
    "z": "nova",
    "na": "prirazena",
    "cas": "2026-10-06T22:41",
    "kdo": "dispecink"
   },
   {
    "z": "prirazena",
    "na": "v-reseni",
    "cas": "2026-10-07T00:10",
    "kdo": "D4"
   }
  ]
 },
 {
  "id": "Z2",
  "priorita": "bezna",
  "nahlaseno": "2026-12-23T09:15",
  "stav": "prirazena",
  "dodavatel": "D1",
  "historie": [
   {
    "z": "nova",
    "na": "prirazena",
    "cas": "2026-12-23T10:00",
    "kdo": "dispecink"
   }
  ]
 },
 {
  "id": "Z3",
  "priorita": "urgentni",
  "nahlaseno": "2026-10-05T08:00",
  "stav": "nova",
  "historie": []
 },
 {
  "id": "Z4",
  "priorita": "planovana",
  "nahlaseno": "2026-09-01T07:00",
  "stav": "hotova",
  "historie": [
   {
    "z": "nova",
    "na": "prirazena",
    "cas": "2026-09-01T08:00",
    "kdo": "x"
   },
   {
    "z": "prirazena",
    "na": "v-reseni",
    "cas": "2026-09-20T08:00",
    "kdo": "x"
   },
   {
    "z": "v-reseni",
    "na": "hotova",
    "cas": "2026-10-02T15:00",
    "kdo": "x"
   }
  ]
 },
 {
  "id": "Z5",
  "priorita": "havarie",
  "nahlaseno": "2026-10-06T10:00",
  "stav": "zrusena",
  "historie": []
 }
]


@pytest.fixture()
def js():
    from tests.jsmod import run_js

    def call(body, **args):
        return run_js("zavady.mjs", body, args=dict(args, Z=ZAVADY))

    return call


def test_konstanty(js):
    assert js("out(m.STAVY.length);") == 8
    assert js('out(m.PRIORITY.bezna);') == {"nazev": "Běžná", "reakce": {"pracovniDny": 2}, "vyreseni": {"pracovniDny": 10}}


def test_lhuty(js):
    assert js('out([m.pridejLhutu("2026-10-31T23:30", {hodiny: 2}), m.pridejLhutu("2026-12-23T09:15", {pracovniDny: 2})]);') == [
        "2026-11-01T01:30", "2026-12-29T09:15"]
    assert js("out(A.Z.map(m.terminy));") == [
        {"reakce": "2026-10-07T00:30", "vyreseni": "2026-10-07T22:30"},
        {"reakce": "2026-12-29T09:15", "vyreseni": "2027-01-11T09:15"},
        {"reakce": "2026-10-06T08:00", "vyreseni": "2026-10-08T08:00"},
        {"reakce": "2026-09-15T07:00", "vyreseni": "2026-10-14T07:00"},
        {"reakce": "2026-10-06T12:00", "vyreseni": "2026-10-07T10:00"}]
    assert js('try { m.terminy({priorita: "xyz", nahlaseno: "2026-10-06T10:00"}); out("ne"); } catch (e) { out(e.message); }') == "priorita"


def test_prechody(js):
    assert js('out([m.muzePrejit("nova", "prirazena"), m.muzePrejit("nova", "hotova"), m.muzePrejit("hotova", "v-reseni"),'
              ' m.muzePrejit("vyfakturovana", "nova"), m.muzePrejit("xyz", "nova")]);') == [True, False, True, False, False]
    z = js('const z = {id: "Q", stav: "nova", historie: []}; const r = m.prirad(z, "D1", "2026-10-06T10:00", "eva"); out([z, r]);')
    assert z[0] == {"id": "Q", "stav": "nova", "historie": []}
    assert z[1] == {"id": "Q", "stav": "prirazena", "dodavatel": "D1",
                    "historie": [{"z": "nova", "na": "prirazena", "cas": "2026-10-06T10:00", "kdo": "eva"}]}
    assert js('try { m.prejdi({stav: "nova"}, "hotova", "x", "y"); out("ne"); } catch (e) { out(e.message); }') == "neplatny-prechod"
    assert js('try { m.prejdi({stav: "nova"}, "prirazena", "x", "y"); out("ne"); } catch (e) { out(e.message); }') == "chybi-dodavatel"
    r = js('out(m.prejdi({stav: "v-reseni"}, "hotova", "2026-10-06T12:00", "D1"));')
    assert r == {"stav": "hotova", "historie": [{"z": "v-reseni", "na": "hotova", "cas": "2026-10-06T12:00", "kdo": "D1"}]}
    assert js('out([m.casPrechodu(A.Z[3], "hotova"), m.casPrechodu(A.Z[2], "hotova")]);') == ["2026-10-02T15:00", None]


def test_sla(js):
    r = js('out(A.Z.map(z => m.slaStav(z, "2026-10-07T00:00")));')
    assert r == [{"reakce": "splneno", "vyreseni": "bezi"}, {"reakce": "bezi", "vyreseni": "bezi"},
                 {"reakce": "poruseno", "vyreseni": "bezi"}, {"reakce": "poruseno", "vyreseni": "splneno"},
                 {"reakce": "zruseno", "vyreseni": "zruseno"}]
    r = js('out(A.Z.map(z => m.slaStav(z, "2026-12-28T12:00")));')
    assert [x["reakce"] for x in r] == ["splneno", "ohrozeno", "poruseno", "poruseno", "zruseno"]
    assert [x["vyreseni"] for x in r] == ["poruseno", "bezi", "poruseno", "splneno", "zruseno"]
    assert js('out(m.slaStav(A.Z[0], "2026-10-07T17:00"));') == {"reakce": "splneno", "vyreseni": "ohrozeno"}
    # přesně v termínu ještě není porušeno
    assert js('out(m.slaStav(A.Z[1], "2026-12-29T09:15"));') == {"reakce": "ohrozeno", "vyreseni": "bezi"}
    assert js('out(m.slaStav(A.Z[1], "2026-12-29T09:16"));')["reakce"] == "poruseno"


def test_zbyva_a_prehled(js):
    assert js('out(m.zbyva(A.Z[0], "2026-10-06T23:00"));') == {"reakce": 90, "vyreseni": 1410}
    assert js('out(m.zbyva(A.Z[2], "2026-10-06T09:00"));') == {"reakce": -60, "vyreseni": 2820}
    p = js('out(m.prehled(A.Z, "2026-10-07T00:00"));')
    assert p["podleStavu"] == {"nova": 1, "prirazena": 1, "v-reseni": 1, "ceka-na-dil": 0, "hotova": 1,
                               "prevzata": 0, "vyfakturovana": 0, "zrusena": 1}
    assert p["otevrene"] == 3 and p["poruseneSla"] == 2
