"""Vyrobí data/demo.json – vymyšlená, ale soudržná data pro demo portálu a interního systému.

Všechno je smyšlené: objekty, lidé, dodavatelé, závady, smlouvy. Demo běží s pevným datem DNES,
aby stavy (blíží se, po termínu, ohroženo) vypadaly pokaždé stejně.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DNES = "2026-10-07"
TED = "2026-10-07T10:30"

OBJEKTY = [
    {"id": "O1", "nazev": "SVJ Lipová 1287", "kratce": "Lipová 1287", "adresa": "Lipová 1287, Kladno", "typ": "svj", "kraj": "stredocesky",
     "jednotek": 48, "plocha": 3650, "rok": 1978, "podlazi": 8, "vytahu": 2, "kontakt": "Jana Dvořáková, předsedkyně výboru",
     "technologie": ["elektro", "hromosvod", "vytah", "po", "nouzove-osvetleni", "hriste"],
     "provedene": {"elektro": "2021-11-12", "hromosvod": "2022-10-20", "vytah-prohlidka": "2026-07-28", "vytah-zkouska": "2024-02-14",
                   "vytah-inspekce": "2021-05-03", "hasici-pristroje": "2025-10-21", "hydranty": "2025-09-01", "hydranty-tlak": "2022-09-01",
                   "nouzove-osvetleni": "2025-11-30", "hriste": "2025-05-15"}},
    {"id": "O2", "nazev": "SVJ Na Výsluní 14", "kratce": "Na Výsluní 14", "adresa": "Na Výsluní 14, Praha 4", "typ": "svj", "kraj": "praha",
     "jednotek": 32, "plocha": 2900, "rok": 2019, "podlazi": 6, "vytahu": 1, "kontakt": "Ing. Martin Kříž, předseda výboru",
     "technologie": ["elektro", "hromosvod", "vytah", "po", "eps", "nouzove-osvetleni", "vzt"],
     "provedene": {"elektro": "2024-03-10", "hromosvod": "2024-03-10", "vytah-prohlidka": "2026-08-20", "vytah-zkouska": "2025-06-11",
                   "vytah-inspekce": "2023-06-11", "hasici-pristroje": "2026-03-02", "hydranty": "2026-03-02", "eps": "2025-10-28",
                   "nouzove-osvetleni": "2026-03-02", "vzt": "2025-11-04"}},
    {"id": "O3", "nazev": "BD Jasmínová", "kratce": "Jasmínová 2850", "adresa": "Jasmínová 2850, Praha 10", "typ": "druzstvo", "kraj": "praha",
     "jednotek": 120, "plocha": 8400, "rok": 1971, "podlazi": 12, "vytahu": 4, "kontakt": "Pavel Horák, předseda představenstva",
     "technologie": ["elektro", "hromosvod", "plyn", "spaliny", "kotelna", "vytah", "po", "nouzove-osvetleni"],
     "provedene": {"elektro": "2022-01-18", "hromosvod": "2021-09-30", "plyn-revize": "2023-10-25", "plyn-kontrola": "2025-10-25",
                   "spalinove-cesty": "2025-10-02", "tlakove-nadoby": "2025-11-15", "kotle": "2024-11-15", "vytah-prohlidka": "2026-07-15",
                   "vytah-zkouska": "2023-12-01", "hasici-pristroje": "2025-11-02", "hydranty": "2025-11-02", "hydranty-tlak": "2021-11-02",
                   "nouzove-osvetleni": "2025-12-12"}},
    {"id": "O4", "nazev": "Administrativní budova Karlín", "kratce": "Karlín Point", "adresa": "Pernerova 0, Praha 8", "typ": "komercni", "kraj": "praha",
     "jednotek": 0, "plocha": 9200, "rok": 2012, "podlazi": 7, "vytahu": 3, "kontakt": "Lucie Benešová, asset manager",
     "technologie": ["elektro", "hromosvod", "vytah", "po", "eps", "nouzove-osvetleni", "vzt", "chlazeni"],
     "provedene": {"elektro": "2022-05-20", "hromosvod": "2022-05-20", "vytah-prohlidka": "2026-09-01", "vytah-zkouska": "2024-09-15",
                   "vytah-inspekce": "2022-09-15", "hasici-pristroje": "2026-01-15", "hydranty": "2026-01-15", "hydranty-tlak": "2023-01-15",
                   "eps": "2026-02-10", "nouzove-osvetleni": "2026-02-10", "vzt": "2026-04-01", "chlazeni": "2025-10-30"}},
    {"id": "O5", "nazev": "ZŠ Ke Hřišti", "kratce": "ZŠ Ke Hřišti", "adresa": "Ke Hřišti 0, Obec", "typ": "verejne", "kraj": "stredocesky",
     "jednotek": 0, "plocha": 4800, "rok": 1964, "podlazi": 3, "vytahu": 0, "kontakt": "Mgr. Hana Svobodová, ředitelka",
     "technologie": ["elektro", "hromosvod", "plyn", "spaliny", "kotelna", "po", "eps", "nouzove-osvetleni", "vzt", "hriste"],
     "provedene": {"elektro": "2023-07-10", "hromosvod": "2023-07-10", "plyn-revize": "2024-08-05", "plyn-kontrola": "2025-08-05",
                   "spalinove-cesty": "2025-09-15", "tlakove-nadoby": "2025-08-20", "kotle": "2025-08-20", "hasici-pristroje": "2025-08-25",
                   "hydranty": "2025-08-25", "eps": "2025-11-20", "nouzove-osvetleni": "2025-08-25", "vzt": "2025-07-15", "hriste": "2025-06-30"}},
    {"id": "O6", "nazev": "Logistický areál D3", "kratce": "Areál D3", "adresa": "Průmyslová 0, Plzeň-sever", "typ": "komercni", "kraj": "plzensky",
     "jednotek": 0, "plocha": 38000, "rok": 2016, "podlazi": 1, "vytahu": 0, "kontakt": "Tomáš Veselý, provozní ředitel",
     "technologie": ["elektro", "hromosvod", "po", "eps", "nouzove-osvetleni", "vzt"],
     "provedene": {"elektro": "2022-11-08", "hromosvod": "2022-11-08", "hasici-pristroje": "2025-12-01", "hydranty": "2025-12-01",
                   "hydranty-tlak": "2021-12-01", "eps": "2025-10-15", "nouzove-osvetleni": "2025-12-01", "vzt": "2026-03-20"}},
]

DODAVATELE = [
    {"id": "D01", "nazev": "Elektro Novák s.r.o.", "obory": ["elektro", "revize"], "kraje": ["praha", "stredocesky"], "aktivni": True, "odezvaHodin": 3, "vytizeni": 0.55,
     "hodnoceni": [5, 5, 4, 5, 4, 5], "kontakt": "Jiří Novák", "dokumenty": [
         {"typ": "zivnostensky-list", "platnostDo": None}, {"typ": "pojisteni", "platnostDo": "2027-03-31"}, {"typ": "opravneni-elektro", "platnostDo": "2026-10-28"}]},
    {"id": "D02", "nazev": "Voltík elektro", "obory": ["elektro"], "kraje": ["praha"], "aktivni": True, "odezvaHodin": 10, "vytizeni": 0.2,
     "hodnoceni": [4, 3, 4], "kontakt": "Ondřej Volt", "dokumenty": [
         {"typ": "zivnostensky-list", "platnostDo": None}, {"typ": "pojisteni", "platnostDo": "2026-12-31"}, {"typ": "opravneni-elektro", "platnostDo": "2029-05-31"}]},
    {"id": "D03", "nazev": "Instalatérství Brož", "obory": ["voda", "topeni"], "kraje": ["praha", "stredocesky"], "aktivni": True, "odezvaHodin": 2, "vytizeni": 0.7,
     "hodnoceni": [5, 4, 5, 5], "kontakt": "Karel Brož", "dokumenty": [
         {"typ": "zivnostensky-list", "platnostDo": None}, {"typ": "pojisteni", "platnostDo": "2027-06-30"}]},
    {"id": "D04", "nazev": "Topení a plyn Malík", "obory": ["plyn", "topeni", "voda"], "kraje": ["praha"], "aktivni": True, "odezvaHodin": 6, "vytizeni": 0.4,
     "hodnoceni": [4, 4, 5], "kontakt": "Milan Malík", "dokumenty": [
         {"typ": "zivnostensky-list", "platnostDo": None}, {"typ": "pojisteni", "platnostDo": "2026-10-20"}, {"typ": "opravneni-plyn", "platnostDo": "2028-02-28"}]},
    {"id": "D05", "nazev": "Výtahy Kladno a.s.", "obory": ["vytahy"], "kraje": ["praha", "stredocesky"], "aktivni": True, "odezvaHodin": 4, "vytizeni": 0.5,
     "hodnoceni": [4, 5, 4, 4], "kontakt": "servisní dispečink", "dokumenty": [
         {"typ": "zivnostensky-list", "platnostDo": None}, {"typ": "pojisteni", "platnostDo": "2027-01-31"}, {"typ": "opravneni-vytahy", "platnostDo": "2027-09-30"}]},
    {"id": "D06", "nazev": "Hasiči-servis Dvořák", "obory": ["po"], "kraje": ["praha", "stredocesky", "plzensky"], "aktivni": True, "odezvaHodin": 24, "vytizeni": 0.3,
     "hodnoceni": [5, 4], "kontakt": "Lukáš Dvořák", "dokumenty": [
         {"typ": "zivnostensky-list", "platnostDo": None}, {"typ": "pojisteni", "platnostDo": "2027-04-30"}, {"typ": "odborna-zpusobilost-po", "platnostDo": "2026-09-15"},
         {"typ": "odborna-zpusobilost-po", "platnostDo": "2031-09-15"}]},
    {"id": "D07", "nazev": "Čisto úklidové služby", "obory": ["uklid"], "kraje": ["praha", "stredocesky"], "aktivni": True, "odezvaHodin": 12, "vytizeni": 0.65,
     "hodnoceni": [3, 4, 3, 4, 4], "kontakt": "Petra Čistá", "dokumenty": [
         {"typ": "zivnostensky-list", "platnostDo": None}, {"typ": "pojisteni", "platnostDo": "2026-09-30"}]},
    {"id": "D08", "nazev": "Zahrady Zelený", "obory": ["zelen", "zima"], "kraje": ["stredocesky"], "aktivni": True, "odezvaHodin": 20, "vytizeni": 0.45,
     "hodnoceni": [5, 5], "kontakt": "Adam Zelený", "dokumenty": [
         {"typ": "zivnostensky-list", "platnostDo": None}, {"typ": "pojisteni", "platnostDo": "2027-02-28"}]},
    {"id": "D09", "nazev": "Stavby a opravy Pešek", "obory": ["stavebni", "malir", "zamecnik"], "kraje": ["praha", "stredocesky"], "aktivni": True, "odezvaHodin": 30, "vytizeni": 0.35,
     "hodnoceni": [4, 4, 3], "kontakt": "Roman Pešek", "dokumenty": [
         {"typ": "zivnostensky-list", "platnostDo": None}, {"typ": "pojisteni", "platnostDo": "2027-05-31"}]},
    {"id": "D10", "nazev": "Plzeňská technika", "obory": ["elektro", "vzt", "chlazeni"], "kraje": ["plzensky"], "aktivni": True, "odezvaHodin": 5, "vytizeni": 0.5,
     "hodnoceni": [4, 5], "kontakt": "Václav Kubát", "dokumenty": [
         {"typ": "zivnostensky-list", "platnostDo": None}, {"typ": "pojisteni", "platnostDo": "2027-08-31"}, {"typ": "opravneni-elektro", "platnostDo": "2028-11-30"}]},
    {"id": "D11", "nazev": "Klima Servis Praha", "obory": ["vzt", "chlazeni"], "kraje": ["praha"], "aktivni": True, "odezvaHodin": 8, "vytizeni": 0.6,
     "hodnoceni": [5, 4, 4], "kontakt": "Filip Mráz", "dokumenty": [
         {"typ": "zivnostensky-list", "platnostDo": None}, {"typ": "pojisteni", "platnostDo": "2027-03-31"}]},
    {"id": "D12", "nazev": "Elektro Rychlík", "obory": ["elektro"], "kraje": ["stredocesky"], "aktivni": False, "odezvaHodin": 1, "vytizeni": 0.1,
     "hodnoceni": [2, 3], "kontakt": "Ivo Rychlík", "dokumenty": [
         {"typ": "zivnostensky-list", "platnostDo": None}, {"typ": "pojisteni", "platnostDo": "2026-05-31"}, {"typ": "opravneni-elektro", "platnostDo": "2027-01-31"}]},
]

OBORY = {"elektro": "Elektro", "voda": "Voda a kanalizace", "topeni": "Topení", "plyn": "Plyn", "vytahy": "Výtahy", "po": "Požární ochrana",
         "uklid": "Úklid", "zelen": "Zeleň", "zima": "Zimní údržba", "stavebni": "Stavební práce", "malir": "Malíř", "zamecnik": "Zámečník",
         "vzt": "Vzduchotechnika", "chlazeni": "Chlazení", "revize": "Revize"}

DOKUMENTY = {"zivnostensky-list": "Živnostenské oprávnění", "pojisteni": "Pojištění odpovědnosti", "opravneni-elektro": "Oprávnění elektro",
             "opravneni-plyn": "Oprávnění plyn", "opravneni-vytahy": "Oprávnění výtahy", "odborna-zpusobilost-po": "Odborná způsobilost PO"}


def h(z, na, cas, kdo):
    return {"z": z, "na": na, "cas": cas, "kdo": kdo}


ZAVADY = [
    {"id": "Z-2026-0412", "objekt": "O3", "nazev": "Teče voda ze stoupačky ve 3. NP", "obor": "voda", "priorita": "havarie", "nahlaseno": "2026-10-07T08:55",
     "nahlasil": "Byt 3.07, telefonicky", "misto": "3. NP, koupelna nad bytem 2.07", "stav": "v-reseni", "dodavatel": "D03",
     "historie": [h("nova", "prirazena", "2026-10-07T09:02", "Eva Nováková"), h("prirazena", "v-reseni", "2026-10-07T10:14", "Instalatérství Brož")]},
    {"id": "Z-2026-0411", "objekt": "O1", "nazev": "Nesvítí osvětlení na chodbě 5. NP", "obor": "elektro", "priorita": "bezna", "nahlaseno": "2026-10-06T19:40",
     "nahlasil": "Portál – byt 12, Petr Malý", "misto": "5. NP, chodba u výtahu", "stav": "prirazena", "dodavatel": "D01",
     "historie": [h("nova", "prirazena", "2026-10-07T07:45", "Eva Nováková")]},
    {"id": "Z-2026-0410", "objekt": "O4", "nazev": "Klimatizace v zasedačce 4.12 nechladí", "obor": "chlazeni", "priorita": "urgentni", "nahlaseno": "2026-10-06T11:20",
     "nahlasil": "Nájemce – Advokátní kancelář", "misto": "4. NP, zasedací místnost 4.12", "stav": "nova", "historie": []},
    {"id": "Z-2026-0409", "objekt": "O5", "nazev": "Uvolněná deska na lavičce u hřiště", "obor": "stavebni", "priorita": "bezna", "nahlaseno": "2026-10-02T13:05",
     "nahlasil": "Portál – ředitelka školy", "misto": "Školní hřiště", "stav": "ceka-na-dil", "dodavatel": "D09",
     "historie": [h("nova", "prirazena", "2026-10-02T14:00", "Eva Nováková"), h("prirazena", "v-reseni", "2026-10-05T09:10", "Stavby a opravy Pešek"),
                  h("v-reseni", "ceka-na-dil", "2026-10-05T11:30", "Stavby a opravy Pešek")]},
    {"id": "Z-2026-0408", "objekt": "O2", "nazev": "Vrže a zasekávají se dveře výtahu", "obor": "vytahy", "priorita": "urgentni", "nahlaseno": "2026-10-05T07:50",
     "nahlasil": "Portál – výbor SVJ", "misto": "Výtah, přízemí", "stav": "hotova", "dodavatel": "D05",
     "historie": [h("nova", "prirazena", "2026-10-05T08:05", "Eva Nováková"), h("prirazena", "v-reseni", "2026-10-05T13:40", "Výtahy Kladno a.s."),
                  h("v-reseni", "hotova", "2026-10-05T16:20", "Výtahy Kladno a.s.")],
     "naklady": [{"popis": "Seřízení dveří kabiny a šachetních dveří", "castkaBezDph": 2850, "sazbaDph": 21}, {"popis": "Výjezd technika", "castkaBezDph": 650, "sazbaDph": 21}]},
    {"id": "Z-2026-0407", "objekt": "O1", "nazev": "Ucpaný odpad ve sklepě", "obor": "voda", "priorita": "urgentni", "nahlaseno": "2026-10-03T18:10",
     "nahlasil": "Telefon – byt 4", "misto": "Suterén, prádelna", "stav": "prevzata", "dodavatel": "D03",
     "historie": [h("nova", "prirazena", "2026-10-03T18:20", "dispečink"), h("prirazena", "v-reseni", "2026-10-04T08:30", "Instalatérství Brož"),
                  h("v-reseni", "hotova", "2026-10-04T10:15", "Instalatérství Brož"), h("hotova", "prevzata", "2026-10-04T17:00", "Jana Dvořáková")],
     "naklady": [{"popis": "Čištění kanalizace strojním perem", "castkaBezDph": 2400, "sazbaDph": 12}, {"popis": "Kamerová prohlídka potrubí", "castkaBezDph": 1800, "sazbaDph": 12}, {"popis": "Výjezd o víkendu", "castkaBezDph": 900, "sazbaDph": 12}]},
    {"id": "Z-2026-0405", "objekt": "O6", "nazev": "Porucha sekčních vrat č. 7", "obor": "stavebni", "priorita": "havarie", "nahlaseno": "2026-10-01T05:40",
     "nahlasil": "Ostraha areálu", "misto": "Hala D3, rampa 7", "stav": "vyfakturovana", "dodavatel": "D09",
     "historie": [h("nova", "prirazena", "2026-10-01T05:48", "dispečink"), h("prirazena", "v-reseni", "2026-10-01T07:10", "Stavby a opravy Pešek"),
                  h("v-reseni", "hotova", "2026-10-01T11:00", "Stavby a opravy Pešek"), h("hotova", "prevzata", "2026-10-01T14:00", "Tomáš Veselý"),
                  h("prevzata", "vyfakturovana", "2026-10-02T09:00", "Eva Nováková")],
     "naklady": [{"popis": "Výměna torzní pružiny vrat", "castkaBezDph": 6200, "sazbaDph": 21}, {"popis": "Havarijní výjezd", "castkaBezDph": 1500, "sazbaDph": 21}]},
    {"id": "Z-2026-0404", "objekt": "O3", "nazev": "Kotelna – kolísá tlak v systému", "obor": "topeni", "priorita": "urgentni", "nahlaseno": "2026-09-29T09:00",
     "nahlasil": "Správce domu", "misto": "Kotelna, suterén", "stav": "prevzata", "dodavatel": "D04",
     "historie": [h("nova", "prirazena", "2026-09-29T09:20", "Eva Nováková"), h("prirazena", "v-reseni", "2026-09-30T11:40", "Topení a plyn Malík"),
                  h("v-reseni", "hotova", "2026-10-01T15:00", "Topení a plyn Malík"), h("hotova", "prevzata", "2026-10-02T08:00", "Pavel Horák")],
     "naklady": [{"popis": "Výměna membrány expanzní nádoby", "castkaBezDph": 3900, "sazbaDph": 12}, {"popis": "Doplnění a odvzdušnění soustavy", "castkaBezDph": 1200, "sazbaDph": 12}]},
    {"id": "Z-2026-0403", "objekt": "O2", "nazev": "Graffiti na fasádě u vchodu", "obor": "malir", "priorita": "planovana", "nahlaseno": "2026-09-22T10:00",
     "nahlasil": "Portál – výbor SVJ", "misto": "Fasáda, hlavní vchod", "stav": "prirazena", "dodavatel": "D09",
     "historie": [h("nova", "prirazena", "2026-09-22T11:00", "Eva Nováková")]},
    {"id": "Z-2026-0402", "objekt": "O5", "nazev": "Nefunkční splachovač, WC chlapci 2. NP", "obor": "voda", "priorita": "bezna", "nahlaseno": "2026-10-01T08:15",
     "nahlasil": "Školník", "misto": "2. NP, WC chlapci", "stav": "nova", "historie": []},
    {"id": "Z-2026-0401", "objekt": "O4", "nazev": "Výměna zářivek v garážích", "obor": "elektro", "priorita": "planovana", "nahlaseno": "2026-09-15T09:00",
     "nahlasil": "Lucie Benešová", "misto": "-1. PP, garáže", "stav": "zrusena",
     "historie": [h("nova", "zrusena", "2026-09-16T10:00", "Lucie Benešová")]},
]

SMLOUVY = [
    {"id": "SK-2024-003", "strana": "klient", "objekt": "O1", "nazev": "Smlouva o správě – SVJ Lipová 1287", "zacatek": "2024-01-01", "dobaMesicu": 24,
     "vypovedniLhutaMesicu": 3, "prodlouzeniMesicu": 12, "castkaMesicne": 16440},
    {"id": "SK-2025-011", "strana": "klient", "objekt": "O2", "nazev": "Smlouva o správě – SVJ Na Výsluní 14", "zacatek": "2025-02-01", "dobaMesicu": 24,
     "vypovedniLhutaMesicu": 3, "prodlouzeniMesicu": 12, "castkaMesicne": 11200},
    {"id": "SK-2023-007", "strana": "klient", "objekt": "O3", "nazev": "Smlouva o správě – BD Jasmínová", "zacatek": "2023-01-01", "dobaMesicu": None,
     "vypovedniLhutaMesicu": 6, "prodlouzeniMesicu": None, "castkaMesicne": 34505},
    {"id": "SK-2025-019", "strana": "klient", "objekt": "O4", "nazev": "Facility management – Karlín", "zacatek": "2025-01-01", "dobaMesicu": 24,
     "vypovedniLhutaMesicu": 3, "prodlouzeniMesicu": 12, "castkaMesicne": 110409},
    {"id": "SK-2026-002", "strana": "klient", "objekt": "O5", "nazev": "Technická správa – ZŠ Ke Hřišti", "zacatek": "2026-01-01", "dobaMesicu": 12,
     "vypovedniLhutaMesicu": 2, "prodlouzeniMesicu": 12, "castkaMesicne": 13172},
    {"id": "SK-2024-015", "strana": "klient", "objekt": "O6", "nazev": "Správa areálu D3", "zacatek": "2024-12-01", "dobaMesicu": 36,
     "vypovedniLhutaMesicu": 6, "prodlouzeniMesicu": None, "castkaMesicne": 58200},
    {"id": "SD-2025-004", "strana": "dodavatel", "dodavatel": "D07", "nazev": "Rámcová smlouva – úklid", "zacatek": "2025-01-01", "dobaMesicu": 12,
     "vypovedniLhutaMesicu": 2, "prodlouzeniMesicu": 12, "castkaMesicne": 41000},
    {"id": "SD-2024-009", "strana": "dodavatel", "dodavatel": "D05", "nazev": "Servisní smlouva – výtahy", "zacatek": "2024-12-01", "dobaMesicu": 24,
     "vypovedniLhutaMesicu": 3, "prodlouzeniMesicu": 12, "castkaMesicne": 9800},
]

SABLONA = """SMLOUVA O SPRÁVĚ NEMOVITOSTI
č. {{smlouva.cislo}}

Smluvní strany

Objednatel: {{klient.nazev}}
se sídlem {{klient.adresa}}, IČO {{klient.ico}}
zastoupený: {{klient.zastoupeni}}

Správce: {{spravce.nazev}}
se sídlem {{spravce.adresa}}, IČO {{spravce.ico}}

1. Předmět smlouvy
Správce zajistí pro objekt {{objekt.adresa}} ({{objekt.popis}}) tyto služby:
{{#each sluzby}}  {{@cislo}}. {{.nazev}} – {{.cena}} Kč měsíčně bez DPH
{{/each}}{{#if havarijni}}Součástí je nonstop havarijní dispečink s příjezdem technika k havárii do 2 hodin od nahlášení.
{{/if}}
2. Cena a platební podmínky
Celková měsíční cena činí {{cena.celkem}} Kč bez DPH, splatnost {{cena.splatnost}} dní.

3. Doba trvání
Smlouva se uzavírá od {{smlouva.zacatek}} na dobu {{smlouva.doba}}. Výpovědní lhůta je {{smlouva.lhuta}} měsíce a počíná prvním dnem měsíce následujícího po doručení výpovědi.

4. Plnění prostřednictvím třetích osob
Správce je oprávněn k plnění této smlouvy využít třetí osoby. Za jejich plnění odpovídá Objednateli, jako by plnil sám.

V {{misto}} dne {{datum}}"""

PRAVIDLA = [
    {"id": "revize-poptat", "nazev": "Blíží se revize → poptat dodavatele", "zdroj": "revize", "zapnuto": True,
     "kdyz": [{"pole": "stav", "op": "in", "hodnota": ["blizi-se"]}],
     "akce": {"typ": "poptavka", "text": "{{objektNazev}} · {{nazev}}, termín {{terminText}}"}},
    {"id": "revize-eskalace", "nazev": "Revize po termínu nebo bez záznamu → eskalovat", "zdroj": "revize", "zapnuto": True,
     "kdyz": [{"pole": "stav", "op": "in", "hodnota": ["po-terminu", "bez-terminu"]}],
     "akce": {"typ": "eskalace", "text": "{{objektNazev}} · {{nazev}}: {{stavText}}"}},
    {"id": "doklad-obnovit", "nazev": "Doklad dodavatele vyprší → vyžádat nový", "zdroj": "doklady", "zapnuto": True,
     "kdyz": [{"pole": "stav", "op": "in", "hodnota": ["vyprsi", "neplatny"]}],
     "akce": {"typ": "upozorneni", "text": "{{nazev}}: {{typText}} – {{stavText}} ({{platnostText}})"}},
    {"id": "sla-ohrozeno", "nazev": "Lhůta závady ohrožena → upozornit dispečera", "zdroj": "zavady", "zapnuto": True,
     "kdyz": [{"pole": "slaHorsi", "op": "in", "hodnota": ["ohrozeno", "poruseno"]}],
     "akce": {"typ": "eskalace", "text": "{{id}} {{nazev}} – lhůta {{slaText}}"}},
    {"id": "smlouva-vypoved", "nazev": "Výpovědní lhůta smlouvy do 60 dní → připomenout", "zdroj": "smlouvy", "zapnuto": True,
     "kdyz": [{"pole": "upozornit", "op": "==", "hodnota": True}],
     "akce": {"typ": "upozorneni", "text": "{{nazev}}: poslední den výpovědi {{vypovedText}}"}},
    {"id": "zavada-nova", "nazev": "Nová závada bez dodavatele → doporučit dodavatele", "zdroj": "zavady", "zapnuto": False,
     "kdyz": [{"pole": "stav", "op": "==", "hodnota": "nova"}],
     "akce": {"typ": "poptavka", "text": "{{id}} {{nazev}} – přiřadit dodavatele"}},
]

JEDNOTKY_O1 = []
plochy = [54.3, 71.2, 38.9, 88.6, 54.3, 71.2, 38.9, 88.6, 61.0, 47.5, 71.2, 54.3]
osoby = [2, 4, 1, 3, 2, 3, 1, 4, 2, 2, 3, 2]
koef = [1.08, 0.95, 1.1, 0.92, 1.0, 0.97, 1.12, 0.9, 1.03, 1.06, 0.94, 1.05]
for i, (p, o) in enumerate(zip(plochy, osoby), start=1):
    JEDNOTKY_O1.append({"id": f"{i:02d}", "nazev": f"Byt {i:02d}", "plocha": p, "osoby": o, "podil": round(p / sum(plochy), 6),
                        "zalohy": round((p * 360 + o * 2000) * koef[i - 1] / 100) * 100, "vlastnik": "vlastník (smyšlený)"})
JEDNOTKY_O1[11]["vlastnik"] = "Petr Malý"

NAKLADY_O1 = [
    {"sluzba": "Teplo", "castka": 168420.50, "klic": "plocha"},
    {"sluzba": "Studená voda", "castka": 61230.00, "klic": "osoby"},
    {"sluzba": "Ohřev teplé vody", "castka": 42810.40, "klic": "osoby"},
    {"sluzba": "Výtah", "castka": 18600.00, "klic": "jednotka"},
    {"sluzba": "Úklid", "castka": 25920.00, "klic": "jednotka"},
    {"sluzba": "Osvětlení společných prostor", "castka": 7300.20, "klic": "podil"},
]

UZIVATELE = {
    "portal": [
        {"id": "vybor", "jmeno": "Jana Dvořáková", "role": "Předsedkyně výboru · SVJ Lipová 1287", "objekty": ["O1"], "jednotka": None, "inicialy": "JD"},
        {"id": "vlastnik", "jmeno": "Petr Malý", "role": "Vlastník bytu 12 · SVJ Lipová 1287", "objekty": ["O1"], "jednotka": "12", "inicialy": "PM"},
        {"id": "reditelka", "jmeno": "Mgr. Hana Svobodová", "role": "Ředitelka · ZŠ Ke Hřišti", "objekty": ["O5"], "jednotka": None, "inicialy": "HS"},
    ],
    "dispecink": [{"id": "dispecer", "jmeno": "Eva Nováková", "role": "Dispečerka · Budovník", "inicialy": "EN"}],
}

SPOTREBA_O1 = [{"mesic": m, "teplo": t, "voda": v} for m, t, v in [
    ("11/25", 21.4, 410), ("12/25", 30.2, 402), ("01/26", 33.8, 398), ("02/26", 28.1, 385), ("03/26", 22.6, 401), ("04/26", 14.2, 395),
    ("05/26", 6.1, 412), ("06/26", 2.4, 430), ("07/26", 2.1, 388), ("08/26", 2.3, 376), ("09/26", 5.9, 404), ("10/26", 12.8, 236)]]


def main() -> None:
    data = {
        "dnes": DNES, "ted": TED, "objekty": OBJEKTY, "dodavatele": DODAVATELE, "obory": OBORY, "dokumenty": DOKUMENTY,
        "zavady": ZAVADY, "smlouvy": SMLOUVY, "sablona": SABLONA, "pravidla": PRAVIDLA,
        "vyuctovani": {"objekt": "O1", "obdobi": "2025", "jednotky": JEDNOTKY_O1, "naklady": NAKLADY_O1},
        "uzivatele": UZIVATELE, "spotreba": SPOTREBA_O1, "marze": 15,
    }
    cil = ROOT / "data" / "demo.json"
    cil.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"zapsáno {cil.relative_to(ROOT)}: {len(OBJEKTY)} objektů, {len(DODAVATELE)} dodavatelů, {len(ZAVADY)} závad")


if __name__ == "__main__":
    main()
