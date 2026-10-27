#!/bin/sh
# Portrék előállítása AVIF + JPEG formátumban, több szélességben (ffmpeg, libsvtav1).
# Használat: scripts/portrait-images.sh <hero-eredeti.jpg> <rolam-eredeti.jpg>
# A crop-értékek a 2024-es portrékhoz (3317×4976 és 3178×4767) vannak beállítva; új fotónál igazítsd.
set -eu
HERO=$1
ABOUT=$2
OUT=assets/img

# Hero: 7:8 boltív
for w in 480 720 1120; do
  h=$((w * 8 / 7 / 2 * 2))
  ffmpeg -loglevel error -y -i "$HERO" -vf "crop=3316:3790:0:120,scale=$w:$h" -q:v 3 "$OUT/gyongyver-portre-$w.jpg"
  ffmpeg -loglevel error -y -i "$OUT/gyongyver-portre-$w.jpg" -c:v libsvtav1 -crf 34 -frames:v 1 "$OUT/gyongyver-portre-$w.avif"
done

# Rólam: 4:5
for w in 400 800; do
  h=$((w * 5 / 4))
  ffmpeg -loglevel error -y -i "$ABOUT" -vf "crop=3178:3972:0:100,scale=$w:$h" -q:v 3 "$OUT/gyongyver-rolam-$w.jpg"
  ffmpeg -loglevel error -y -i "$OUT/gyongyver-rolam-$w.jpg" -c:v libsvtav1 -crf 34 -frames:v 1 "$OUT/gyongyver-rolam-$w.avif"
done

# Open Graph kép: 1200×630
ffmpeg -loglevel error -y -i "$HERO" -vf "crop=3316:1741:0:250,scale=1200:630" -q:v 3 "$OUT/og-image.jpg"
