import concurrent.futures as cf, hashlib, html, json, re, subprocess, time
from pathlib import Path
from urllib.parse import urljoin,urlsplit,unquote
BASE='https://www.volamh5.top/'
OUT=Path(__file__).resolve().parent; SITE=OUT/'site'; SITE.mkdir(parents=True,exist_ok=True)
PAT=re.compile(r'''["'`]([^"'`\n<>]*?\.(?:webp|png|jpe?g|gif|svg|ico|json|js|css|mp3|ogg|wav|woff2?|ttf|wasm|map)(?:\?[^"'`\s<>]*)?)["'`]''',re.I)
seen=set(); records=[]; failures=[]; skipped=set(); start=time.time()
def extract(s,base):
 values=PAT.findall(s)+re.findall(r'url\(\s*["\']?([^\)"\'\s]+)',s)
 for v in values:
  v=html.unescape(v)
  if '${' in v or any(c in v for c in ['+','{','}','\\']) or len(v)>400:continue
  if v.startswith(('data:','blob:')):continue
  if '/' not in v and re.match(r'(ani|enemy|boss|pl_).*\.webp',v):v='img/a/'+v
  if v.startswith(('img/','doll/','fx/','snd/','music/','ui/')):v='/'+v
  u=urljoin(base,v); p=urlsplit(u)
  if p.netloc not in ('www.volamh5.top','volamh5.top'):skipped.add(u);continue
  if p.path.startswith('/api/'):continue
  yield BASE.rstrip('/')+p.path+('?' +p.query if p.query else '')
def fetch(u):
 p=urlsplit(u); rel=unquote(p.path).lstrip('/') or 'index.html'
 if '..' in Path(rel).parts:return {'url':u,'error':'unsafe path'},''
 if rel=='play01':rel='play01.html'
 dest=SITE/rel; dest.parent.mkdir(parents=True,exist_ok=True)
 tmp=dest.with_name(dest.name+'.download')
 r=subprocess.run(['curl','-sS','-L','--retry','1','--retry-delay','1','--connect-timeout','10','--max-time','45','-w','%{http_code}|%{content_type}','-o',str(tmp),u],capture_output=True,text=True)
 status,_,ct=r.stdout.partition('|')
 if r.returncode or status!='200':
  tmp.unlink(missing_ok=True);return {'url':u,'status':status,'error':r.stderr.strip() or 'HTTP '+status},''
 data=tmp.read_bytes()
 if 'text/html' in ct and Path(rel).suffix not in ('.html',''):
  tmp.unlink();return {'url':u,'status':status,'error':'HTML fallback instead of asset'},''
 tmp.replace(dest)
 rec={'url':u,'path':'site/'+rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'content_type':ct}
 text=data.decode('utf-8',errors='replace') if Path(rel).suffix in ('.html','.js','.css','.json','.map','.svg') else ''
 return rec,text
def checkpoint():
 (OUT/'manifest.json').write_text(json.dumps({'pages':[BASE,BASE+'play01'],'files':records,'failed':failures,'external_not_downloaded':sorted(skipped)},ensure_ascii=False,indent=2))

def main():
 global records,failures,skipped,seen
 import sys
 from collections import deque
 old=json.loads((OUT/'manifest.json').read_text()) if (OUT/'manifest.json').exists() else {}
 records=[r for r in old.get('files',[]) if (OUT/r['path']).is_file()]
 failures=old.get('failed',[]) if '--retry-failed' not in sys.argv else []
 seen={urlsplit(r['url']).path for r in records+failures}
 skipped=set(old.get('external_not_downloaded',[]))
 queue=deque([BASE,BASE+'play01',BASE+'jxlook.js',BASE+'sw.js',BASE+'version.json'])
 for r in records:
  path=OUT/r['path']
  if path.suffix in ('.html','.js','.css','.json','.svg','.map'):
   queue.extend(extract(path.read_text(errors='replace'),r['url']))
 if '--retry-failed' in sys.argv:queue.extend(r['url'] for r in old.get('failed',[]))
 with cf.ThreadPoolExecutor(max_workers=8) as pool:
  pending={}
  while queue or pending:
   while queue and len(pending)<16:
    u=queue.popleft();key=urlsplit(u).path
    if key in seen:continue
    seen.add(key);pending[pool.submit(fetch,u)]=u
   if not pending:continue
   done,_=cf.wait(pending,return_when=cf.FIRST_COMPLETED)
   for f in done:
    u=pending.pop(f)
    try:rec,text=f.result()
    except Exception as e:rec,text={'url':u,'error':str(e)},''
    (failures if 'error' in rec else records).append(rec)
    if text:queue.extend(extract(text,u))
   checkpoint()
 checkpoint();print(len(records),'files;',len(failures),'failed')
if __name__=='__main__':main()
