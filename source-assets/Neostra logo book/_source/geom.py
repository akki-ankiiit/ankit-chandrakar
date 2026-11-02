import sys,re,json,cairo; sys.path.insert(0,'.')
from svgp import *
s=open('/sessions/brave-quirky-darwin/mnt/uploads/SVG.svg').read()
ds=re.findall(r' d="([^"]+)"',s)
sym=parse(ds[0]); h1=sym[1]; h2=sym[2]; o=sym[0]
def end(c): return c[-2:]
star=[('M',*o[0][1:3]), ('C',245.65,10.22,252.4,17.9,258.691,25.013), h2[3],h2[4],h2[5],h2[6],h2[7],h2[8],h2[9], ('C',309.4,108.6,315.5,122.4,318.242,128.179), o[7],o[8], ('L',*end(h1[7])), h1[8],h1[9],h1[10],h1[11], ('C',266.44,61.01,247.2,14.4,245.37,10.0), ('Z',)]
# check h2[1] end
print(end(h2[1]), end(o[5]), end(h1[6]), end(o[10]))
def ext(subs):
    sf=cairo.ImageSurface(cairo.FORMAT_A8,1,1); c=cairo.Context(sf); draw(c,subs); return c.fill_extents()
G={}
G['sym']=tod(sym,nd=3); G['star']=tod([star],nd=3)
G['wm']=tod(parse(ds[1]),nd=3); G['lam']=tod(parse(ds[2]),nd=3); G['mac']=tod(parse(ds[3]),nd=3); G['tag']=tod(parse(ds[4]),nd=3)
G['ext']={k:ext(parse(G[k])) for k in ['sym','star','wm','lam','mac','tag']}
json.dump(G,open('geom.json','w'))
for k,v in G['ext'].items(): print(k,[round(x,2) for x in v])
