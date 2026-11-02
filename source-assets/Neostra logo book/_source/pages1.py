from parts import *
INS = '/sessions/brave-quirky-darwin/w/insp/'
K, TX, TY = 4.2, -805.0, 10.0
def P(x, y): return (K*x+TX, K*y+TY)
GT = f'transform="translate({TX} {TY}) scale({K})"'
NS = 'vector-effect="non-scaling-stroke"'

def folio(n, title, dark=False):
    return f'<div class="folio"><span><b>Neostra</b>&nbsp;&nbsp;Logo book, edition 1.0</span><span>{title}&nbsp;&nbsp;&nbsp;{n:02d}</span></div>'

def chap(no, title, lede):
    return f'<div class="chap"><div class="no">Chapter {no}</div><h2>{title}</h2><p class="lede">{lede}</p></div>'

RING_MASK = ('<mask id="m-ring" maskUnits="userSpaceOnUse" x="200" y="0" width="150" height="140">'
             '<rect x="200" y="0" width="150" height="140" fill="#fff"/><use href="#p-star" fill="#000" stroke="#000" stroke-width=".6"/></mask>')

def cover():
    circ = ''.join(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#123F2F" stroke-width="1" {NS} {extra}/>'
                   for cx, cy, r, extra in [(278.65,69.91,51.9,''),(289.07,60.59,51.3,'stroke-dasharray="3 5"'),(269.5,78.0,51.3,'stroke-dasharray="3 5"'),(278.65,69.91,74,'')])
    axes = (f'<line x1="232.6" y1="-10.7" x2="331" y2="148.9" stroke="#123F2F" {NS}/>'
            f'<line x1="232" y1="95.5" x2="329" y2="38.8" stroke="#123F2F" {NS}/>')
    art = (f'<svg class="orbit" viewBox="190 -12 180 180" aria-hidden="true"><defs>{RING_MASK}</defs>{circ}{axes}'
           f'<use href="#p-sym" fill="{C["brand"]}" mask="url(#m-ring)"/>'
           f'<g class="spin"><use href="#p-star" fill="{C["brand"]}"/></g></svg>')
    return f'''<section class="page cover" id="cover">
{art}
<div style="position:relative;max-width:640px">
<div class="logo">{horizontal(C['brand'], '#FFFFFF')}</div>
<h1>Logo book</h1>
<p class="sub">How the Neostra mark was found, how it is built, and how to use it so it always looks like itself.</p>
<p class="meta" style="margin-top:64px;color:#7FA595">Brand identity guidelines, edition 1.0<br>October 2026</p>
</div></section>'''

TOC = [('01','The idea',3),('02','Where the mark came from',4),('03','Anatomy of the symbol',5),('04','Construction',6),
       ('05','The wordmark',7),('06','Logo family',8),('07','Clear space',9),('08','Minimum size',10),('09','Colour',11),
       ('10','The logo on colour',12),('11','Typography',13),('12','The North Star',14),('13','The North Star in use',15),
       ('14','Tagline',16),('15','Misuse',17),('16','Applications: digital',18),('17','Applications: print and office',19),('18','Files and naming',20)]
def contents():
    rows = ''.join(f'<a href="#ch{n}"><span class="n">{n}</span><span>{t}</span><span class="pg">{p:02d}</span></a>' for n,t,p in TOC)
    return f'''<section class="page" id="contents">
<div class="chap"><div class="no">Contents</div><h2>Inside this book</h2>
<p class="lede">Chapters 1 to 5 explain the thinking behind the mark. Chapters 6 to 15 are the rules. Chapters 16 to 18 show the logo at work and list the master files. If you only have five minutes, read chapters 6, 7, 10 and 15.</p></div>
<div class="grid"><div class="c3-13"><div class="toc">{rows}</div></div></div>
{folio(2,'Contents')}</section>'''

def idea():
    return f'''<section class="page" id="ch01">
{chap('01','The idea','Neostra is a privacy operations and compliance platform. Privacy teams use it to map data, answer requests, manage consent and prove compliance, all in one place. The identity has one job: make that work feel calm, oriented and protected.')}
<div class="grid">
<div class="c3-8">
<h3>A new star</h3>
<p>The name joins two words. <em>Neo</em> means new. <em>Astra</em> is Latin for the stars. Neostra is a new star: a fixed point to steer by when the rules keep moving and the data keeps growing.</p>
<p>Sailors trusted the North Star because it holds still while everything else turns around it. That is the role Neostra wants to play for a privacy team: the one reference point that stays true.</p>
<h3 style="margin-top:40px">The space for privacy.</h3>
<p>The tagline carries two meanings at once. Space is the night sky where the star lives. Space is also room: a protected place where personal data is kept safe and handled with care. The symbol draws both meanings. A star sits inside an open orbit that guards it without caging it.</p>
</div>
<div class="c8-13">
<div class="tile dk" style="height:420px">{stacked(C['brand'], '#FFFFFF', True, '#FFFFFF', style='width:72%')}</div>
<dl class="kv" style="margin-top:28px">
<dt>Brand name</dt><dd>Neostra. Written with a capital N in running text. The wordmark artwork shows NEOSTRĀ in capitals with a macron.</dd>
<dt>Tagline</dt><dd>The space for privacy.</dd>
<dt>Primary colour</dt><dd>Neostra Green, #29BD8E</dd>
<dt>Typefaces</dt><dd>Crimson Pro for display, DM Sans for everything else</dd>
<dt>Personality</dt><dd>Steady, precise, quietly confident. Never alarmist about risk.</dd>
</dl>
</div></div>
{folio(3,'The idea')}</section>'''

def origin():
    steps = [
        ('i0.png','The compass rose','The search began with the oldest tool for finding your way. A compass rose is calm, symmetric and trusted. It points, it orients, it never panics.'),
        ('i1.png','One needle, pulled out','The rose was reduced to its main needle. The needle was turned off true north onto a diagonal axis, shown in green, so the mark leans forward and feels in motion instead of static.'),
        ('i2.png','The star','The diagonal needle was crossed with a short arm at right angles. Long arms of about twice the short arms turned the needle into a four-point star, sharp at the tips and soft at the joins.'),
        ('i3.png','The orbit','Arcs were drawn around the star to give it a place to live. The dotted line shows the full circle the arcs imply. The orbit never closes completely, because privacy should protect people without locking them in.'),
        (None,'The Neostra symbol','The two sketched arcs became two offset circles cut from one disc. The heavy crescent moved to the trailing side. The star breaks out of the orbit at both tips, as if it is moving forward through it.'),
    ]
    out = ''
    for i,(img,t,d) in enumerate(steps,1):
        fr = f'<img src="{img64(INS+img)}" alt="{t} sketch">' if img else f'<div style="width:78%">{sym()}</div>'
        out += f'<div class="step"><div class="frame">{fr}</div><div class="n">{i}</div><h4>{t}</h4><p>{d}</p></div>'
    return f'''<section class="page" id="ch02">
{chap('02','Where the mark came from','The symbol was not invented from nothing. It was found by simplifying a compass rose, one step at a time, until only the parts that carry meaning were left. These are the original working sketches.')}
<div class="steps">{out}</div>
<div class="journey"><div class="c3-10" style="grid-column:3/10"><p class="quote">Start with a tool for finding your way. Remove everything that does not help you find it. Give what remains a safe place to move.</p>
<p class="meta" style="margin-top:14px">The design principle behind every decision in this book.</p></div></div>
{folio(4,'Where the mark came from')}</section>'''

def anatomy():
    marks = [(1,(280.6,67.1),'North Star','The four-point star at the centre. It is the brand in one shape: a fixed point to steer by.'),
             (2,(233.0,86.0),'Crescent','The heavy side of the orbit. It sits on the trailing side and gives the mark weight, like a moon behind the star.'),
             (3,(326.2,58.0),'Orbit','The thin side of the ring. It finishes the circle lightly, so the mark stays open on the leading side.'),
             (4,(245.37,10.0),'Breakout points','The long arms pass through the orbit at both ends. The star is held, not trapped.'),
             (5,(291.0,39.0),'Open space','The two counters between star and orbit. This is the space in the tagline, kept clean at every size.')]
    pins = ''
    for n,(x,y),t,d in marks:
        px,py = P(x,y)
        pins += f'<circle cx="{px:.1f}" cy="{py:.1f}" r="15" fill="{C["text"]}"/><text x="{px:.1f}" y="{py+5:.1f}" text-anchor="middle" font-family="DM Sans,system-ui,sans-serif" font-size="15" font-weight="500" fill="#fff">{n}</text>'
    px,py = P(318.24,128.18)
    pins += f'<circle cx="{px:.1f}" cy="{py:.1f}" r="15" fill="{C["text"]}"/><text x="{px:.1f}" y="{py+5:.1f}" text-anchor="middle" font-family="DM Sans,system-ui,sans-serif" font-size="15" font-weight="500" fill="#fff">4</text>'
    art = (f'<svg viewBox="100 20 560 562" role="img" aria-label="Annotated Neostra symbol" style="width:100%;height:100%"><defs>{RING_MASK}</defs>'
           f'<g {GT}><use href="#p-sym" fill="#BFEBDC" mask="url(#m-ring)"/><use href="#p-star" fill="{C["brand"]}"/></g>{pins}</svg>')
    legend = ''.join(f'<li><h4>{n}&nbsp;&nbsp;{t}</h4><span class="small">{d}</span></li>' for n,_,t,d in marks)
    return f'''<section class="page" id="ch03">
{chap('03','Anatomy of the symbol','The symbol has two parts that always travel together: the North Star and the orbit around it. Knowing the parts makes the rules in later chapters easier to follow.')}
<div class="grid"><div class="c1-7"><div class="tile" style="height:600px;padding:24px">{art}</div></div>
<div class="c7-13"><ul class="plain">{legend}</ul>
<p class="small" style="margin-top:24px">The orbit is shown in a pale tint here only to separate the parts. In the logo, star and orbit are always one colour.</p></div></div>
{folio(5,'Anatomy of the symbol')}</section>'''
