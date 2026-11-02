import sys; sys.path.insert(0,'/sessions/brave-quirky-darwin/w/src')
from pages5 import *
css=open('/sessions/brave-quirky-darwin/w/src/style.css').read()
body=''.join(f() for f in [cover,contents,idea,origin,anatomy,construction,wordmark_page,family,clearspace,minsize,colour,oncolour,typography,northstar,ns_inuse,tagline,misuse,apps_digital,apps_print,files,back])
html=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Neostra Logo Book</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap" rel="stylesheet">
<style>{css}</style></head><body>{defs()}<main class="book">{body}</main></body></html>'''
import os
out=sys.argv[1]; os.makedirs(os.path.dirname(out),exist_ok=True)
open(out,'w').write(html); print(len(html))
