/**
 * BẢNG XẾP HẠNG SERVER - VÕ LÂM H5 CÔNG THÀNH CHIẾN
 */
(function() {
  'use strict';

  const FACTION_NAMES = {
    shaolin: 'Thiếu Lâm',
    tianwang: 'Thiên Vương',
    tangmen: 'Đường Môn',
    wudu: 'Ngũ Độc',
    emei: 'Nga Mi',
    cuiyan: 'Thúy Yên',
    gaibang: 'Cái Bang',
    tianren: 'Thiên Nhẫn',
    wudang: 'Võ Đang',
    kunlun: 'Côn Lôn'
  };

  const FACTION_COLORS = {
    shaolin: '#f5d688',
    tianwang: '#f5d688',
    tangmen: '#6be27f',
    wudu: '#6be27f',
    emei: '#65d5f5',
    cuiyan: '#65d5f5',
    gaibang: '#ff6e6e',
    tianren: '#ff6e6e',
    wudang: '#f3b469',
    kunlun: '#f3b469'
  };

  let rankingData = [];
  let currentSort = 'lvl'; // 'lvl' | 'stage' | 'gold'
  let currentFac = 'all';
  let searchQuery = '';

  function fmtNumber(n) {
    return Number(n || 0).toLocaleString('vi-VN');
  }

  function fmtVan(gold) {
    const v = Number(gold || 0);
    if (v >= 10000) {
      return (v / 10000).toFixed(1).replace(/\.0$/, '') + ' vạn';
    }
    return fmtNumber(v) + ' lượng';
  }

  async function fetchRanking() {
    try {
      const res = await fetch('/api/ranking');
      if (!res.ok) throw new Error('Không thể tải BXH');
      const data = await res.json();
      rankingData = data.ranking || [];
    } catch (err) {
      console.warn('Lỗi lấy BXH server:', err);
    }
  }

  function renderRows() {
    const listEl = document.getElementById('srvRankList');
    const myRankEl = document.getElementById('srvMyRank');
    if (!listEl) return;

    let filtered = [...rankingData];

    if (currentFac !== 'all') {
      filtered = filtered.filter(x => x.fac === currentFac);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(x => (x.name || '').toLowerCase().includes(q));
    }

    if (currentSort === 'lvl') {
      filtered.sort((a, b) => b.lvl - a.lvl || b.stage - a.stage || b.gold - a.gold);
    } else if (currentSort === 'stage') {
      filtered.sort((a, b) => b.stage - a.stage || b.lvl - a.lvl || b.gold - a.gold);
    } else if (currentSort === 'gold') {
      filtered.sort((a, b) => b.gold - a.gold || b.lvl - a.lvl);
    }

    if (!filtered.length) {
      listEl.innerHTML = '<div class="srv-rank-empty">Không tìm thấy người chơi nào.</div>';
      if (myRankEl) myRankEl.textContent = 'Chưa xếp hạng';
      return;
    }

    const curName = (window.P && window.P.name) || '';

    let myIdx = -1;
    const html = filtered.map((item, idx) => {
      const rankNum = idx + 1;
      let medalHtml = `<span class="srv-rank-num">#${rankNum}</span>`;
      if (rankNum === 1) medalHtml = `<span class="srv-rank-badge gold" title="Hạng 1">🥇 1</span>`;
      else if (rankNum === 2) medalHtml = `<span class="srv-rank-badge silver" title="Hạng 2">🥈 2</span>`;
      else if (rankNum === 3) medalHtml = `<span class="srv-rank-badge bronze" title="Hạng 3">🥉 3</span>`;

      const facName = FACTION_NAMES[item.fac] || item.fac || 'Vô Môn';
      const facColor = FACTION_COLORS[item.fac] || '#d7c27a';
      const isMe = curName && item.name === curName;
      if (isMe && myIdx === -1) myIdx = rankNum;

      return `
        <div class="srv-rank-row ${isMe ? 'is-me' : ''}">
          <div class="col-rank">${medalHtml}</div>
          <div class="col-name">
            <span class="p-name">${escapeHtml(item.name)}</span>
            ${isMe ? '<span class="tag-me">Tôi</span>' : ''}
          </div>
          <div class="col-fac" style="color: ${facColor}; font-weight: 600;">${facName}</div>
          <div class="col-lvl"><b style="color: #ffeaa7;">${item.lvl}</b></div>
          <div class="col-stage">Ải ${item.stage}</div>
          <div class="col-gold">${fmtVan(item.gold)}</div>
        </div>
      `;
    }).join('');

    listEl.innerHTML = html;

    if (myRankEl) {
      if (myIdx > 0) {
        myRankEl.innerHTML = `Hạng của bạn: <b style="color: #ffd166;">#${myIdx}</b> (${escapeHtml(curName)})`;
      } else if (curName) {
        myRankEl.innerHTML = `Nhân vật: <b>${escapeHtml(curName)}</b>`;
      } else {
        myRankEl.textContent = '';
      }
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  async function openRankModal() {
    let modal = document.getElementById('serverRankModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'serverRankModal';
      modal.className = 'srv-rank-overlay';
      modal.innerHTML = `
        <div class="srv-rank-box" role="dialog" aria-modal="true">
          <div class="srv-rank-header">
            <div class="srv-rank-title">
              <span class="icon">🏆</span>
              <h3>BẢNG XẾP HẠNG SERVER</h3>
            </div>
            <button type="button" class="srv-rank-close" id="srvRankCloseBtn" aria-label="Đóng">✕</button>
          </div>

          <div class="srv-rank-controls">
            <div class="srv-rank-tabs">
              <button type="button" class="srv-tab-btn active" data-sort="lvl">Cấp Độ</button>
              <button type="button" class="srv-tab-btn" data-sort="stage">Tiến Độ Ải</button>
              <button type="button" class="srv-tab-btn" data-sort="gold">Tài Phú</button>
            </div>

            <div class="srv-rank-filters">
              <select id="srvFacSelect" class="srv-fac-select">
                <option value="all">Tất cả môn phái</option>
                <option value="shaolin">Thiếu Lâm</option>
                <option value="tianwang">Thiên Vương</option>
                <option value="tangmen">Đường Môn</option>
                <option value="wudu">Ngũ Độc</option>
                <option value="emei">Nga Mi</option>
                <option value="cuiyan">Thúy Yên</option>
                <option value="gaibang">Cái Bang</option>
                <option value="tianren">Thiên Nhẫn</option>
                <option value="wudang">Võ Đang</option>
                <option value="kunlun">Côn Lôn</option>
              </select>
              <input type="text" id="srvSearchInput" class="srv-search-input" placeholder="Tìm tên nhân vật…" />
            </div>
          </div>

          <div class="srv-rank-table-head">
            <span class="col-rank">Hạng</span>
            <span class="col-name">Nhân vật</span>
            <span class="col-fac">Môn phái</span>
            <span class="col-lvl">Cấp</span>
            <span class="col-stage">Tiến độ</span>
            <span class="col-gold">Tài phú</span>
          </div>

          <div class="srv-rank-list" id="srvRankList">
            <div class="srv-rank-loading">Đang tải dữ liệu xếp hạng…</div>
          </div>

          <div class="srv-rank-footer">
            <div class="srv-my-rank" id="srvMyRank"></div>
            <button type="button" class="srv-close-footer-btn" id="srvFooterClose">Đóng</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeRankModal();
      });

      document.getElementById('srvRankCloseBtn').onclick = closeRankModal;
      document.getElementById('srvFooterClose').onclick = closeRankModal;

      modal.querySelectorAll('.srv-tab-btn').forEach(btn => {
        btn.onclick = () => {
          modal.querySelectorAll('.srv-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentSort = btn.dataset.sort;
          renderRows();
        };
      });

      const facSelect = document.getElementById('srvFacSelect');
      if (facSelect) {
        facSelect.onchange = () => {
          currentFac = facSelect.value;
          renderRows();
        };
      }

      const searchInput = document.getElementById('srvSearchInput');
      if (searchInput) {
        searchInput.oninput = () => {
          searchQuery = searchInput.value;
          renderRows();
        };
      }
    }

    modal.classList.add('show');
    await fetchRanking();
    renderRows();
  }

  function closeRankModal() {
    const modal = document.getElementById('serverRankModal');
    if (modal) modal.classList.remove('show');
  }

  function initRankButton() {
    const btn = document.getElementById('serverRankBtn');
    if (btn) {
      btn.onclick = (e) => {
        e.preventDefault();
        openRankModal();
      };
    }
  }

  window.openServerRankModal = openRankModal;
  window.closeServerRankModal = closeRankModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRankButton);
  } else {
    initRankButton();
  }
})();
