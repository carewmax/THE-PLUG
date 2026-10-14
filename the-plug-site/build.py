#!/usr/bin/env python3
"""Builds THE PLUG into a single index.html (standalone) and an artifact fragment."""
import os, json, zipfile, shutil
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
os.makedirs(DIST, exist_ok=True)
rd = lambda p: open(os.path.join(SRC, p), encoding='utf-8').read()
assets = "(function(r){r.PLUG=r.PLUG||{};r.PLUG.ASSETS={wordmark:%s,icon:%s,badge:%s,badgeSm:%s};})(window);" % (
    json.dumps(rd('asset_wordmark2.txt').strip()), json.dumps(rd('asset_badge.txt').strip()), json.dumps(rd('asset_badge.txt').strip()), json.dumps(rd('asset_badge192.txt').strip()))
order = ['core.js', 'data.js', 'engine.js', 'actions.js', None, 'ui.js', 'pages1.js', 'pages2.js', 'pages3.js', 'market.js', 'events.js', 'geo.js', 'theme.js', 'shell.js', 'app.js', 'main.js']
js = '\n'.join(assets if f is None else rd(f) for f in order)
assert '</script' not in js.lower()
css = rd('styles.css')
fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">'
body = '<div id="plug-app"></div><script>\n' + js + '\n</script>'
icon = rd('asset_badge192.txt').strip()
standalone = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>THE PLUG</title><meta name="description" content="THE PLUG: food, groceries, stays, errands, rides, travel, pharmacy and print in one app. Prototype with sample data."><link rel="icon" href="%s">%s<style>\n%s\n</style></head><body>%s</body></html>' % (icon, fonts, css, body)
open(os.path.join(DIST, 'index.html'), 'w', encoding='utf-8').write(standalone)
fragment = '<title>THE PLUG</title><meta name="claude:viewport-fit-sides" content="cover">%s<style>\n%s\n</style>%s' % (fonts, css, body)
open(os.path.join(DIST, 'artifact.html'), 'w', encoding='utf-8').write(fragment)
print('index.html', len(standalone)//1024, 'KB; artifact.html', len(fragment)//1024, 'KB')
