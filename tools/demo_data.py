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


# ---------------------------------------------------------------------------
# Obchod a administrativa – stejný rozsah jako CRM byPalda (klienti, zakázky,
# doklady, poptávky, úkoly, tým, nastavení, vzory smluv).
# ---------------------------------------------------------------------------
KLIENTI = [
    {"id": 1, "nazev": "SVJ Lipová 1287", "typ": "firma", "ico": "12345678", "dic": "", "ulice": "Lipová 1287", "mesto": "Kladno", "psc": "272 01",
     "email": "vybor@lipova-kladno.cz", "telefon": "+420 777 000 001", "kontakt": "Jana Dvořáková", "stav": "aktivni", "pausal": True, "vytvoreno": "2023-11-20", "objekty": ["O1"]},
    {"id": 2, "nazev": "SVJ Na Výsluní 14", "typ": "firma", "ico": "24681357", "dic": "", "ulice": "Na Výsluní 14", "mesto": "Praha 4", "psc": "140 00",
     "email": "vybor@navysluni.cz", "telefon": "+420 777 000 002", "kontakt": "Ing. Martin Kříž", "stav": "aktivni", "pausal": True, "vytvoreno": "2025-01-10", "objekty": ["O2"]},
    {"id": 3, "nazev": "Bytové družstvo Jasmínová", "typ": "firma", "ico": "87654321", "dic": "CZ87654321", "ulice": "Jasmínová 2850", "mesto": "Praha 10", "psc": "106 00",
     "email": "info@bd-jasminova.cz", "telefon": "+420 777 000 003", "kontakt": "Pavel Horák", "stav": "aktivni", "pausal": True, "vytvoreno": "2022-12-01", "objekty": ["O3"]},
    {"id": 4, "nazev": "Karlín Point Property s.r.o.", "typ": "firma", "ico": "11223344", "dic": "CZ11223344", "ulice": "Pernerova 0", "mesto": "Praha 8", "psc": "186 00",
     "email": "lucie.benesova@karlinpoint.cz", "telefon": "+420 777 000 004", "kontakt": "Lucie Benešová", "stav": "aktivni", "pausal": True, "vytvoreno": "2024-11-15", "objekty": ["O4"]},
    {"id": 5, "nazev": "Obec Ke Hřišti (ZŠ Ke Hřišti)", "typ": "firma", "ico": "00000027", "dic": "", "ulice": "Ke Hřišti 0", "mesto": "Obec", "psc": "000 00",
     "email": "reditelka@zs-kehristi.cz", "telefon": "+420 777 000 005", "kontakt": "Mgr. Hana Svobodová", "stav": "aktivni", "pausal": True, "vytvoreno": "2025-11-20", "objekty": ["O5"]},
    {"id": 6, "nazev": "D3 Logistics Park a.s.", "typ": "firma", "ico": "55667788", "dic": "CZ55667788", "ulice": "Průmyslová 0", "mesto": "Plzeň", "psc": "301 00",
     "email": "provoz@d3park.cz", "telefon": "+420 777 000 006", "kontakt": "Tomáš Veselý", "stav": "aktivni", "pausal": True, "vytvoreno": "2024-10-01", "objekty": ["O6"]},
    {"id": 7, "nazev": "SVJ Korunní 88", "typ": "firma", "ico": "", "dic": "", "ulice": "Korunní 88", "mesto": "Praha 2", "psc": "120 00",
     "email": "korunni88@email.cz", "telefon": "", "kontakt": "Alena Marková", "stav": "potencialni", "pausal": False, "vytvoreno": "2026-09-28", "objekty": []},
    {"id": 8, "nazev": "Městská knihovna Rakovník", "typ": "firma", "ico": "", "dic": "", "ulice": "", "mesto": "Rakovník", "psc": "",
     "email": "reditel@knihovna-rakovnik.cz", "telefon": "+420 777 000 008", "kontakt": "PhDr. Jan Kos", "stav": "potencialni", "pausal": False, "vytvoreno": "2026-10-02", "objekty": []},
]

DENIK = [
    {"klient": 7, "datum": "2026-09-28 10:15", "kdo": "Eva Nováková", "typ": "telefon", "text": "Volala paní Marková: chtějí změnit správce od ledna, 36 bytů, starý činžák. Domluvena prohlídka."},
    {"klient": 7, "datum": "2026-10-03 16:00", "kdo": "Eva Nováková", "typ": "schuzka", "text": "Prohlídka domu: kotelna na plyn, výtah po termínu odborné zkoušky, chybí revize hromosvodu. Poslat nabídku do pátku."},
    {"klient": 8, "datum": "2026-10-02 09:40", "kdo": "Eva Nováková", "typ": "email", "text": "Poptávka přes web: revize a údržba budovy knihovny, rozpočet do 15 tis. měsíčně."},
    {"klient": 1, "datum": "2026-09-15 18:00", "kdo": "Eva Nováková", "typ": "schuzka", "text": "Shromáždění vlastníků: schválen plán oprav na 2027 (výměna stoupaček ve dvou sekcích)."},
    {"klient": 4, "datum": "2026-10-01 11:00", "kdo": "Eva Nováková", "typ": "schuzka", "text": "Měsíční report SLA za září předán, 98 % splněno. Požadavek na nabídku čištění fasády."},
    {"klient": 3, "datum": "2026-09-30 08:30", "kdo": "Eva Nováková", "typ": "poznamka", "text": "Před topnou sezónou zkontrolována expanzní nádoba, vyměněna membrána (Z-2026-0404)."},
]

ZAKAZKY = [
    {"id": 101, "klient": 1, "nazev": "Kompletní správa domu", "druh": "pausal", "stav": "bezi", "hodnota": 1644000, "od": "2024-01-01"},
    {"id": 102, "klient": 2, "nazev": "Kompletní správa domu", "druh": "pausal", "stav": "bezi", "hodnota": 1120000, "od": "2025-02-01"},
    {"id": 103, "klient": 3, "nazev": "Správa a energetický management", "druh": "pausal", "stav": "bezi", "hodnota": 3450500, "od": "2023-01-01"},
    {"id": 104, "klient": 4, "nazev": "Facility management budovy", "druh": "pausal", "stav": "bezi", "hodnota": 11040900, "od": "2025-01-01"},
    {"id": 105, "klient": 5, "nazev": "Technická správa školy", "druh": "pausal", "stav": "bezi", "hodnota": 1317200, "od": "2026-01-01"},
    {"id": 106, "klient": 6, "nazev": "Správa areálu", "druh": "pausal", "stav": "bezi", "hodnota": 5820000, "od": "2024-12-01"},
    {"id": 107, "klient": 1, "nazev": "Výměna stoupaček, sekce A a B", "druh": "jednorazova", "stav": "nabidka", "hodnota": 48600000, "od": "2027-03-01"},
    {"id": 108, "klient": 4, "nazev": "Čištění fasády a oken", "druh": "jednorazova", "stav": "nabidka", "hodnota": 18900000, "od": "2026-11-01"},
    {"id": 109, "klient": 5, "nazev": "Letní údržba 2026 (malování, podlahy)", "druh": "jednorazova", "stav": "hotovo", "hodnota": 31250000, "od": "2026-07-01"},
    {"id": 110, "klient": 7, "nazev": "Správa SVJ – Korunní 88", "druh": "pausal", "stav": "poptavka", "hodnota": 0, "od": ""},
]


def _dokl(druh, cislo, klient, vystaveno, splatnost, uhrazeno, polozky, zakazka=None, stav=None):
    return {"druh": druh, "cislo": cislo, "klientId": klient, "zakazka": zakazka, "vystaveno": vystaveno, "splatnost": splatnost,
            "uhrazeno": uhrazeno, "polozky": polozky, "stav": stav}


def _doklady():
    d = []
    pausaly = [(1, 101, 1644000), (2, 102, 1120000), (3, 103, 3450500), (4, 104, 11040900), (5, 105, 1317200), (6, 106, 5820000)]
    poradi = 0
    mesice = ["2026-%02d" % m for m in range(1, 11)]
    for mi, mes in enumerate(mesice):
        for k, z, castka in pausaly:
            if k == 5 and mi < 0:
                continue
            poradi += 1
            vyst = mes + "-01"
            spl = mes + "-15"
            # platby: většina včas, pár pozdě, říjen zatím nezaplacený, září jeden dlužník
            if mes == "2026-10":
                uhr = "2026-10-05" if k in (1, 3) else None
            elif mes == "2026-09" and k == 6:
                uhr = None
            elif k == 4:
                uhr = mes + "-20"
            else:
                uhr = mes + "-%02d" % (8 + k)
            d.append(_dokl("faktura", "FA2026%04d" % poradi, k, vyst, spl, uhr,
                           [{"popis": "Správa objektu – paušál " + mes[5:] + "/" + mes[:4], "mnozstvi": 1, "cena": castka, "dph": 21}], z))
    poradi += 1
    d.append(_dokl("faktura", "FA2026%04d" % poradi, 5, "2026-08-31", "2026-09-14", "2026-09-10",
                   [{"popis": "Malování tříd a chodeb", "mnozstvi": 1240, "cena": 9500, "dph": 21}, {"popis": "Broušení a lakování parket", "mnozstvi": 310, "cena": 42000, "dph": 21},
                    {"popis": "Drobné opravy a úklid po řemeslnících", "mnozstvi": 1, "cena": 3850000, "dph": 21}], 109))
    d.append(_dokl("nabidka", "NAB2026014", 1, "2026-09-20", "2026-10-20", None,
                   [{"popis": "Výměna stoupaček vody a kanalizace, sekce A", "mnozstvi": 1, "cena": 24300000, "dph": 12},
                    {"popis": "Výměna stoupaček vody a kanalizace, sekce B", "mnozstvi": 1, "cena": 24300000, "dph": 12}], 107, "odeslana"))
    d.append(_dokl("nabidka", "NAB2026015", 4, "2026-10-02", "2026-11-02", None,
                   [{"popis": "Čištění fasády (horolezecky)", "mnozstvi": 4200, "cena": 3500, "dph": 21}, {"popis": "Mytí oken z vnější strany", "mnozstvi": 1, "cena": 4200000, "dph": 21}], 108, "odeslana"))
    d.append(_dokl("nabidka", "NAB2026016", 7, "2026-10-06", "2026-11-06", None,
                   [{"popis": "Kompletní správa domu (36 bytů) – měsíčně", "mnozstvi": 12, "cena": 1290000, "dph": 21}], 110, "koncept"))
    d.append(_dokl("proforma", "PF2026003", 5, "2026-06-15", "2026-06-30", "2026-06-25",
                   [{"popis": "Záloha na letní údržbu", "mnozstvi": 1, "cena": 10000000, "dph": 21}], 109))
    return d


DOKLADY = _doklady()

POPTAVKY = [
    {"id": "P-2026-031", "prijato": "2026-10-06 21:14", "stav": "nova", "segment": "svj", "jmeno": "Alena Marková", "role": "Předseda / člen výboru SVJ",
     "email": "korunni88@email.cz", "telefon": "", "firma": "", "adresa": "Korunní 88, Praha 2", "velikost": "36 bytů", "rozpocet": "do 15 tis. měsíčně",
     "zprava": "Dobrý den, náš současný správce končí k 31. 12. Hledáme někoho, kdo převezme technickou i ekonomickou správu.", "stranka": "/kontakt.html"},
    {"id": "P-2026-030", "prijato": "2026-10-02 09:31", "stav": "nova", "segment": "verejne", "jmeno": "PhDr. Jan Kos", "role": "Starosta / ředitel / zřizovatel",
     "email": "reditel@knihovna-rakovnik.cz", "telefon": "+420 777 000 008", "firma": "Městská knihovna Rakovník", "adresa": "Rakovník", "velikost": "1 800 m²", "rozpocet": "cca 12–15 tis. Kč",
     "zprava": "Potřebujeme zajistit revize a pravidelnou údržbu budovy, nejlépe od nového roku.", "stranka": "/verejne-budovy.html"},
    {"id": "P-2026-029", "prijato": "2026-09-24 13:02", "stav": "prevedena", "segment": "komercni", "jmeno": "Lucie Benešová", "role": "Majitel / investor",
     "email": "lucie.benesova@karlinpoint.cz", "telefon": "+420 777 000 004", "firma": "Karlín Point Property s.r.o.", "adresa": "Pernerova 0, Praha 8", "velikost": "9 200 m²", "rozpocet": "kolem 200 tis.",
     "zprava": "Prosím o nabídku na čištění fasády a mytí oken.", "stranka": "/komercni-objekty.html"},
]

UKOLY = [
    {"id": 1, "text": "Poslat nabídku SVJ Korunní 88", "kdo": "Eva Nováková", "termin": "2026-10-09", "hotovo": False, "klient": 7},
    {"id": 2, "text": "Upomínka: faktura za září – Areál D3", "kdo": "Petra Šindelářová", "termin": "2026-10-07", "hotovo": False, "klient": 6},
    {"id": 3, "text": "Připravit podklady na shromáždění BD Jasmínová", "kdo": "Eva Nováková", "termin": "2026-10-20", "hotovo": False, "klient": 3},
    {"id": 4, "text": "Objednat inspekční prohlídku výtahu Lipová", "kdo": "Martin Dušek", "termin": "2026-10-05", "hotovo": False, "klient": 1},
    {"id": 5, "text": "Roční vyúčtování 2025 – odeslat vlastníkům", "kdo": "Petra Šindelářová", "termin": "2026-04-30", "hotovo": True, "klient": 1},
]

TYM = [
    {"id": 1, "jmeno": "Michal Novotný", "email": "michal@budovnik.cz", "role": "spravce", "aktivni": True},
    {"id": 2, "jmeno": "Eva Nováková", "email": "eva@budovnik.cz", "role": "dispecer", "aktivni": True},
    {"id": 3, "jmeno": "Petra Šindelářová", "email": "ucetni@budovnik.cz", "role": "ucetni", "aktivni": True},
    {"id": 4, "jmeno": "Martin Dušek", "email": "martin@budovnik.cz", "role": "technik", "aktivni": True},
]

NASTAVENI = {
    "firma": "Budovník s.r.o.", "ico": "00000019", "dic": "CZ00000019", "adresa": "Ulice 000/00, 000 00 Město",
    "ucet": "2000145399/0800", "platceDph": True, "splatnostDni": 14, "pravaZapnuta": True,
    "rady": {"faktura": "FA{rok}{poradi4}", "proforma": "PF{rok}{poradi3}", "nabidka": "NAB{rok}{poradi3}"},
}

VZORY = [
    {"id": "sprava", "nazev": "Smlouva o správě nemovitosti", "text":
     "SMLOUVA O SPRÁVĚ NEMOVITOSTI č. {cislo_smlouvy}\n\nObjednatel: {klient_nazev}, IČO {klient_ico}, {klient_adresa}, zastoupený {klient_zastoupeni}\n"
     "Správce: {spravce_nazev}, IČO {spravce_ico}, {spravce_adresa}\n\n1. Správce zajistí pro objekt {objekt_adresa} technickou, provozní a ekonomickou správu v rozsahu přílohy č. 1.\n"
     "2. Cena činí {cena_mesicne} Kč měsíčně bez DPH, splatnost {splatnost} dní.\n3. Smlouva se uzavírá od {zacatek} na dobu {doba}.\n"
     "4. Správce je oprávněn k plnění využít třetí osoby; za jejich plnění odpovídá, jako by plnil sám.\n\nV {misto} dne {datum}"},
    {"id": "objednavka", "nazev": "Objednávka jednorázové zakázky", "text":
     "OBJEDNÁVKA č. {cislo_smlouvy}\n\nObjednatel {klient_nazev} (IČO {klient_ico}) objednává u {spravce_nazev}: {predmet}.\n"
     "Cena dle nabídky {cislo_nabidky}: {cena_celkem} Kč bez DPH. Termín provedení: {termin}.\n\nV {misto} dne {datum}"},
]

NAVSTEVNOST = {
    "zdroje": [{"id": "Vyhledávání (Google, Seznam)", "podil": 46}, {"id": "Přímé návštěvy", "podil": 24}, {"id": "Doporučení a odkazy", "podil": 14},
               {"id": "Sociální sítě", "podil": 9}, {"id": "Firmy.cz a katalogy", "podil": 7}],
    "zarizeni": [{"id": "Mobil", "podil": 58}, {"id": "Počítač", "podil": 36}, {"id": "Tablet", "podil": 6}],
    "stranky": [{"nazev": "Úvod", "cesta": "/", "vaha": 100}, {"nazev": "Kalkulačka ceny", "cesta": "/kalkulacka.html", "vaha": 46},
                {"nazev": "Bytové domy", "cesta": "/bytove-domy.html", "vaha": 38}, {"nazev": "Průvodce revizemi", "cesta": "/revize.html", "vaha": 31},
                {"nazev": "Kontakt", "cesta": "/kontakt.html", "vaha": 27}, {"nazev": "Technická správa", "cesta": "/technicka-sprava.html", "vaha": 19}],
}


def main() -> None:
    data = {
        "dnes": DNES, "ted": TED, "objekty": OBJEKTY, "dodavatele": DODAVATELE, "obory": OBORY, "dokumenty": DOKUMENTY,
        "zavady": ZAVADY, "smlouvy": SMLOUVY, "sablona": SABLONA, "pravidla": PRAVIDLA,
        "vyuctovani": {"objekt": "O1", "obdobi": "2025", "jednotky": JEDNOTKY_O1, "naklady": NAKLADY_O1},
        "uzivatele": UZIVATELE, "spotreba": SPOTREBA_O1, "marze": 15,
        "klienti": KLIENTI, "denik": DENIK, "zakazky": ZAKAZKY, "doklady": DOKLADY, "poptavky": POPTAVKY, "ukoly": UKOLY,
        "tym": TYM, "nastaveni": NASTAVENI, "vzory": VZORY, "navstevnost": NAVSTEVNOST,
    }
    cil = ROOT / "data" / "demo.json"
    cil.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"zapsáno {cil.relative_to(ROOT)}: {len(OBJEKTY)} objektů, {len(DODAVATELE)} dodavatelů, {len(ZAVADY)} závad")


if __name__ == "__main__":
    main()
