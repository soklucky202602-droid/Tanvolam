(()=>{
'use strict';
const nativeFetch=window.fetch.bind(window);
if(window.__TANV_ADMV_ADMIN_BRIDGE)return;
window.__TANV_ADMV_ADMIN_BRIDGE=true;
window.fetch=async function(input,init){
  try{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(init&&init.body&&String(url).includes('/api/admin/admv/action')){
      const b=JSON.parse(init.body||'{}');
      const group=String(b.action||''),p=b.payload&&typeof b.payload==='object'?b.payload:{},i=Number(p.index),v=p.value;
      if(group==='hero'){
        b.payload=i===0?{level:v}:i===1?{potential:Number(v)||0}:i===2?{martial:Number(v)||0}:i===3?{gold:Number(v)||0}:{fullHp:true,fullMp:true};
      }else if(group==='world'){
        const map=[{kind:'stage',stage:v},{kind:'bossWave'},{kind:'regionalBoss'},{kind:'goldenBoss'},{kind:'elite',count:Number(v)||5},{kind:'clearEnemies'},{kind:'unlockWorld'}];
        b.payload=map[i]||{};
      }else if(group==='item'){
        b.payload=i===0?{action:'random',count:Number(v)||3}:i===1?{action:'goldenSet'}:i===2?{action:'upgrade10'}:{action:'materials',qty:100};
      }else if(group==='act'){
        const map=[{action:'reset'},{action:'towerRecord',value:Number(v)||0},{action:'ct',value:Number(v)||0},{action:'tk',value:Number(v)||0},{action:'phucDuyen',value:Number(v)||0},{action:'expBuff',minutes:Number(v)||60},{action:'daily'},{action:'attendance'},{action:'unlock'}];
        b.payload=map[i]||{};
      }
      init=Object.assign({},init,{body:JSON.stringify(b)});
    }
  }catch(e){console.warn('[ADMV bridge]',e)}
  return nativeFetch(input,init);
};
})();