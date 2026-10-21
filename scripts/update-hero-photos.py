#!/usr/bin/env python3
"""Rebuild the header carousel's photo list from img/header-imgs/.

Run from the repo root:   python3 scripts/update-hero-photos.py

Photos show in filename order (prefix them 01-, 02-, ... to control it).
Only the lines inside <div class="hero-track"> in index.html are replaced.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLDER = "img/header-imgs"
INDEX = os.path.join(ROOT, "index.html")
EXTS = (".jpg", ".jpeg", ".png", ".webp")
BIG_KB = 700  # warn above this; large photos slow the first page load

folder_path = os.path.join(ROOT, FOLDER)
if not os.path.isdir(folder_path):
    sys.exit(f"No {FOLDER}/ folder found in {ROOT}")

photos = sorted(f for f in os.listdir(folder_path)
                if f.lower().endswith(EXTS) and not f.startswith("."))
if not photos:
    sys.exit(f"No .jpg/.png/.webp photos in {FOLDER}/")

indent = " " * 20
lines = []
for i, name in enumerate(photos):
    lazy = "" if i == 0 else ' loading="lazy"'
    lines.append(f'{indent}<img src="{FOLDER}/{name}" alt=""{lazy}>')

with open(INDEX, encoding="utf-8") as f:
    html = f.read()

pattern = re.compile(r'(<div class="hero-track">\n)(.*?)(\n\s*</div>)', re.S)
if not pattern.search(html):
    sys.exit('Could not find <div class="hero-track"> in index.html')
html = pattern.sub(lambda m: m.group(1) + "\n".join(lines) + m.group(3), html, count=1)

with open(INDEX, "w", encoding="utf-8") as f:
    f.write(html)

print(f"Carousel now has {len(photos)} photo(s):")
for name in photos:
    kb = os.path.getsize(os.path.join(folder_path, name)) // 1024
    flag = "  <- large, consider shrinking" if kb > BIG_KB else ""
    print(f"  {name}  ({kb} KB){flag}")
