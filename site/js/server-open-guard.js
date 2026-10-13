// Quản lý trạng thái mở server (Open 13h30 - 10/10/2026)
(function() {
  'use strict';

  window.SERVER_OPEN_STATE = {
    open: false,
    openTime: '2026-10-10T13:30:00+07:00',
    targetMs: new Date('2026-10-10T13:30:00+07:00').getTime(),
    message: 'Máy chủ sẽ chính thức Open vào lúc 13h30!'
  };
  window.SERVER_TIME_OFFSET = 0;

  async function syncServerOpen() {
    try {
      const res = await fetch('/api/public/server-open', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (data.serverTime) {
            window.SERVER_TIME_OFFSET = new Date(data.serverTime).getTime() - Date.now();
          }
          window.SERVER_OPEN_STATE.open = !!data.open;
          if (data.openTime) {
            window.SERVER_OPEN_STATE.openTime = data.openTime;
            window.SERVER_OPEN_STATE.targetMs = new Date(data.openTime).getTime();
          }
          if (data.message) window.SERVER_OPEN_STATE.message = data.message;
        }
      }
    } catch (e) {}
  }

  window.isServerOpen = function() {
    if (window.SERVER_FORCE_OPEN === true) return true;
    if (localStorage.getItem('jx_force_open') === '1') return true;
    if (window.SERVER_OPEN_STATE && window.SERVER_OPEN_STATE.open) return true;
    const now = Date.now() + (window.SERVER_TIME_OFFSET || 0);
    const target = (window.SERVER_OPEN_STATE && window.SERVER_OPEN_STATE.targetMs) || new Date('2026-10-10T13:30:00+07:00').getTime();
    return now >= target;
  };

  let modalTimer = null;

  window.showServerOpenModal = function() {
    const targetMs = (window.SERVER_OPEN_STATE && window.SERVER_OPEN_STATE.targetMs) || new Date('2026-10-10T13:30:00+07:00').getTime();
    
    function formatCountdown() {
      const now = Date.now() + (window.SERVER_TIME_OFFSET || 0);
      const diff = targetMs - now;
      if (diff <= 0) return 'Đã đến giờ mở server! Hãy tải lại trang hoặc bấm Trở lại ải.';
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return `Đếm ngược: ${h > 0 ? h + ' giờ ' : ''}${m} phút ${s < 10 ? '0' + s : s} giây`;
    }

    const html = `
      <div class="server-open-modal-box" style="text-align: center; padding: 6px 4px; font-family: inherit;">
        <div style="font-size: 40px; margin-bottom: 4px; filter: drop-shadow(0 0 10px #f59e0b);">⏳</div>
        <h3 style="color: #f59e0b; font-size: 20px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px; text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);">
          Thông Báo Khai Mở Máy Chủ
        </h3>
        
        <div style="background: linear-gradient(180deg, rgba(180, 83, 9, 0.22) 0%, rgba(69, 26, 3, 0.38) 100%); border: 1.5px solid #d97706; border-radius: 10px; padding: 14px 12px; margin: 12px 0; box-shadow: 0 4px 16px rgba(0,0,0,0.5);">
          <p style="font-size: 15px; font-weight: 700; color: #fde047; margin-bottom: 4px;">
            ⚔️ MÁY CHỦ SẼ CHÍNH THỨC OPEN VÀO LÚC:
          </p>
          <div style="font-size: 28px; font-weight: 900; color: #ef4444; letter-spacing: 1px; text-shadow: 0 0 14px rgba(239, 68, 68, 0.8); margin: 6px 0;">
            13h30 - 10/10/2026
          </div>
          <div id="openServerCdText" style="font-size: 13.5px; color: #38bdf8; font-weight: 700; margin-top: 4px; text-shadow: 0 0 8px rgba(56, 189, 248, 0.5);">
            ${formatCountdown()}
          </div>
          <p style="font-size: 12.5px; color: #cbd5e1; margin-top: 10px; line-height: 1.5;">
            Hiện tại các Ải Luyện Công đang tạm khóa để chuẩn bị máy chủ chu đáo nhất.<br>
            Đại hiệp vui lòng tịnh dưỡng tại thành <b>Biện Kinh</b> chuẩn bị quân trang!
          </p>
        </div>

        <div style="text-align: left; background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 13px; color: #f1f5f9; line-height: 1.7;">
          <div style="color: #fbbf24; font-weight: 700; margin-bottom: 2px;">✨ Hướng Dẫn Trước Giờ Khai Mở:</div>
          <div>• Tạo trước nhân vật, chọn hệ ngũ hành & môn phái ưng ý.</div>
          <div>• Dạo quanh thành phố Biện Kinh, giao lưu cùng các hiệp khách.</div>
          <div>• Tham gia <b>Nhóm Zalo</b> để nhận GiftCode Tân Thủ & hỗ trợ cài đặt.</div>
        </div>

        <div class="btnrow" style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
          <a href="https://zalo.me/g/spnv6daqu8lvtilahypo" target="_blank" rel="noopener noreferrer" class="btn" style="background: linear-gradient(180deg, #ef4444 0%, #b91c1c 100%); color: #fff; text-decoration: none; font-weight: 700; padding: 8px 16px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);">
            💬 Vào Nhóm Zalo
          </a>
          <button class="btn" id="bCloseServerOpenNotice" style="background: #334155; color: #fff; font-weight: 600; padding: 8px 16px; border-radius: 6px;">
            Đã Hiểu
          </button>
        </div>
      </div>
    `;

    if (modalTimer) clearInterval(modalTimer);

    if (typeof window.G === 'function') {
      window.G(html, () => {
        const btn = document.getElementById('bCloseServerOpenNotice');
        if (btn && typeof window.K === 'function') btn.onclick = () => { if (modalTimer) clearInterval(modalTimer); window.K(true); };
      });
    } else if (typeof window.modal === 'function') {
      window.modal(html, () => {
        const btn = document.getElementById('bCloseServerOpenNotice');
        if (btn && typeof window.closeModal === 'function') btn.onclick = () => { if (modalTimer) clearInterval(modalTimer); window.closeModal(true); };
      });
    }

    modalTimer = setInterval(() => {
      const el = document.getElementById('openServerCdText');
      if (el) el.textContent = formatCountdown();
      else if (modalTimer) clearInterval(modalTimer);
    }, 1000);

    if (typeof window.W === 'function') window.W('13h30 chính thức Open!');
    else if (typeof window.toast === 'function') window.toast('13h30 chính thức Open!');
  };

  // Intercept click on '#bBack' (Trở lại ải) and '#bTp' (Thổ Địa Phù) in town
  document.addEventListener('click', (e) => {
    const backBtn = e.target.closest('#bBack');
    if (backBtn) {
      if (!window.isServerOpen()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.showServerOpenModal();
        return false;
      }
    }
    const tpBtn = e.target.closest('#bTp');
    if (tpBtn && window.R && window.R.town) {
      if (!window.isServerOpen()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.showServerOpenModal();
        return false;
      }
    }
  }, true);

  // Intercept key shortcuts (t, 3) in town
  document.addEventListener('keydown', (e) => {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if ((e.key === 't' || e.key === '3') && window.R && window.R.town) {
      if (!window.isServerOpen()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.showServerOpenModal();
      }
    }
  }, true);

  // Sync on startup and periodically every 30s
  syncServerOpen();
  setInterval(syncServerOpen, 30000);
})();
