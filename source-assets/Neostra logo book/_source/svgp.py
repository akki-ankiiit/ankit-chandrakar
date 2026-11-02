import re, cairo
TOK=re.compile(r'[MLCHVZmlchvz]|-?\d*\.?\d+(?:e-?\d+)?')
def parse(d):
    toks=TOK.findall(d); i=0; cmd=None; out=[]; cx=cy=sx=sy=0; sub=[]
    def num():
        nonlocal i; v=float(toks[i]); i+=1; return v
    while i<len(toks):
        t=toks[i]
        if t.isalpha(): cmd=t; i+=1
        if cmd=='M': cx,cy=num(),num(); sx,sy=cx,cy; sub=[('M',cx,cy)]; out.append(sub); cmd='L'
        elif cmd=='L': cx,cy=num(),num(); sub.append(('L',cx,cy))
        elif cmd=='H': cx=num(); sub.append(('L',cx,cy))
        elif cmd=='V': cy=num(); sub.append(('L',cx,cy))
        elif cmd=='C':
            a=[num() for _ in range(6)]; sub.append(('C',*a)); cx,cy=a[4],a[5]
        elif cmd=='Z': sub.append(('Z',)); cx,cy=sx,sy; cmd=None
        else: raise Exception(cmd)
    return out
def draw(ctx,subs):
    for s in subs:
        for c in s:
            if c[0]=='M': ctx.move_to(*c[1:])
            elif c[0]=='L': ctx.line_to(*c[1:])
            elif c[0]=='C': ctx.curve_to(*c[1:])
            else: ctx.close_path()
def tod(subs,dx=0,dy=0,k=1,nd=2):
    f=lambda v:('%.*f'%(nd,v)).rstrip('0').rstrip('.')
    o=[]
    for s in subs:
        for c in s:
            if c[0]=='Z': o.append('Z')
            else:
                v=c[1:]; o.append(c[0]+' '.join(f(v[j]*k+(dx if j%2==0 else dy)) for j in range(len(v))))
    return ''.join(o)
def pts(subs):
    P=[]
    for s in subs:
        for c in s:
            if c[0] in 'ML': P.append(c[1:])
            elif c[0]=='C': P.append(c[5:7])
    return P
