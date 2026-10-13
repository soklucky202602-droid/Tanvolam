'use strict';
const express=require('express');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const DATA=path.join(process.env.DATA_DIR||path.join(__dirname,'data'),'database.json');
const CFG=path.join(path.dirname(DATA),'admin-config.json');
const ORIGIN='https://tanvolam.onrender.com';
const ADM=new Set(String(process.env.ADMIN_USERNAMES||'admin1234').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
const read=()=>{try{const d=JSON.parse(fs.readFileSync(DATA,'utf8'));d.users??=[];d.sessions??=[];d.giftClaims??=[];d.giftCodes??=[];return d}catch{return{users:[],sessions:[],giftClaims:[],giftCodes:[]}}};
const write=d=>{fs.mkdirSync(path.dirname(DATA),{recursive:true});fs.writeFileSync(DATA,JSON.stringify(d,null,2))};
const cfg=()=>{try{return JSON.parse(fs.readFileSync(CFG,'utf8'))}catch{return{maintenance:false,forceOpen:false,openTime:process.env.SERVER_OPEN_TIME||'2026-10-10T13:30:00+07:00',simbotEnabled:process.env.SIMBOT_ENABLED!=='false',ktc:[]}}};
const wcfg=c=>{fs.mkdirSync(path.dirname(CFG),{recursive:true});fs.writeFileSync(CFG,JSON.stringify(c,null,2))};
function cookie(req){const x=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('jx_session='));return x?decodeURIComponent(x.slice(11)):''}
function adminUser(req,d){const s=d.sessions.find(x=>x.id===cookie(req)&&Number(x.expiresAt)>Date.now());const u=s&&d.users.find(x=>x.id===s.userId);return u&&ADM.has(String(u.username||'').toLowerCase())?u:null}
function cors(res){res.setHeader('Access-Control-Allow-Origin',ORIGIN);res.setHeader('Access-Control-Allow-Credentials','true');res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization,X-Requested-With');res.setHeader('Vary','Origin')}
function send(res,status,x){cors(res);res.status(status).json(x)}
function rawBody(req,cb){let a=[];req.on('data',x=>a.push(x));req.on('end',()=>{try{cb(JSON.parse(Buffer.concat(a).toString()||'{}'))}catch{cb({})}})}
const oldUse=express.application.use;
express.application.use=function(...args){
 const middleware=(req,res,next)=>{
  const p=req.path||new URL(req.url||'/','http://local').pathname;
  if(!p.startsWith('/api/admin/'))return next();
  const d=read(),u=adminUser(req,d);if(!u)return next();
  if(p==='/api/admin/simbot'){
   if(req.method==='GET')return send(res,200,{enabled:cfg().simbotEnabled});
   if(req.method==='POST')return rawBody(req,b=>{const c=cfg();c.simbotEnabled=b.enabled!==false;wcfg(c);send(res,200,{ok:true,enabled:c.simbotEnabled})});
  }
  if(p==='/api/admin/maintenance'){
   if(req.method==='GET')return send(res,200,{maintenance:!!cfg().maintenance});
   if(req.method==='POST')return rawBody(req,b=>{const c=cfg();c.maintenance=!!b.enabled;wcfg(c);send(res,200,{ok:true,maintenance:c.maintenance})});
  }
  if(p==='/api/admin/server-open'){
   if(req.method==='GET'){const c=cfg();return send(res,200,{ok:true,forceOpen:!!c.forceOpen,openTime:c.openTime,open:c.forceOpen||Date.now()>=new Date(c.openTime).getTime()})}
   if(req.method==='POST')return rawBody(req,b=>{const c=cfg();if('forceOpen'in b)c.forceOpen=!!b.forceOpen;if(b.openTime)c.openTime=String(b.openTime);wcfg(c);send(res,200,{ok:true,forceOpen:c.forceOpen,openTime:c.openTime,open:c.forceOpen||Date.now()>=new Date(c.openTime).getTime()})});
  }
  if(p==='/api/admin/users/wipe'&&req.method==='POST'){const n=d.users.length;d.users=d.users.filter(x=>ADM.has(String(x.username||'').toLowerCase()));d.sessions=d.sessions.filter(s=>d.users.some(x=>x.id===s.userId));write(d);return send(res,200,{ok:true,deleted:n-d.users.length,remaining:d.users.length})}
  if(p==='/api/admin/users/reset-progress'&&req.method==='POST'){let n=0;for(const x of d.users)if(!ADM.has(String(x.username||'').toLowerCase())){const g=x.game||{};for(const s of Array.isArray(g.slots)?g.slots:[])if(s){s.lvl=1;s.xp=0;s.stage=1;s.gold=0;n++}x.game=g;x.revision=Number(x.revision||0)+1}write(d);return send(res,200,{ok:true,resetCount:n})}
  if(p==='/api/admin/gift-codes'){
   if(req.method==='GET')return send(res,200,{codes:d.giftCodes});
   if(req.method==='POST')return rawBody(req,b=>{const out=[],count=Math.max(1,Math.min(100,Number(b.count||1)));for(let i=0;i<count;i++){let code=String(i===0?b.code||'':b.prefix||'GIFT').trim().toUpperCase();if(!code)code='GIFT-'+crypto.randomBytes(4).toString('hex').toUpperCase();if(i)code+='-'+crypto.randomBytes(2).toString('hex').toUpperCase();if(d.giftCodes.some(x=>x.code===code))continue;const c={id:crypto.randomUUID(),code,kind:b.kind||'tanthu',ttl:Number(b.ttl||5),knb:Number(b.knb||5),maxUses:Math.max(1,Number(b.maxUses||1)),used:0,usedBy:[],active:true,createdAt:Date.now()};d.giftCodes.push(c);out.push(c)}write(d);send(res,200,count===1?{ok:true,code:out[0]}:{ok:true,codes:out})});
  }
  const gm=p.match(/^\/api\/admin\/gift-codes\/([^/]+)$/);if(gm){const c=d.giftCodes.find(x=>x.id===gm[1]);if(req.method==='PATCH')return rawBody(req,b=>{if(!c)return send(res,404,{error:'Không tìm thấy mã.'});if('active'in b)c.active=!!b.active;write(d);send(res,200,{ok:true,code:c})});if(req.method==='DELETE'){d.giftCodes=d.giftCodes.filter(x=>x.id!==gm[1]);write(d);return send(res,200,{ok:true})}}
  if(p==='/api/admin/ktc-catalog'){
   const c=cfg();if(req.method==='GET')return send(res,200,{items:c.ktc||[]});if(req.method==='POST')return rawBody(req,b=>{c.ktc=Array.isArray(b.items)?b.items:[];wcfg(c);send(res,200,{ok:true,items:c.ktc})});
  }
  next();
 };
 return oldUse.call(this,middleware,...args);
};
