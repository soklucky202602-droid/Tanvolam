// ============================================================================
// CHAT SPEECH BUBBLE (BONG BÓNG CHAT TRÊN ĐẦU NHÂN VẬT)
// ============================================================================
(function() {
  'use strict';

  // Hàm chia dòng thông minh cho tiếng Việt và tiếng Anh
  function wrapChatText(ctx, text, maxW) {
    if (!text) return [];
    const words = String(text).trim().split(/\s+/);
    const lines = [];
    let curLine = '';
    for (const w of words) {
      const testLine = curLine ? (curLine + ' ' + w) : w;
      if (ctx.measureText(testLine).width <= maxW) {
        curLine = testLine;
      } else {
        if (curLine) lines.push(curLine);
        // Nếu một từ quá dài, cắt nhỏ
        if (ctx.measureText(w).width > maxW) {
          let part = '';
          for (const char of w) {
            if (ctx.measureText(part + char).width <= maxW) {
              part += char;
            } else {
              lines.push(part);
              part = char;
            }
          }
          curLine = part;
        } else {
          curLine = w;
        }
      }
    }
    if (curLine) lines.push(curLine);
    if (lines.length > 4) {
      lines.length = 4;
      lines[3] = lines[3].slice(0, -1) + '…';
    }
    return lines;
  }

  // Vẽ bong bóng chat cổ phong trên Canvas
  function drawSpeechBubble(ctx, x, topY, text, borderColor = '#ffd24a', alpha = 1) {
    if (!ctx || !text) return;
    const cleanText = String(text).trim();
    if (!cleanText) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // Phông chữ rõ ràng, sắc nét
    ctx.font = 'bold 12px "Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxTextW = 200;
    const lines = wrapChatText(ctx, cleanText, maxTextW);
    if (!lines.length) {
      ctx.restore();
      return;
    }

    const lineH = 17;
    let maxW = 32;
    for (const l of lines) {
      const w = ctx.measureText(l).width;
      if (w > maxW) maxW = w;
    }

    const padX = 12, padY = 7;
    const bw = Math.min(maxW + padX * 2, maxTextW + padX * 2);
    const bh = lines.length * lineH + padY * 2;
    const bx = Math.round(x - bw / 2);
    const by = Math.round(topY - bh - 8);

    // 1. Vẽ nền bong bóng (màu đen cánh gián viền hoàng kim đậm chất Võ Lâm)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = 'rgba(16, 12, 10, 0.93)';
    ctx.strokeStyle = borderColor || '#ffd24a';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(bx, by, bw, bh, 6);
    } else {
      ctx.rect(bx, by, bw, bh);
    }
    ctx.fill();
    ctx.stroke();

    // 2. Mũi tên chỉ xuống đỉnh đầu
    ctx.beginPath();
    ctx.moveTo(x - 6, by + bh);
    ctx.lineTo(x, by + bh + 6);
    ctx.lineTo(x + 6, by + bh);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - 6, by + bh);
    ctx.lineTo(x, by + bh + 6);
    ctx.lineTo(x + 6, by + bh);
    ctx.stroke();

    // Nối liền đáy mũi tên với thân khung
    ctx.fillStyle = 'rgba(16, 12, 10, 0.95)';
    ctx.fillRect(x - 5, by + bh - 1.5, 10, 3);

    // 3. Chữ nội dung chat với bóng đổ đọc rõ trên mọi bản đồ
    ctx.fillStyle = '#fffef0';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    const startY = by + padY + lineH / 2;
    lines.forEach((l, idx) => {
      ctx.fillText(l, x, startY + idx * lineH);
    });

    ctx.restore();
  }

  // Gán nội dung chat cho Hero hiện tại
  function setHeroChat(text) {
    if (!text) return;
    const clean = String(text).replace(/^\/w\s+\S+\s*/i, '').trim();
    if (!clean) return;

    const hero = (typeof window.getM === 'function' ? window.getM() : null) || window.M || window.H || null;
    if (hero) {
      hero.chatText = clean;
      hero.chatT = 6.0; // Hiển thị 6 giây
    }
  }

  // Kích hoạt bong bóng cho nhân vật tương ứng theo tên
  function triggerSpeechBubble(name, text) {
    if (!text) return;
    const cleanMsg = String(text).trim();
    if (!cleanMsg) return;

    const cleanName = String(name || '').trim();
    const curPlayer = (typeof window.getP === 'function' ? window.getP() : null) || window.P || window.S || null;
    const curHero = (typeof window.getM === 'function' ? window.getM() : null) || window.M || window.H || null;

    // 1. Kiểm tra nếu là bản thân người chơi
    const myName = (curPlayer && curPlayer.name) ? String(curPlayer.name).trim() : '';
    if (!cleanName || cleanName === 'Tôi' || (myName && cleanName === myName)) {
      if (curHero) {
        curHero.chatText = cleanMsg;
        curHero.chatT = 6.0;
      }
      return;
    }

    // 2. Kiểm tra nếu là Simbot
    if (window.SIMBOTS && Array.isArray(window.SIMBOTS.list)) {
      const bot = window.SIMBOTS.list.find(b => b.name === cleanName);
      if (bot) {
        bot.chatText = cleanMsg;
        bot.chatT = 6.0;
        return;
      }
    }

    // 3. Kiểm tra nếu là Người chơi thật khác (Online Presence)
    if (typeof window.getOnlineEntities === 'function') {
      const onlineList = window.getOnlineEntities();
      if (Array.isArray(onlineList)) {
        const peer = onlineList.find(p => p.name === cleanName);
        if (peer) {
          peer.chatText = cleanMsg;
          peer.chatT = 6.0;
          return;
        }
      }
    }
  }

  window.drawSpeechBubble = drawSpeechBubble;
  window.setHeroChat = setHeroChat;
  window.triggerSpeechBubble = triggerSpeechBubble;
})();
