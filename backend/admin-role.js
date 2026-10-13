'use strict';
const ADMIN_USERNAMES=new Set(String(process.env.ADMIN_USERNAMES||'admin1234').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
function isAdminUser(user){return !!user && ADMIN_USERNAMES.has(String(user.username||'').trim().toLowerCase());}
module.exports={ADMIN_USERNAMES,isAdminUser};
