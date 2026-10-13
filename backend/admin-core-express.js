'use strict';
const express=require('express');
const fs=require('fs');
const path=require('path');
const DATA=path.join(process.env.DATA_DIR||path.join(__dirname,'data'),'database.json');
const ORIGIN='https://tanvolam.onrender.com';
const admins=new Set(String(process.env.ADMIN_USERNAMES||'admin1234').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
const originalUse=express.application.use;
function load(){try{return JSON.parse(fs.readFileSync(DATA,'utf8'))}catch(_){return{users:[],sessions:[]}}}
function save(d){fs.mkdirSync(path.dirname(DATA),{recursive:true});fs.writeFileSync(DATA,JSON.stringify(d,null,2))}
function sid(req){const x=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('jx_session='));return x?decodeURIComponent(x.slice(11)):''}
function me(req,d){const s=(d.sessions||[]).find(x=>x.id===sid(req)&&Number(x.expiresAt)>Date.now());return s?(d.users||[]).find(x=>x.id===s.userId)||null:null}
function admin(u){return !!u&&admins.has(String(u.username||'').trim().toLowerCase())}
function send(res,n,x){res.status(n).json(x)}
function raw(req,cb){let a=[];req.on('data',x=>a.push(x));req.on('end',()=>{try{cb(JSON.parse(Buffer.concat(a).toString()||'{}'))}catch(_){cb({})}})}
function game(x){const g=x.game&&typeof x.game==='object'?x.game:{};const slots=Array.isArray(g.slots)?g.slots.slice(0,3):[];while(slots.length<3)slots.push(null);return {...g,slots}}
express.application.use=function(...args){const app=this;const middleware=function(req,res,next){
 if(req.method==='OPTIONS'){res.set('Access-Control-Allow-Origin',ORIGIN).set('Access-Control-Allow-Credentials','true').set('Access-Control-Allow-Headers','Content-Type, Authorization, X-Requested-With').set('Access-Control-Allow-Methods','GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS')}
 const p=req.path||req.url.split('?')[0];if(!p.startsWith('/api/admin/')&&p!=='/api/auth/me')return next();
 const d=load(),u=me(req,d);
 if(p==='/api/auth/me'&&req.method==='GET'){if(!u)return send(res,401,{error:'Chưa đăng nhập'});return send(res,200,{user:{id:u.id,username:u.username,createdAt:u.createdAt,role:admin(u)?'admin':'player',locked:!!u.locked}})}
 if(!admin(u))return send(res,u?403:401,{error:u?'Không có quyền quản trị.':'Chưa đăng nhập'});
 if(p==='/api/admin/users'&&req.method==='GET'){const users=d.users.map(x=>{const g=game(x),s=g.slots;return{id:x.id,username:x.username,createdAt:x.createdAt,role:admin(x)?'admin':'player',locked:!!x.locked,isOnline:false,lastSeen:null,activeSlot:Number(g.activeSlot||0),slots:s,levels:s.map(v=>v&&v.lvl!=null?Number(v.lvl):null),charName:(s.find(v=>v&&v.name)||{}).name||''}});return send(res,200,{users,total:users.length,onlineCount:0})}
 if(p==='/api/admin/ranking'&&req.method==='GET'){const a=[];for(const x of d.users)for(const s of game(x).slots)if(s&&s.name)a.push({username:x.username,name:s.name,lvl:Number(s.lvl||1),stage:Number(s.stage||1),gold:Number(s.gold||0)});a.sort((a,b)=>b.lvl-a.lvl||b.stage-a.stage||b.gold-a.gold);return send(res,200,{ranking:a.slice(0,200)})}
 if(p==='/api/admin/grant'&&req.method==='POST')return raw(req,b=>{const targets=b.target==='all'?d.users:d.users.filter(x=>x.id===String(b.target));if(!targets.length)return send(res,404,{error:'Không tìm thấy tài khoản.'});const i=Math.max(0,Math.min(2,Number(b.slot||1)-1));for(const x of targets){const g=game(x);let s=g.slots[i];if(!s||typeof s!=='object')s={name:'',lvl:1,gold:0,knb:0};if(b.level!=null&&b.level!=='')s.lvl=Math.max(1,Math.min(180,Math.floor(Number(b.level))));s.gold=Number(s.gold||0)+Math.max(0,Math.floor(Number(b.gold||0)));s.knb=Number(s.knb||0)+Math.max(0,Math.floor(Number(b.knb||0)));g.slots[i]=s;x.game=g;x.revision=Number(x.revision||0)+1}save(d);return send(res,200,{ok:true,count:targets.length})});
 if(/^\/api\/admin\/users\/[^/]+\/lock$/.test(p)&&req.method==='POST')return raw(req,b=>{const id=p.split('/')[4],x=d.users.find(v=>v.id===id);if(!x)return send(res,404,{error:'Không tìm thấy tài khoản.'});if(admin(x))return send(res,400,{error:'Không thể khóa tài khoản quản trị.'});x.locked=!!b.locked;if(x.locked)d.sessions=d.sessions.filter(s=>s.userId!==id);save(d);return send(res,200,{ok:true,locked:x.locked})});
 if(/^\/api\/admin\/users\/[^/]+$/.test(p)&&req.method==='DELETE'){const id=p.split('/')[4],x=d.users.find(v=>v.id===id);if(!x)return send(res,404,{error:'Không tìm thấy tài khoản.'});if(admin(x))return send(res,400,{error:'Không thể xóa tài khoản quản trị.'});d.users=d.users.filter(v=>v.id!==id);d.sessions=d.sessions.filter(s=>s.userId!==id);save(d);return send(res,200,{ok:true})}
 return next();
};return originalUse.call(app,middleware,...args)};
