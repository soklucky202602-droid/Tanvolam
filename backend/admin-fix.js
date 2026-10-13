'use strict';
const http=require('http'),fs=require('fs'),path=require('path');
const native=http.createServer,ORIGIN='https://tanvolam.onrender.com';
const DIR=process.env.DATA_DIR||path.join(__dirname,'data'),CFG=path.join(DIR,'admin-config.json'),DB=path.join(DIR,'database.json');
const ADM=new Set(String(process.env.ADMIN_USERNAMES||'admin1234').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
function read(p,d){try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch(_){return d}}
function db(){const d=read(DB,{users:[],sessions:[]});d.users??=[];d.sessions??=[];return d}
function cfg(){return read(CFG,{maintenance:false})}
function cookie(r){const x=String(r.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('jx_session='));return x?decodeURIComponent(x.slice(11)):''}
function user(r,d){const sid=cookie(r),s=d.sessions.find(x=>x.id===sid&&Number(x.expiresAt)>Date.now());return s?d.users.find(x=>x.id===s.userId)||null:null}
function admin(u){return !!u&&ADM.has(String(u.username||'').toLowerCase())}
function cors(s){s.setHeader('Access-Control-Allow-Origin',ORIGIN);s.setHeader('Access-Control-Allow-Credentials','true');s.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, X-Requested-With');s.setHeader('Access-Control-Allow-Methods','GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');s.setHeader('Vary','Origin')}
function json(s,n,x){cors(s);s.statusCode=n;s.setHeader('content-type','application/json; charset=utf-8');s.end(JSON.stringify(x))}
function norm(g){const x=g&&typeof g==='object'?g:{};const slots=Array.isArray(x.slots)?x.slots.slice(0,3):[];while(slots.length<3)slots.push(null);return {...x,slots}}
http.createServer=function(listener,...args){return native.call(http,(r,s)=>{cors(s);const u=new URL(r.url||'/','http://local'),d=db(),me=user(r,d),c=cfg();if(r.method==='OPTIONS'&&r.headers.origin===ORIGIN){s.statusCode=204;return s.end()}
if(u.pathname==='/api/admin/users'&&r.method==='GET'&&admin(me)){const cut=Date.now()-12000,users=d.users.map(x=>{const g=norm(x.game),last=Number(x.lastSeen||0);return{id:x.id,username:x.username,createdAt:x.createdAt,role:admin(x)?'admin':'player',locked:!!x.locked,isOnline:last>cut,lastSeen:last||null,activeSlot:Number(g.activeSlot||0),slots:g.slots,levels:g.slots.map(v=>v&&v.lvl!=null?Number(v.lvl):null),charName:(g.slots.find(v=>v&&v.name)||{}).name||''}});return json(s,200,{users,total:users.length,onlineCount:users.filter(x=>x.isOnline&&x.role!=='admin').length})}
if(u.pathname==='/api/game/state'&&me&&!admin(me)&&c.maintenance)return json(s,503,{error:'Máy chủ đang bảo trì.'});
return listener(r,s)},...args)};
