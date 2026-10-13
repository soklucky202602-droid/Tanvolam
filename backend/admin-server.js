'use strict';
// Render currently starts this file directly, so load the admin middleware here too.
require('./cors-preload.js');
require('./admin-more.js');
require('./admin-fix.js');
require('./admin-admv.js');
require('./inventory-fix.js');
require('./admin-v2.js');
const http=require('http'),fs=require('fs'),path=require('path');
const original=http.createServer,ORIGIN='https://tanvolam.onrender.com';
const DATA=path.join(process.env.DATA_DIR||path.join(__dirname,'data'),'database.json');
const ADM=new Set(String(process.env.ADMIN_USERNAMES||'admin1234').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
function load(){try{return JSON.parse(fs.readFileSync(DATA,'utf8'))}catch(_){return{users:[],sessions:[]}}}
function cookie(req){const x=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('jx_session='));return x?decodeURIComponent(x.slice(11)):''}
function current(req,d){const sid=cookie(req),s=(d.sessions||[]).find(x=>x.id===sid&&Number(x.expiresAt)>Date.now());return s?(d.users||[]).find(x=>x.id===s.userId)||null:null}
function admin(u){return !!u&&ADM.has(String(u.username||'').toLowerCase())}
function cors(req,res){const origin=req&&req.headers?req.headers.origin:'';if(origin===ORIGIN){res.setHeader('Access-Control-Allow-Origin',ORIGIN);res.setHeader('Access-Control-Allow-Credentials','true');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, X-Requested-With');res.setHeader('Access-Control-Allow-Methods','GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');res.setHeader('Vary','Origin')}}
function json(req,res,status,data){cors(req,res);res.statusCode=status;res.setHeader('content-type','application/json; charset=utf-8');res.end(JSON.stringify(data))}
http.createServer=function(listener,...args){return original.call(http,(req,res)=>{cors(req,res);if(req.method==='OPTIONS'&&req.headers.origin===ORIGIN){res.statusCode=204;return res.end()}const u=new URL(req.url||'/','http://local'),d=load(),me=current(req,d);if(u.pathname==='/api/auth/me'&&req.method==='GET'&&me){return json(req,res,200,{user:{id:me.id,username:me.username,createdAt:me.createdAt,role:admin(me)?'admin':'player',locked:!!me.locked}})}return listener(req,res)},...args)};
require('./server.js');
