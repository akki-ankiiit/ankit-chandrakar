import re,sys,os
h=open('/sessions/brave-quirky-darwin/book/Neostra-Logo-Book.html').read()
h=h.replace('@media (max-width:1100px)','@media (max-width:10px)')
ids=re.findall(r'<section class="page[^"]*" id="([^"]+)"',h)
od='/sessions/brave-quirky-darwin/mnt/outputs/_preview'; os.makedirs(od,exist_ok=True)
sel=sys.argv[1:] or ids
for i in sel:
    x=h.replace('</style>',f'.page{{display:none!important}}#{i}{{display:block!important}}#end#{i}{{display:flex!important}} html{{zoom:.5}} .book{{width:1440px}}</style>')
    open(f'{od}/{i}.html','w').write(x)
print(ids)
