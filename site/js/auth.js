'use strict';
(() => {
  const keys = ['jxidle', 'jxidle_2', 'jxidle_3'];
  const legacyKeys = ['jxxanh', 'jxxanh_2', 'jxxanh_3'];
  const shared = ['jxidle_stash', 'jxidle_clan'];
  const legacyShared = ['jxxanh_stash', 'jxxanh_clan'];
  const pointer = 'jxidle_slot';
  const legacyPointer = 'jxxanh_slot';

  let user = null, revision = 0, ready = false, pending = null, closing = false, loggingOut = false, resolveReady;
  window.jxAuthReady = new Promise(resolve => resolveReady = resolve);

  const SAVE_SALT = 'jx-idle-v1:';
  function sigOf(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    const s = SAVE_SALT + str;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  function pack(state) {
    if (state && (Object.prototype.hasOwnProperty.call(state, '_attrPotentialChanged') || Object.prototype.hasOwnProperty.call(state, '_itemLuckChanged'))) {
      state = Object.assign({}, state);
      delete state._attrPotentialChanged;
      delete state._itemLuckChanged;
    }
    const body = JSON.stringify(state);
    return JSON.stringify({ d: body, h: sigOf(body) });
  }

  function unpack(txt) {
    try {
      const o = JSON.parse(txt);
      if (o && typeof o.d === 'string' && typeof o.h === 'string') {
        return { state: JSON.parse(o.d), ok: sigOf(o.d) === o.h };
      }
      return { state: o, ok: true, legacy: true };
    } catch {
      return { state: null, ok: false };
    }
  }

  window.jxPack = pack;
  window.jxUnpack = unpack;

  const request = async (url, opt = {}) => {
    if (window.jxMountReady) await window.jxMountReady;
    const r = await fetch(url, { ...opt, headers: { 'content-type': 'application/json', ...opt.headers } });
    const j = await r.json();
    if (!r.ok) {
      const e = Error(j.error || 'Lỗi kết nối');
      e.status = r.status;
      throw e;
    }
    return j;
  };

  function restore(game) {
    keys.forEach((k, i) => {
      localStorage.removeItem(k + '_bak');
      localStorage.removeItem(k + '_kps');
      if (game.slots?.[i]) localStorage.setItem(k, pack(game.slots[i]));
      else localStorage.removeItem(k);
    });
    legacyKeys.forEach((k, i) => {
      localStorage.removeItem(k + '_bak');
      localStorage.removeItem(k + '_kps');
      if (game.slots?.[i]) localStorage.setItem(k, pack(game.slots[i]));
      else localStorage.removeItem(k);
    });
    const actSlot = String(game.activeSlot || '0');
    localStorage.setItem(pointer, actSlot);
    localStorage.setItem(legacyPointer, actSlot);

    shared.forEach((k, i) => {
      localStorage.removeItem(k + '_bak');
      const lk = legacyShared[i];
      localStorage.removeItem(lk + '_bak');
      const s = game.shared?.[k] || game.shared?.[lk];
      if (s) {
        localStorage.setItem(k, pack(s));
        localStorage.setItem(lk, pack(s));
      } else {
        localStorage.removeItem(k);
        localStorage.removeItem(lk);
      }
    });
  }

  function snapshot() {
    const decode = (k, alt) => {
      try {
        let x = localStorage.getItem(k);
        if (!x && alt) x = localStorage.getItem(alt);
        return x ? unpack(x).state : null;
      } catch {
        return null;
      }
    };
    const actSlot = localStorage.getItem(pointer) || localStorage.getItem(legacyPointer) || '0';
    return {
      slots: keys.map((k, i) => decode(k, legacyKeys[i])),
      activeSlot: actSlot,
      shared: {
        jxidle_stash: decode('jxidle_stash', 'jxxanh_stash'),
        jxidle_clan: decode('jxidle_clan', 'jxxanh_clan'),
        jxxanh_stash: decode('jxidle_stash', 'jxxanh_stash'),
        jxxanh_clan: decode('jxidle_clan', 'jxxanh_clan')
      }
    };
  }

  async function enter(u) {
    const state = await request('/api/game/state');
    restore(state.game);
    user = u;
    window.jxUser = u;
    if (window.NET) window.NET.user = u;
    revision = state.revision;
    ready = true;
    document.querySelector('#authGate')?.remove();
    resolveReady(u);
  }

  function gate() {
    if (document.querySelector('#authGate')) return;
    const el = document.createElement('div');
    el.id = 'authGate';
    el.innerHTML = '<section><h1>Võ Lâm Idle</h1><p>Server 01 · Lưu nhân vật theo tài khoản</p><form id="authForm"><input id="au" placeholder="Tài khoản" autocomplete="username" minlength="3" maxlength="24" required><input id="ap" type="password" placeholder="Mật khẩu (tối thiểu 6 ký tự)" autocomplete="current-password" minlength="6" required><button id="login" type="submit">Đăng nhập</button><button id="register" type="button" class="alt">Đăng ký tài khoản mới</button></form><small id="am"></small><a href="/">← Trang chủ</a></section>';
    document.body.append(el);
    let busy = false;
    const submit = async (register) => {
      if (busy) return;
      if (!el.querySelector('form').reportValidity()) return;
      busy = true;
      el.querySelectorAll('button').forEach(b => b.disabled = true);
      el.querySelector('#am').textContent = 'Đang kết nối…';
      try {
        const r = await request(register ? '/api/auth/register' : '/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            username: el.querySelector('#au').value,
            password: el.querySelector('#ap').value
          })
        });
        await enter(r.user);
      } catch (e) {
        el.querySelector('#am').textContent = e.message;
      } finally {
        busy = false;
        el.querySelectorAll('button').forEach(b => b.disabled = false);
      }
    };
    el.querySelector('form').onsubmit = e => { e.preventDefault(); submit(false); };
    el.querySelector('#register').onclick = () => submit(true);
  }

  const start = async () => {
    try {
      const r = await request('/api/auth/me');
      await enter(r.user);
    } catch {
      gate();
      const p = document.querySelector('#authGate p');
      if (p) p.textContent = (window.jxServerLabel || 'Server 01') + ' · Lưu nhân vật theo tài khoản';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  async function sync(keepalive = false) {
    if (!ready || closing) return;
    if (pending) {
      await pending;
      if (!keepalive) return sync(false);
      return;
    }
    pending = (async () => {
      const snap = snapshot();
      const r = await request('/api/game/state', {
        method: 'PUT',
        body: JSON.stringify({ game: snap, revision }),
        keepalive
      });
      revision = r.revision;
    })();
    try {
      await pending;
    } catch (e) {
      if (e.status === 409 || e.status === 401) {
        ready = false;
        window.SAVE_LOCK = true;
        if (!loggingOut) {
          if (typeof toast === 'function') toast(e.status === 409 ? 'Dữ liệu đã đổi ở thiết bị khác. Đang tải lại…' : 'Phiên đăng nhập hết hạn');
          setTimeout(() => location.reload(), 500);
        }
      }
      throw e;
    } finally {
      pending = null;
    }
  }

  window.jxSync = sync;
  window.jxReload = async () => {
    try {
      await sync();
      ready = false;
      window.SAVE_LOCK = true;
      location.reload();
    } catch (e) {
      alert('Chưa lưu được, hãy thử lại: ' + e.message);
    }
  };

  window.doLogout = function(btn) {
    if (loggingOut) return;
    loggingOut = true;
    if (btn) {
      try {
        btn.disabled = true;
        btn.textContent = 'Đang đăng xuất…';
        btn.style.opacity = '0.7';
      } catch (e) {}
    }
    window.jxLogout();
  };

  window.jxLogout = async () => {
    loggingOut = true;
    try {
      try { await Promise.race([sync(), new Promise(r => setTimeout(r, 1000))]); } catch (e) { if (![409, 401].includes(e.status)) console.warn(e); }
      closing = true;
      await Promise.race([request('/api/auth/logout', { method: 'POST' }), new Promise(r => setTimeout(r, 1500))]);
      ready = false;
      window.SAVE_LOCK = true;
      keys.concat(legacyKeys, shared, legacyShared).forEach(k => {
        localStorage.removeItem(k);
        localStorage.removeItem(k + '_bak');
        localStorage.removeItem(k + '_kps');
      });
      localStorage.removeItem(pointer);
      localStorage.removeItem(legacyPointer);
      location.reload();
    } catch (e) {
      closing = false;
      loggingOut = false;
      location.reload();
    } finally {
      loggingOut = false;
    }
  };

  window.jxServerAction = async (url, data) => {
    const actSlot = localStorage.getItem(pointer) || localStorage.getItem(legacyPointer) || '0';
    try {
      await sync();
      closing = true;
      window.SAVE_LOCK = true;
      await request(url, {
        method: 'POST',
        body: JSON.stringify({ ...data, slot: Number(actSlot), revision, requestId: crypto.randomUUID() })
      });
      ready = false;
      location.reload();
    } catch (e) {
      closing = false;
      window.SAVE_LOCK = false;
      throw e;
    }
  };

  // Periodic autosave to backend
  setInterval(() => {
    if (ready) sync().catch(() => {});
  }, 5000);

  window.addEventListener('pagehide', () => {
    if (ready && !closing) sync(true).catch(() => {});
  });

  // Account modal dialog
  function openAccountModal() {
    const modalEl = document.querySelector('#modal');
    const bodyEl = document.querySelector('#mBody');
    if (!modalEl || !bodyEl) return;
    bodyEl.innerHTML = `
      <div style="padding:16px;text-align:center;">
        <h3 style="margin-bottom:12px;font-size:18px;color:#facc15;">Thông Tin Tài Khoản</h3>
        <p style="margin:8px 0;font-size:15px;color:#e2e8f0;">Tài khoản: <b style="color:#38bdf8;">${user?.username || 'Hiệp khách'}</b></p>
        <p style="margin:8px 0;font-size:14px;color:#94a3b8;">Máy chủ: <b>Võ Lâm H5 · Server 01</b></p>
        <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;">
          <button id="authLogoutBtn" class="btn red" style="padding:8px 20px;background:#dc2626;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Đăng xuất</button>
          <button id="authCloseBtn" class="btn" style="padding:8px 20px;background:#334155;color:#fff;border:none;border-radius:6px;cursor:pointer;">Đóng</button>
        </div>
      </div>
    `;
    modalEl.classList.remove('hidden');
    document.querySelector('#authLogoutBtn')?.addEventListener('click', () => window.jxLogout());
    document.querySelector('#authCloseBtn')?.addEventListener('click', () => modalEl.classList.add('hidden'));
  }
  window.openAccountModal = openAccountModal;

  document.addEventListener('click', e => {
    if (e.target.closest('#heroAvatar, .hero-mark, .hero-identity, #heroName')) {
      openAccountModal();
    }
    // Zalo group button in chat
    const zaloBtn = e.target.closest('.wc-zalo');
    if (zaloBtn) {
      e.stopImmediatePropagation();
      e.preventDefault();
      window.open('https://zalo.me/g/spnv6daqu8lvtilahypo', '_blank', 'noopener');
    }
    // Treo máy tab button
    const afkTab = e.target.closest('#tabs button[data-t="more"], #tabAfkBtn');
    if (afkTab) {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (typeof window.setAfkMode === 'function') {
        window.setAfkMode(true);
      } else if (typeof window.jxAfk === 'function') {
        window.jxAfk(true);
      }
    }
  }, true);

})();
