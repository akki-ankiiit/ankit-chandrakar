from pages3 import *
def northstar():
    rules=[('One star per view','There is only one North Star. Never repeat it as a pattern, a starfield or a row of icons.'),
           ('Fixed lean','The star always leans 31.7° anticlockwise, exactly as in the logo. Never rotate, flip or spin it.'),
           ('Approved colours','Neostra Green on Canvas, Surface, Forest and Ink. Forest 950 on Neostra Green. Mint 400 on Forest below 24 px.'),
           ('Room around it','Keep clear space of at least half the star’s width on every side.'),
           ('Never in a ring','Do not put the star inside a circle, badge or new orbit. The orbit belongs to the logo.'),
           ('Not the logo','The star alone does not replace the logo. The brand must be introduced first with a full logo or the symbol.')]
    rl=''.join(f'<li><h4 style="color:#E6EFEA">{t}</h4><span class="small">{d}</span></li>' for t,d in rules)
    return f'''<section class="page dark" id="ch12">
<div style="position:absolute;left:24px;top:84px;width:604px;height:980px">{star(C['brand'],style='width:100%;height:100%')}</div>
<div class="grid" style="position:relative">
<div style="grid-column:6/13">
<div class="chap" style="display:block;margin-bottom:40px"><div class="no" style="padding:0 0 12px">Chapter 12</div><h2>The North Star</h2>
<p class="lede" style="margin-top:22px">The star at the centre of the symbol can work on its own as a brand device. It is the brand’s pointer: it marks the one thing that matters most in a view, the current step, the key number, the recommended choice.</p></div>
<p class="small" style="max-width:56ch">Because it is cut directly from the logo, it carries the brand without needing the name. Used sparingly, it becomes a signal people learn to trust. Used everywhere, it becomes decoration. The rules below keep it a signal.</p>
<ul class="plain" style="margin-top:28px">{rl}</ul>
</div></div>
{folio(14,'The North Star')}</section>'''

def ns_inuse():
    st = lambda h,c=C['brand']: star(c, style=f'height:{h}px;width:auto;flex:none')
    metric = f'''<div class="tile" style="height:260px;padding:28px;display:block;text-align:left">
<div style="display:flex;justify-content:space-between;align-items:flex-start"><span class="meta">North Star metric</span>{st(26,C['deep'])}</div>
<div style="font-family:var(--serif);font-weight:300;font-size:64px;line-height:1;margin-top:26px">98.4%</div>
<div style="font-size:14px;margin-top:8px">of data subject requests closed within the legal deadline</div>
<div style="height:6px;background:var(--subtle);border-radius:3px;margin-top:22px"><div style="width:98.4%;height:6px;background:var(--brand);border-radius:3px"></div></div></div>'''
    stepper_items = [('Map your data','done'),('Assess risk','current'),('Fix gaps','next'),('Report','next')]
    sh=''
    for t,s in stepper_items:
        ic = st(22) if s=='current' else f'<span style="width:12px;height:12px;border-radius:50%;flex:none;margin:0 5px;background:{"var(--deep)" if s=="done" else "transparent"};border:1.5px solid {"var(--deep)" if s=="done" else "#B9B6AC"}"></span>'
        sh+=f'<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-top:1px solid var(--border);font-size:15px;{"font-weight:500" if s=="current" else "color:#77766F" if s=="next" else ""}">{ic}{t}</div>'
    stepper=f'<div class="tile" style="height:260px;padding:22px 28px;display:block;text-align:left"><span class="meta">Onboarding</span><div style="margin-top:14px">{sh}</div></div>'
    plans=f'''<div class="tile" style="height:260px;padding:28px;display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:stretch;text-align:left">
<div style="border:1px solid var(--border);border-radius:10px;padding:16px"><div class="meta">Team</div><div style="font-family:var(--serif);font-size:30px;margin-top:8px">Core</div><p class="small" style="margin-top:6px">Requests, consent and data map.</p></div>
<div style="border:1.5px solid var(--brand);border-radius:10px;padding:16px;position:relative"><div style="display:flex;justify-content:space-between"><span class="meta">Recommended</span>{st(22,C['deep'])}</div><div style="font-family:var(--serif);font-size:30px;margin-top:8px">Enterprise</div><p class="small" style="margin-top:6px">Everything in Core, plus audits and vendor risk.</p></div></div>'''
    poster=f'''<div class="mock" style="height:260px;background:var(--f975);color:#E6EFEA;padding:28px">
<div style="position:absolute;right:10px;top:18px;height:340px;width:210px">{star(C['brand'],style='height:100%;width:100%')}</div>
<div style="position:relative;max-width:55%"><div style="font-family:var(--serif);font-weight:300;font-size:38px;line-height:1.05">Find true north on privacy.</div>
<div style="font-size:13px;color:#A9C2B7;margin-top:16px">Neostra Privacy Summit 2027</div></div></div>'''
    donts=[('Rotated',f'<div style="transform:rotate(58deg)">{st(70)}</div>'),
           ('Repeated as a rating',''.join(st(26) for _ in range(5))),
           ('Used as a pattern',''.join(f'<div style="margin:{m}">{st(s)}</div>' for s,m in [(18,'0 0 30px'),(30,'20px 0 0'),(14,'0 0 40px'),(24,'30px 0 0'),(16,'0 0 10px')])),
           ('Placed in a new ring',f'<div style="width:96px;height:96px;border:5px solid var(--brand);border-radius:50%;display:flex;align-items:center;justify-content:center">{st(56)}</div>')]
    dh=''.join(f'<div style="grid-column:span 3"><div class="tile" style="height:150px;gap:10px">{a}<span class="x" style="position:absolute;top:10px;right:10px;width:22px;height:22px;border-radius:50%;background:#B4372B;color:#fff;font-size:13px;line-height:22px;text-align:center">✕</span></div><p class="small cap">{t}</p></div>' for t,a in donts)
    return f'''<section class="page" id="ch13">
{chap('13','The North Star in use','Four good uses. In each one, the star points at a single thing and there is only one star in sight.')}
<div class="grid">
<div class="c1-7">{metric}<h4 class="cap">The key number</h4><p class="small">Marks the one metric a dashboard is built around. Use Deep Green at small sizes on light surfaces.</p></div>
<div class="c7-13">{stepper}<h4 class="cap">Where you are</h4><p class="small">Shows the current step in a flow. Finished and future steps use plain dots.</p></div>
<div class="c1-7">{plans}<h4 class="cap">The recommended choice</h4><p class="small">Highlights one option among several, such as a plan or a setting.</p></div>
<div class="c7-13">{poster}<h4 class="cap">A brand moment</h4><p class="small">Cropped large and bleeding off the edge on covers and posters. The crop keeps at least one tip and the centre visible.</p></div>
</div>
<div class="rule"></div><h3 style="margin-bottom:20px">Avoid</h3>
<div class="grid">{dh}</div>
<p class="small" style="margin-top:20px">In motion, the star may travel a short distance along its long axis, as if moving forward. It never spins, pulses or twinkles.</p>
{folio(15,'The North Star in use')}</section>'''

def tagline():
    return f'''<section class="page" id="ch14">
{chap('14','Tagline','The space for privacy. Five words that say what Neostra gives a privacy team: room to work, and a protected place for the data in their care.')}
<div class="grid">
<div class="c1-7"><div class="tile dk" style="height:420px">{stacked(C['brand'],'#FFFFFF',True,'#FFFFFF',style='width:64%')}</div>
<p class="small cap">The tagline is locked to the stacked logo as artwork, set in DM Sans and centred under the wordmark. Use the supplied file. Do not reset it.</p></div>
<div class="c7-13">
<div style="font-family:var(--serif);font-weight:300;font-size:64px;line-height:1.05;letter-spacing:-.015em">The space for privacy.</div>
<p class="small" style="margin-top:12px">In headlines, the tagline may be set on its own in Crimson Pro Light, in sentence case with its full stop.</p>
<ul class="plain" style="margin-top:28px">
<li>Always written “The space for privacy.” with a capital T and a closing full stop.</li>
<li>Never in capitals, never in quotation marks, never followed by an exclamation mark.</li>
<li>Do not translate it into other wording or shorten it. For other languages, agree a translation with the brand team.</li>
<li>Do not attach it to the horizontal logo or the symbol. If a layout needs both, set the tagline as a separate line at least 2x from the logo.</li>
<li>Use it once per piece. It is a sign-off, not a slogan to repeat.</li>
</ul></div></div>
{folio(16,'Tagline')}</section>'''
