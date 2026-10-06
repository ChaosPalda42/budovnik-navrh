"""Akceptační test C-026 – src/lib/poptavky.mjs. Část A se porovnává s reference/bypalda/poptavky.php."""
from __future__ import annotations

from tests.phpref import js, porovnej

KLIENTI = [{"id": 3, "nazev": "SVJ  Lipová 1287 ", "ico": "12345678", "email": "Vybor@Lipova.cz"},
           {"id": "7", "nazev": "Karlín Point s.r.o.", "ico": "", "email": ""},
           {"id": 9, "nazev": "BD Jasmínová", "ico": "87654321", "email": "info@jasminova.cz"}]
P = [{"jmeno": "Jana Dvořáková", "email": " vybor@lipova.cz ", "telefon": "777 123 456", "firma": "", "zprava": "Chceme převzít správu."},
     {"jmeno": "Lucie", "email": "", "firma": "karlín  POINT s.r.o."},
     {"jmeno": "", "email": "x@y.cz", "firma": "Nová firma"},
     {}]
ARES = [{}, {"ico": "87654321", "nazev": "Bytové družstvo Jasmínová", "dic": "CZ87654321", "ulice": "Jasmínová 2850", "mesto": "Praha 10", "psc": "106 00", "zeme": ""}]


def test_cast_a_proti_php():
    v = [["poptavkaKlientData", [p, a]] for p in P for a in ARES]
    v += [["poptavkaNormalizaceNazvu", [n]] for n in ("  SVJ   Lipová\t1287 ", "ŽLUŤOUČKÝ Kůň", "")]
    v += [["poptavkaShodaKlienta", [p, KLIENTI, a]] for p in P for a in ARES]
    porovnej("poptavky.mjs", "poptavky.php", v)


def test_kategorie_a_nazev():
    r = js("poptavky.mjs", [["poptavkaKategorie", [s]] for s in ("svj", " SVJ ", "komercni", "verejne", "jine", "hrad", "")])
    assert r == ["svj", "svj", "komercni", "verejne", "jine", "jine", "jine"]
    r = js("poptavky.mjs", [["poptavkaNazevZakazky", [p]] for p in (
        {"segment": "svj", "firma": "", "adresa": " Lipová 1287, Kladno ", "jmeno": "Jana"},
        {"segment": "komercni", "firma": "Karlín Point", "adresa": "Pernerova 0"},
        {"segment": "x", "jmeno": "Petr"}, {"segment": "verejne"})])
    assert r == ["Správa SVJ a družstva – Lipová 1287, Kladno", "Správa komerčního objektu – Karlín Point", "Jednorázová zakázka – Petr", "Správa veřejné budovy"]


def test_zadani():
    p = {"segment": "svj", "jmeno": "Jana Dvořáková", "role": "Předseda / člen výboru SVJ", "email": "vybor@lipova.cz", "telefon": "",
         "adresa": "Lipová 1287, Kladno", "velikost": "48 bytů", "zprava": "  Chceme převzít správu od ledna.  ", "stranka": "/kontakt.html"}
    assert js("poptavky.mjs", [["poptavkaZadani", [p]]])[0] == (
        "Chceme převzít správu od ledna.\n\n--- Z poptávky z webu ---\nKontakt: Jana Dvořáková\nRole: Předseda / člen výboru SVJ\n"
        "E-mail: vybor@lipova.cz\nAdresa objektu: Lipová 1287, Kladno\nVelikost: 48 bytů\nTyp: Správa SVJ a družstva\nOdesláno ze stránky: /kontakt.html")
    assert js("poptavky.mjs", [["poptavkaZadani", [{}]]])[0] == "--- Z poptávky z webu ---\nTyp: Jednorázová zakázka"
