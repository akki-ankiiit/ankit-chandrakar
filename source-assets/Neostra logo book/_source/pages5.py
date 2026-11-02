from pages4 import *
def misuse():
    W='width:62%'
    def raw(vb, inner, style=W, extra=''): return f'<svg viewBox="{vb}" style="{style}" {extra} aria-hidden="true">{inner}</svg>'
    base = f'<use href="#p-sym" fill="{C["brand"]}"/><use href="#p-wmk" fill="{C["ink"]}"/>'
    items=[
     ('Do not stretch or squash the logo.','', raw(VB_STACK, base, 'width:80%;height:80px', 'preserveAspectRatio="none"')),
     ('Do not rotate the logo.','', f'<div style="transform:rotate(-18deg);width:62%">{stacked()}</div>'),
     ('Do not change the angle of the star.','', raw(VB_STACK, f'<defs><mask id="mm" maskUnits="userSpaceOnUse" x="200" y="0" width="150" height="140"><rect x="200" y="0" width="150" height="140" fill="#fff"/><use href="#p-star" fill="#000" stroke="#000" stroke-width=".6"/></mask></defs><use href="#p-sym" fill="{C["brand"]}" mask="url(#mm)"/><use href="#p-star" fill="{C["brand"]}" transform="rotate(32 280.6 67.1)"/><use href="#p-wmk" fill="{C["ink"]}"/>')),
     ('Do not recolour the symbol.','', stacked('#3E7BFA', C['ink'], style=W)),
     ('Do not use white on Neostra Green.','gr', stacked('#FFFFFF','#FFFFFF', style=W)),
     ('Do not add shadows, glows or effects.','', f'<div style="width:62%;filter:drop-shadow(4px 6px 4px rgba(0,0,0,.45))">{stacked()}</div>'),
     ('Do not outline the logo.','', raw(VB_STACK, f'<use href="#p-sym" fill="none" stroke="{C["brand"]}" stroke-width="2.6"/><use href="#p-wmk" fill="none" stroke="{C["ink"]}" stroke-width="1.6"/>')),
     ('Do not rearrange the parts.','', raw("50 140 548 70", f'<use href="#p-wmk" fill="{C["ink"]}"/><use href="#p-sym" fill="{C["brand"]}" transform="translate(417 150) scale(.48)"/>', 'width:82%')),
     ('Do not retype the name.','', f'<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><div style="width:50px">{sym()}</div><div style="font-family:var(--sans);font-weight:700;font-size:26px;letter-spacing:.02em">Neostra</div></div>'),
     ('Do not change the proportions.','', raw("40 -60 480 264", f'<use href="#p-sym" fill="{C["brand"]}" transform="translate(-280 -100) scale(2)"/><use href="#p-wmk" fill="{C["ink"]}" transform="translate(150 70) scale(.5)"/>', 'width:62%')),
    ]
    tiles=''.join(f'<div><div class="tile {k}">{a}<span class="x" aria-hidden="true">✕</span></div><p>{t}</p></div>' for t,k,a in items)
    return f'''<section class="page" id="ch15">
{chap('15','Misuse','The logo only works if it looks the same everywhere. These are the mistakes seen most often. If a layout seems to need one of them, the layout needs to change, not the logo.')}
<div class="mis">{tiles}</div>
<div class="rule"></div>
<div class="grid"><div class="c1-7"><p class="small">Also avoid placing the logo on busy photographs, patterns or gradients. If it must sit on an image, choose a calm, dark area and use the one-colour white version, or place the logo on a Forest 950 panel.</p></div>
<div class="c7-13"><p class="small">Never animate the parts of the logo separately except in approved brand films, and never redraw, trace or rebuild it from a screenshot. Use the master files listed in chapter 18.</p></div></div>
{folio(17,'Misuse')}</section>'''

def appicon(size, kind='primary', radius=None):
    r = radius if radius is not None else size*0.225
    if kind=='primary': bg='linear-gradient(180deg,#0A3C2C 0%,#04160E 100%)'; f=C['brand']
    elif kind=='mint': bg=C['brand']; f=C['f950']
    else: bg=C['f950']; f=C['mint']
    pad = 0.24 if size>40 else 0.14
    return f'<div style="width:{size}px;height:{size}px;border-radius:{r}px;background:{bg};display:flex;align-items:center;justify-content:center;flex:none">{sym(f, style=f"width:{(1-2*pad)*100:.0f}%")}</div>'

def apps_digital():
    web=f'''<div class="mock" style="background:var(--canvas);border:1px solid var(--border);height:400px">
<div style="height:30px;background:#ECEAE3;display:flex;align-items:center;gap:6px;padding:0 12px"><i style="width:9px;height:9px;border-radius:50%;background:#D4D1C7"></i><i style="width:9px;height:9px;border-radius:50%;background:#D4D1C7"></i><i style="width:9px;height:9px;border-radius:50%;background:#D4D1C7"></i></div>
<div style="display:flex;align-items:center;justify-content:space-between;padding:20px 32px;border-bottom:1px solid var(--border);background:#fff">{horizontal(style='width:150px')}
<div style="display:flex;gap:26px;font-size:14px;align-items:center"><span>Platform</span><span>Solutions</span><span>Resources</span><span>Pricing</span><span style="background:var(--f950);color:#fff;padding:9px 16px;border-radius:8px;font-weight:500">Book a demo</span></div></div>
<div style="padding:52px 32px;display:grid;grid-template-columns:1.2fr 1fr;gap:32px;align-items:center">
<div><div style="font-family:var(--serif);font-weight:300;font-size:52px;line-height:1.02;letter-spacing:-.015em">The space for privacy.</div>
<p style="font-size:15.5px;margin-top:16px;color:#4A4943;max-width:42ch">Map your data, answer every request on time and prove compliance, from one calm workspace built for privacy teams.</p></div>
<div style="height:200px;border-radius:12px;background:var(--f950);display:flex;align-items:center;justify-content:center">{sym(style='height:62%')}</div></div></div>'''
    social=f'<div style="flex:none;width:120px;height:120px;border-radius:50%;background:var(--f950);display:flex;align-items:center;justify-content:center">{sym(style="width:58%")}</div>'
    tab=f'''<div style="display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--border);border-radius:8px 8px 0 0;padding:8px 14px;font-size:13px">{appicon(16,'fav',3)}Neostra · Privacy workspace</div>'''
    tab = tab.replace(' · ',' | ')
    return f'''<section class="page" id="ch16">
{chap('16','Applications: digital','How the logo appears on screens. The dark Forest tile is the brand’s home for the symbol at small sizes: it gives Neostra Green the contrast it needs.')}
<div class="grid">
<div class="c1-9" style="grid-column:1/9">{web}<h4 class="cap">Website header</h4><p class="small">Horizontal logo on white, left aligned, at 150 px wide or more. The hero carries the tagline in Crimson Pro Light.</p></div>
<div class="c9-13">
<div style="display:flex;gap:18px;align-items:flex-end">{appicon(120)}{appicon(80,'mint')}{appicon(56)}</div>
<h4 class="cap">App icon</h4><p class="small">Green symbol on a Forest 900 to 975 gradient. The alternate uses a Forest 950 symbol on green. The symbol fills 60% of the tile.</p>
<div style="display:flex;gap:18px;align-items:flex-end;margin-top:26px">{appicon(16,'fav',3)}{appicon(32,'fav',6)}{appicon(48,'fav',10)}</div>
<h4 class="cap">Favicon</h4><p class="small">Mint 400 symbol on Forest 950, shown at 16, 32 and 48 px. The lighter mint stays crisp at tiny sizes.</p>
<div style="margin-top:20px">{tab}</div>
</div>
<div class="c1-5" style="display:flex;gap:20px;align-items:center">{social}<div><h4>Social avatar</h4><p class="small">Symbol on Forest 950, centred, 58% of the circle.</p></div></div>
<div class="c5-13" style="grid-column:5/13"><div class="tile" style="height:120px;justify-content:flex-start;padding:0 28px;gap:24px"><div style="border-left:3px solid var(--brand);padding-left:16px"><div style="font-weight:500;font-size:15px">Aisha Raman</div><div class="small">Head of Privacy Programs</div><div class="small" style="color:var(--deep)">neostra.io</div></div>{horizontal(style='width:120px;margin-left:auto')}</div><h4 class="cap">Email signature</h4><p class="small">Horizontal logo as a 2× PNG at 120 px wide. Text in Arial as the email-safe fallback for DM Sans.</p></div>
</div>
{folio(18,'Applications: digital')}</section>'''

def apps_print():
    front=f'<div class="mock" style="aspect-ratio:85/55;background:var(--f975);display:flex;align-items:center;justify-content:center">{stacked(C["brand"],"#FFFFFF",style="width:44%")}</div>'
    back=f'''<div class="mock" style="aspect-ratio:85/55;background:var(--canvas);border:1px solid var(--border);padding:8%;display:flex;flex-direction:column;justify-content:space-between">
<div><div style="font-family:var(--serif);font-size:26px">Aisha Raman</div><div style="font-size:13px;color:#4A4943">Head of Privacy Programs</div></div>
<div style="display:flex;justify-content:space-between;align-items:flex-end"><div style="font-size:12.5px;line-height:1.6">aisha@neostra.io<br>+91 00000 00000<br>neostra.io</div>{wordmark(style='width:120px')}</div></div>'''
    slide=f'''<div class="mock" style="aspect-ratio:16/9;background:var(--f950);color:#E6EFEA;padding:5%;display:flex;flex-direction:column;justify-content:space-between">
<div style="position:absolute;right:6%;top:50%;transform:translateY(-50%);height:70%;width:30%">{sym(style='height:100%;width:100%')}</div>
<div style="font-size:13px;color:#A9C2B7">Quarterly privacy review</div>
<div style="font-family:var(--serif);font-weight:300;font-size:46px;line-height:1.05;max-width:12ch">Where we stand on privacy</div>
<div style="font-size:12px;color:#7FA595">Neostra | Q4 2026</div></div>'''
    letter=f'''<div class="mock" style="aspect-ratio:210/297;background:#fff;border:1px solid var(--border);padding:9%;display:flex;flex-direction:column">
<div style="width:38%">{horizontal()}</div>
<div style="margin-top:16%;display:flex;flex-direction:column;gap:7px">{''.join(f'<i style="display:block;height:5px;border-radius:3px;background:#E8E6DE;width:{w}%"></i>' for w in [40,92,88,95,70,0,90,94,86,60])}</div>
<div style="margin-top:auto;font-size:9px;color:var(--muted);border-top:1px solid var(--border);padding-top:8px">Neostra | The space for privacy. | neostra.io</div></div>'''
    return f'''<section class="page" id="ch17">
{chap('17','Applications: print and office','On paper and in documents the logo keeps the same rules. Dark covers use Forest 975 with the white-wordmark version. Everyday documents stay light and quiet.')}
<div class="grid">
<div class="c1-5">{front}<h4 class="cap">Business card, front</h4><p class="small">85 × 55 mm. Stacked logo, 38 mm wide, centred on Forest 975.</p></div>
<div class="c5-9">{back}<h4 class="cap">Business card, back</h4><p class="small">Name in Crimson Pro, details in DM Sans. The wordmark alone is fine here because the symbol is on the front.</p></div>
<div class="c9-13" style="grid-row:span 2">{letter}<h4 class="cap">Letterhead and documents</h4><p class="small">A4. Horizontal logo top left at 45 mm wide. The tagline can sign off in the footer.</p></div>
<div class="c1-9" style="grid-column:1/9">{slide}<h4 class="cap">Presentation</h4><p class="small">Title slides on Forest 950 with the symbol large on the right. Content slides use Canvas with the horizontal logo small in the footer.</p></div>
</div>
{folio(19,'Applications: print and office')}</section>'''

FILES=[('neostra-stacked','Primary stacked logo','color-light, color-dark, ink, white, forest'),
       ('neostra-stacked-tagline','Stacked with tagline','color-light, color-dark, ink, white, forest'),
       ('neostra-horizontal','Horizontal logo','color-light, color-dark, ink, white, forest'),
       ('neostra-symbol','Symbol','color, ink, white, forest'),
       ('neostra-wordmark','Wordmark','ink, white, forest'),
       ('neostra-north-star','North Star device','green, deep, ink, white, forest, mint'),
       ('neostra-app-icon','App icon tiles','primary, mint'),
       ('neostra-favicon','Favicon','svg, 16, 32, 48, 180, 512')]
def files():
    rows=''.join(f'<tr><td style="font-weight:500">{a}</td><td>{b}</td><td class="meta">{c}</td></tr>' for a,b,c in FILES)
    return f'''<section class="page" id="ch18">
{chap('18','Files and naming','Every logo in this book is supplied as master artwork in the assets folder next to this file. Use SVG for screens, PNG where SVG is not accepted, and SVG or PDF from SVG for print.')}
<div class="grid"><div class="c1-9" style="grid-column:1/9"><table class="ct"><thead><tr><th>File name</th><th>Contents</th><th>Versions</th></tr></thead><tbody>{rows}</tbody></table></div>
<div class="c9-13"><h4>Naming pattern</h4><p class="small">neostra-[version]-[colour].svg, for example neostra-horizontal-color-dark.svg. “color-light” means for light backgrounds, “color-dark” means for dark backgrounds.</p>
<h4 style="margin-top:22px">Colour versions</h4><p class="small">color-light: green symbol, Ink wordmark. color-dark: green symbol, white wordmark. ink, white and forest: the whole logo in one colour.</p>
<h4 style="margin-top:22px">PNG files</h4><p class="small">Supplied at 2048 px on the long side with a transparent background, plus app icon and favicon sizes.</p>
<h4 style="margin-top:22px">Fonts</h4><p class="small">Crimson Pro and DM Sans are free from Google Fonts. The logo files are outlined, so they need no fonts to display.</p></div></div>
{folio(20,'Files and naming')}</section>'''

def back():
    return f'''<section class="page cover" id="end" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:900px">
<div style="width:380px">{stacked(C['brand'],'#FFFFFF',True,'#FFFFFF')}</div>
<p class="meta" style="margin-top:80px;color:#7FA595;text-align:center">Neostra logo book, edition 1.0, October 2026.<br>For questions about the brand, contact the Neostra brand team.</p></section>'''
