'use strict';
// Render starts this file directly. Keep ADMV settings at the outermost HTTP layer
// so generic admin middleware cannot swallow the endpoint.
require('./cors-preload.js');
require('./admin-more.js');
require('./admin-fix.js');
require('./admin-v2.js');
require('./admin-admv.js');
require('./inventory-fix.js');
require('./admv-compat.js');
const http=require('http'),fs=require('fs'),path=require('path');
const original=http.createServer,ORIGIN='https://tanvolam.onrender.com';
const DATA=path.join(process.env.DATA_DIR||path.join(__dirname,'data'),'database.json');
const CFG=path.join(process.env.DATA_DIR||path.join(__dirname,'data'),'admv-config.json');
const ADM=new Set(String(process.env.ADMIN_USERNAMES||'admin1234').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
const DEFAULT={xp:1,gold:1,drop:1,hp:1,dmg:1,heroDmg:1,spawn:1,lucky:0,speed:0,god:false,infMana:false,maintenance:false,announce:''};
function load(){try{return JSON.parse(fs.readFileSync(DATA,'utf8'))}catch(_){return{users:[],sessions:[]}}}
function cfg(){try{return {...DEFAULT,...JSON.parse(fs.readFileSync(CFG,'utf8'))}}catch(_){return {...DEFAULT}}}
function saveCfg(v){fs.mkdirSync(path.dirname(CFG),{recursive:true});fs.writeFileSync(CFG,JSON.stringify(v,null,2))}
function cookie(req){const x=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('jx_session='));return x?decodeURIComponent(x.slice(11)):''}
function current(req,d){const sid=cookie(req),s=(d.sessions||[]).find(x=>x.id===sid&&Number(x.expiresAt)>Date.now());return s?(d.users||[]).find(x=>x.id===s.userId)||null:null}
function admin(u){return !!u&&(u.role==='admin'||ADM.has(String(u.username||'').toLowerCase()))}
function cors(req,res){const origin=req&&req.headers?req.headers.origin:'';if(origin===ORIGIN){res.setHeader('Access-Control-Allow-Origin',ORIGIN);res.setHeader('Access-Control-Allow-Credentials','true');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, X-Requested-With');res.setHeader('Access-Control-Allow-Methods','GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');res.setHeader('Vary','Origin')}}
function json(req,res,status,data){cors(req,res);res.statusCode=status;res.setHeader('content-type','application/json; charset=utf-8');res.end(JSON.stringify(data))}
function body(req,cb){const chunks=[];req.on('data',x=>chunks.push(x));req.on('end',()=>{try{cb(JSON.parse(Buffer.concat(chunks).toString()||'{}'))}catch(_){cb({})}})}
http.createServer=function(listener,...args){return original.call(http,(req,res)=>{
  cors(req,res);
  if(req.method==='OPTIONS'&&req.headers.origin===ORIGIN){res.statusCode=204;return res.end()}
  const u=new URL(req.url||'/','http://local');
  const d=load();
  const me=current(req,d);

  // HARD OVERRIDE: handle ADMV settings before every generic admin handler.
  if(u.pathname==='/api/admin/admv/settings'){
    if(!admin(me)) return json(req,res,403,{error:'Không có quyền quản trị ADMV'});
    if(req.method==='GET') return json(req,res,200,cfg());
    if(req.method==='PUT') return body(req,b=>{const next={...cfg(),...(b.settings&&typeof b.settings==='object'?b.settings:{})};saveCfg(next);return json(req,res,200,next)});
    return json(req,res,405,{error:'Method không được hỗ trợ'});
  }

  if(u.pathname==='/api/auth/me'&&req.method==='GET'&&me)return json(req,res,200,{user:{id:me.id,username:me.username,createdAt:me.createdAt,role:admin(me)?'admin':'player',locked:!!me.locked}});
  return listener(req,res);
},...args)};
require('./server.js');
