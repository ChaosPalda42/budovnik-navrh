#!/bin/sh
# Sestaví web a zabalí ho do _balicek/Budovnik-ukazka.zip
set -e
cd "$(dirname "$0")/.."
node build.mjs
mkdir -p _balicek
rm -f _balicek/Budovnik-ukazka.zip
cp dokumenty/PRECTI-ME.txt out/PRECTI-ME.txt
(cd out && zip -qr ../_balicek/Budovnik-ukazka.zip . -x "_*")
rm out/PRECTI-ME.txt
ls -la _balicek/Budovnik-ukazka.zip
