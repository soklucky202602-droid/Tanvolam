'use strict';
const http=require('http');
const fs=require('fs');
const path=require('path');
const original=http.createServer;
const dataFile=path.join(process.env.DATA_DIR||path.join(__dirname,'data'),'database.json');
const admins=new Set(String(process.env.ADMIN_USERNAMES||'admin1234').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
function load(){try{return JSON.parse(fs.readFileSync(dataFile,'utf8'))}catch(_){return{users:[],sessions:[]}}}
function save(d){fs.mkdirSync(path.dirname(dataFile),{recursive:true});fs.writeFileSync(dataFile,JSON.stringify(d,null,2))}
function cookie(req,n){const x=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(n+'='));return x?decodeURIComponent(x.slice(n.length+1)):''}
function user(req,d){const s=(d.sessions||[]).find(x=>x.id===cookie(req,'jx_session')&&Number(x.expiresAt)>Date.now());return s?(d.users||[]).find(x=>x.id===s.userId)||null:null}
function admin(u){return !!u&&admins.has(String(u.username||'').toLowerCase())}
function json(res,status,data){const b=JSON.stringify(data);res.statusCode=status;res.setHeader('content-type','application/json; charset=utf-8');res.end(b)}
function body(req,cb){const a=[];req.on('data',x=>a.push(x));req.on('end',()=>{try{cb(JSON.parse(Buffer.concat(a).toString()||'{}'))}catch(_){cb({})}})}
function game(u){const g=u&&u.game&&typeof u.game==='object'?u.game:{};const slots=Array.isArray(g.slots)?g.slots.slice(0,3):[];while(slots.length<3)slots.push(null);return{...g,slots}}
http.createServer=function(listener,...args){return original.call(http,(req,res)=>{
 const url=new URL(req.url||'/','http://local');
 if(url.pathname==='/api/auth/me'&&req.method==='GET'){
  const d=load(),u=user(req,d);if(!u)return json(res,401,{error:'Chưa đăng nhập'});return json(res,200,{user:{id:u.id,username:u.username,createdAt:u.createdAt,role:admin(u)?'admin':'player',locked:!!u.locked}})
 }
 if(!url.pathname.startsWith('/api/admin/'))return listener(req,res);
 const d=load(),u=user(req,d);if(!u)return json(res,401,{error:'Chưa đăng nhập'});if(!admin(u))return json(res,403,{error:'Không có quyền quản trị.'});
 if(req.method==='GET'&&url.pathname==='/api/admin/users'){
  const users=(d.users||[]).map(x=>{const s=game(x).slots;return{id:x.id,username:x.username,createdAt:x.createdAt,role:admin(x)?'admin':'player',locked:!!x.locked,isOnline:false,lastSeen:null,activeSlot:Number(game(x).activeSlot||0),slots:s,levels:s.map(v=>v&&v.lvl!=null?Number(v.lvl):null),charName:(s.find(v=>v&&v.name)||{}).name||''}});return json(res,200,{users,total:users.length,onlineCount:0})
 }
 if(req.method==='GET'&&url.pathname==='/api/admin/ranking'){const a=[];for(const x of d.users||[])for(const s of game(x).slots)if(s&&s.name)a.push({username:x.username,name:s.name,lvl:Number(s.lvl||1),stage:Number(s.stage||1),gold:Number(s.gold||0)});a.sort((a,b)=>b.lvl-a.lvl||b.stage-a.stage||b.gold-a.gold);return json(res,200,{ranking:a.slice(0,200)})}
 if(req.method==='GET'&&url.pathname==='/api/admin/simbot-status')return json(res,200,{simbotEnabled:process.env.SIMBOT_ENABLED!=='false'});
 if(req.method==='GET'&&url.pathname==='/api/admin/gift-codes')return json(res,200,{codes:{TANTHU2026:{choices:[{value:'ttl_knb',label:'5 Tiên Thảo Lộ + 5 KNB'}]},VLTKH5:{choices:[{value:'ttl_knb',label:'5 Tiên Thảo Lộ + 5 KNB'}]},OPEN2026:{choices:[{value:'ttl_knb',label:'5 Tiên Thảo Lộ + 5 KNB'},{value:'kimphong',label:'Bộ Kim Phong + 5 Tiên Thảo Lộ + 5 KNB'}]}}});
 if(req.method==='POST'&&url.pathname==='/api/admin/grant')return body(req,b=>{const targets=b.target==='all'?d.users:d.users.filter(x=>x.id===String(b.target));if(!targets.length)return json(res,404,{error:'Không tìm thấy tài khoản.'});const i=Math.max(0,Math.min(2,Number(b.slot||1)-1));for(const x of targets){const g=game(x);let s=g.slots[i];if(!s||typeof s!=='object')s={name:'',lvl:1,gold:0,knb:0};if(b.level!=null)s.lvl=Math.max(1,Math.min(180,Number(b.level)));s.gold=Number(s.gold||0)+Math.max(0,Number(b.gold||0));s.knb=Number(s.knb||0)+Math.max(0,Number(b.knb||0));g.slots[i]=s;x.game=g;x.revision=Number(x.revision||0)+1}save(d);json(res,200,{ok:true,count:targets.length})});
 if(req.method==='POST'&&/^\/api\/admin\/users\/[^/]+\/lock$/.test(url.pathname))return body(req,b=>{const id=url.pathname.split('/')[4],x=d.users.find(v=>v.id===id);if(!x)return json(res,404,{error:'Không tìm thấy tài khoản.'});if(admin(x))return json(res,400,{error:'Không thể khóa tài khoản quản trị.'});x.locked=!!b.locked;if(x.locked)d.sessions=d.sessions.filter(s=>s.userId!==id);save(d);json(res,200,{ok:true,locked:x.locked})});
 if(req.method==='DELETE'&&/^\/api\/admin\/users\/[^/]+$/.test(url.pathname)){const id=url.pathname.split('/')[4],x=d.users.find(v=>v.id===id);if(!x)return json(res,404,{error:'Không tìm thấy tài khoản.'});if(admin(x))return json(res,400,{error:'Không thể xóa tài khoản quản trị.'});d.users=d.users.filter(v=>v.id!==id);d.sessions=d.sessions.filter(s=>s.userId!==id);save(d);return json(res,200,{ok:true})}
 return json(res,404,{error:'Admin API chưa được hỗ trợ: '+url.pathname});
},...args)};
require('./server.js');
