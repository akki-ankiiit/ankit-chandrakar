from pages1 import *
import math
CIRC=[(278.65,69.91,51.9,'#252521',''),(289.07,60.59,51.3,'#178062','4 4'),(269.5,78.0,51.3,'#B4372B','4 4')]
def construction():
    g = ''
    # circles
    for cx,cy,r,col,da in CIRC:
        g += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{col}" stroke-width="1" stroke-dasharray="{da}" {NS}/>'
        g += f'<circle cx="{cx}" cy="{cy}" r=".9" fill="{col}"/>'
    T=(245.37,10.0);B=(318.242,128.179);L=(250.12,84.92);R=(308.2,51.0);C0=(280.59,67.12)
    def ext(a,b,e):
        dx,dy=b[0]-a[0],b[1]-a[1]; n=math.hypot(dx,dy); return (a[0]-dx/n*e,a[1]-dy/n*e,b[0]+dx/n*e,b[1]+dy/n*e)
    for a,b in [(T,B),(L,R)]:
        x1,y1,x2,y2 = ext(a,b,14); g += f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="#B4372B" stroke-width="1.2" {NS}/>'
    g += f'<line x1="{C0[0]}" y1="-6" x2="{C0[0]}" y2="140" stroke="#252521" stroke-width="1" stroke-dasharray="2 4" {NS}/>'
    g += f'<line x1="214" y1="{C0[1]}" x2="346" y2="{C0[1]}" stroke="#252521" stroke-width="1" stroke-dasharray="2 4" {NS}/>'
    # angle arc
    r=30; a0=math.radians(-90); a1=math.atan2(T[1]-C0[1],T[0]-C0[0])
    x0,y0=C0[0]+r*math.cos(a0),C0[1]+r*math.sin(a0); x1,y1=C0[0]+r*math.cos(a1),C0[1]+r*math.sin(a1)
    g += f'<path d="M{x0:.2f} {y0:.2f} A{r} {r} 0 0 0 {x1:.2f} {y1:.2f}" fill="none" stroke="#B4372B" stroke-width="1.5" {NS}/>'
    for p in (T,B,L,R): g += f'<circle cx="{p[0]}" cy="{p[1]}" r="1.1" fill="#B4372B"/>'
    lab = lambda x,y,t,col='#252521',anc='start': f'<text x="{x:.1f}" y="{y:.1f}" font-family="DM Sans,system-ui,sans-serif" font-size="14" fill="{col}" text-anchor="{anc}">{t}</text>'
    tx,ty = P(266,36); labels = lab(tx-6,ty,'31.7°','#B4372B','end')
    labels=labels.replace('font-size="14"','font-size="17" font-weight="500"')
    for (cx,cy,r,col,_),nm,ang in zip(CIRC,'ABC',[15,-38,148]):
        a=math.radians(ang); px,py=P(cx+(r+6)*math.cos(a), cy+(r+6)*math.sin(a))
        labels += f'<circle cx="{px:.1f}" cy="{py:.1f}" r="13" fill="#fff" stroke="{col}"/><text x="{px:.1f}" y="{py+5.5:.1f}" text-anchor="middle" font-family="DM Sans,system-ui,sans-serif" font-size="15" font-weight="500" fill="{col}">{nm}</text>'
    art = (f'<svg viewBox="100 0 600 600" role="img" aria-label="Construction drawing of the symbol" style="width:100%;height:100%">'
           f'<g {GT}><use href="#p-sym" fill="#BFEBDC"/>{g}</g>{labels}</svg>')
    return f'''<section class="page" id="ch04">
{chap('04','Construction','The symbol is built from three circles and two crossed axes. The numbers below come from the master artwork and are given so the mark can be checked, never redrawn. Always use the supplied files.')}
<div class="grid"><div class="c1-7"><div class="tile" style="height:620px;padding:10px">{art}</div></div>
<div class="c7-13">
<div style="display:flex;gap:18px;margin-bottom:22px" class="small"><span><b style="color:#252521">A</b> orbit, outer edge</span><span><b style="color:#178062">B</b> inner edge of the crescent</span><span><b style="color:#B4372B">C</b> inner edge of the orbit</span></div><h3>Three circles</h3>
<p class="small">Circle A sets the outer edge of the orbit. Circles B and C are each 0.99 × the size of A and are pushed off-centre in opposite directions along one diagonal, each by about a quarter of A’s radius. Where B is cut away, the thick crescent remains on the lower left. Where C is cut away, the thin orbit remains on the upper right.</p>
<h3 style="margin-top:28px">Two axes</h3>
<p class="small">The star sits on a cross of two axes at right angles, like the cardinal points of a compass. The whole cross is turned 31.7° anticlockwise from true north. That lean is fixed. It gives the star its sense of forward motion.</p>
<dl class="kv" style="margin-top:28px;grid-template-columns:220px 1fr">
<dt>Long arms, tip to tip</dt><dd>1.34 × the orbit diameter</dd>
<dt>Short arms, tip to tip</dt><dd>0.65 × the orbit diameter</dd>
<dt>Long to short ratio</dt><dd>2 : 1</dd>
<dt>Arm lengths from centre</dt><dd>Top 67, bottom 72, left 35, right 32 units</dd>
<dt>Star centre</dt><dd>Slightly above and right of the orbit centre</dd>
<dt>Lean of the star</dt><dd>31.7° anticlockwise, both axes</dd>
</dl>
<p class="small" style="margin-top:20px">The slightly longer bottom arm acts like the weighted end of a compass needle. It keeps the star stable while the top arm reaches forward.</p>
</div></div>
{folio(6,'Construction')}</section>'''

LET = [(58.43,97.8),(132.4,165.0),(198.5,238.1),(273.5,299.7),(331.5,366.9),(399.7,435.2),(461.18,502.05)]
def wordmark_page():
    g = ''
    for y,t in [(161.98,'cap height'),(203.07,'baseline'),(151.12,'macron')]:
        g += f'<line x1="40" x2="520" y1="{y}" y2="{y}" stroke="#178062" stroke-width="1" stroke-dasharray="{"" if t!="macron" else "3 3"}" {NS}/>'
    for (a,b),(c,d) in zip(LET,LET[1:]):
        g += f'<rect x="{b}" y="208" width="{c-b:.2f}" height="3" fill="{C["brand"]}"/>'
    vb = "36 138 488 82"
    art = f'<svg viewBox="{vb}" role="img" aria-label="Wordmark with guides" style="width:100%;height:100%">{g}<use href="#p-wmk" fill="{C["ink"]}"/></svg>'
    return f'''<section class="page" id="ch05">
{chap('05','The wordmark','NEOSTRĀ is set in classical serif capitals with wide, even spacing. The serif gives the name the authority of something written down and kept. The open spacing gives it air. The wordmark is drawn artwork, not live type.')}
<div class="tile" style="height:300px;padding:40px 60px">{art}</div>
<div class="grid" style="margin-top:48px">
<div class="c1-5"><h3>Wide spacing</h3><p class="small">The space between letters, marked in green, is about 0.8 × the cap height. Optical spacing is used instead of mechanical, so the round O and the open Λ do not leave holes. Never close up or stretch the spacing.</p></div>
<div class="c5-9"><h3>The open A</h3><p class="small">The last letter is an A without its crossbar. It rises to a point, echoing the top arm of the North Star, and keeps the end of the word light. Do not replace it with a standard A.</p></div>
<div class="c9-13"><h3>The macron</h3><p class="small">The bar over the final letter marks the long ā of astra, the star in the name. It also reads as a horizon line with something rising above it. It is part of the wordmark and must never be removed.</p></div>
</div>
<div class="rule"></div>
<div class="grid"><div class="c1-7"><h4>Writing the name</h4><p class="small">In sentences, write Neostra with a capital N and no macron. Never write NEOSTRA in capitals in running text, and never type the macron in body copy. The capitals and the macron belong to the logo only.</p></div>
<div class="c7-13"><h4>Why it is artwork</h4><p class="small">Retyping the name in Crimson Pro or any other font will not reproduce the spacing, the open A or the macron. Always place the supplied wordmark file.</p></div></div>
{folio(7,'The wordmark')}</section>'''

def family():
    return f'''<section class="page" id="ch06">
{chap('06','Logo family','There are five approved versions. Choose by the shape of the space and how much room you have. When in doubt, use the primary stacked logo.')}
<div class="grid">
<div class="c1-7"><div class="tile" style="height:400px">{stacked(style='width:62%')}</div>
<h3 class="cap">Primary stacked</h3><p class="small">The default logo. Use it wherever the space is roughly square or there is room to breathe: covers, home pages, packaging, signage.</p></div>
<div class="c7-13"><div class="tile" style="height:400px">{stacked(tag=True, style='width:62%')}</div>
<h3 class="cap">Stacked with tagline</h3><p class="small">For brand moments where the promise matters: campaign end frames, event backdrops, the last slide of a pitch. Not for small sizes or product UI.</p></div>
<div class="c1-5"><div class="tile" style="height:220px">{horizontal(style='width:76%')}</div>
<h3 class="cap">Horizontal</h3><p class="small">For wide, short spaces: website and product headers, email signatures, document footers.</p></div>
<div class="c5-9"><div class="tile" style="height:220px">{sym(style='height:62%')}</div>
<h3 class="cap">Symbol</h3><p class="small">For square or tiny spaces where the brand is already known: app icon, favicon, social avatar, loading screens.</p></div>
<div class="c9-13"><div class="tile" style="height:220px">{wordmark(style='width:78%')}</div>
<h3 class="cap">Wordmark</h3><p class="small">Rarely needed. Use only where the symbol already appears nearby, for example on the back of a business card.</p></div>
</div>
{folio(8,'Logo family')}</section>'''

def clearspace():
    def box(vb, inner, X, lx, ly, lw, lh):
        x0,y0 = lx-X, ly-X; w,h = lw+2*X, lh+2*X
        g = f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="#E7F7F0" stroke="{C["brand"]}" stroke-width="1" stroke-dasharray="4 3" {NS}/>'
        g += f'<rect x="{lx}" y="{ly}" width="{lw}" height="{lh}" fill="{C["canvas"]}" stroke="#C9C6BC" stroke-width="1" {NS}/>'
        for (sx,sy) in [(x0,y0),(lx+lw,y0),(x0,ly+lh),(lx+lw,ly+lh)]:
            g += f'<rect x="{sx}" y="{sy}" width="{X}" height="{X}" fill="none" stroke="{C["deep"]}" stroke-width="1" {NS}/>'
            g += f'<text x="{sx+X/2}" y="{sy+X*0.64}" font-family="Crimson Pro,Georgia,serif" font-style="italic" font-size="{X*0.5}" text-anchor="middle" fill="{C["deep"]}">x</text>'
        pad = X*0.4
        return f'<svg viewBox="{x0-pad} {y0-pad} {w+2*pad} {h+2*pad}" role="img" aria-label="Clear space diagram" style="width:100%;height:100%">{g}{inner}</svg>'
    s = box("", f'<use href="#p-sym" fill="{C["brand"]}"/><use href="#p-wmk" fill="{C["ink"]}"/>', 41.09, 58.43, 10.0, 443.62, 193.88)
    hz = box("", f'<use href="#p-sym" fill="{C["brand"]}" transform="translate(-78.973 37.371) scale(0.49197)"/><use href="#p-wmk" fill="{C["ink"]}" transform="translate(79.39 -38.14) scale(0.6)"/>', 24.65, 31.73, 42.29, 348.85, 58.14)
    sy_ = box("", f'<use href="#p-sym" fill="{C["brand"]}"/>', 39.39, 225.01, 10.0, 105.64, 118.18)
    return f'''<section class="page" id="ch07">
{chap('07','Clear space','Clear space keeps the logo from being crowded by text, edges and other marks. It is measured with x, the cap height of the wordmark, so it scales with the logo automatically.')}
<div class="grid">
<div class="c1-7"><div class="tile cv" style="height:420px;padding:20px">{s}</div><p class="small cap">Stacked logo. Keep at least 1x clear on every side. With the tagline, measure from the tagline’s baseline.</p></div>
<div class="c7-13"><div class="tile cv" style="height:200px;padding:20px">{hz}</div><p class="small cap">Horizontal logo. x is the cap height of its wordmark, so the clear space is smaller in absolute terms.</p>
<div class="tile cv" style="height:200px;padding:20px;margin-top:20px">{sy_}</div><p class="small cap">Symbol on its own. x is one third of the symbol’s height, which matches its proportion in the stacked logo.</p></div>
</div>
<div class="rule"></div>
<div class="grid"><div class="c1-7"><p class="small">Clear space is a minimum. Give the logo more room whenever you can, especially on covers and home pages, where 2x or more looks best.</p></div>
<div class="c7-13"><p class="small">Never let a photo edge, a line of text, a button or a partner logo enter the clear space. Partner logos sit at least 2x away and are divided by a 1 px rule in Border colour.</p></div></div>
{folio(9,'Clear space')}</section>'''

def minsize():
    items = [('Stacked',lambda w: stacked(style=f'width:{w}px'),[120,180,260],'120 px wide on screen. 30 mm wide in print.'),
             ('Stacked with tagline',lambda w: stacked(tag=True,style=f'width:{w}px'),[200,260],'200 px wide on screen. 50 mm wide in print. Below this the tagline is hard to read, so use the stacked logo without it.'),
             ('Horizontal',lambda w: horizontal(style=f'width:{w}px'),[110,160,240],'110 px wide on screen. 28 mm wide in print.'),
             ('Symbol',lambda w: sym(style=f'width:{w}px'),[16,24,32,48],'16 px on screen, using the small-size favicon file below 32 px. 6 mm in print.'),
             ('North Star',lambda w: star(style=f'height:{w}px'),[10,16,24],'10 px tall on screen. 4 mm in print.')]
    rows=''
    for t,f,ws,d in items:
        ex = ''.join(f'<div style="display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;gap:8px">{f(w)}<span class="meta">{w} px</span></div>' for w in ws)
        rows += f'<div class="c1-5"><h4>{t}</h4><p class="small">{d}</p></div><div class="c5-13" style="grid-column:5/13;display:flex;gap:56px;align-items:flex-end;border-bottom:1px solid var(--border);padding-bottom:24px">{ex}</div>'
    return f'''<section class="page" id="ch08">
{chap('08','Minimum size','Below these sizes the open spaces in the symbol fill in and the wordmark spacing breaks down. Examples are shown at actual size on a standard screen.')}
<div class="grid" style="row-gap:28px">{rows}</div>
{folio(10,'Minimum size')}</section>'''
