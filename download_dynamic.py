import concurrent.futures as cf
from download_public import BASE,OUT,SITE,fetch,Path,re,json
sources=list((SITE/'assets').glob('game.*.js'))
if (SITE/'jxlook.js').exists():sources.append(SITE/'jxlook.js')
s='\n'.join(f.read_text(errors='replace') for f in sources)
keys=set(re.findall(r'''["'`]((?:f|m)/[^"'`]+)["'`]\s*:\s*\[''',s))
urls=[BASE+'img/jx/'+k+'.webp' for k in sorted(keys)]
urls += [BASE+'ui/icons/item-'+x+'.png' for x in ['locked','unlocked']]
# Strings combined with runtime effect names are resolved from the published tables.
fx=set(re.findall(r'''["'`]((?:m\d+_(?:hit|fly|vanish)|c\d+))["'`]''',s))
urls += [BASE+'fx/'+k+'.webp' for k in sorted(fx)]
old=json.loads((OUT/'dynamic-manifest.json').read_text()) if (OUT/'dynamic-manifest.json').exists() else {}
records=[r for r in old.get('files',[]) if (OUT/r['path']).is_file()];failures=old.get('failed',[])
seen={r['url'] for r in records+failures};urls=[u for u in urls if u not in seen]
def save():
 (OUT/'dynamic-manifest.json').write_text(json.dumps({'files':records,'failed':failures},ensure_ascii=False,indent=2))
with cf.ThreadPoolExecutor(max_workers=8) as pool:
 for rec,s in pool.map(fetch,urls):
  (failures if 'error' in rec else records).append(rec)
  if (len(records)+len(failures))%100==0:
   save();print(f"Dynamic: {len(records)} downloaded; {len(failures)} failed; {sum(x['bytes'] for x in records)/1e6:.1f} MB",flush=True)
save();print('DYNAMIC DONE',len(records),len(failures),flush=True)
