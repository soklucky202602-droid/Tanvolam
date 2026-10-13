/* ============================================================================
   KỲ TRÂN CÁC - VÕ LÂM TRUYỀN KỲ
   - Đổi Kim Nguyên Bảo <-> Ngân Lượng
   - Mua và sử dụng Kỳ Trân Phẩm (Tiên Thảo Lộ, Quế Hoa Tửu, Rương Ngựa,
     Dịch Căn Kinh, Tẩy Tủy Kinh, Võ Lâm Mật Tịch 90, Rương Huyền Tinh, Rương Đá)
   - Lưu trữ và đồng bộ với hệ thống nhân vật
   ============================================================================ */
'use strict';

(function () {
  const KTC_ITEMS = [
    {
      k: 'tt',
      n: 'Tiên Thảo Lộ',
      ic: 'img/ep/tt.png',
      knb: 20,
      d: '+50% kinh nghiệm chiến đấu trong 60 phút. Dùng thêm sẽ cộng dồn thời gian.'
    },
    {
      k: 'qht',
      n: 'Quế Hoa Tửu',
      ic: 'img/ep/qht.png',
      knb: 20,
      d: '+20 may mắn trong 60 phút, tăng phẩm chất đồ rơi. Dùng thêm sẽ cộng dồn thời gian.'
    },
    {
      k: 'rngua',
      n: 'Rương Ngựa',
      ic: 'img/ep/box2.png',
      knb: 20,
      d: 'Mở nhận một con ngựa (Thường, Tốt, Quý, Thần, Danh mã, Bảo mã, Chí tôn).'
    },
    {
      k: 'vlmt',
      n: 'Dịch Căn Kinh',
      ic: 'img/ep/mt90.webp',
      knb: 100,
      d: 'Từ cấp 80 hoặc đã trùng sinh: +1 điểm kỹ năng. Mỗi nhân vật dùng tối đa 15 cuốn.'
    },
    {
      k: 'ttk',
      n: 'Tẩy Tủy Kinh',
      ic: 'img/ep/dtbk.png',
      knb: 100,
      d: 'Từ cấp 80: +5 điểm tiềm năng. Tối đa 15 cuốn mỗi nhân vật; điểm được giữ qua chuyển sinh.'
    },
    {
      k: 'bk90',
      n: 'Võ Lâm Mật Tịch 90',
      ic: 'img/ep/mt90.webp',
      knb: 50,
      d: 'Lĩnh ngộ bí kíp võ công cấp 90 của môn phái, hoặc bù tiến độ cho chiêu đã học.'
    },
    {
      k: 'rht',
      n: 'Rương Huyền Tinh',
      ic: 'img/ep/box2.png',
      gold: 30000,
      d: 'Mở nhận 2–3 viên Huyền Tinh Khoáng Thạch theo cấp nhân vật.'
    },
    {
      k: 'rda',
      n: 'Rương Đá Thuộc Tính',
      ic: 'img/ep/box3.png',
      gold: 50000,
      d: 'Mở nhận đá thuộc tính khảm nạm trang bị theo ngũ hành.'
    }
  ];

  function getPlayer() {
    if (typeof window.getP === 'function') return window.getP();
    return window.P || null;
  }

  function formatNum(n) {
    return Number(n || 0).toLocaleString('vi-VN');
  }

  function getStackItemCount(p, key) {
    if (!p) return 0;
    if (p.stackItems && typeof p.stackItems[key] === 'number') return p.stackItems[key];
    if (p.mats && p.mats.misc && typeof p.mats.misc[key] === 'number') return p.mats.misc[key];
    return 0;
  }

  function addStackItem(p, key, qty = 1) {
    p.stackItems = p.stackItems || {};
    p.stackItems[key] = (Number(p.stackItems[key]) || 0) + qty;
  }

  function consumeStackItem(p, key, qty = 1) {
    if (p.stackItems && p.stackItems[key] >= qty) {
      p.stackItems[key] -= qty;
      if (p.stackItems[key] <= 0) delete p.stackItems[key];
      return true;
    }
    if (p.mats && p.mats.misc && p.mats.misc[key] >= qty) {
      p.mats.misc[key] -= qty;
      if (p.mats.misc[key] <= 0) delete p.mats.misc[key];
      return true;
    }
    return false;
  }

  function notify(msg) {
    if (typeof window.toast === 'function') window.toast(msg);
    else if (typeof window.W === 'function') window.W(msg);
  }

  function logMsg(msg) {
    if (typeof window.gameLog === 'function') window.gameLog(msg);
    else if (typeof window.U === 'function') window.U(msg);
  }

  function syncGame() {
    if (typeof window.updateHud === 'function') window.updateHud();
    if (typeof window.updatePanel === 'function') window.updatePanel();
    if (window.A) window.A.dirty = true;
    if (typeof window.saveGameState === 'function') {
      try { window.saveGameState(); } catch (e) {}
    }
  }

  // 1. Đổi Vàng -> KNB
  function buyKnb() {
    const p = getPlayer();
    if (!p) return;
    const cost = 100000;
    if ((Number(p.gold) || 0) < cost) {
      notify('Không đủ 100.000 lượng để đổi 1 KNB');
      return;
    }
    p.gold = Math.floor(Number(p.gold)) - cost;
    p.knb = Math.floor(Number(p.knb) || 0) + 1;
    notify('Đổi thành công 1 Kim Nguyên Bảo!');
    logMsg('🏮 Kỳ Trân Các: đổi 100.000 lượng lấy <b style="color:#ffd24a">1 Kim Nguyên Bảo</b>.');
    syncGame();
    renderKtcModal();
  }

  // 2. Đổi KNB -> Vàng
  function sellKnb() {
    const p = getPlayer();
    if (!p) return;
    if ((Number(p.knb) || 0) < 1) {
      notify('Bạn không có Kim Nguyên Bảo để đổi');
      return;
    }
    p.knb = Math.floor(Number(p.knb)) - 1;
    p.gold = Math.floor(Number(p.gold) || 0) + 80000;
    notify('Đổi thành công 1 KNB lấy 80.000 lượng!');
    logMsg('🏮 Kỳ Trân Các: đổi 1 KNB nhận <b style="color:#ffd24a">80.000 lượng</b>.');
    syncGame();
    renderKtcModal();
  }

  // 3. Mua vật phẩm Kỳ Trân Các
  function buyItem(key) {
    const p = getPlayer();
    if (!p) return;
    const item = KTC_ITEMS.find(it => it.k === key);
    if (!item) return;

    if (item.knb) {
      if ((Number(p.knb) || 0) < item.knb) {
        notify('Không đủ ' + item.knb + ' Kim Nguyên Bảo');
        return;
      }
      p.knb = Math.floor(Number(p.knb)) - item.knb;
    } else if (item.gold) {
      if ((Number(p.gold) || 0) < item.gold) {
        notify('Không đủ ' + formatNum(item.gold) + ' lượng');
        return;
      }
      p.gold = Math.floor(Number(p.gold)) - item.gold;
    }

    addStackItem(p, key, 1);
    notify('Mua thành công 1 ' + item.n + '!');
    logMsg('🏮 Kỳ Trân Các: nhận 1 <b style="color:#ffd24a">' + item.n + '</b>.');
    syncGame();
    renderKtcModal();
  }

  // 4. Dùng vật phẩm Kỳ Trân Các
  function useItem(key) {
    const p = getPlayer();
    if (!p) return;
    const count = getStackItemCount(p, key);
    if (count <= 0) {
      notify('Trong túi không còn vật phẩm này');
      return;
    }

    const now = Date.now();
    p.buf = p.buf || {};
    p.useN = p.useN || {};

    if (key === 'tt') {
      const cur = p.buf.tt;
      const until = (cur && cur.until > now) ? cur.until + 3600000 : now + 3600000;
      p.buf.tt = { p: 0.5, until };
      consumeStackItem(p, key, 1);
      notify('Kích hoạt Tiên Thảo Lộ: +50% EXP trong 60 phút!');
      logMsg('🌿 Dùng <b style="color:#7cff79">Tiên Thảo Lộ</b>: +50% kinh nghiệm chiến đấu trong 60 phút.');
    } else if (key === 'qht') {
      const cur = p.buf.luck;
      const until = (cur && cur.until > now) ? cur.until + 3600000 : now + 3600000;
      p.buf.luck = { p: 20, until };
      consumeStackItem(p, key, 1);
      notify('Kích hoạt Quế Hoa Tửu: +20 may mắn trong 60 phút!');
      logMsg('🍶 Dùng <b style="color:#ffd24a">Quế Hoa Tửu</b>: +20 may mắn trong 60 phút.');
    } else if (key === 'vlmt') {
      const used = Number(p.useN.vlmt) || 0;
      if (used >= 15) {
        notify('Đã dùng tối đa 15 cuốn Dịch Căn Kinh!');
        return;
      }
      p.skPts = (Number(p.skPts) || 0) + 1;
      p.useN.vlmt = used + 1;
      consumeStackItem(p, key, 1);
      notify('Dùng Dịch Căn Kinh: +1 điểm kỹ năng! (' + (used + 1) + '/15)');
      logMsg('📖 Dùng <b style="color:#ffd24a">Dịch Căn Kinh</b>: nhận +1 điểm kỹ năng.');
    } else if (key === 'ttk') {
      const used = Number(p.useN.ttk) || 0;
      if (used >= 15) {
        notify('Đã dùng tối đa 15 cuốn Tẩy Tủy Kinh!');
        return;
      }
      p.attrPts = (Number(p.attrPts) || 0) + 5;
      p.useN.ttk = used + 1;
      consumeStackItem(p, key, 1);
      notify('Dùng Tẩy Tủy Kinh: +5 điểm tiềm năng! (' + (used + 1) + '/15)');
      logMsg('📜 Dùng <b style="color:#ffd24a">Tẩy Tủy Kinh</b>: nhận +5 điểm tiềm năng.');
    } else if (key === 'bk90') {
      p.skPts = (Number(p.skPts) || 0) + 1;
      consumeStackItem(p, key, 1);
      notify('Lĩnh ngộ Võ Lâm Mật Tịch: +1 điểm võ công!');
      logMsg('📕 Dùng <b style="color:#ffd24a">Võ Lâm Mật Tịch 90</b>: +1 điểm võ công.');
    } else if (key === 'rht') {
      p.mats = p.mats || {};
      p.mats.ht = p.mats.ht || {};
      const tier = Math.max(1, Math.min(10, Math.floor((p.lvl || 1) / 15) + 1));
      const qty = Math.floor(Math.random() * 2) + 2;
      p.mats.ht[tier] = (Number(p.mats.ht[tier]) || 0) + qty;
      consumeStackItem(p, key, 1);
      notify('Mở nhận ' + qty + ' Huyền Tinh cấp ' + tier + '!');
      logMsg('💎 Mở Rương Huyền Tinh: nhận ' + qty + ' Huyền Tinh cấp ' + tier + '.');
    } else if (key === 'rda') {
      p.mats = p.mats || {};
      p.mats.ore = p.mats.ore || {};
      const oreTypes = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
      const ot = oreTypes[Math.floor(Math.random() * oreTypes.length)];
      p.mats.ore[ot] = (Number(p.mats.ore[ot]) || 0) + 1;
      consumeStackItem(p, key, 1);
      notify('Mở nhận 1 Khoáng Thạch hệ ' + ot.toUpperCase() + '!');
      logMsg('🪨 Mở Rương Đá: nhận 1 Khoáng Thạch hệ ' + ot.toUpperCase() + '.');
    } else if (key === 'rngua') {
      notify('Đã nhận Rương Ngựa vào hành trang, bạn có thể mở trong Hành trang.');
    }

    syncGame();
    renderKtcModal();
  }

  // Render HTML modal Kỳ Trân Các
  function renderKtcModal() {
    const p = getPlayer();
    if (!p) return;

    const gold = Number(p.gold) || 0;
    const knb = Number(p.knb) || 0;
    const now = Date.now();

    let buffHtml = '';
    const activeBuffs = [];
    if (p.buf && p.buf.tt && p.buf.tt.until > now) {
      const minLeft = Math.ceil((p.buf.tt.until - now) / 60000);
      activeBuffs.push('🌿 Tiên Thảo Lộ: +50% EXP (' + minLeft + ' phút)');
    }
    if (p.buf && p.buf.luck && p.buf.luck.until > now) {
      const minLeft = Math.ceil((p.buf.luck.until - now) / 60000);
      activeBuffs.push('🍶 Quế Hoa Tửu: +20 may mắn (' + minLeft + ' phút)');
    }
    if (activeBuffs.length) {
      buffHtml = '<div class="ktc-buff-box">' + activeBuffs.map(b => '<span>' + b + '</span>').join('') + '</div>';
    }

    const html = `
      <div class="ktc-shell">
        <header class="ktc-head">
          <div class="ktc-title">
            <h3>🏮 Kỳ Trân Các</h3>
            <p>Dưỡng sức hành tẩu · Kỳ trân bên mình</p>
          </div>
          <div class="ktc-wallet">
            <div class="ktc-wallet-knb">
              <img src="/img/ep/knb.png" alt="KNB">
              <span><b>${formatNum(knb)}</b><small>Kim Nguyên Bảo</small></span>
            </div>
            <div class="ktc-wallet-gold">
              <img src="/assets/yuanbao.BJ5MmdH1.png" alt="Lượng">
              <span><b>${formatNum(gold)}</b><small>Ngân lượng</small></span>
            </div>
          </div>
        </header>

        <section class="ktc-exchange">
          <div class="ktc-exchange-info">
            <img src="/img/ep/knb.png" alt="KNB">
            <div>
              <b>Đổi Kim Nguyên Bảo</b>
              <small>Tỷ giá giao thương giang hồ</small>
            </div>
          </div>
          <div class="ktc-exchange-actions">
            <button class="btn ktc-btn-gold" id="ktcBuyKnb" ${gold >= 100000 ? '' : 'disabled'}>100.000 lượng → 1 KNB</button>
            <button class="btn ktc-btn-knb" id="ktcSellKnb" ${knb >= 1 ? '' : 'disabled'}>1 KNB → 80.000 lượng</button>
          </div>
        </section>

        ${buffHtml}

        <div class="ktc-section-title">
          <h4>Vật Phẩm Hỗ Trợ</h4>
          <small>Trang bị cho hành trình bôn tẩu</small>
        </div>

        <div class="ktc-grid">
          ${KTC_ITEMS.map(item => {
            const haveCount = getStackItemCount(p, item.k);
            const canAfford = item.knb ? knb >= item.knb : gold >= item.gold;
            const priceLabel = item.knb ? item.knb + ' KNB' : formatNum(item.gold) + ' lượng';
            let extraInfo = '';
            if (item.k === 'vlmt') extraInfo = ' · Đã dùng ' + (p.useN?.vlmt || 0) + '/15';
            if (item.k === 'ttk') extraInfo = ' · Đã dùng ' + (p.useN?.ttk || 0) + '/15';

            return `
              <div class="ktc-card">
                <div class="ktc-card-top">
                  <img src="/${item.ic}" alt="${item.n}">
                  <div>
                    <b>${item.n}</b>
                    <small>Đang có: ${haveCount}${extraInfo}</small>
                  </div>
                </div>
                <p class="ktc-desc">${item.d}</p>
                <div class="ktc-card-btns">
                  <button class="btn ktc-buy-btn" data-buy="${item.k}" ${canAfford ? '' : 'disabled'}>Mua · ${priceLabel}</button>
                  <button class="btn ktc-use-btn" data-use="${item.k}" ${haveCount > 0 ? '' : 'disabled'}>Dùng</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <footer class="ktc-foot">
          <small>Kỳ trân phẩm cộng dồn và có thể gửi vào Kho chung.</small>
          <button class="btn sm" id="ktcCloseBtn">Đóng</button>
        </footer>
      </div>
    `;

    // Mở modal qua hệ thống của game hoặc fallback DOM
    if (typeof window.showModal === 'function') {
      window.showModal(html, bindEvents);
    } else if (typeof window.G === 'function') {
      window.G(html, bindEvents);
    } else {
      const modal = document.getElementById('modal');
      const mBody = document.getElementById('mBody');
      if (modal && mBody) {
        mBody.innerHTML = html;
        modal.classList.remove('hidden');
        bindEvents();
      }
    }
  }

  function bindEvents() {
    const buyBtn = document.getElementById('ktcBuyKnb');
    if (buyBtn) buyBtn.onclick = buyKnb;

    const sellBtn = document.getElementById('ktcSellKnb');
    if (sellBtn) sellBtn.onclick = sellKnb;

    const closeBtn = document.getElementById('ktcCloseBtn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        if (typeof window.closeModal === 'function') window.closeModal();
        else if (typeof window.K === 'function') window.K();
        else {
          const modal = document.getElementById('modal');
          if (modal) modal.classList.add('hidden');
        }
      };
    }

    document.querySelectorAll('[data-buy]').forEach(btn => {
      btn.onclick = () => buyItem(btn.dataset.buy);
    });

    document.querySelectorAll('[data-use]').forEach(btn => {
      btn.onclick = () => useItem(btn.dataset.use);
    });
  }

  // Inject CSS riêng cho Kỳ Trân Các
  function injectStyle() {
    if (document.getElementById('ktcStyle')) return;
    const style = document.createElement('style');
    style.id = 'ktcStyle';
    style.textContent = `
      .ktc-shell {
        color: #dfdfcf;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 4px;
        font-family: inherit;
      }
      .ktc-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        border-bottom: 1px solid #c8a76033;
        padding-bottom: 10px;
      }
      .ktc-title h3 {
        margin: 0;
        color: #f1e2b7;
        font-size: 20px;
        font-family: Georgia, serif;
      }
      .ktc-title p {
        margin: 2px 0 0;
        color: #889d8e;
        font-size: 11px;
      }
      .ktc-wallet {
        display: flex;
        gap: 14px;
      }
      .ktc-wallet > div {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #121c16;
        padding: 5px 10px;
        border-radius: 6px;
        border: 1px solid #c8a76033;
      }
      .ktc-wallet img {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }
      .ktc-wallet span {
        display: flex;
        flex-direction: column;
      }
      .ktc-wallet b {
        color: #ecd18c;
        font-size: 13px;
        line-height: 1.2;
      }
      .ktc-wallet small {
        color: #90a192;
        font-size: 9px;
      }
      .ktc-exchange {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        background: linear-gradient(120deg, #39321b55, #19271a66);
        border: 1px solid #a38d454a;
        border-radius: 8px;
        padding: 10px 14px;
      }
      .ktc-exchange-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .ktc-exchange-info img {
        width: 32px;
        height: 32px;
        object-fit: contain;
      }
      .ktc-exchange-info div {
        display: flex;
        flex-direction: column;
      }
      .ktc-exchange-info b {
        color: #dfcf96;
        font-size: 13px;
      }
      .ktc-exchange-info small {
        color: #8ea087;
        font-size: 10px;
      }
      .ktc-exchange-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .ktc-btn-gold {
        background: linear-gradient(#b49349, #927033) !important;
        color: #111 !important;
        font-weight: 700 !important;
      }
      .ktc-btn-knb {
        background: #1b271d !important;
        color: #d9c78f !important;
        border-color: #64734c77 !important;
      }
      .ktc-buff-box {
        background: #29412c44;
        border: 1px solid #81a96b66;
        border-radius: 6px;
        padding: 8px 12px;
        display: flex;
        gap: 14px;
        font-size: 11px;
        color: #a2d488;
      }
      .ktc-section-title {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        border-bottom: 1px solid #ffffff12;
        padding-bottom: 4px;
      }
      .ktc-section-title h4 {
        margin: 0;
        color: #eedfba;
        font-size: 14px;
      }
      .ktc-section-title small {
        color: #889d8e;
        font-size: 10px;
      }
      .ktc-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        max-height: 48vh;
        overflow-y: auto;
        padding-right: 4px;
      }
      @media (max-width: 600px) {
        .ktc-grid {
          grid-template-columns: 1fr;
        }
      }
      .ktc-card {
        background: #17271d;
        border: 1px solid #71836144;
        border-radius: 7px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 8px;
      }
      .ktc-card-top {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .ktc-card-top img {
        width: 36px;
        height: 36px;
        object-fit: contain;
        background: #0d1611;
        border-radius: 4px;
        border: 1px solid #3d4f3e;
      }
      .ktc-card-top div {
        display: flex;
        flex-direction: column;
      }
      .ktc-card-top b {
        color: #e5d5a4;
        font-size: 12px;
      }
      .ktc-card-top small {
        color: #819e82;
        font-size: 10px;
      }
      .ktc-desc {
        margin: 0;
        color: #98ab92;
        font-size: 10px;
        line-height: 1.4;
      }
      .ktc-card-btns {
        display: flex;
        gap: 6px;
        margin-top: auto;
      }
      .ktc-buy-btn {
        flex: 1;
        background: linear-gradient(#b49349, #927033) !important;
        color: #111 !important;
        font-weight: 700 !important;
        font-size: 10px !important;
        padding: 6px !important;
      }
      .ktc-use-btn {
        background: #1b271d !important;
        color: #d9c78f !important;
        border-color: #64734c77 !important;
        font-size: 10px !important;
        padding: 6px 12px !important;
      }
      .ktc-foot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #ffffff12;
        padding-top: 8px;
      }
      .ktc-foot small {
        color: #7a8d80;
        font-size: 10px;
      }
    `;
    document.head.appendChild(style);
  }

  // Khởi tạo và gán toàn cục
  injectStyle();
  window.openKyTranCac = function () {
    injectStyle();
    renderKtcModal();
  };
})();
