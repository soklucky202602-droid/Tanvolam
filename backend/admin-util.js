'use strict';
const fs=require('fs'),path=require('path');
const DATA=path.join(process.env.DATA_DIR||path.join(__dirname,'data'),'database.json');
const CFG=path.join(path.dirname(DATA),'admin-config.json');
const ORIGIN='https://tanvolam.onrender.com';
const ADM=new Set(String(process.env.ADMIN_USERNAMES||'admin1234').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
function db(){try{const d=JSON.parse(fs.readFileSync(DATA,'utf8'));d.users??=[];d.sessions??=[];d.giftClaims??=[];d.giftCodes??=[];return d}catch{return{users:[],sessions:[],giftClaims:[],giftCodes:[]}}}
function save(d){fs.mkdirSync(path.dirname(DATA),{recursive:true});fs.writeFileSync(DATA,JSON.stringify(d,null,2))}
function cfg(){try{return JSON.parse(fs.readFileSync(CFG,'utf8'))}catch{return{maintenance:false,forceOpen:false,openTime:process.env.SERVER_OPEN_TIME||'2026-10-10T13:30:00+07:00',simbotEnabled:process.env.SIMBOT_ENABLED!=='false',ktc:[]}}}
function saveCfg(c){fs.mkdirSync(path.dirname(CFG),{recursive:true});fs.writeFileSync(CFG,JSON.stringify(c,null,2))}
function cookie(req,n){const x=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(n+'='));return x?decodeURIComponent(x.slice(n.length+1)):''}
function user(req,d){const s=d.sessions.find(x=>x.id===cookie(req,'jx_session')&&Number(x.expiresAt)>Date.now());return s?d.users.find(x=>x.id===s.userId):null}
function admin(u){return !!u&&ADM.has(String(u.username||'').toLowerCase())}
function cors(res){res.setHeader('Access-Control-Allow-Origin',ORIGIN);res.setHeader('Access-Control-Allow-Credentials','true');res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization,X-Requested-With');res.setHeader('Vary','Origin')}
function json(res,status,x){cors(res);res.statusCode=status;res.setHeader('content-type','application/json; charset=utf-8');res.end(JSON.stringify(x))}
function body(req,cb){let a=[];req.on('data',x=>a.push(x));req.on('end',()=>{try{cb(JSON.parse(Buffer.concat(a).toString()||'{}'))}catch{cb({})}})}
function game(u){const g=u&&u.game&&typeof u.game==='object'?{...u.game}:{};g.slots=Array.isArray(g.slots)?g.slots.slice(0,3):[];while(g.slots.length<3)g.slots.push(null);return g}
module.exports={DATA,db,save,cfg,saveCfg,user,admin,cors,json,body,game};
