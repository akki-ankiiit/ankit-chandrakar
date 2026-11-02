from pages2 import *
def lum(h):
    c=[int(h[i:i+2],16)/255 for i in (1,3,5)]; c=[x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4 for x in c]
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def cr(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
def rgb(h): return ', '.join(str(int(h[i:i+2],16)) for i in (1,3,5))
def cmyk(h):
    r,g,b=[int(h[i:i+2],16)/255 for i in (1,3,5)]; k=1-max(r,g,b)
    if k>=1: return '0, 0, 0, 100'
    return ', '.join(str(round(v*100)) for v in ((1-r-k)/(1-k),(1-g-k)/(1-k),(1-b-k)/(1-k),k))
def swatches(lst):
    return '<div class="sw">'+''.join(f'<div><div class="chip" style="background:{h}"></div><div class="nm">{n}</div><div class="hx">{h}</div><div class="hx">RGB {rgb(h)}<br>CMYK {cmyk(h)}</div><div class="rl">{r}</div></div>' for n,h,r in lst)+'</div>'
CORE=[('Brand','#29BD8E','Neostra Green. The symbol, highlights, key moments. Use for shapes, not for small text on light backgrounds.'),
      ('Canvas','#FAF9F5','The default page background. Warmer than white, easier on the eye.'),
      ('Surface','#FFFFFF','Cards, panels and anything that sits on Canvas.'),
      ('Subtle','#F0EEE6','Quiet fills: table stripes, input fields, secondary panels.'),
      ('Text','#252521','All body text and headings on light backgrounds.'),
      ('Border','#E3E0D7','Hairlines, dividers and outlines. Decorative only.')]
SUPPORT=[('Forest 900','#0A3C2C','Dark panels and the top of the app icon gradient.'),
         ('Forest 950','#04261A','The main dark background. The best partner for Neostra Green.'),
         ('Forest 975','#04160E','Deepest night tone for covers and film end frames.'),
         ('Mint 400','#4ACFA0','The symbol at very small sizes on dark, for example the favicon.'),
         ('Deep Green','#178062','Green text and links on light backgrounds. Passes AA.'),
         ('Ink','#070707','The wordmark on light backgrounds, as in the master files.')]
def colour():
    return f'''<section class="page" id="ch09">
{chap('09','Colour','Neostra Green is the brand’s signature and is used with restraint: on a calm, warm neutral base, it reads as a single point of light. Most surfaces are neutral. Green marks what matters.')}
<h3>Core palette</h3><p class="small" style="margin-bottom:24px">The six colours of the product and marketing system.</p>
{swatches(CORE)}
<div class="rule"></div>
<h3>Logo support colours</h3><p class="small" style="margin-bottom:24px">Same hue as Neostra Green, taken down into the night sky and up into mint. Use them for dark backgrounds and to keep green text legible.</p>
{swatches(SUPPORT)}
<p class="meta" style="margin-top:28px">CMYK values are calculated starting points. Confirm print colour with a drawdown or press proof before production.</p>
{folio(11,'Colour')}</section>'''

def oncolour():
    T=[('Canvas','cv',stacked(),'Primary. Green symbol, Ink wordmark.'),
       ('Surface','',stacked(),'Same as Canvas. Use on white paper and cards.'),
       ('Forest 950','dk',stacked(C['brand'],'#FFFFFF'),'Preferred dark version. Green symbol, white wordmark.'),
       ('Ink','ink',stacked(C['brand'],'#FFFFFF'),'For black print and dark media. Green symbol, white wordmark.'),
       ('Neostra Green','gr',stacked(C['f950'],C['f950']),'Single colour in Forest 950. Never white on green.'),
       ('Subtle','sb',stacked(),'Full colour stays clear on Subtle.'),
       ('One colour, dark','',stacked(C['ink'],C['ink']),'Ink only, for fax, stamps, engraving and one-colour print.'),
       ('One colour, light','dk',stacked('#FFFFFF','#FFFFFF'),'White only, on dark photos and single-colour dark print.')]
    cols=['1/4','4/7','7/10','10/13']*2
    tiles=''
    for (n,k,sv,d),a in zip(T,cols):
        sv=sv.replace('<svg ','<svg style="width:56%" ',1)
        tiles+=f'<div style="grid-column:{a}"><div class="tile {k}" style="height:200px">{sv}</div><h4 class="cap">{n}</h4><p class="small">{d}</p></div>'
    pairs=[('#29BD8E','#04261A','Symbol on Forest 950'),('#29BD8E','#070707','Symbol on Ink'),('#04261A','#29BD8E','Forest 950 on Neostra Green'),
           ('#4ACFA0','#04261A','Mint 400 on Forest 950'),('#252521','#FAF9F5','Text on Canvas'),('#178062','#FAF9F5','Deep Green on Canvas'),
           ('#29BD8E','#FFFFFF','Neostra Green on white'),('#FFFFFF','#29BD8E','White on Neostra Green')]
    rows=''
    for f,b,n in pairs:
        v=cr(f,b); st=('<span class="pass">Use freely</span>' if v>=4.5 else '<span class="lim">Large shapes only</span>' if v>=3 else '<span class="lim">Symbol only, never text</span>' if f=='#29BD8E' else '<span class="fail">Avoid</span>')
        rows+=f'<tr><td><span class="pv" style="background:{b};color:{f}">Aa</span></td><td>{n}</td><td style="font-variant-numeric:tabular-nums">{v:.2f} : 1</td><td>{st}</td></tr>'
    return f'''<section class="page" id="ch10">
{chap('10','The logo on colour','The symbol stays Neostra Green on every approved background except green itself. Pick the background first, then use the version shown for it.')}
<div class="grid">{tiles}</div>
<div class="rule"></div>
<div class="grid"><div class="c1-5"><h3>Contrast</h3><p class="small">Measured with the WCAG 2.2 formula. Neostra Green on white is 2.4 : 1. That is fine for the symbol, which is a large graphic, but too low for text. For green text on light backgrounds, use Deep Green.</p>
<p class="small">White on Neostra Green fails for both text and the logo, so the logo on green is always Forest 950.</p></div>
<div class="c5-13" style="grid-column:5/13"><table class="ct"><thead><tr><th>Sample</th><th>Pairing</th><th>Contrast</th><th>Guidance</th></tr></thead><tbody>{rows}</tbody></table></div></div>
{folio(12,'The logo on colour')}</section>'''

def typography():
    return f'''<section class="page" id="ch11">
{chap('11','Typography','Two typefaces, each with one job. Crimson Pro is the voice: classical, literary, trustworthy. DM Sans is the instrument: clear, modern and built for interfaces. Together they echo the logo’s serif wordmark and its clean, geometric symbol.')}
<div class="grid">
<div class="c1-7"><div class="spec">Aa</div><h3 style="margin-top:18px">Crimson Pro</h3>
<p class="small">Display and editorial. Headlines, pull quotes, chapter titles, numbers that need presence. Use Light 300 for large headlines, Regular 400 for subheads and Italic for quotes.</p>
<p style="font-family:var(--serif);font-size:22px;margin-top:16px;line-height:1.35">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 &amp; ( ) . , ; : ? ! “ ”</p>
<p class="meta" style="margin-top:12px">Open source under the SIL Open Font License. Available on Google Fonts.</p></div>
<div class="c7-13"><div class="spec sans">Aa</div><h3 style="margin-top:18px">DM Sans</h3>
<p class="small">Body text, interface, labels, data, buttons and the tagline. Use Regular 400 for text and Medium 500 for emphasis and buttons. Avoid weights above 600.</p>
<p style="font-family:var(--sans);font-size:20px;margin-top:16px;line-height:1.45">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 &amp; ( ) . , ; : ? ! “ ”</p>
<p class="meta" style="margin-top:12px">Open source under the SIL Open Font License. Available on Google Fonts.</p></div>
</div>
<div class="rule"></div>
<div class="grid">
<div class="c1-7 scale">
<div><span class="m">Display, 72</span><span style="font-family:var(--serif);font-weight:300;font-size:72px;line-height:1">Find your way.</span></div>
<div><span class="m">H1, 48</span><span style="font-family:var(--serif);font-weight:300;font-size:48px;line-height:1.1">Privacy, in one place</span></div>
<div><span class="m">H2, 32</span><span style="font-family:var(--serif);font-size:32px;line-height:1.2">Every request, on time</span></div>
<div><span class="m">H3, 24</span><span style="font-family:var(--serif);font-size:24px">Data map overview</span></div>
<div><span class="m">Body, 16</span><span style="font-size:16px">Neostra keeps your records of processing current as systems change.</span></div>
<div><span class="m">Label, 13</span><span style="font-size:13px;font-weight:500">Last reviewed 12 October</span></div>
</div>
<div class="c7-13"><h4>Rules</h4><ul class="plain">
<li>Crimson Pro for headlines, DM Sans for everything a person reads to get something done.</li>
<li>Set headlines in sentence case. Never set text in all capitals; capitals belong to the wordmark.</li>
<li>Body text 16 px minimum on screen, 9 pt in print, with line height 1.5 to 1.6 and lines under 80 characters.</li>
<li>Tighten large Crimson Pro headlines slightly, around −1.5%. Leave DM Sans body text at default spacing.</li>
<li>Neither typeface is used to write the logo. Always place the wordmark artwork.</li>
<li>If the brand fonts are unavailable, for example in email or Office files, fall back to Georgia and Arial.</li>
</ul></div></div>
{folio(13,'Typography')}</section>'''
