'use strict';
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const previous=http.createServer,ORIGIN='https://tanvolam.onrender.com';
const DATA=path.join(process.env.DATA_DIR||path.join(__dirname,'data'),'database.json');
const CFG=path.join(process.env.DATA_DIR||path.join(__dirname,'data'),'admv-config.json');
function readDb(){try{return JSON.parse(fs.readFileSync(DATA,'utf8'))}catch(_){return{users:[],sessions:[]}}}
function writeDb(d){fs.mkdirSync(path.dirname(DATA),{recursive:true});fs.writeFileSync(DATA,JSON.stringify(d,null,2))}
const DEFAULT={xp:1,gold:1,drop:1,hp:1,dmg:1,heroDmg:1,spawn:1,lucky:0,speed:0,god:false,infMana:false,maintenance:false,announce:''};
function readCfg(){try{return {...DEFAULT,...JSON.parse(fs.readFileSync(CFG,'utf8'))}}catch(_){return {...DEFAULT}}}
function writeCfg(c){fs.mkdirSync(path.dirname(CFG),{recursive:true});fs.writeFileSync(CFG,JSON.stringify({...DEFAULT,...c},null,2))}
function cookie(r){const x=String(r.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('jx_session='));return x?decodeURIComponent(x.slice(11)):''}
function current(r,d){const sid=cookie(r),s=(d.sessions||[]).find(x=>x.id===sid&&Number(x.expiresAt)>Date.now());return s?(d.users||[]).find(x=>x.id===s.userId)||null:null}
function isAdmin(u){const names=new Set(String(process.env.ADMIN_USERNAMES||'admin1234').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));return !!u&&(u.role==='admin'||names.has(String(u.username||'').toLowerCase()))}
function cors(s){s.setHeader('Access-Control-Allow-Origin',ORIGIN);s.setHeader('Access-Control-Allow-Credentials','true');s.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, X-Requested-With');s.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE,OPTIONS');s.setHeader('Vary','Origin')}
function json(s,n,x){cors(s);s.statusCode=n;s.setHeader('content-type','application/json; charset=utf-8');s.end(JSON.stringify(x))}
function body(r,cb){const a=[];r.on('data',x=>a.push(x));r.on('end',()=>{try{cb(JSON.parse(Buffer.concat(a).toString()||'{}'))}catch(_){cb({})}})}
function slots(g){const x=g&&typeof g==='object'?g:{};const a=Array.isArray(x.slots)?x.slots.slice(0,3):[];while(a.length<3)a.push(null);x.slots=a;return x}
function slotFor(u,n){const g=slots(u.game);let s=g.slots[Math.max(0,Math.min(2,Number(n||1)-1))];if(!s){s={name:u.username,fac:'shaolin',lvl:1,stage:1,gold:0,knb:0,inv:[],stackItems:{},admvCommands:[]};g.slots[Math.max(0,Math.min(2,Number(n||1)-1))]=s}if(!Array.isArray(s.inv))s.inv=[];if(!s.stackItems||typeof s.stackItems!=='object')s.stackItems={};if(!Array.isArray(s.admvCommands))s.admvCommands=[];u.game=g;return s}
function item(sl,name,id,qty){const q=Math.max(1,Math.floor(Number(qty||1)));const key=String(id||'').toLowerCase();const stack=new Set(['tt','qht','rngua','vlmt','ttk','bk90','rht','rda','knb','life_potion','mana_potion']);if(stack.has(key)){sl.stackItems[key]=(Number(sl.stackItems[key])||0)+q;return q}for(let i=0;i<q;i++)sl.inv.push({uid:'admv-'+crypto.randomUUID(),id:id||undefined,n:name||'Vật phẩm ADMV',name:name||'Vật phẩm ADMV',qty:1,locked:true});return q}
function audit(d,u,action,target,detail){d.admvAudit=Array.isArray(d.admvAudit)?d.admvAudit:[];d.admvAudit.unshift({id:crypto.randomUUID(),at:Date.now(),admin:u?.username||'admin',action,target,detail:detail||''});d.admvAudit=d.admvAudit.slice(0,500)}
function findTarget(d,b){const q=String(b.owner||b.userId||'').trim();if(q){const u=d.users.find(x=>x.id===q);if(u)return u}const name=String(b.name||b.targetName||'').trim().toLowerCase();if(name){for(const u of d.users){for(const s of slots(u.game).slots){if(s&&String(s.name||'').trim().toLowerCase()===name)return u}}}return null}
function mutate(s,a,p){
  const v=p&&p.value;
  if(a==='hero'){
    if(p.index===0)s.lvl=v==='MAX_LEVEL'?180:Math.max(1,Math.min(180,Number(v)||1));
    else if(p.index===1)s.potential=(Number(s.potential)||0)+Math.max(0,Number(v)||0);
    else if(p.index===2)s.skillPoints=(Number(s.skillPoints)||0)+Math.max(0,Number(v)||0);
    else if(p.index===3)s.gold=(Number(s.gold)||0)+Math.max(0,Number(v)||0);
    else if(p.index===4){s.hp=s.maxHp||s.hp||999999;s.mp=s.maxMp||s.mp||999999}
  } else if(a==='world'){
    if(p.index===0)s.stage=v==='STAGES'?2000:Math.max(1,Number(v)||1);
    else if(p.index===1)s.admvCommands.push({id:crypto.randomUUID(),type:'bossWave',at:Date.now()});
    else if(p.index===2)s.admvCommands.push({id:crypto.randomUUID(),type:'regionalBoss',at:Date.now()});
    else if(p.index===3)s.admvCommands.push({id:crypto.randomUUID(),type:'goldenBoss',at:Date.now()});
    else if(p.index===4)s.admvCommands.push({id:crypto.randomUUID(),type:'elite',count:Math.max(1,Number(v)||1),at:Date.now()});
    else if(p.index===5)s.admvCommands.push({id:crypto.randomUUID(),type:'clearEnemies',at:Date.now()});
    else if(p.index===6)s.admvCommands.push({id:crypto.randomUUID(),type:'unlockWorld',at:Date.now()});
  } else if(a==='item'){
    if(p.index===0){const lines=Math.max(3,Math.min(6,Number(v)||3));for(let i=0;i<10;i++)item(s,'Trang bị ADMV '+(i+1),'admv_equipment_'+lines,1)}
    else if(p.index===1){for(const n of ['Mũ Hoàng Kim','Áo Hoàng Kim','Quần Hoàng Kim','Giày Hoàng Kim','Vũ khí Hoàng Kim'])item(s,n,'hoang_kim',1)}
    else if(p.index===2)s.admvCommands.push({id:crypto.randomUUID(),type:'upgradeEquipped',level:10,at:Date.now()});
    else if(p.index===3){for(const id of ['tt','qht','rngua','vlmt','ttk','bk90','rht','rda'])item(s,id,id,99)}
  } else if(a==='act'){
    if(p.index===0){s.congThanh=0;s.tongKim=0;s.towerFloor=0;s.dailyResetAt=Date.now()}
    else if(p.index===1)s.towerFloor=Math.max(0,Number(v)||0);
    else if(p.index===2)s.congThanhLenh=(Number(s.congThanhLenh)||0)+Math.max(0,Number(v)||0);
    else if(p.index===3)s.tongKimLenh=(Number(s.tongKimLenh)||0)+Math.max(0,Number(v)||0);
    else if(p.index===4)s.phucDuyen=(Number(s.phucDuyen)||0)+Math.max(0,Number(v)||0);
    else if(p.index===5)s.admvBuff={type:'exp',pct:25,until:Date.now()+Math.max(1,Number(v)||30)*60000};
    else if(p.index===6)s.dailyDone=true;
    else if(p.index===7)s.checkinUnlocked=true;
    else if(p.index===8)s.featuresUnlocked=true;
  } else throw new Error('Nhóm lệnh không hợp lệ');
}
http.createServer=function(listener,...args){return previous.call(http,(r,s)=>{cors(s);if(r.method==='OPTIONS'&&r.headers.origin===ORIGIN){s.statusCode=204;return s.end()}const u=new URL(r.url||'/','http://local');if(!u.pathname.startsWith('/api/admin/admv'))return listener(r,s);const d=readDb(),me=current(r,d);if(!isAdmin(me))return json(s,403,{error:'Không có quyền quản trị ADMV'});
  if(u.pathname==='/api/admin/admv/settings'&&r.method==='GET')return json(s,200,readCfg());
  if(u.pathname==='/api/admin/admv/settings'&&r.method==='PUT')return body(r,b=>{const c=readCfg(),n={...c,...(b.settings||{})};writeCfg(n);audit(d,me,'settings','server',JSON.stringify(n));writeDb(d);json(s,200,n)});
  if(u.pathname==='/api/admin/admv/players'&&r.method==='GET'){const q=String(u.searchParams.get('q')||'').toLowerCase();const out=[];for(const x of d.users||[]){for(let i=0;i<3;i++){const sl=slots(x.game).slots[i];if(!sl)continue;const name=String(sl.name||'').trim();if(q&&!name.toLowerCase().includes(q)&&!String(x.username||'').toLowerCase().includes(q))continue;out.push({owner:x.id,username:x.username,slot:i+1,name:name||x.username,lvl:Number(sl.lvl||1),stage:Number(sl.stage||1),gold:Number(sl.gold||0),knb:Number(sl.knb||0)})}}return json(s,200,{players:out.slice(0,500)})}
  if(u.pathname==='/api/admin/admv/action'&&r.method==='POST')return body(r,b=>{const t=findTarget(d,b);if(!t)return json(s,404,{error:'Không tìm thấy nhân vật'});const sl=slotFor(t,b.slot);const action=String(b.action||'');mutate(sl,action,b.payload||{});t.revision=Number(t.revision||0)+1;audit(d,me,action,sl.name||t.username,JSON.stringify(b.payload||{}));writeDb(d);json(s,200,{ok:true,revision:t.revision,player:{name:sl.name||t.username,lvl:sl.lvl,stage:sl.stage,gold:sl.gold,knb:sl.knb,inv:Array.isArray(sl.inv)?sl.inv.length:0}})});
  if(u.pathname==='/api/admin/admv/grant-item'&&r.method==='POST')return body(r,b=>{const t=findTarget(d,b);if(!t)return json(s,404,{error:'Không tìm thấy nhân vật'});const sl=slotFor(t,b.slot);const n=item(sl,b.itemName,b.itemId,b.qty);t.revision=Number(t.revision||0)+1;audit(d,me,'grant-item',sl.name||t.username,`${b.itemId||''} x${b.qty||1}`);writeDb(d);json(s,200,{ok:true,added:n})});
  if(u.pathname==='/api/admin/admv/announce'&&r.method==='POST')return body(r,b=>{const text=String(b.text||'').trim().slice(0,240);if(!text)return json(s,400,{error:'Thiếu nội dung'});const c=readCfg();c.announce=text;c.announceAt=Date.now();writeCfg(c);audit(d,me,'announce','world',text);writeDb(d);json(s,200,{ok:true,text})});
  if(u.pathname==='/api/admin/admv/audit'&&r.method==='GET')return json(s,200,{items:(d.admvAudit||[]).slice(0,100)});
  return json(s,404,{error:'ADMV endpoint không tồn tại'});
},...args)};
