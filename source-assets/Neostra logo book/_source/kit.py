import sys,os,json,cairo; sys.path.insert(0,'/sessions/brave-quirky-darwin/w/src')
from svgp import parse, draw
from parts import G, C
OUT=sys.argv[1]; SV=OUT+'/svg'; PN=OUT+'/png'; os.makedirs(SV,exist_ok=True); os.makedirs(PN,exist_ok=True)
WMK=[G['wm'],G['lam'],G['mac']]
def hexc(h): return tuple(int(h[i:i+2],16)/255 for i in (1,3,5))
# layer: (d, fill, (k,tx,ty))
I=(1,0,0); H_S=(0.49197,-78.973,37.371); H_W=(0.6,79.39,-38.14)
def stacked(s,w,tag=False): L=[(G['sym'],s,I)]+[(d,w,I) for d in WMK]; return L+([(G['tag'],w,I)] if tag else [])
def horiz(s,w): return [(G['sym'],s,H_S)]+[(d,w,H_W) for d in WMK]
VB={'stacked':(58.4,10,443.7,193.9),'stacked-tagline':(58.4,10,443.7,242.2),'horizontal':(31.7,42.3,348.9,58.1),
    'symbol':(225.01,10,105.64,118.18),'wordmark':(58.4,151.1,443.7,52.8),'north-star':(245.37,10,72.87,118.18)}
def write(name,vbk,layers,pad=0.0,bg=None,png=2048):
    x,y,w,h=VB[vbk]; p=pad*max(w,h); x-=p;y-=p;w+=2*p;h+=2*p
    body=''
    for d,f,(k,tx,ty) in layers:
        tr='' if (k,tx,ty)==I else f' transform="translate({tx} {ty}) scale({k})"'
        body+=f'<path d="{d}" fill="{f}"{tr}/>'
    bgr=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    open(f'{SV}/{name}.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:.2f} {y:.2f} {w:.2f} {h:.2f}" width="{w:.0f}" height="{h:.0f}">{bgr}{body}</svg>\n')
    sc=png/max(w,h); sf=cairo.ImageSurface(cairo.FORMAT_ARGB32,round(w*sc),round(h*sc)); c=cairo.Context(sf)
    c.scale(sc,sc); c.translate(-x,-y)
    if bg: c.set_source_rgb(*hexc(bg)); c.paint()
    for d,f,(k,tx,ty) in layers:
        c.save(); c.translate(tx,ty); c.scale(k,k); draw(c,parse(d)); c.restore(); c.set_source_rgb(*hexc(f)); c.fill()
    sf.write_to_png(f'{PN}/{name}.png')
W='#FFFFFF'
CV={'color-light':(C['brand'],C['ink']),'color-dark':(C['brand'],W),'ink':(C['ink'],C['ink']),'white':(W,W),'forest':(C['f950'],C['f950'])}
for v,(s,w) in CV.items():
    write(f'neostra-stacked-{v}','stacked',stacked(s,w),0.04)
    write(f'neostra-stacked-tagline-{v}','stacked-tagline',stacked(s,w,True),0.04)
    write(f'neostra-horizontal-{v}','horizontal',horiz(s,w),0.04)
for v,f in {'color':C['brand'],'ink':C['ink'],'white':W,'forest':C['f950'],'mint':C['mint']}.items():
    write(f'neostra-symbol-{v}','symbol',[(G['sym'],f,I)],0.04)
for v,f in {'ink':C['ink'],'white':W,'forest':C['f950']}.items():
    write(f'neostra-wordmark-{v}','wordmark',[(d,f,I) for d in WMK],0.04)
for v,f in {'green':C['brand'],'deep':C['deep'],'ink':C['ink'],'white':W,'forest':C['f950'],'mint':C['mint']}.items():
    write(f'neostra-north-star-{v}','north-star',[(G['star'],f,I)],0.04)
# app icons / favicon: square tile, symbol at given fraction
def tile(name, size, kind, frac, radius):
    x,y,w,h=VB['symbol']; S=1024; k=S*frac/h; tx=S/2-(x+w/2)*k; ty=S/2-(y+h/2)*k
    if kind=='primary': grad='<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A3C2C"/><stop offset="1" stop-color="#04160E"/></linearGradient>'; bg='url(#g)'; f=C['brand']
    elif kind=='mint': grad=''; bg=C['brand']; f=C['f950']
    else: grad=''; bg=C['f950']; f=C['mint']
    r=S*radius
    open(f'{SV}/{name}.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}"><defs>{grad}</defs><rect width="{S}" height="{S}" rx="{r}" fill="{bg}"/><path d="{G["sym"]}" fill="{f}" transform="translate({tx:.2f} {ty:.2f}) scale({k:.5f})"/></svg>\n')
    for px in size:
        sf=cairo.ImageSurface(cairo.FORMAT_ARGB32,px,px); c=cairo.Context(sf); c.scale(px/S,px/S)
        c.new_sub_path(); 
        import math
        for (cx,cy,a0) in [(S-r,r,-90),(S-r,S-r,0),(r,S-r,90),(r,r,180)]:
            c.arc(cx,cy,r,math.radians(a0),math.radians(a0+90)) if r>0 else c.line_to(cx,cy)
        c.close_path()
        if kind=='primary':
            g=cairo.LinearGradient(0,0,0,S); g.add_color_stop_rgb(0,*hexc('#0A3C2C')); g.add_color_stop_rgb(1,*hexc('#04160E')); c.set_source(g)
        else: c.set_source_rgb(*hexc(bg))
        c.fill()
        c.translate(tx,ty); c.scale(k,k); draw(c,parse(G['sym'])); c.set_source_rgb(*hexc(f)); c.fill()
        sf.write_to_png(f'{PN}/{name}-{px}.png')
tile('neostra-app-icon-primary',[1024,512,180],'primary',0.56,0)      # iOS masks corners itself
tile('neostra-app-icon-mint',[1024,512,180],'mint',0.56,0)
tile('neostra-favicon',[16,32,48,180,512],'fav',0.74,0.18)
print(len(os.listdir(SV)),len(os.listdir(PN)))
