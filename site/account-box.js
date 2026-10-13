'use strict';
(() => {
  const script = document.currentScript, admin = script.dataset.mode === 'admin';
  const mounted = location.pathname.startsWith('/play02/');
  const standalone = true; // Standalone distribution of Server 02.
  const blue = mounted || standalone || script.dataset.server === 'xanh';
  const fixed = admin || blue;
  let server = blue ? '02' : '01', busy = false, checkVersion = 0;
  const API_ORIGIN = window.JX_API_ORIGIN || 'https://tanvolam-api.onrender.com';
  const root = () => mounted ? '/play02' : (!fixed && server === '02' ? '/play02' : '');
  const play = () => mounted ? '/play02/' : (fixed ? '/play01' : '/play'+server);

  // admin.html does not load api-config.js, so route its /api requests directly
  // to the Render API before server-admin.js starts making requests.
  if (admin && !window.__jxAdminFetchPatched) {
    const nativeFetch = window.fetch.bind(window);
    const toApiUrl = input => {
      const raw = typeof input === 'string' ? input : (input && input.url);
      if (!raw) return raw;
      try {
        const url = new URL(raw, window.location.href);
        if (url.origin === window.location.origin && url.pathname.startsWith('/api/')) {
          return API_ORIGIN + url.pathname + url.search + url.hash;
        }
        return raw;
      } catch (_) { return raw; }
    };
    window.fetch = function (input, init) {
      const apiUrl = toApiUrl(input);
      const isRequestObject = typeof input !== 'string' && input instanceof Request;
      let nextInput = input;
      const nextInit = init ? { ...init } : {};
      if (apiUrl && apiUrl !== (typeof input === 'string' ? input : input?.url)) {
        if (isRequestObject) nextInput = new Request(apiUrl, input);
        else nextInput = apiUrl;
      }
      if (!Object.prototype.hasOwnProperty.call(nextInit, 'credentials')) nextInit.credentials = 'include';
      return nativeFetch(nextInput, nextInit);
    };
    window.__jxAdminFetchPatched = true;
  }

  const box = document.createElement('section');box.className='account-box';box.id='accountBox';
  box.innerHTML='<h2>Tài khoản '+(admin?'quản trị':'Võ Lâm')+'</h2>'+
    '<label>Server <select id="boxServer"><option value="01">Server 01</option><option value="02">Server 01 · Võ Lâm Xanh</option></select></label>'+
    '<form id="boxForm"><label>Tài khoản<input id="boxUser" autocomplete="username" minlength="3" maxlength="24" required></label><label>Mật khẩu<input id="boxPass" type="password" autocomplete="current-password" minlength="6" maxlength="128" required></label><div class="box-actions"><button type="submit">Đăng nhập</button><button type="button" id="boxRegister">Đăng ký</button></div></form>'+
    '<p id="boxMessage" role="status" aria-live="polite"></p><div id="boxSession" hidden><p id="boxIdentity"></p><div class="box-actions"><a id="boxPlay">Vào game</a><a id="boxAdmin" hidden>Trang admin</a><button id="boxLogout">Đăng xuất</button></div></div><small>Đăng ký tạo tài khoản người chơi, không cấp quyền quản trị. Dữ liệu hai server riêng biệt.</small>';
  const host = document.querySelector('#accountBoxHost');
  if(host)host.append(box);else document.body.prepend(box);
  const $=id=>box.querySelector('#'+id), selector=$('boxServer');selector.value=server;
  selector.disabled=true; // This package contains only Server 02.
  const lock=on=>{if(admin)document.body.classList.toggle('admin-locked',on);};if(admin)lock(true);
  async function request(path,options={}) {
    const r=await fetch(root()+path,{...options,headers:{'content-type':'application/json',...options.headers}});
    const j=await r.json();if(!r.ok)throw Error(j.error||'Không kết nối được máy chủ');return j;
  }
  function view(user){
    $('boxForm').hidden=!!user;$('boxSession').hidden=!user;$('boxPass').value='';
    if(user){$('boxIdentity').textContent=user.username+' · Server '+server+' · '+(user.role==='admin'?'Quản trị viên':'Người chơi');$('boxPlay').href=play();$('boxAdmin').hidden=user.role!=='admin';$('boxAdmin').href=root()+'/admin.html';}
    if(admin){lock(user?.role!=='admin');if(user&&user.role!=='admin')$('boxMessage').textContent='Tài khoản này không có quyền quản trị. Bạn có thể vào game hoặc đăng xuất để đổi tài khoản.';}
  }
  async function check(){const version=++checkVersion;try{const me=await request('/api/auth/me');if(version===checkVersion)view(me.user);}catch(e){if(version===checkVersion){$('boxMessage').textContent=e.message;view(null);}}}
  async function submit(register){
    if(busy||!$('boxForm').reportValidity())return;++checkVersion;busy=true;selector.disabled=true;
    box.querySelectorAll('button').forEach(b=>b.disabled=true);$('boxMessage').textContent='Đang kết nối…';
    try{const r=await request(register?'/api/auth/register':'/api/auth/login',{method:'POST',body:JSON.stringify({username:$('boxUser').value.trim(),password:$('boxPass').value})});view(r.user);$('boxMessage').textContent=register?'Đăng ký thành công.':'Đăng nhập thành công.';
      if(admin&&r.user.role==='admin')location.reload();
      else if(admin)$('boxMessage').textContent='Đây là tài khoản người chơi, không có quyền quản trị.';
    }catch(e){$('boxMessage').textContent=e.message;}finally{busy=false;selector.disabled=true;box.querySelectorAll('button').forEach(b=>b.disabled=false);}
  }
  $('boxForm').onsubmit=e=>{e.preventDefault();submit(false);};$('boxRegister').onclick=()=>submit(true);
  $('boxLogout').onclick=async()=>{try{await request('/api/auth/logout',{method:'POST'});if(admin)location.reload();else{view(null);$('boxMessage').textContent='Đã đăng xuất.';}}catch(e){$('boxMessage').textContent=e.message;}};
  selector.onchange=()=>{
    if(admin){
      ++checkVersion;lock(true);selector.disabled=true;
      const destination=selector.value==='02'?'/play02/admin.html':'/admin.html';
      location.assign(root()+'/admin.html');return;
    }
    server=selector.value;$('boxMessage').textContent='';view(null);check();
  };
  check();
})();
