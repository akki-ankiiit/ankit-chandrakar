import json, base64
G = json.load(open('/sessions/brave-quirky-darwin/w/src/geom.json'))
C = dict(brand='#29BD8E', canvas='#FAF9F5', surface='#FFFFFF', subtle='#F0EEE6', text='#252521', border='#E3E0D7',
         f900='#0A3C2C', f950='#04261A', f975='#04160E', mint='#4ACFA0', deep='#178062', ink='#070707', white='#FFFFFF')
VB_SYM = "225.01 10 105.64 118.18"
VB_STAR = "245.37 10 72.87 118.18"
VB_WM = "58.4 151.1 443.7 52.8"
VB_STACK = "58.4 10 443.7 193.9"
VB_STACK_T = "58.4 10 443.7 242.2"
VB_HOR = "31.7 42.3 348.9 58.1"
def defs():
    return ('<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'
            f'<path id="p-sym" d="{G["sym"]}"/><path id="p-star" d="{G["star"]}"/>'
            f'<g id="p-wmk"><path d="{G["wm"]}"/><path d="{G["lam"]}"/><path d="{G["mac"]}"/></g>'
            f'<path id="p-tag" d="{G["tag"]}"/></defs></svg>')
def _svg(vb, inner, cls='', label='Neostra', style=''):
    return f'<svg class="{cls}" viewBox="{vb}" role="img" aria-label="{label}" style="{style}">{inner}</svg>'
def sym(fill=C['brand'], cls='', style='', label='Neostra symbol'):
    return _svg(VB_SYM, f'<use href="#p-sym" fill="{fill}"/>', cls, label, style)
def star(fill=C['brand'], cls='', style='', label='North Star'):
    return _svg(VB_STAR, f'<use href="#p-star" fill="{fill}"/>', cls, label, style)
def wordmark(fill=C['ink'], cls='', style=''):
    return _svg(VB_WM, f'<use href="#p-wmk" fill="{fill}"/>', cls, 'Neostra wordmark', style)
def stacked(s=C['brand'], w=C['ink'], tag=False, t=None, cls='', style=''):
    inner = f'<use href="#p-sym" fill="{s}"/><use href="#p-wmk" fill="{w}"/>'
    if tag: inner += f'<use href="#p-tag" fill="{t or w}"/>'
    return _svg(VB_STACK_T if tag else VB_STACK, inner, cls, 'Neostra — The space for privacy.' if tag else 'Neostra', style)
def horizontal(s=C['brand'], w=C['ink'], cls='', style=''):
    inner = (f'<use href="#p-sym" fill="{s}" transform="translate(-78.973 37.371) scale(0.49197)"/>'
             f'<use href="#p-wmk" fill="{w}" transform="translate(79.39 -38.14) scale(0.6)"/>')
    return _svg(VB_HOR, inner, cls, 'Neostra', style)
def img64(path):
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()
