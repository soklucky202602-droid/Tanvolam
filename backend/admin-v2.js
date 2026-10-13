'use strict';
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const native=http.createServer;
const ORIGIN='https://tanvolam.onrender.com';
const DIR=process.env.DATA_DIR||path.join(__dirname,'data');
const DB=path.join(DIR,'database.json');
const CFG=path.join(DIR,'admin-config.json');
const ADM=new Set(String(process.env.ADMIN_USERNAMES||'admin1234').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));

function read(p,fallback){try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch(_){return fallback}}
function write(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2))}
function loadDb(){const d=read(DB,{users:[],sessions:[],giftClaims:[],giftCodes:[]});d.users??=[];d.sessions??=[];d.giftClaims??=[];d.giftCodes??=[];return d}
function loadCfg(){return read(CFG,{maintenance:false,forceOpen:false,openTime:process.env.SERVER_OPEN_TIME||'2026-10-10T13:30:00+07:00',simbotEnabled:process.env.SIMBOT_ENABLED!=='false',ktc:[]})}
function cookie(r){const x=String(r.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('jx_session='));return x?decodeURIComponent(x.slice(11)):''}
function current(r,d){const sid=cookie(r),s=(d.sessions||[]).find(x=>x.id===sid&&Number(x.expiresAt)>Date.now());return s?(d.users||[]).find(x=>x.id===s.userId)||null:null}
function admin(u){return !!u&&ADM.has(String(u.username||'').toLowerCase())}
function cors(s){s.setHeader('Access-Control-Allow-Origin',ORIGIN);s.setHeader('Access-Control-Allow-Credentials','true');s.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, X-Requested-With');s.setHeader('Access-Control-Allow-Methods','GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');s.setHeader('Vary','Origin')}
function json(s,n,v){cors(s);s.statusCode=n;s.setHeader('content-type','application/json; charset=utf-8');s.end(JSON.stringify(v))}
function body(r,cb){const a=[];r.on('data',x=>a.push(x));r.on('end',()=>{try{cb(JSON.parse(Buffer.concat(a).toString()||'{}'))}catch(_){cb({})}})}
function game(g){const x=g&&typeof g==='object'?g:{};const slots=Array.isArray(x.slots)?x.slots.slice(0,3):[];while(slots.length<3)slots.push(null);return {...x,slots,activeSlot:String(x.activeSlot??'0'),shared:x.shared&&typeof x.shared==='object'?x.shared:{}}}
function slot(u,i){const g=game(u.game);u.game=g;if(!g.slots[i]||typeof g.slots[i]!=='object')g.slots[i]={name:'',lvl:1,xp:0,stage:1,gold:0,knb:0,inv:[],stackItems:{},adminItems:[],bag:[]};const s=g.slots[i];s.inv=Array.isArray(s.inv)?s.inv:[];s.adminItems=Array.isArray(s.adminItems)?s.adminItems:[];s.bag=Array.isArray(s.bag)?s.bag:[];s.stackItems=s.stackItems&&typeof s.stackItems==='object'?s.stackItems:{};return s}
function targets(d,t){if(String(t)==='all')return d.users.filter(x=>!admin(x));const u=d.users.find(x=>x.id===String(t));return u?[u]:[]}
function stackId(x){const id=String(x?.id||x?.itemId||x?.k||x?.key||x?.kind||'').toLowerCase();return ['tt','qht','rngua','vlmt','ttk','bk90','rht','rda','knb','gold','life_potion','mana_potion'].includes(id)?id:null}
function addItems(s,items){let count=0;for(const raw of Array.isArray(items)?items:[]){if(!raw||typeof raw!=='object')continue;const qty=Math.max(1,Math.floor(Number(raw.qty||raw.quantity||1)));const sk=stackId(raw);if(sk){s.stackItems[sk]=(Number(s.stackItems[sk])||0)+qty;count+=qty;continue}if(raw.grant==='potion'){const pk=String(raw.kind||'life').toLowerCase()==='mana'?'mana_potion':'life_potion';s.stackItems[pk]=(Number(s.stackItems[pk])||0)+qty;count+=qty;continue}for(let i=0;i<qty;i++){const item={...raw};delete item.qty;delete item.quantity;item.uid=item.uid||crypto.randomUUID();item.locked=item.locked!==false;s.inv.push(item);s.adminItems.push(item);s.bag.push(item);count++}}return count}
function openState(c){const t=new Date(c.openTime).getTime();const open=!!c.forceOpen||(!Number.isNaN(t)&&Date.now()>=t);return{ok:true,forceOpen:!!c.forceOpen,openTime:c.openTime,open,serverTime:new Date().toISOString()}}
function ranking(d){const out=[];for(const u of d.users||[]){const g=game(u.game);for(const s of g.slots){if(!s||typeof s!=='object'||!s.name)continue;out.push({username:u.username,name:String(s.name),fac:s.fac||'shaolin',lvl:Number(s.lvl||1),stage:Number(s.stage||1),gold:Number(s.gold||0)})}}return out.sort((a,b)=>b.lvl-a.lvl||b.stage-a.stage||b.gold-a.gold).slice(0,200)}

http.createServer=function(listener,...args){return native.call(http,(r,s)=>{
  cors(s);
  if(r.method==='OPTIONS'&&r.headers.origin===ORIGIN){s.statusCode=204;return s.end()}
  const u=new URL(r.url||'/','http://local');
  if(!u.pathname.startsWith('/api/admin/'))return listener(r,s);
  const d=loadDb(),me=current(r,d);
  if(!admin(me))return json(s,403,{error:'Không có quyền quản trị.'});
  const c=loadCfg();

  if(u.pathname==='/api/admin/users'&&r.method==='GET'){
    const cut=Date.now()-12000;
    const users=d.users.map(x=>{const g=game(x.game),slots=g.slots,last=Number(x.lastSeen||0),online=last>cut;return{id:x.id,username:x.username,createdAt:x.createdAt,role:admin(x)?'admin':'player',locked:!!x.locked,isOnline:online,lastSeen:last||null,activeSlot:Number(g.activeSlot||0),slots,levels:slots.map(v=>v&&v.lvl!=null?Number(v.lvl):null),charName:(slots.find(v=>v&&v.name)||{}).name||''}});
    return json(s,200,{users,total:users.length,onlineCount:users.filter(x=>x.isOnline&&x.role!=='admin').length});
  }

  if(u.pathname==='/api/admin/grant'&&r.method==='POST')return body(r,b=>{
    const ts=targets(d,b.target),idx=Math.max(0,Math.min(2,Number(b.slot||1)-1));
    if(!ts.length)return json(s,404,{error:'Không tìm thấy tài khoản.'});
    const level=b.level==null||b.level===''?null:Math.max(1,Math.min(180,Math.floor(Number(b.level)||1)));
    const gold=Math.max(0,Math.floor(Number(b.gold)||0));
    const knb=Math.max(0,Math.floor(Number(b.knb)||0));
    let itemsGranted=0;
    for(const x of ts){const sl=slot(x,idx);if(level!=null)sl.lvl=level;if(gold)sl.gold=Number(sl.gold||0)+gold;if(knb)sl.knb=Number(sl.knb||0)+knb;itemsGranted+=addItems(sl,b.items);x.game=game(x.game);x.revision=Number(x.revision||0)+1}
    write(DB,d);
    return json(s,200,{ok:true,count:ts.length,itemsGranted,sendMail:false,message:'Đã cập nhật trực tiếp vào nhân vật.'});
  });

  if(u.pathname==='/api/admin/users/reset-progress'&&r.method==='POST'){
    let n=0;for(const x of d.users)if(!admin(x)){const g=game(x.game);for(const sl of g.slots)if(sl){sl.lvl=1;sl.xp=0;sl.stage=1;sl.gold=0;sl.knb=0;n++}x.game=g;x.revision=Number(x.revision||0)+1}write(DB,d);return json(s,200,{ok:true,resetCount:n});
  }
  if(u.pathname==='/api/admin/users/wipe'&&r.method==='POST'){
    const before=d.users.length;d.users=d.users.filter(x=>admin(x));const ids=new Set(d.users.map(x=>x.id));d.sessions=d.sessions.filter(x=>ids.has(x.userId));write(DB,d);return json(s,200,{ok:true,deleted:before-d.users.length,remaining:d.users.length});
  }

  const lock=u.pathname.match(/^\/api\/admin\/users\/([^/]+)\/lock$/);
  if(lock&&r.method==='POST')return body(r,b=>{const x=d.users.find(v=>v.id===lock[1]);if(!x)return json(s,404,{error:'Không tìm thấy tài khoản.'});if(admin(x))return json(s,400,{error:'Không thể khóa tài khoản quản trị.'});x.locked=!!b.locked;x.lockReason=String(b.reason||'');if(x.locked)d.sessions=d.sessions.filter(v=>v.userId!==x.id);write(DB,d);json(s,200,{ok:true,locked:x.locked})});
  const del=u.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if(del&&r.method==='DELETE'){const x=d.users.find(v=>v.id===del[1]);if(!x)return json(s,404,{error:'Không tìm thấy tài khoản.'});if(admin(x))return json(s,400,{error:'Không thể xóa tài khoản quản trị.'});d.users=d.users.filter(v=>v.id!==x.id);d.sessions=d.sessions.filter(v=>v.userId!==x.id);write(DB,d);return json(s,200,{ok:true})}

  if(u.pathname==='/api/admin/ranking'&&(r.method==='GET'||r.method==='POST'))return json(s,200,{ranking:ranking(d)});
  if(u.pathname==='/api/admin/simbot'&&(r.method==='GET'||r.method==='POST')){if(r.method==='GET')return json(s,200,{enabled:c.simbotEnabled!==false,simbotEnabled:c.simbotEnabled!==false});return body(r,b=>{c.simbotEnabled=b.enabled!==false;write(CFG,c);json(s,200,{ok:true,enabled:c.simbotEnabled,simbotEnabled:c.simbotEnabled})})}
  if(u.pathname==='/api/admin/simbot-status'&&r.method==='GET')return json(s,200,{enabled:c.simbotEnabled!==false,simbotEnabled:c.simbotEnabled!==false});
  if(u.pathname==='/api/admin/maintenance'&&(r.method==='GET'||r.method==='POST')){if(r.method==='GET')return json(s,200,{maintenance:!!c.maintenance});return body(r,b=>{c.maintenance=!!b.enabled;write(CFG,c);json(s,200,{ok:true,maintenance:c.maintenance})})}
  if(u.pathname==='/api/admin/server-open'&&(r.method==='GET'||r.method==='POST')){if(r.method==='GET')return json(s,200,openState(c));return body(r,b=>{if('forceOpen'in b)c.forceOpen=!!b.forceOpen;if(b.openTime)c.openTime=String(b.openTime);write(CFG,c);json(s,200,openState(c))})}

  if(u.pathname==='/api/admin/gift-codes'&&r.method==='GET')return json(s,200,{giftCodes:d.giftCodes,codes:d.giftCodes});
  if(u.pathname==='/api/admin/gift-codes'&&r.method==='POST')return body(r,b=>{const count=Math.max(1,Math.floor(Number(b.count||1)));const out=[];for(let i=0;i<count;i++){let code=String(b.code||'').trim().toUpperCase();if(count>1)code=(String(b.prefix||'VLTK').trim().toUpperCase()||'VLTK')+'-'+crypto.randomBytes(3).toString('hex').toUpperCase();if(!code)code='VLTK-'+crypto.randomBytes(4).toString('hex').toUpperCase();if(d.giftCodes.some(x=>x.code===code)){i--;continue}const row={id:crypto.randomUUID(),code,kind:String(b.kind||'ttl_knb'),ttl:Math.max(0,Math.floor(Number(b.ttl)||5)),knb:Math.max(0,Math.floor(Number(b.knb)||5)),maxUses:Math.max(1,Math.floor(Number(b.maxUses||1))),used:0,usedBy:[],active:true,createdAt:Date.now()};d.giftCodes.push(row);out.push(row)}write(DB,d);return json(s,200,{ok:true,codes:out,giftCodes:d.giftCodes})});
  const gc=u.pathname.match(/^\/api\/admin\/gift-codes\/([^/]+)$/);
  if(gc&&r.method==='PATCH')return body(r,b=>{const x=d.giftCodes.find(v=>v.id===gc[1]);if(!x)return json(s,404,{error:'Không tìm thấy mã quà.'});if('active'in b)x.active=!!b.active;if(b.maxUses!=null)x.maxUses=Math.max(1,Math.floor(Number(b.maxUses)||1));write(DB,d);json(s,200,{ok:true,code:x})});
  if(gc&&r.method==='DELETE'){d.giftCodes=d.giftCodes.filter(v=>v.id!==gc[1]);write(DB,d);return json(s,200,{ok:true})}

  if(u.pathname==='/api/admin/ktc-catalog'&&r.method==='GET')return json(s,200,{catalog:Array.isArray(c.ktc)?c.ktc:[],items:Array.isArray(c.ktc)?c.ktc:[]});
  if(u.pathname==='/api/admin/ktc-catalog'&&r.method==='POST')return body(r,b=>{c.ktc=Array.isArray(b.catalog)?b.catalog:(Array.isArray(b.items)?b.items:c.ktc||[]);write(CFG,c);json(s,200,{ok:true,catalog:c.ktc,items:c.ktc})});

  return json(s,404,{error:'Chức năng quản trị chưa được hỗ trợ: '+u.pathname});
},...args)};
