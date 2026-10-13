'use strict';
// Render currently starts this file directly, so load the middleware chain here too.
// require() is cached, so this is safe even when package.json also preloads them.
require('./cors-preload.js');
require('./admin-more.js');
require('./admin-fix.js');

const http=require('http');
const original=http.createServer,ORIGIN='https://tanvolam.onrender.com';
function cors(req,res){if(req.headers.origin===ORIGIN){res.setHeader('Access-Control-Allow-Origin',ORIGIN);res.setHeader('Access-Control-Allow-Credentials','true');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, X-Requested-With');res.setHeader('Access-Control-Allow-Methods','GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');res.setHeader('Vary','Origin')}}
function json(res,status,data){res.statusCode=status;res.setHeader('content-type','application/json; charset=utf-8');res.end(JSON.stringify(data))}
http.createServer=function(listener,...args){return original.call(http,(req,res)=>{cors(req,res);if(req.method==='OPTIONS'&&req.headers.origin===ORIGIN){res.statusCode=204;return res.end()}return listener(req,res)},...args)};
require('./server.js');
