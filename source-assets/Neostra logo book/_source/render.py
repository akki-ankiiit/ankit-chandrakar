import sys,re,cairo
sys.path.insert(0,'.')
from svgp import *
def hexc(h):
    h=h.lstrip('#'); 
    if h=='white': return (1,1,1)
    return tuple(int(h[i:i+2],16)/255 for i in (0,2,4))
def render(svgfile,out,scale=3,bg=None):
    s=open(svgfile).read()
    W,H=[float(x) for x in re.search(r'viewBox="0 0 (\S+) (\S+)"',s).groups()]
    sf=cairo.ImageSurface(cairo.FORMAT_ARGB32,int(W*scale),int(H*scale)); c=cairo.Context(sf)
    if bg: c.set_source_rgb(*hexc(bg)); c.paint()
    c.scale(scale,scale)
    for d,f in re.findall(r'<path d="([^"]+)" fill="([^"]+)"',s):
        draw(c,parse(d)); c.set_source_rgb(*(hexc(f) if f!='white' else (1,1,1))); c.set_fill_rule(cairo.FILL_RULE_WINDING); c.fill()
    sf.write_to_png(out)
if __name__=='__main__':
    render(sys.argv[1],sys.argv[2],float(sys.argv[3]),sys.argv[4] if len(sys.argv)>4 else None)
