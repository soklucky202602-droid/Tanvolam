/* ============================================================================
   ONLINE PRESENCE & TRAIN CHUNG (REALTIME MULTIPLAYER SYNC)
   - Tự động đồng bộ vị trí, hướng, động tác (đứng, chạy, đánh chiêu) của người chơi thật
   - Thấy nhau di chuyển và tương tác cả ở trong Thành (Biện Kinh) và ngoài Bản Đồ Luyện Công
   - Hỗ trợ đánh quái chung: khi người chơi khác tung chiêu, quái xung quanh bị trừ máu,
     bật hiệu ứng chiêu thức (skillFx) và hiện chữ sát thương đồng đội
   - Nhãn nhận diện: Tên xanh ngọc và thanh máu thời gian thực (không vương miện)
   ============================================================================ */
(function() {
  'use strict';

  // Khởi tạo ClientId DUY NHẤT TRONG BỘ NHỚ RAM cho mỗi trang/tab/cửa sổ
  // (Tuyệt đối KHÔNG lưu sessionStorage/localStorage để tránh bị clone giữa các tab trong cùng trình duyệt)
  try {
    sessionStorage.removeItem('jx_client_id');
  } catch (e) {}

  const clientId = 'tab_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1000000);

  const peers = new Map();
  let lastSyncTime = 0;
  let isSyncing = false;

  // Bảng chiêu thức đại diện theo môn phái
  const PEER_SKILLS = {
    shaolin:  { low: 10, mid: 11, high: 321 },
    tianwang: { low: 30, mid: 41, high: 323 },
    tangmen:  { low: 45, mid: 54, high: 302 },
    wudu:     { low: 63, mid: 64, high: 355 },
    emei:     { low: 80, mid: 88, high: 380 },
    cuiyan:   { low: 95, mid: 104, high: 388 },
    gaibang:  { low: 111, mid: 115, high: 357 },
    tianren:  { low: 125, mid: 128, high: 362 },
    wudang:   { low: 153, mid: 158, high: 368 },
    kunlun:   { low: 169, mid: 172, high: 375 }
  };

  function getPeerSkillId(fac, level) {
    const s = PEER_SKILLS[fac] || PEER_SKILLS.shaolin;
    if (level >= 80) return s.high;
    if (level >= 30) return s.mid;
    return s.low;
  }

  // Lấy dữ liệu người chơi hiện tại (ưu tiên closure function)
  function getLocalPlayer() {
    return (typeof window.getP === 'function' ? window.getP() : null) || window.P || null;
  }
  function getLocalHero() {
    return (typeof window.getM === 'function' ? window.getM() : null) || window.M || null;
  }
  function getLocalArena() {
    return (typeof window.getA === 'function' ? window.getA() : null) || window.A || null;
  }

  // Nhận diện trạng thái Trong Thành (Biện Kinh) chuẩn xác 100%
  function isTownActive() {
    const a = getLocalArena();
    if (a && a.town) return true;
    if (typeof window !== 'undefined' && window.A && window.A.town) return true;
    if (typeof document !== 'undefined') {
      const tb = document.getElementById('townBar');
      if (tb && !tb.classList.contains('hidden') && tb.style.display !== 'none') return true;
    }
    return false;
  }

  // Gửi tọa độ lên máy chủ định kỳ (4 - 5 lần / giây)
  async function syncPresence() {
    if (isSyncing) return;
    const p = getLocalPlayer();
    const m = getLocalHero();
    const a = getLocalArena();
    if (!p || !m) return;

    isSyncing = true;
    try {
      const inTown = isTownActive();
      const zoneId = inTown ? 0 : ((a && a.field && a.field.key) ? a.field.key : (p.stage || 1));
      const payload = {
        clientId,
        name: p.name || 'Đại hiệp',
        fac: p.fac || 'shaolin',
        sex: p.sex || 0,
        lvl: p.lvl || 1,
        hp: p.hp || 100,
        maxHp: p.maxHp || 100,
        x: Math.round(m.x || 0),
        y: Math.round(m.y || 0),
        dir: m.dir || 0,
        act: m.act || (m.moving ? 'run' : 'st'),
        moving: !!m.moving,
        isTown: inTown,
        zoneId,
        ride: !!(p && p.riding)
      };

      const res = await fetch('/api/world/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (typeof data.simbotEnabled === 'boolean') {
            window.SIMBOT_ENABLED = data.simbotEnabled;
            if (window.SIMBOTS) window.SIMBOTS.enabled = data.simbotEnabled;
            if (data.simbotEnabled === false) {
              window.NO_SIMBOT = true;
              if (window.SIMBOTS && Array.isArray(window.SIMBOTS.list)) {
                window.SIMBOTS.list = [];
              }
            } else {
              window.NO_SIMBOT = false;
            }
          }
          if (Array.isArray(data.peers)) {
            const receivedIds = new Set();
            const now = performance.now();

            for (const raw of data.peers) {
              receivedIds.add(raw.clientId);
              let peer = peers.get(raw.clientId);
              if (!peer) {
                peer = {
                  id: raw.clientId,
                  name: raw.name || 'Đại hiệp',
                  fac: raw.fac || 'shaolin',
                  sex: raw.sex || 0,
                  level: raw.lvl || 1,
                  hp: raw.hp,
                  maxHp: raw.maxHp,
                  x: raw.x,
                  y: raw.y,
                  tx: raw.x,
                  ty: raw.y,
                  dir: raw.dir || 0,
                  act: raw.act || 'st',
                  moving: !!raw.moving,
                  isRealPlayer: true,
                  animT: 0,
                  actT: 0,
                  ride: !!raw.ride,
                  lastSeen: now,
                  lastAtkTime: 0
                };
                peers.set(raw.clientId, peer);
              } else {
                peer.name = raw.name || peer.name;
                peer.fac = raw.fac || peer.fac;
                peer.sex = raw.sex || peer.sex;
                peer.level = raw.lvl || peer.level;
                peer.hp = raw.hp;
                peer.maxHp = raw.maxHp;
                peer.tx = raw.x;
                peer.ty = raw.y;
                peer.dir = raw.dir;
                peer.act = raw.act;
                peer.moving = !!raw.moving;
                peer.ride = !!raw.ride;
                peer.lastSeen = now;
              }
            }

            // Xóa các peer không còn phản hồi (> 3.5s)
            for (const [id, peer] of peers.entries()) {
              if (!receivedIds.has(id) || now - peer.lastSeen > 3500) {
                peers.delete(id);
              }
            }
          }
        }
      }
    } catch (err) {
      // Bỏ qua lỗi mạng chớp nhoáng
    } finally {
      isSyncing = false;
    }
  }

  // Vòng lặp cập nhật chuyển động mượt mà và hỗ trợ đánh quái
  let lastTickTime = performance.now();
  function tickOnlinePeers() {
    if (peers.size === 0) return;
    const now = performance.now();
    if (now - lastTickTime < 16) return;
    const dt = Math.min(0.1, (now - lastTickTime) / 1000);
    lastTickTime = now;

    const a = getLocalArena();
    const enemies = (a && Array.isArray(a.enemies)) ? a.enemies : [];

    for (const [id, peer] of peers.entries()) {
      // Nội suy tọa độ di chuyển
      const dx = peer.tx - peer.x;
      const dy = peer.ty - peer.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 300) {
        // Dịch chuyển tức thời nếu khoảng cách quá lớn (ví dụ chuyển map / về thành)
        peer.x = peer.tx;
        peer.y = peer.ty;
      } else if (dist > 1) {
        peer.x += dx * Math.min(1, dt * 10);
        peer.y += dy * Math.min(1, dt * 10);
      }

      peer.animT = (peer.animT || 0) + dt;

      // Hỗ trợ đánh quái chung khi người chơi khác đang tung chiêu (chỉ ở ngoài bãi quái)
      if (peer.act === 'at' && enemies.length > 0 && now - (peer.lastAtkTime || 0) > 600) {
        peer.lastAtkTime = now;
        let nearest = null;
        let minDist = 190;
        for (const e of enemies) {
          if (e && !e.dead && e.hp > 0) {
            const d = Math.hypot(e.x - peer.x, e.y - peer.y);
            if (d < minDist) {
              minDist = d;
              nearest = e;
            }
          }
        }

        if (nearest) {
          const dmg = Math.max(50, Math.floor(peer.level * 28 + Math.random() * 20));
          nearest.hp -= dmg;
          nearest.hitT = 0.14;

          if (typeof window.skillFx === 'function') {
            const skId = getPeerSkillId(peer.fac, peer.level);
            try { window.skillFx(peer, nearest, { id: skId, rate: 1 }); } catch (err) {}
          }
          if (typeof window.Ef === 'function') {
            try { window.Ef('hit'); } catch (err) {}
          }
          if (typeof window.addText === 'function') {
            try {
              window.addText(nearest.x + (Math.random() * 20 - 10), nearest.y - 30, `-${dmg}`, '#4ade80', 13);
            } catch (err) {}
          }
          if (typeof window.U === 'function' && Math.random() < 0.25) {
            window.U(`<span style="color:#4ade80">[Đồng đội ${peer.name}]</span> hợp lực đánh trúng quái -${dmg} sát thương!`);
          }
        }
      }
    }
  }

  // Trả về danh sách thực thể để game engine vẽ (Y-sorting)
  function getOnlineEntities() {
    tickOnlinePeers();
    const list = [];
    for (const [id, peer] of peers.entries()) {
      list.push({ simbot: peer, y: peer.y });
    }
    return list;
  }

  // Hook vào simbotEnts của game engine
  const origSimbotEnts = window.simbotEnts;
  window.simbotEnts = function() {
    const onlineEnts = getOnlineEntities();
    // Khi Simbot tắt (window.NO_SIMBOT hoặc window.SIMBOT_ENABLED === false):
    if (window.NO_SIMBOT === true || window.SIMBOT_ENABLED === false || (window.SIMBOTS && window.SIMBOTS.enabled === false)) {
      if (window.SIMBOTS && Array.isArray(window.SIMBOTS.list) && window.SIMBOTS.list.length > 0) {
        window.SIMBOTS.list = [];
      }
      return onlineEnts;
    }
    const list = (typeof origSimbotEnts === 'function') ? origSimbotEnts() : [];
    return list.concat(onlineEnts);
  };

  // Hook vào simbotDraw để vẽ người chơi thật với ngoại hình và tên nổi bật
  const origSimbotDraw = window.simbotDraw;
  window.simbotDraw = function(ctx, bot, dt) {
    if (!ctx || !bot) return;

    if (!bot.isRealPlayer) {
      if (window.NO_SIMBOT === true || window.SIMBOT_ENABLED === false || (window.SIMBOTS && window.SIMBOTS.enabled === false)) {
        return; // TUYỆT ĐỐI KHÔNG VẼ BOT KHI ĐÃ TẮT!
      }
      if (typeof origSimbotDraw === 'function') origSimbotDraw(ctx, bot, dt);
      return;
    }

    // Vẽ người chơi thật:
    ctx.save();

    // 1. Bóng dưới chân
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(bot.x, bot.y, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Sprite hoạt ảnh nhân vật
    const wHero = (typeof window !== 'undefined' && window.JW && window.JW.hero) ? window.JW.hero : null;
    const g = (wHero && wHero[bot.fac]) || (wHero && (wHero.shaolin || Object.values(wHero)[0]));
    const curAct = (bot.act === 'at') ? 'at' : (bot.moving ? 'run' : 'st');
    const heroScale = (typeof window !== 'undefined' && window.HERO_SCALE) ? window.HERO_SCALE : 1.35;
    const drawAnimFn = (typeof window !== 'undefined' && typeof window.drawAnim === 'function') ? window.drawAnim : null;

    let height = 0;
    if (g && g.anim && drawAnimFn) {
      try {
        height = drawAnimFn(g.anim, curAct, bot.dir || 0, bot.animT || 0, bot.x, bot.y, heroScale);
      } catch (e) {
        height = 0;
      }
    }

    const drawSpriteFn = (typeof window !== 'undefined' && typeof window.drawSprite === 'function') ? window.drawSprite : null;
    const imgFn = (typeof window !== 'undefined' && typeof window.img === 'function') ? window.img : null;
    if (!height && g && drawSpriteFn && imgFn) {
      try {
        drawSpriteFn(imgFn(g.img), g.sz, bot.x, bot.y, heroScale, false);
        height = 55;
      } catch (e) {
        height = 0;
      }
    }

    if (!height) {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(bot.x, bot.y - 22, 15, 0, Math.PI * 2);
      ctx.fill();
      height = 55;
    }

    // 3. Hiển thị nhãn người chơi thật: Tên xanh ngọc + Cấp (ĐÃ BỎ HOÀN TOÀN VƯƠNG MIỆN)
    const topY = bot.y - (height ? Math.min(height, 90) * 0.95 : 55) - 6;

    const labelFn = (typeof window !== 'undefined' && typeof window.label === 'function') ? window.label : null;
    if (labelFn) {
      labelFn(
        bot.x,
        topY,
        `${bot.name} · Cấp ${bot.level}`,
        '#4ade80',
        12,
        Math.max(0, Math.min(1, (bot.hp || 1) / (bot.maxHp || 1))),
        '#22c55e',
        '',
        ''
      );
    } else {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      // Tên người chơi và Cấp độ
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#4ade80'; // Xanh ngọc nổi bật
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(`${bot.name} · Cấp ${bot.level}`, bot.x, topY);

      // Thanh máu
      const barW = 38;
      const barH = 3.5;
      const barX = bot.x - barW / 2;
      const barY = topY + 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      const hpRatio = Math.max(0, Math.min(1, (bot.hp || 1) / (bot.maxHp || 1)));
      ctx.fillStyle = hpRatio > 0.3 ? '#22c55e' : '#ef4444';
      ctx.fillRect(barX, barY, barW * hpRatio, barH);
    }

    // 4. Bong bóng chat trên đầu người chơi khác
    if ((bot.chatT || 0) > 0 && bot.chatText) {
      bot.chatT -= dt;
      if (bot.chatT <= 0) {
        bot.chatText = '';
      } else {
        const bubbleTopY = topY - 24;
        const alpha = Math.min(1, Math.max(0, bot.chatT / 0.5));
        if (typeof window.drawSpeechBubble === 'function') {
          window.drawSpeechBubble(ctx, bot.x, bubbleTopY, bot.chatText, '#38bdf8', alpha);
        }
      }
    }

    ctx.restore();
  };

  // Kiểm tra trạng thái Simbot trực tiếp từ máy chủ
  async function checkSimbotStatus() {
    try {
      const res = await fetch('/api/public/simbot-status', { cache: 'no-store' });
      if (res.ok) {
        const d = await res.json();
        if (typeof d.enabled === 'boolean') {
          window.SIMBOT_ENABLED = d.enabled;
          if (window.SIMBOTS) window.SIMBOTS.enabled = d.enabled;
          if (!d.enabled) {
            window.NO_SIMBOT = true;
            if (window.SIMBOTS && Array.isArray(window.SIMBOTS.list)) {
              window.SIMBOTS.list = [];
            }
          } else {
            window.NO_SIMBOT = false;
          }
        }
      }
    } catch (e) {}
  }
  checkSimbotStatus();
  setInterval(checkSimbotStatus, 1500);

  // Khởi động vòng lặp đồng bộ vị trí
  setInterval(syncPresence, 220);

  // Xuất API toàn cục để kiểm tra
  window.ONLINE_PRESENCE = {
    clientId,
    getPeers: () => Array.from(peers.values()),
    getEntities: getOnlineEntities,
    syncNow: syncPresence,
    isTown: isTownActive
  };

  console.log('[Online Presence] Đã kích hoạt hệ thống đồng bộ vị trí realtime (ID tab:', clientId, ')');
})();
