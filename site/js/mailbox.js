/* Mailbox UI for server mail stored in slot.mail */
(function(){
  'use strict';
  let state=null, slotIndex=0, overlay=null;
  const API='/api/game/state';
  const esc=s=>String(s==null?'':s).replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  async function load(){
    const r=await fetch(API,{credentials:'include',cache:'no-store'}); if(!r.ok) throw new Error('load');
    const j=await r.json(); state=j.game||j; slotIndex=Number(state.activeSlot||0); if(!Array.isArray(state.slots)) state.slots=[];
    if(!state.slots[slotIndex]) state.slots[slotIndex]={mail:[]};
    return state;
  }
  function slot(){ return state.slots[slotIndex]||{}; }
  function mails(){ return Array.isArray(slot().mail)?slot().mail:[]; }
  function itemName(x){return x?.name||x?.n||x?.title||x?.id||'Vật phẩm';}
  function itemQty(x){return Math.max(1,Number(x?.qty||x?.quantity||1));}
  function render(){
    if(!overlay)return; const ms=mails();
    overlay.innerHTML='<div class="mailbox-box"><button class="mailbox-close" type="button">✕</button><div class="mailbox-title">📜 HÒM THƯ <span>'+ms.length+'</span></div><div class="mailbox-list">'+
      (ms.length?ms.map((m,i)=>'<article class="mail-row"><div class="mail-row-head"><b>'+esc(m.subject||'Thư hệ thống')+'</b><small>'+new Date(Number(m.createdAt)||Date.now()).toLocaleString('vi-VN')+'</small></div><div class="mail-text">'+esc(m.text||'Bạn có thư mới.')+'</div><div class="mail-items">'+(Array.isArray(m.items)&&m.items.length?m.items.map(x=>'<span>🎁 '+esc(itemName(x))+(itemQty(x)>1?' ×'+itemQty(x):'')+'</span>').join(''):'<span>Không có vật phẩm đính kèm</span>')+'</div><button class="mail-claim" data-i="'+i+'" type="button">Nhận</button></article>').join(''):'<div class="mail-empty">📭 Không có thư.</div>')+'</div></div>';
    overlay.querySelector('.mailbox-close').onclick=close;
    overlay.querySelectorAll('.mail-claim').forEach(b=>b.onclick=()=>claim(Number(b.dataset.i)));
  }
  function addItems(sl,items){
    sl.stackItems=sl.stackItems&&typeof sl.stackItems==='object'?sl.stackItems:{};
    sl.adminItems=Array.isArray(sl.adminItems)?sl.adminItems:[];
    sl.bag=Array.isArray(sl.bag)?sl.bag:[];
    for(const raw of (Array.isArray(items)?items:[])){
      if(!raw||typeof raw!=='object')continue;
      const qty=Math.max(1,Math.floor(Number(raw.qty||raw.quantity||1)));
      const key=String(raw.id||raw.itemId||raw.kind||'').toLowerCase();
      const stack=['tt','qht','rngua','vlmt','ttk','bk90','rht','rda','knb','gold','life_potion','mana_potion'];
      if(stack.includes(key)) { sl.stackItems[key]=(Number(sl.stackItems[key])||0)+qty; continue; }
      for(let n=0;n<qty;n++){
        const item={...raw}; delete item.qty; delete item.quantity;
        item.uid=item.uid||('mail-'+Date.now()+'-'+Math.random().toString(36).slice(2));
        sl.adminItems.push(item); sl.bag.push(item);
      }
    }
  }
  function persistSlot(){
    const keys=['jxidle','jxidle_2','jxidle_3'];
    const k=keys[slotIndex]||keys[0];
    if(typeof window.jxPack==='function') localStorage.setItem(k,window.jxPack(slot()));
    else localStorage.setItem(k,JSON.stringify(slot()));
    localStorage.setItem('jxidle_slot',String(slotIndex));
  }
  async function claim(i){
    const ms=mails(), m=ms[i]; if(!m||m.claimed)return;
    const sl=slot();
    const backup=JSON.parse(JSON.stringify(sl));
    addItems(sl,m.items);
    ms.splice(i,1); sl.mail=ms;
    try{
      persistSlot();
      if(typeof window.jxSync!=='function') throw new Error('sync');
      await window.jxSync();
      render();
      if(typeof window.renderAll==='function')window.renderAll();
      if(typeof window.toast==='function') window.toast('Đã nhận quà từ thư.');
    }catch(e){
      state.slots[slotIndex]=backup;
      try{persistSlot();}catch(_){ }
      if(e&&e.status===409){ alert('Dữ liệu vừa thay đổi, game sẽ tải lại. Vui lòng mở lại Hòm thư sau khi vào game.'); }
      else alert('Không thể nhận thư, vui lòng thử lại.');
    }
  }
  async function open(){
    try{await load(); if(!overlay){overlay=document.createElement('div');overlay.id='mailboxOverlay';document.body.appendChild(overlay);} overlay.hidden=false; render();}
    catch(e){alert('Không thể tải hòm thư.');}
  }
  function close(){if(overlay)overlay.hidden=true;}
  function init(){
    if(document.getElementById('mailboxBtn'))return;
    const b=document.createElement('button'); b.id='mailboxBtn'; b.type='button'; b.title='Hòm thư'; b.innerHTML='📜<span class="mailbox-badge" hidden></span>'; b.onclick=open; document.body.appendChild(b);
    refreshBadge(); setInterval(refreshBadge,5000);
  }
  async function refreshBadge(){
    try{await load();const n=mails().length,b=document.querySelector('.mailbox-badge');if(b){b.textContent=n>99?'99+':n;b.hidden=n===0;}}catch(e){}
  }
  window.openMailbox=open;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();
