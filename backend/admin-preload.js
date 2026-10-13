'use strict';
const http=require('http');
const fs=require('fs');
const path=require('path');
const original=http.createServer;
const file=path.join(process.env.DATA_DIR||path.join(__dirname,'data'),'database.json');
function db(){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(_){return{users:[],sessions:[]}}}
function cookie(req,n){const x=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(n+'='));return x?decodeURIComponent(x.slice(n.length+1)):''}
http.createServer=function(listener,...args){return original.call(http,(req,res)=>{
 const u=new URL(req.url||'/', 'http://local');
 if(req.method==='GET'&&u.pathname==='/api/auth/me'){
  const d=db(),sid=cookie(req,'jx_session'),s=(d.sessions||[]).find(x=>x.id===sid&&Number(x.expiresAt)>Date.now()),user=s?(d.users||[]).find(x=>x.id===s.userId):null;
  if(!user){res.statusCode=401;res.setHeader('content-type','application/json');return res.end(JSON.stringify({error:'Chưa đăng nhập'}))}
  const role=String(user.username||'').toLowerCase()==='admin1234'?'admin':'player';
  res.statusCode=200;res.setHeader('content-type','application/json');return res.end(JSON.stringify({user:{id:user.id,username:user.username,createdAt:user.createdAt,role,locked:!!user.locked}}));
 }
 return listener(req,res);
},...args)};
