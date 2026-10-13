'use strict';
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const native=http.createServer,ORIGIN='https://tanvolam.onrender.com';
const DIR=process.env.DATA_DIR||path.join(__dirname,'data'),CFG=path.join(DIR,'admin-config.json'),DB=path.join(DIR,'database.json');
const ADM=new Set(String(process.env.ADMIN_USERNAMES||'admin1234').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
function read(p,d){try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch(_){return d}}
function write(p,d){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2))}
function db(){const d=read(DB,{users:[],sessions:[],giftClaims:[],giftCodes:[]});d.users??=[];d.sessions??=[];d.giftClaims??=[];d.giftCodes??=[];return d}
function cfg(){return read(CFG,{maintenance:false,forceOpen:false,openTime:process.env.SERVER_OPEN_TIME||'2026-10-10T13:30:00+07:00',simbotEnabled:process.env.SIMBOT_ENABLED!=='false',ktc:[]})}
function cookie(r){const x=String(r.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('jx_session='));return x?decodeURIComponent(x.slice(11)):''}
function currentUser(r,d){const sid=cookie(r),s=(d.sessions||[]).find(x=>x.id===sid&&Number(x.expiresAt)>Date.now());return s?(d.users||[]).find(x=>x.id===s.userId)||null:null}
function isAdmin(u){return !!u&&ADM.has(String(u.username||'').toLowerCase())}
function cors(s){s.setHeader('Access-Control-Allow-Origin',ORIGIN);s.setHeader('Access-Control-Allow-Credentials','true');s.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, X-Requested-With');s.setHeader('Access-Control-Allow-Methods','GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');s.setHeader('Vary','Origin')}
function json(s,n,x){cors(s);s.statusCode=n;s.setHeader('content-type','application/json; charset=utf-8');s.end(JSON.stringify(x))}
function body(r,cb){let a=[];r.on('data',x=>a.push(x));r.on('end',()=>{try{cb(JSON.parse(Buffer.concat(a).toString()||'{}'))}catch(_){cb({})}})}
function normGame(g){const x=g&&typeof g==='object'?g:{};const slots=Array.isArray(x.slots)?x.slots.slice(0,3):[];while(slots.length<3)slots.push(null);return {...x,slots,activeSlot:String(x.activeSlot??'0'),shared:x.shared&&typeof x.shared==='object'?x.shared:{}}}
function gameOf(u){u.game=normGame(u.game);return u.game}
function ensureSlot(u,i){const g=gameOf(u);if(!g.slots[i]||typeof g.slots[i]!=='object')g.slots[i]={name:'',lvl:1,gold:0,knb:0};return g.slots[i]}
function targets(d,target){if(target==='all')return d.users.filter(u=>!isAdmin(u));const x=d.users.find(u=>u.id===String(target));return x?[x]:[]}
function knownStackId(x){const id=String(x?.id||x?.k||x?.key||'').toLowerCase();const map={tt:'tt',qht:'qht',rngua:'rngua',vlmt:'vlmt',ttk:'ttk',bk90:'bk90',rht:'rht',rda:'rda'};return map[id]||null}
function addItems(slot,items){
  if(!Array.isArray(items))return 0;let n=0;
  slot.stackItems=slot.stackItems&&typeof slot.stackItems==='object'?slot.stackItems:{};
  slot.adminItems=Array.isArray(slot.adminItems)?slot.adminItems:[];
  slot.bag=Array.isArray(slot.bag)?slot.bag:[];
  for(const raw of items){
    if(!raw||typeof raw!=='object')continue;
    const qty=Math.max(1,Math.floor(Number(raw.qty||raw.quantity||1)));
    const sk=knownStackId(raw);
    if(sk){slot.stackItems[sk]=(Number(slot.stackItems[sk])||0)+qty;n+=qty;continue}
    if(raw.grant==='potion'){
      const sk2=String(raw.kind||'life').toLowerCase()==='mana'?'mana_potion':'life_potion';
      slot.stackItems[sk2]=(Number(slot.stackItems[sk2])||0)+qty;n+=qty;continue
    }
    for(let i=0;i<qty;i++){
      const item={...raw};delete item.qty;delete item.quantity;
      item.uid=item.uid||Date.now()+Math.floor(Math.random()*1000000)+i;item.locked=item.locked!==false;
      slot.adminItems.push(item);slot.bag.push(item);n++;
    }
  }
  return n;
}
function addMail(slot,subject,text,items){
  slot.mail=Array.isArray(slot.mail)?slot.mail:[];
  slot.mail.push({id:crypto.randomUUID(),subject:String(subject||'Phần thưởng từ Quản Trị Viên'),text:String(text||'Phần thưởng dành cho bạn.'),items:Array.isArray(items)?items:[],createdAt:Date.now(),claimed:false});
}
function buildRanking(d){const a=[];for(const u of d.users||[])for(const s of normGame(u.game).slots){if(!s||typeof s!=='object'||!s.name)continue;a.push({username:u.username,name:String(s.name),fac:s.fac||'shaolin',lvl:Number(s.lvl||1),stage:Number(s.stage||1),gold:Number(s.gold||0)})}return a.sort((a,b)=>b.lvl-a.lvl||b.stage-a.stage||b.gold-a.gold)}
function openState(c){return {ok:true,forceOpen:!!c.forceOpen,openTime:c.openTime,open:!!c.forceOpen||Date.now()>=new Date(c.openTime).getTime()}}
function redeemGift(d,u,code){const c=d.giftCodes.find(x=>x.code===code&&x.active!==false);if(!c)return{status:404,data:{error:'Mã quà không hợp lệ.'}};const usedBy=Array.isArray(c.usedBy)?c.usedBy:[];if(usedBy.includes(u.id))return{status:409,data:{error:'Mã này đã được nhận.'}};if(Number(c.used||0)>=Number(c.maxUses||1))return{status:409,data:{error:'Mã này đã được sử dụng hết.'}};const choices=String(c.kind||'').toLowerCase()==='vip'?[{value:'vip',label:'10 Tiên Thảo Lộ + 10 KNB + Ngựa Chiếu Dạ'}]:[{value:'ttl_knb',label:`${Number(c.ttl||5)} Tiên Thảo Lộ + ${Number(c.knb||5)} KNB`}];return{status:200,data:{ok:true,choices}}}
function chooseGift(d,u,code,choice){const c=d.giftCodes.find(x=>x.code===code&&x.active!==false);if(!c)return{status:404,data:{error:'Mã quà không hợp lệ.'}};c.usedBy=Array.isArray(c.usedBy)?c.usedBy:[];if(c.usedBy.includes(u.id))return{status:409,data:{error:'Mã này đã được nhận.'}};if(Number(c.used||0)>=Number(c.maxUses||1))return{status:409,data:{error:'Mã này đã được sử dụng hết.'}};const kind=String(c.kind||'').toLowerCase();if(!['ttl_knb','vip','tanthu','kimphong','faction','set'].includes(String(choice))&&!(kind==='tanthu'&&choice==='ttl_knb'))return{status:400,data:{error:'Lựa chọn không hợp lệ.'}};const slot=ensureSlot(u,Number(normGame(u.game).activeSlot||0));slot.stackItems=slot.stackItems||{};const ttl=kind==='vip'?10:Number(c.ttl||5),knb=kind==='vip'?10:Number(c.knb||5);slot.stackItems.tt=(Number(slot.stackItems.tt)||0)+ttl;slot.knb=(Number(slot.knb)||0)+knb;if(kind==='vip'||choice==='vip'){slot.adminItems=Array.isArray(slot.adminItems)?slot.adminItems:[];slot.bag=Array.isArray(slot.bag)?slot.bag:[];const horse={uid:Date.now()+Math.floor(Math.random()*100000),n:'Ngựa Chiếu Dạ Ngọc Sư Tử',p:50,d:10,s:-1,r:4,req:[[36,1]],locked:true,autoEquipHorse:true};slot.adminItems.push(horse);slot.bag.push(horse)}c.usedBy.push(u.id);c.used=Number(c.used||0)+1;d.giftClaims.push(u.id+':'+code);return{status:200,data:{ok:true,code,choice}}}
http.createServer=function(listener,...args){return native.call(http,(r,s)=>{
  cors(s);if(r.method==='OPTIONS'&&r.headers.origin===ORIGIN){s.statusCode=204;return s.end()}
  const u=new URL(r.url||'/','http://local'),d=db(),me=currentUser(r,d),c=cfg();
  if(u.pathname==='/api/public/server-open'&&r.method==='GET')return json(s,200,{...openState(c),serverTime:new Date().toISOString(),message:openState(c).open?'Máy chủ đang mở.':'Máy chủ chưa chính thức mở.'});
  if(u.pathname==='/api/public/simbot-status'&&r.method==='GET')return json(s,200,{simbotEnabled:c.simbotEnabled!==false});
  if(u.pathname==='/api/game/state'&&r.method==='GET'){
    if(!me)return json(s,401,{error:'Chưa đăng nhập'});return json(s,200,{game:normGame(me.game),revision:Number(me.revision||0)});
  }
  if(u.pathname==='/api/game/state'&&r.method==='PUT'){
    if(!me)return json(s,401,{error:'Chưa đăng nhập'});return body(r,b=>{const rev=Number(b.revision),cur=Number(me.revision||0);if(!Number.isInteger(rev)||rev!==cur)return json(s,409,{error:'Dữ liệu đã thay đổi ở nơi khác.',revision:cur});me.game=normGame(b.game);me.revision=cur+1;write(DB,d);json(s,200,{ok:true,revision:me.revision})});
  }
  if(u.pathname==='/api/world/presence'&&r.method==='POST'&&me){const now=Date.now();me.lastSeen=now;me.isOnline=true;write(DB,d);}
  if(u.pathname==='/api/gift-codes/redeem'&&r.method==='POST'){
    if(!me)return json(s,401,{error:'Chưa đăng nhập'});return body(r,b=>{const x=redeemGift(d,me,String(b.code||'').trim().toUpperCase());json(s,x.status,x.data)});
  }
  if(u.pathname==='/api/gift-codes/choose'&&r.method==='POST'){
    if(!me)return json(s,401,{error:'Chưa đăng nhập'});return body(r,b=>{const x=chooseGift(d,me,String(b.code||'').trim().toUpperCase(),String(b.choice||''));if(x.status===200)write(DB,d);json(s,x.status,x.data)});
  }
  if(!u.pathname.startsWith('/api/admin/'))return listener(r,s);
  if(!isAdmin(me))return json(s,403,{error:'Không có quyền quản trị.'});
  if(u.pathname==='/api/admin/users'&&r.method==='GET'){
    const onlineCut=Date.now()-12000,users=d.users.map(x=>{const g=normGame(x.game),slots=g.slots;const lastSeen=Number(x.lastSeen||0);const on=lastSeen>onlineCut;return{id:x.id,username:x.username,createdAt:x.createdAt,role:isAdmin(x)?'admin':'player',locked:!!x.locked,isOnline:on,lastSeen:lastSeen||null,activeSlot:Number(g.activeSlot||0),slots,levels:slots.map(v=>v&&v.lvl!=null?Number(v.lvl):null),charName:(slots.find(v=>v&&v.name)||{}).name||''}});return json(s,200,{users,total:users.length,onlineCount:users.filter(x=>x.isOnline&&!x.role==='admin').length})
  }
  if(u.pathname==='/api/admin/ranking'&&(r.method==='GET'||r.method==='POST'))return json(s,200,{ranking:buildRanking(d).slice(0,200)});
  if(u.pathname==='/api/admin/simbot'&&(r.method==='GET'||r.method==='POST')){if(r.method==='GET')return json(s,200,{enabled:c.simbotEnabled!==false});return body(r,b=>{c.simbotEnabled=b.enabled!==false;write(CFG,c);json(s,200,{ok:true,enabled:c.simbotEnabled})})}
  if(u.pathname==='/api/admin/simbot-status'&&r.method==='GET')return json(s,200,{simbotEnabled:c.simbotEnabled!==false});
  if(u.pathname==='/api/admin/maintenance'&&(r.method==='GET'||r.method==='POST')){if(r.method==='GET')return json(s,200,{maintenance:!!c.maintenance});return body(r,b=>{c.maintenance=!!b.enabled;write(CFG,c);json(s,200,{ok:true,maintenance:c.maintenance})})}
  if(u.pathname==='/api/admin/server-open'&&(r.method==='GET'||r.method==='POST')){if(r.method==='GET')return json(s,200,openState(c));return body(r,b=>{if('forceOpen'in b)c.forceOpen=!!b.forceOpen;if(b.openTime)c.openTime=String(b.openTime);write(CFG,c);json(s,200,openState(c))})}
  if(u.pathname==='/api/admin/users/wipe'&&r.method==='POST'){const before=d.users.length;d.users=d.users.filter(x=>isAdmin(x));d.sessions=d.sessions.filter(x=>d.users.some(u=>u.id===x.userId));write(DB,d);return json(s,200,{ok:true,deleted:before-d.users.length,remaining:d.users.length})}
  if(u.pathname==='/api/admin/users/reset-progress'&&r.method==='POST'){let n=0;for(const x of d.users)if(!isAdmin(x)){const g=normGame(x.game);for(const sl of g.slots)if(sl){sl.lvl=1;sl.xp=0;sl.stage=1;sl.gold=0;n++}x.game=g;x.revision=Number(x.revision||0)+1}write(DB,d);return json(s,200,{ok:true,resetCount:n})}
  const lm=u.pathname.match(/^\/api\/admin\/users\/([^/]+)\/lock$/);if(lm&&r.method==='POST')return body(r,b=>{const x=d.users.find(v=>v.id===lm[1]);if(!x)return json(s,404,{error:'Không tìm thấy tài khoản.'});if(isAdmin(x))return json(s,400,{error:'Không thể khóa tài khoản quản trị.'});x.locked=!!b.locked;x.lockReason=String(b.reason||'');if(x.locked)d.sessions=d.sessions.filter(v=>v.userId!==x.id);write(DB,d);json(s,200,{ok:true,locked:x.locked,message:x.locked?`Đã khóa tài khoản "${x.username}".`:`Đã mở khóa tài khoản "${x.username}".`})});
  const del=u.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);if(del&&r.method==='DELETE'){const x=d.users.find(v=>v.id===del[1]);if(!x)return json(s,404,{error:'Không tìm thấy tài khoản.'});if(isAdmin(x))return json(s,400,{error:'Không thể xóa tài khoản quản trị.'});d.users=d.users.filter(v=>v.id!==x.id);d.sessions=d.sessions.filter(v=>v.userId!==x.id);write(DB,d);return json(s,200,{ok:true})}
  if(u.pathname==='/api/admin/grant'&&r.method==='POST')return body(r,b=>{const ts=targets(d,b.target),items=Array.isArray(b.items)?b.items:[],slotIndex=Math.max(0,Math.min(2,Number(b.slot||1)-1));if(!ts.length)return json(s,404,{error:'Không tìm thấy tài khoản.'});if(!b.sendMail){for(const x of ts){const sl=ensureSlot(x,slotIndex);if(b.level!=null)sl.lvl=Math.max(1,Math.min(180,Math.floor(Number(b.level)||1)));sl.gold=Number(sl.gold||0)+Math.max(0,Math.floor(Number(b.gold||0)));sl.knb=Number(sl.knb||0)+Math.max(0,Math.floor(Number(b.knb||0)));addItems(sl,items);x.game=normGame(x.game);x.revision=Number(x.revision||0)+1}}else{for(const x of ts){const sl=ensureSlot(x,slotIndex);addMail(sl,b.subject,b.text,items);if(b.level!=null)sl.lvl=Math.max(1,Math.min(180,Math.floor(Number(b.level)||1)));if(b.gold)sl.gold=Number(sl.gold||0)+Math.max(0,Math.floor(Number(b.gold||0)));if(b.knb)sl.knb=Number(sl.knb||0)+Math.max(0,Math.floor(Number(b.knb||0)));x.revision=Number(x.revision||0)+1}}write(DB,d);json(s,200,{ok:true,count:ts.length,itemCount:items.length})});
  if(u.pathname==='/api/admin/gift-codes'&&(r.method==='GET'||r.method==='POST')){if(r.method==='GET')return json(s,200,{codes:d.giftCodes||[]});return body(r,b=>{const out=[],count=Math.max(1,Math.min(100,Number(b.count||1)));for(let i=0;i<count;i++){let code=i===0?String(b.code||'').trim().toUpperCase():'';if(!code)code=(String(b.prefix||'GIFT').toUpperCase()+'-'+crypto.randomBytes(4).toString('hex').toUpperCase());if(i>0)code=String(b.prefix||'GIFT').toUpperCase()+'-'+crypto.randomBytes(4).toString('hex').toUpperCase();if(d.giftCodes.some(x=>x.code===code))continue;const c2={id:crypto.randomUUID(),code,kind:String(b.kind||'tanthu'),ttl:Number(b.kind==='vip'?10:(b.ttl||5)),knb:Number(b.kind==='vip'?10:(b.knb||5)),maxUses:Math.max(1,Number(b.maxUses||1)),used:0,usedBy:[],active:true,createdAt:Date.now()};d.giftCodes.push(c2);out.push(c2)}write(DB,d);json(s,200,count===1?{ok:true,code:out[0]}:{ok:true,codes:out})})}
  const gc=u.pathname.match(/^\/api\/admin\/gift-codes\/([^/]+)$/);if(gc){const x=d.giftCodes.find(v=>v.id===gc[1]);if(r.method==='PATCH')return body(r,b=>{if(!x)return json(s,404,{error:'Không tìm thấy mã.'});if('active'in b)x.active=!!b.active;write(DB,d);json(s,200,{ok:true,code:x})});if(r.method==='DELETE'){if(!x)return json(s,404,{error:'Không tìm thấy mã.'});d.giftCodes=d.giftCodes.filter(v=>v.id!==x.id);write(DB,d);return json(s,200,{ok:true})}}
  if(u.pathname==='/api/admin/ktc-catalog'&&(r.method==='GET'||r.method==='POST')){if(r.method==='GET')return json(s,200,{items:Array.isArray(c.ktc)?c.ktc:[]});return body(r,b=>{c.ktc=Array.isArray(b.items)?b.items:[];write(CFG,c);json(s,200,{ok:true,items:c.ktc})})}
  return json(s,404,{error:'Admin API chưa được hỗ trợ: '+u.pathname});
},...args)};
