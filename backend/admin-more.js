'use strict';
const http=require('http'),fs=require('fs'),path=require('path');
const native=http.createServer,ORIGIN='https://tanvolam.onrender.com';
const DIR=process.env.DATA_DIR||path.join(__dirname,'data'),CFG=path.join(DIR,'admin-config.json'),DB=path.join(DIR,'database.json');
const admins=new Set(String(process.env.ADMIN_USERNAMES||'admin1234').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
function read(p,d){try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch(_){return d}}
function write(p,d){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2))}
function cookie(r){const x=String(r.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('jx_session='));return x?decodeURIComponent(x.slice(11)):''}
function admin(r,d){const s=(d.sessions||[]).find(x=>x.id===cookie(r)&&Number(x.expiresAt)>Date.now());const u=s&&(d.users||[]).find(x=>x.id===s.userId);return u&&admins.has(String(u.username||'').toLowerCase())}
function cors(r,s){if(r.headers.origin===ORIGIN){s.setHeader('Access-Control-Allow-Origin',ORIGIN);s.setHeader('Access-Control-Allow-Credentials','true');s.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, X-Requested-With');s.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE,OPTIONS');s.setHeader('Vary','Origin')}}
function json(s,n,x){s.statusCode=n;s.setHeader('content-type','application/json; charset=utf-8');s.end(JSON.stringify(x))}
function body(r,cb){let a=[];r.on('data',x=>a.push(x));r.on('end',()=>{try{cb(JSON.parse(Buffer.concat(a).toString()||'{}'))}catch(_){cb({})}})}
http.createServer=function(listener,...args){return native.call(http,(r,s)=>{cors(r,s);if(r.method==='OPTIONS'&&r.headers.origin===ORIGIN){s.statusCode=204;return s.end()};const u=new URL(r.url||'/','http://x'),d=read(DB,{users:[],sessions:[]}),c=read(CFG,{serverOpen:true,simbotEnabled:true,maintenance:false,giftCodes:{},ktcCatalog:{}});if(!u.pathname.startsWith('/api/admin/'))return listener(r,s);if(!admin(r,d))return listener(r,s);
if((r.method==='GET'||r.method==='POST')&&u.pathname==='/api/admin/maintenance'){if(r.method==='GET')return json(s,200,{maintenance:!!c.maintenance});return body(r,b=>{c.maintenance=!!b.enabled;write(CFG,c);json(s,200,{ok:true,maintenance:c.maintenance})})}
if((r.method==='GET'||r.method==='POST')&&u.pathname==='/api/admin/server-open'){if(r.method==='GET')return json(s,200,{open:c.serverOpen!==false,serverOpen:c.serverOpen!==false});return body(r,b=>{c.serverOpen=b.open!==false&&b.serverOpen!==false;write(CFG,c);json(s,200,{ok:true,open:c.serverOpen,serverOpen:c.serverOpen})})}
if((r.method==='GET'||r.method==='POST')&&u.pathname==='/api/admin/simbot'){if(r.method==='GET')return json(s,200,{enabled:c.simbotEnabled!==false,simbotEnabled:c.simbotEnabled!==false});return body(r,b=>{c.simbotEnabled=b.enabled!==false;write(CFG,c);json(s,200,{ok:true,enabled:c.simbotEnabled,simbotEnabled:c.simbotEnabled})})}
if(r.method==='GET'&&u.pathname==='/api/admin/simbot-status')return json(s,200,{simbotEnabled:c.simbotEnabled!==false});
if(r.method==='GET'&&u.pathname==='/api/admin/gift-codes')return json(s,200,{codes:c.giftCodes||{}});
if(r.method==='POST'&&u.pathname==='/api/admin/gift-codes')return body(r,b=>{const code=String(b.code||b.id||'').trim().toUpperCase();if(!code)return json(s,400,{error:'Thiếu mã giftcode'});c.giftCodes=c.giftCodes||{};c.giftCodes[code]=Object.assign({},c.giftCodes[code]||{},b,{code});write(CFG,c);json(s,200,{ok:true,code:c.giftCodes[code]})});
if((r.method==='GET'||r.method==='POST')&&u.pathname==='/api/admin/ktc-catalog'){if(r.method==='GET')return json(s,200,{catalog:c.ktcCatalog||{}});return body(r,b=>{c.ktcCatalog=b.catalog??b;write(CFG,c);json(s,200,{ok:true,catalog:c.ktcCatalog})})}
return listener(r,s)},...args)};
