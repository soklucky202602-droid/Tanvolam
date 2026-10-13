(function(){
  'use strict';
  if(window.__TANV_ADMV_RUNTIME_V2)return;
  window.__TANV_ADMV_RUNTIME_V2=true;

  const seenKey='tanv_admv_seen_v2';
  const MAX_SEEN=120;
  let seen=[];
  try{seen=JSON.parse(sessionStorage.getItem(seenKey)||'[]');if(!Array.isArray(seen))seen=[];}catch(_){seen=[];}
  const hasSeen=id=>seen.includes(String(id));
  function markSeen(id){id=String(id);if(hasSeen(id))return;seen.push(id);if(seen.length>MAX_SEEN)seen=seen.slice(-MAX_SEEN);try{sessionStorage.setItem(seenKey,JSON.stringify(seen));}catch(_){} }

  async function json(url,opt){
    const r=await fetch(url,Object.assign({credentials:'same-origin',cache:'no-store'},opt||{}));
    const t=await r.text();let d={};try{d=JSON.parse(t||'{}')}catch(_){}
    if(!r.ok)throw Error(d.error||('HTTP '+r.status));
    return d;
  }
  function S(){return window.S&&typeof window.S==='object'?window.S:null;}
  function toast(msg){try{typeof window.toast==='function'&&window.toast(msg)}catch(_){}try{typeof window.addText==='function'&&window.addText(String(msg))}catch(_){} }
  function recalc(){try{typeof window.recalc==='function'&&window.recalc()}catch(_){} }
  function refresh(){try{typeof window.refresh==='function'&&window.refresh()}catch(_){} }
  function save(){try{return typeof window.save==='function'?window.save():false}catch(_){return false}}
  function num(v,d=0){const n=Number(v);return Number.isFinite(n)?n:d;}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

  function ensureArrays(s){
    if(!Array.isArray(s.inv))s.inv=[];
    if(!s.stackItems||typeof s.stackItems!=='object')s.stackItems={};
    return s;
  }

  function addStack(s,key,qty){
    qty=Math.max(1,Math.floor(num(qty,1)));
    if(typeof window.stackItemAdd==='function'){
      try{window.stackItemAdd(key,qty);return true}catch(_){}
    }
    s.stackItems[key]=Math.max(0,num(s.stackItems[key],0))+qty;
    return true;
  }

  function addInvItem(s,item){
    const x=Object.assign({},item||{});
    x.uid=x.uid||('admv-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8));
    if(typeof window.addItem==='function'){
      try{window.addItem(x);return true}catch(_){}
    }
    if(!Array.isArray(s.inv))s.inv=[];
    s.inv.push(x);return true;
  }

  function grantItem(s,p){
    ensureArrays(s);
    const item=p&&p.item&&typeof p.item==='object'?p.item:p||{};
    const qty=Math.max(1,Math.floor(num(p&&p.qty,item.q||1)));
    const key=String(p&&p.key||item.key||item.id||'').trim();
    const stackable=!!(p&&p.stackable) || !!(window.STACK_ITEM_TYPES&&key&&window.STACK_ITEM_TYPES[key]);
    if(stackable&&key){addStack(s,key,qty);return true;}
    for(let i=0;i<qty;i++)addInvItem(s,item);
    return true;
  }

  function liveWorld(group,p){
    const s=S(); if(!s)return false;
    let used=false;
    if(group==='stage'){
      const stage=clamp(Math.floor(num(p&&p.stage,1)),1,Math.max(1,num(window.STAGES,2000)));
      if(typeof window.gotoStage==='function'){try{window.gotoStage(stage);used=true;}catch(_){}
      } else {s.stage=stage;used=true;}
      try{if(typeof window.spawnWave==='function')window.spawnWave();}catch(_){}
    }else if(group==='bossWave'){
      const waves=Array.isArray(window.WAVES)?window.WAVES:[];
      const last=Math.max(1,waves.length||num(window.WAVES,1));
      s.wave=last;
      try{if(typeof window.spawnWave==='function'){window.spawnWave();used=true;}}catch(_){}
    }else if(group==='regionalBoss'){
      s.admvForceBoss={kind:'regional',at:Date.now()};
      try{if(typeof window.spawnWave==='function'){window.spawnWave();used=true;}}catch(_){}
    }else if(group==='goldenBoss'){
      try{if(typeof window.spawnGoldBoss==='function'){window.spawnGoldBoss();used=true;}}catch(_){}
      if(!used)s.admvForceBoss={kind:'golden',at:Date.now()};
    }else if(group==='elite'){
      const count=clamp(Math.floor(num(p&&p.count,5)),1,100);
      s.admvEliteSpawn={count,at:Date.now()};
      try{if(typeof window.populateField==='function'&&typeof window.startFieldWave==='function'){window.startFieldWave(count);window.populateField();used=true;}}catch(_){}
    }else if(group==='clearEnemies'){
      try{
        if(window.R&&Array.isArray(window.R.enemies)){window.R.enemies.length=0;used=true;}
        if(window.FIELD&&Array.isArray(window.FIELD.enemies))window.FIELD.enemies.length=0;
      }catch(_){}
      s.admvClearEnemiesAt=Date.now();
    }else if(group==='unlockWorld'){
      s.worldUnlocked=true;
      s.maxStage=Math.max(num(s.maxStage,0),num(window.STAGES,2000));
      used=true;
    }
    return used;
  }

  function applyHero(p){
    const s=S();if(!s)return false;let changed=false;
    if(p&&p.level!=null){const max=Math.max(1,num(window.MAX_LEVEL,180));s.lvl=clamp(Math.floor(num(p.level,1)),1,max);changed=true;}
    if(p&&p.potential!=null){const n=Math.max(0,Math.floor(num(p.potential,0)));s.attrPts=num(s.attrPts,0)+n;changed=true;}
    if(p&&p.martial!=null){const n=Math.max(0,Math.floor(num(p.martial,0)));s.skillPts=num(s.skillPts,0)+n;changed=true;}
    if(p&&p.gold!=null){s.gold=Math.max(0,num(s.gold,0)+num(p.gold,0));changed=true;}
    if(p&&p.fullHp){if(s.P&&typeof s.P==='object')s.P.life=s.P.lifeMax||s.P.life||1;if(window.R){window.R.life=window.R.P?.life||window.R.lifeMax||window.R.life||1;}changed=true;}
    if(p&&p.fullMp){if(s.P&&typeof s.P==='object')s.P.mana=s.P.manaMax||s.P.mana||1;if(window.R){window.R.mana=window.R.P?.mana||window.R.manaMax||window.R.mana||1;}changed=true;}
    recalc();return changed;
  }

  function applyItem(p){
    const s=S();if(!s)return false;
    if(p&&p.action==='random'){
      const n=clamp(Math.floor(num(p.count,3)),1,20);
      for(let i=0;i<n;i++){
        try{if(typeof window.makeItem==='function'){const x=window.makeItem(Math.max(1,num(s.lvl,1)),null);if(x)addInvItem(s,x);}}
        catch(_){}
      }
      return true;
    }
    if(p&&p.action==='goldenSet'){
      s.admvGoldenSet=true;s.admvGoldenSetAt=Date.now();return true;
    }
    if(p&&p.action==='upgrade10'){
      (s.inv||[]).forEach(x=>{if(x&&typeof x==='object'&&x.enhancement!=null)x.enhancement=Math.max(num(x.enhancement,0),10);});
      try{typeof window.renderInv==='function'&&window.renderInv()}catch(_){}
      return true;
    }
    if(p&&p.action==='materials'){
      const mats=['ore','ore2','shard','shard2'];for(const k of mats)addStack(s,k,Math.max(1,num(p.qty,100)));
      return true;
    }
    return false;
  }

  function applyActivity(p){
    const s=S();if(!s)return false;const now=Date.now();
    switch(String(p&&p.action||'')){
      case 'reset': s.ctState=null;s.tkState=null;s.towerBest=0;s.admvResetAt=now;return true;
      case 'towerRecord': s.towerBest=Math.max(0,Math.floor(num(p.value,0)));if(s.tower2Best!=null)s.tower2Best=Math.max(num(s.tower2Best,0),s.towerBest);return true;
      case 'ct': s.ctTokens=Math.max(num(s.ctTokens,0),Math.floor(num(p.value,0)));return true;
      case 'tk': s.tkTokens=Math.max(num(s.tkTokens,0),Math.floor(num(p.value,0)));return true;
      case 'phucDuyen': s.phucDuyen=Math.max(num(s.phucDuyen,0),Math.floor(num(p.value,0)));return true;
      case 'expBuff': s.admvExpBuffUntil=now+Math.max(0,num(p.minutes,60))*60000;return true;
      case 'daily': s.dailyTasks={resetAt:now,complete:true};return true;
      case 'attendance': s.attendance={day:new Date().toISOString().slice(0,10),claimed:true};return true;
      case 'unlock': s.featuresUnlocked=true;s.worldUnlocked=true;return true;
      default:return false;
    }
  }

  function applyCommand(c){
    const s=S();if(!s||!c)return false;
    const a=String(c.action||'');const p=c.payload&&typeof c.payload==='object'?c.payload:{};
    let ok=false;
    if(a==='grant-item')ok=grantItem(s,p);
    else if(a==='hero')ok=applyHero(p);
    else if(a==='world')ok=liveWorld(String(p.kind||p.action||''),p);
    else if(a==='item')ok=applyItem(p);
    else if(a==='act')ok=applyActivity(p);
    else if(a==='announce'){toast(String(p.message||''));ok=true;}
    if(ok){s.admvLastCommand=String(c.id||'');s.admvLastAt=Date.now();}
    return ok;
  }

  async function ack(id){try{await json('/api/game/admv/ack',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})})}catch(_){} }

  let busy=false;
  async function poll(){
    if(busy||!window.jxAuthReady)return;
    busy=true;
    try{
      const d=await json('/api/game/admv/commands');
      const list=Array.isArray(d.commands)?d.commands:[];
      for(const c of list){
        if(hasSeen(c.id)){await ack(c.id);continue;}
        let applied=false;
        try{applied=applyCommand(c);if(applied){markSeen(c.id);save();refresh();window.dispatchEvent(new CustomEvent('admv:applied',{detail:c}));toast('ADMV: '+(c.label||c.action||'Đã thực hiện'));}}catch(e){console.warn('[ADMV]',e)}
        if(applied)await ack(c.id);
      }
    }catch(e){/* offline/not logged in */}
    finally{busy=false;}
  }

  let lastSettings='';
  async function loadSettings(){
    try{
      const d=await json('/api/public/admv-settings');
      const s=d&&d.settings&&typeof d.settings==='object'?d.settings:{};
      const sig=JSON.stringify(s);if(sig===lastSettings)return;lastSettings=sig;
      window.TANV_ADMV_SETTINGS=s;
      window.dispatchEvent(new CustomEvent('admv:settings',{detail:s}));
    }catch(_){}
  }

  function init(){
    loadSettings();setInterval(loadSettings,30000);
    const wait=setInterval(()=>{
      if(window.jxAuthReady){clearInterval(wait);poll();setInterval(poll,3000);}
    },250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();