"""Akceptační test C-013 – src/lib/datum.mjs se musí chovat přesně jako reference/bypalda/datum.php."""
from __future__ import annotations

import datetime as dt

from tests.phpref import porovnej, js

DATA = ["2026-10-07", "2026-10-07 14:05", "2026-10-07 14:05:33", "2024-02-29", "", "nesmysl", "2026-13-40"]

def test_formaty_a_posuny():
    v = [["datumCz", [d]] for d in DATA] + [["datumCasCz", [d]] for d in DATA]
    v += [["posunDatum", [d, n]] for d in ["2026-10-07", "2024-02-28", "2026-12-31"] for n in [0, 1, -1, 30, -400]]
    v += [["pocetDniMesice", [r, m]] for r, m in [(2024, 2), (2025, 2), (2026, 4), (2026, 12), (2000, 2), (1900, 2)]]
    v += [["posunMesice", [d, n]] for d in ["2026-01-31", "2024-02-29", "2026-10-07", "2026-12-15"] for n in [1, -1, 12, -13, 25, 0]]
    v += [["periodaMesicu", [p]] for p in ["mesicne", "ctvrtletne", "pololetne", "rocne", "tydne", ""]]
    v += [["dalsiFakturace", [d, p, den]] for d in ["2026-01-31", "2026-10-07"] for p in ["mesicne", "ctvrtletne", "rocne", "nic"] for den in [1, 15, 31, 0]]
    porovnej("datum.mjs", "datum.php", v)

def test_lhuty_proti_dnesku():
    from tests.phpref import php as _php
    # „dnes“ musí být stejný den, jaký vidí PHP (pražský čas) – CI běží v UTC.
    dnes = dt.date.fromisoformat(_php("datum.php", [["dnes", []]])[0])
    cile = [(dnes + dt.timedelta(n)).isoformat() for n in (0, 1, 2, 4, 5, 30, -1, -2, -4, -5, -40)]
    from tests.phpref import php
    ocek = php("datum.php", [["zbyvaDni", [c]] for c in cile] + [["lhutaText", [c]] for c in cile] + [["zbyvaDni", [""]], ["lhutaText", [""]]])
    skut = js("datum.mjs", [["zbyvaDni", [c, dnes.isoformat()]] for c in cile] + [["lhutaText", [c, dnes.isoformat()]] for c in cile] + [["zbyvaDni", ["", dnes.isoformat()]], ["lhutaText", ["", dnes.isoformat()]]])
    assert skut == ocek

