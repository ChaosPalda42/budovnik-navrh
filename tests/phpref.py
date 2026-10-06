"""Porovnání JS převodu s původní PHP knihovnou z byPalda CRM (reference/bypalda).

`php(soubor, volani)` zavolá funkce z PHP souboru a vrátí výsledky jako JSON-hodnoty;
`js(modul, volani)` totéž pro ESM modul ze src/lib. `volani` je seznam (funkce, [argumenty]).
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

from tests.jsmod import run_js

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT / "reference" / "bypalda"


def php(soubor: str, volani: list, *, pred: str = "") -> list:
    kod = (
        "date_default_timezone_set('Europe/Prague');"
        + pred
        + f"require_once {json.dumps(str(REF / soubor))};"
        + "$v = json_decode(stream_get_contents(STDIN), true); $out = [];"
        + "foreach ($v as [$f, $a]) { $out[] = call_user_func_array($f, $a); }"
        + "echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION);"
    )
    proc = subprocess.run(["php", "-r", kod], input=json.dumps(volani, ensure_ascii=False),
                          capture_output=True, text=True, timeout=60)
    if proc.returncode != 0 or not proc.stdout:
        raise AssertionError("php selhal:\n" + (proc.stderr or proc.stdout)[:2000])
    return json.loads(proc.stdout)


def js(modul: str, volani: list) -> list:
    return run_js(modul, "out(A.v.map(([f, a]) => { if (typeof m[f] !== 'function') throw new Error('chybí funkce ' + f); return m[f](...a); }));", args={"v": volani})


def normalizuj(x):
    """PHP prázdné pole [] a JS {} jsou totéž; čísla 5.0 a 5 taky."""
    if isinstance(x, dict):
        if not x:
            return []
        if [str(k) for k in x] == [str(i) for i in range(len(x))]:
            return [normalizuj(x[k]) for k in x]
        return {str(k): normalizuj(v) for k, v in x.items()}
    if isinstance(x, list):
        return [normalizuj(v) for v in x] if x else []
    if isinstance(x, float) and x.is_integer():
        return int(x)
    return x


def porovnej(modul: str, soubor: str, volani: list, *, pred: str = "") -> None:
    ocekavane = php(soubor, volani, pred=pred)
    if __import__("os").environ.get("PHPREF_JEN_PHP"):
        return  # kontrola samotného testu: PHP strana musí doběhnout
    skutecne = js(modul, volani)
    for (f, a), o, s in zip(volani, ocekavane, skutecne):
        assert normalizuj(s) == normalizuj(o), f"{f}({json.dumps(a, ensure_ascii=False)[:200]}): JS {s!r} ≠ PHP {o!r}"
