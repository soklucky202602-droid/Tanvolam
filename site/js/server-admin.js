const api = (u, o = {}) => fetch(u, { headers: { 'content-type': 'application/json' }, ...o }).then(async r => {
  const j = await r.json();
  if (!r.ok) throw Error(j.error || 'Yêu cầu thất bại');
  return j;
});

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function timeAgo(ts) {
  if (!ts) return '<span style="color:#678">Chưa vào</span>';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return '<span style="color:#44e37a;font-weight:600">Vừa xong</span>';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

let allLoadedUsers = [];
let currentSelectedUser = null;
let currentSelectedSlot = 1;

// 1. Quản lý danh sách người chơi
function renderUsers() {
  const tbody = document.querySelector('#users');
  if (!tbody) return;
  const q = (document.querySelector('#userSearch')?.value || '').trim().toLowerCase();
  const onlyOnline = !!document.querySelector('#filterOnline')?.checked;

  const filtered = allLoadedUsers.filter(u => {
    if (onlyOnline && !u.isOnline) return false;
    if (!q) return true;
    if (u.username && u.username.toLowerCase().includes(q)) return true;
    if (u.charName && u.charName.toLowerCase().includes(q)) return true;
    if (Array.isArray(u.slots) && u.slots.some(s => s && s.name && s.name.toLowerCase().includes(q))) return true;
    return false;
  });

  const countEl = document.querySelector('#filteredCount');
  if (countEl) {
    countEl.textContent = (q || onlyOnline)
      ? `Hiển thị ${filtered.length} / ${allLoadedUsers.length} tài khoản`
      : `Tổng: ${allLoadedUsers.length} tài khoản`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:18px;color:#8bb098">Không tìm thấy tài khoản phù hợp với từ khóa "${esc(q)}".</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    const statusBadge = u.locked
      ? `<span style="color:#ef4444;font-weight:bold;background:#451212;padding:2px 6px;border-radius:4px;border:1px solid #b91c1c;font-size:12px">🔒 Đã khóa</span>`
      : (u.isOnline
        ? `<span style="color:#44e37a;font-weight:bold;display:inline-flex;align-items:center;gap:6px"><span class="online-pulse"></span>Online</span>`
        : `<span style="color:#789">Offline</span>`);
    const charInfo = (u.charName ? `<b style="color:#ffd24a">[${esc(u.charName)}]</b> ` : '') +
      (u.levels || []).map((x, i) => `Slot ${i + 1}: ${x != null ? ('Lv.' + x) : 'trống'}`).join(' · ');
    const roleBadge = u.role === 'admin'
      ? '<span style="color:#f2ce70;font-size:11px;background:#3a2f14;padding:2px 6px;border-radius:3px;margin-left:6px;border:1px solid #74581f">Admin</span>'
      : '';
    const isChosen = currentSelectedUser?.id === u.id;
    return `<tr onclick="window.pick('${u.id}')" style="cursor:pointer;transition:background 0.15s;${isChosen ? 'background:rgba(242,206,112,0.18);outline:2px solid #ffd24a' : (u.locked ? 'background:rgba(220,38,38,0.1)' : (u.isOnline ? 'background:rgba(68,227,122,0.06)' : ''))}">
      <td><b>${esc(u.username)}</b>${roleBadge}</td>
      <td style="text-align:center">${statusBadge}</td>
      <td>${charInfo}</td>
      <td style="font-size:13px">${timeAgo(u.lastSeen)}</td>
      <td style="text-align:center;white-space:nowrap">
        <button type="button" class="${isChosen ? 'btn-gold' : 'btn-primary'}" style="padding:5px 10px;font-size:13px" onclick="event.stopPropagation();window.pick('${u.id}')">
          ${isChosen ? '✔ Đang chọn' : '👉 Chọn'}
        </button>
        ${u.role !== 'admin' ? `
        <button type="button" class="btn-sub" style="padding:5px 9px;font-size:12px;${u.locked ? 'background:#064e3b;border:1px solid #059669;color:#34d399' : 'background:#581c87;border:1px solid #9333ea;color:#e9d5ff'};margin-left:4px" title="${u.locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản này'}" onclick="event.stopPropagation();window.toggleLockUser('${u.id}','${esc(u.username)}',${!!u.locked})">
          ${u.locked ? '🔓 Mở' : '🔒 Khóa'}
        </button>
        <button type="button" class="btn-sub" style="padding:5px 9px;font-size:12px;background:#451212;border:1px solid #b91c1c;color:#fca5a5;margin-left:4px" title="Xóa tài khoản này" onclick="event.stopPropagation();window.deleteSingleUser('${u.id}','${esc(u.username)}')">
          🗑 Xóa
        </button>` : ''}
      </td>
    </tr>`;
  }).join('');
}

async function load(silent = false) {
  try {
    const me = await api('/api/auth/me');
    if (me.user?.role !== 'admin') throw Error('Hãy đăng nhập bằng tài khoản admin tại trang game trước.');
    const d = await api('/api/admin/users');
    allLoadedUsers = d.users || [];
    const onlineCount = d.onlineCount ?? allLoadedUsers.filter(u => u.isOnline).length;
    const total = d.total ?? allLoadedUsers.length;
    
    const onEl = document.querySelector('#onlineCount');
    const totEl = document.querySelector('#totalUsers');
    if (onEl) onEl.textContent = onlineCount;
    if (totEl) totEl.textContent = total;
    renderUsers();
    loadSimbotStatus();
    loadRankingAdmin(true);
    loadMaintenanceAdmin();
    loadServerOpenAdmin();
    loadGiftCodesAdmin(true);
  } catch (e) {
    if (!silent) alert(e.message);
  }
}

function renderSlotButtons(user) {
  const picker = document.querySelector('#slotPicker');
  if (!picker) return;
  picker.innerHTML = [1, 2, 3].map(slotNum => {
    const s = user.slots?.[slotNum - 1];
    const isCur = slotNum === currentSelectedSlot;
    const label = s ? `Slot ${slotNum}: ${esc(s.name || 'Nhân vật')} (Lv.${s.lvl})` : `Slot ${slotNum}: (trống)`;
    return `<button type="button" class="${isCur ? 'btn-primary' : 'btn-sub'}" style="padding:4px 10px;font-size:12px;cursor:pointer" onclick="window.selectSlot(${slotNum})">
      ${label}
    </button>`;
  }).join('');
}

function selectSlot(slotNum) {
  currentSelectedSlot = slotNum;
  document.querySelector('#slot').value = slotNum;
  if (currentSelectedUser) {
    renderSlotButtons(currentSelectedUser);
    const s = currentSelectedUser.slots?.[slotNum - 1];
    const curLevelEl = document.querySelector('#charLevelCurrent');
    if (curLevelEl) {
      curLevelEl.textContent = s ? `Hiện tại: Lv.${s.lvl} (${s.name || 'Chưa đặt tên'})` : 'Hiện tại: Slot trống';
    }
    const levelInp = document.querySelector('#levelInput');
    if (levelInp && s?.lvl != null) levelInp.value = s.lvl;
    const grantTargetEl = document.querySelector('#grantTargetName');
    if (grantTargetEl) grantTargetEl.textContent = `${currentSelectedUser.username} (Slot ${slotNum}: ${s?.name || 'trống'})`;
  }
}
window.selectSlot = selectSlot;

function pick(id) {
  const user = allLoadedUsers.find(u => u.id === id);
  if (!user) return;
  currentSelectedUser = user;
  document.querySelector('#uid').value = user.id;

  const statusEl = document.querySelector('#userStatusTag');
  if (statusEl) {
    statusEl.innerHTML = `Tài khoản: <b style="color:#ffd24a">${esc(user.username)}</b> ` +
      (user.locked ? '<span style="color:#ef4444;font-weight:bold;background:#451212;padding:2px 8px;border-radius:4px;border:1px solid #b91c1c;margin-left:6px">🔒 ĐÃ KHÓA</span>' :
      (user.isOnline ? '<span style="color:#44e37a;margin-left:6px">● Online</span>' : '<span style="color:#8bb098;margin-left:6px">○ Offline</span>'));
  }

  const btnLock = document.querySelector('#btnLockSelectedUser');
  if (btnLock) {
    if (user.role === 'admin') {
      btnLock.style.display = 'none';
    } else {
      btnLock.style.display = 'inline-block';
      if (user.locked) {
        btnLock.textContent = '🔓 Mở Khóa Tài Khoản';
        btnLock.style.background = '#064e3b';
        btnLock.style.color = '#34d399';
        btnLock.style.border = '1px solid #10b981';
      } else {
        btnLock.textContent = '🔒 Khóa Tài Khoản';
        btnLock.style.background = '#451212';
        btnLock.style.color = '#fca5a5';
        btnLock.style.border = '1px solid #ef4444';
      }
    }
  }

  currentSelectedSlot = (user.activeSlot != null ? user.activeSlot + 1 : 1);
  selectSlot(currentSelectedSlot);

  const grantTargetUserRadio = document.querySelector('#grantTargetUser');
  if (grantTargetUserRadio) grantTargetUserRadio.checked = true;

  renderUsers();

  const manageSec = document.querySelector('#playerManageSection');
  if (manageSec) manageSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.pick = pick;

// 2. Các hàm nhanh cho Cấp Độ, Tiền Vạn, KNB
function quickSetLevel(lv) {
  const inp = document.querySelector('#levelInput');
  if (inp) inp.value = lv;
}
window.quickSetLevel = quickSetLevel;

function quickAddLevel(add) {
  const inp = document.querySelector('#levelInput');
  if (inp) inp.value = Math.min(180, (Number(inp.value) || 1) + add);
}
window.quickAddLevel = quickAddLevel;

function updateVanPreview() {
  const inp = document.querySelector('#grantVanInput');
  const preview = document.querySelector('#grantVanPreview');
  if (!inp || !preview) return;
  const v = Math.max(0, Math.floor(Number(inp.value) || 0));
  preview.textContent = `${v.toLocaleString('vi-VN')} vạn = ${(v * 10000).toLocaleString('vi-VN')} lượng`;
}
window.updateVanPreview = updateVanPreview;

function quickAddVan(v) {
  const inp = document.querySelector('#grantVanInput');
  if (!inp) return;
  inp.value = Math.max(0, Math.floor(Number(inp.value) || 0)) + v;
  updateVanPreview();
}
window.quickAddVan = quickAddVan;

function quickZeroVan() {
  const inp = document.querySelector('#grantVanInput');
  if (inp) inp.value = 0;
  updateVanPreview();
}
window.quickZeroVan = quickZeroVan;

function updateKnbPreview() {
  const inp = document.querySelector('#grantKnbInput');
  const preview = document.querySelector('#grantKnbPreview');
  if (!inp || !preview) return;
  const k = Math.max(0, Math.floor(Number(inp.value) || 0));
  preview.textContent = `${k.toLocaleString('vi-VN')} KNB`;
}
window.updateKnbPreview = updateKnbPreview;

function quickAddKnb(k) {
  const inp = document.querySelector('#grantKnbInput');
  if (!inp) return;
  inp.value = Math.max(0, Math.floor(Number(inp.value) || 0)) + k;
  updateKnbPreview();
}
window.quickAddKnb = quickAddKnb;

function quickZeroKnb() {
  const inp = document.querySelector('#grantKnbInput');
  if (inp) inp.value = 0;
  updateKnbPreview();
}
window.quickZeroKnb = quickZeroKnb;

// 3. Thực hiện phát Cấp, Tiền Vạn, KNB
async function executeBasicGrant() {
  const targetAll = document.querySelector('#grantTargetAll')?.checked;
  if (!targetAll && !currentSelectedUser) {
    alert('Vui lòng chọn một tài khoản từ danh sách người chơi trước!');
    return;
  }

  const target = targetAll ? 'all' : currentSelectedUser.id;
  const slot = currentSelectedSlot;
  const van = Math.max(0, Math.floor(Number(document.querySelector('#grantVanInput')?.value) || 0));
  const gold = van * 10000;
  const knb = Math.max(0, Math.floor(Number(document.querySelector('#grantKnbInput')?.value) || 0));
  const levelVal = document.querySelector('#levelInput')?.value;
  const level = levelVal ? Math.max(1, Math.min(180, Math.floor(Number(levelVal)))) : null;
  const sendMail = document.querySelector('#grantMethodMail')?.checked;
  const subject = document.querySelector('#grantMailSubject')?.value || 'Phát thưởng từ Quản Trị Viên';
  const text = document.querySelector('#grantMailText')?.value || 'Phần thưởng dành cho bạn.';

  if (!gold && !knb && !level) {
    alert('Vui lòng nhập ít nhất một giá trị: Cấp độ, Tiền Vạn hoặc KNB muốn phát.');
    return;
  }

  const statusEl = document.querySelector('#grantBasicStatus');
  if (statusEl) statusEl.innerHTML = '<span style="color:#ffd24a">⏳ Đang thực hiện phát thưởng...</span>';

  try {
    const res = await api('/api/admin/grant', {
      method: 'POST',
      body: JSON.stringify({
        target,
        slot,
        gold,
        knb,
        level,
        sendMail,
        subject,
        text
      })
    });

    const targetDesc = targetAll ? 'Toàn bộ người chơi' : `Tài khoản ${currentSelectedUser.username} (Slot ${slot})`;
    if (statusEl) statusEl.innerHTML = `<span style="color:#44e37a">✔ Đã phát thành công cho ${targetDesc}! (${res.count} người nhận)</span>`;
    await load(true);
  } catch (err) {
    if (statusEl) statusEl.innerHTML = `<span style="color:#ff6b6b">❌ Lỗi: ${err.message}</span>`;
  }
}
window.executeBasicGrant = executeBasicGrant;

// 4. KHUNG TẠO VẬT PHẨM THEO Ý ĐỂ PHÁT CHO NGƯỜI CHƠI (IMAGE 1)
const DETAIL_TYPES = [
  [0, 'Vũ khí cận chiến'],
  [1, 'Ám khí'],
  [2, 'Áo'],
  [3, 'Nhẫn'],
  [4, 'Dây chuyền'],
  [5, 'Giày'],
  [6, 'Đai lưng'],
  [7, 'Mũ'],
  [8, 'Hộ uyển'],
  [9, 'Ngọc bội'],
  [10, 'Ngựa']
];

const SERIES_NAMES = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];

function getItemRow(detail, part, tier) {
  const items = window.JX?.items?.[detail];
  if (!items || !items.list) return null;
  const matching = items.list.filter(e => e.k === part);
  if (!matching.length) return null;
  return matching.reduce((best, cur) => Math.abs(cur.lvl - tier) < Math.abs(best.lvl - tier) ? cur : best);
}

function getAvailableAffixes(detail, lvl, series) {
  const map = new Map();
  for (const a of window.JX?.affix || []) {
    if (!a || !Array.isArray(a.p) || !a.w || !(+a.w[detail] > 0) || +a.lvl > lvl || (a.s >= 0 && +a.s !== series)) continue;
    const r = +a.a;
    const score = (a.s === series ? 10000 : 0) + (+a.lvl || 0) * 10 + (+!!a.pre);
    const cur = map.get(r);
    if (!cur || score > cur.score) map.set(r, { row: a, score });
  }
  return [...map.values()].map(x => x.row).sort((a, b) => String(a.d || a.n).localeCompare(String(b.d || b.n), 'vi'));
}

function initCustomItemCreator() {
  const detailSel = document.querySelector('#customItemDetail');
  const partSel = document.querySelector('#customItemPart');
  const tierInp = document.querySelector('#customItemTier');
  const seriesSel = document.querySelector('#customItemSeries');
  const enhInp = document.querySelector('#customItemEnh');
  const nameInp = document.querySelector('#customItemName');
  const affixesContainer = document.querySelector('#customItemAffixes');

  if (!detailSel || !partSel || !affixesContainer) return;

  // Render 6 ô ma thuật
  affixesContainer.innerHTML = Array.from({ length: 6 }, (_, i) => `
    <div class="admin-item-affix">
      <span class="admin-item-affix-label">Dòng ${i + 1}</span>
      <div class="admin-item-affix-controls">
        <select class="custom-item-affix-sel" data-index="${i}">
          <option value="">Không chọn</option>
        </select>
        <input type="number" class="custom-item-affix-val" data-index="${i}" min="0" step="1" hidden>
      </div>
    </div>
  `).join('');

  detailSel.innerHTML = DETAIL_TYPES.map(([id, name]) => `<option value="${id}" ${id === 2 ? 'selected' : ''}>${name}</option>`).join('');
  seriesSel.innerHTML = SERIES_NAMES.map((name, idx) => `<option value="${idx}">${name}</option>`).join('');

  function updateParts() {
    const detail = +detailSel.value;
    const tier = Math.max(1, Math.min(10, Math.floor(+tierInp.value || 1)));
    const items = window.JX?.items?.[detail];
    const uniqueKeys = [...new Set((items?.list || []).map(e => +e.k))].sort((a, b) => a - b);
    const options = uniqueKeys.map(k => {
      const row = getItemRow(detail, k, tier);
      return row ? { k, row } : null;
    }).filter(Boolean);

    const prevVal = partSel.value;
    partSel.innerHTML = options.map(o => `<option value="${o.k}">${esc(o.row.n)} · bậc ${o.row.lvl}</option>`).join('');
    if (options.some(o => String(o.k) === prevVal)) {
      partSel.value = prevVal;
    } else if (options[0]) {
      partSel.value = String(options[0].k);
    }
  }

  function updateAffixOptions() {
    const detail = +detailSel.value;
    const tier = Math.max(1, Math.min(10, Math.floor(+tierInp.value || 1)));
    const part = +partSel.value;
    const row = getItemRow(detail, part, tier);
    const series = row && row.s >= 0 ? row.s : +seriesSel.value;

    if (row && row.s >= 0) {
      seriesSel.value = String(row.s);
      seriesSel.disabled = true;
    } else {
      seriesSel.disabled = false;
    }

    const affList = getAvailableAffixes(detail, row ? row.lvl : tier, series);
    const sels = document.querySelectorAll('.custom-item-affix-sel');
    const curValues = [...sels].map(s => s.value);

    sels.forEach((sel, i) => {
      const cur = curValues[i];
      sel.innerHTML = '<option value="">Không chọn</option>' + affList.map(a => `
        <option value="${a.a}">${esc(a.n)} · ${esc(a.d || a.a)}</option>
      `).join('');
      if (affList.some(a => String(a.a) === cur)) sel.value = cur;
      else sel.value = '';

      const valInp = sel.closest('.admin-item-affix').querySelector('.custom-item-affix-val');
      const chosenAff = affList.find(a => String(a.a) === sel.value);
      if (chosenAff) {
        const paramIdx = chosenAff.p.findIndex(([lo, hi]) => (lo !== -1 || hi !== -1) && +lo !== +hi);
        if (paramIdx >= 0) {
          const [lo, hi] = chosenAff.p[paramIdx];
          valInp.min = Math.min(+lo, +hi);
          valInp.max = Math.max(+lo, +hi);
          valInp.value = Math.max(+lo, +hi);
          valInp.hidden = false;
        } else {
          valInp.hidden = true;
        }
      } else {
        valInp.hidden = true;
      }
    });

    renderItemPreview();
  }

  function renderItemPreview() {
    const previewEl = document.querySelector('#customItemPreview');
    if (!previewEl) return;
    const detail = +detailSel.value;
    const tier = Math.max(1, Math.min(10, Math.floor(+tierInp.value || 1)));
    const part = +partSel.value;
    const row = getItemRow(detail, part, tier);

    if (!row) {
      previewEl.innerHTML = '<span style="color:#678">Không tìm thấy mẫu vật phẩm phù hợp.</span>';
      return;
    }

    const series = row.s >= 0 ? row.s : +seriesSel.value;
    const customName = nameInp.value.trim() || row.n;
    const enh = Math.max(0, Math.min(10, Math.floor(+enhInp.value || 0)));

    const chosenAffixes = [];
    document.querySelectorAll('.custom-item-affix-sel').forEach(sel => {
      if (sel.value) {
        const affObj = (window.JX?.affix || []).find(a => String(a.a) === sel.value);
        const valInp = sel.closest('.admin-item-affix').querySelector('.custom-item-affix-val');
        if (affObj) {
          chosenAffixes.push({
            name: affObj.n,
            desc: affObj.d || '',
            val: valInp && !valInp.hidden ? valInp.value : ''
          });
        }
      }
    });

    const typeName = DETAIL_TYPES.find(d => d[0] === detail)?.[1] || 'Trang bị';
    const seriesName = SERIES_NAMES[series] || 'Vô';
    const iconSrc = row.ic ? `/${row.ic}` : '';

    previewEl.innerHTML = `
      ${iconSrc ? `<img src="${iconSrc}" alt="" onerror="this.style.display='none'">` : ''}
      <div class="admin-item-preview-text" style="flex:1">
        <b>${esc(customName)}</b>
        <small>${esc(typeName)} · bậc ${row.lvl} · Hệ ${esc(seriesName)} · +${enh} · ${chosenAffixes.length}/6 dòng</small>
        ${chosenAffixes.length ? `
          <div class="admin-item-preview-affixes">
            ${chosenAffixes.map(a => `<div>• <span style="color:#ffd24a">${esc(a.name)}:</span> ${esc(a.desc)} ${a.val ? `<b style="color:#44e37a">(${a.val})</b>` : ''}</div>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  detailSel.onchange = () => { updateParts(); updateAffixOptions(); };
  tierInp.onchange = () => { updateParts(); updateAffixOptions(); };
  partSel.onchange = updateAffixOptions;
  seriesSel.onchange = updateAffixOptions;
  enhInp.oninput = renderItemPreview;
  nameInp.oninput = renderItemPreview;

  document.querySelectorAll('.custom-item-affix-sel').forEach(sel => {
    sel.onchange = () => {
      const valInp = sel.closest('.admin-item-affix').querySelector('.custom-item-affix-val');
      const affObj = (window.JX?.affix || []).find(a => String(a.a) === sel.value);
      if (affObj) {
        const paramIdx = affObj.p.findIndex(([lo, hi]) => (lo !== -1 || hi !== -1) && +lo !== +hi);
        if (paramIdx >= 0) {
          const [lo, hi] = affObj.p[paramIdx];
          valInp.min = Math.min(+lo, +hi);
          valInp.max = Math.max(+lo, +hi);
          valInp.value = Math.max(+lo, +hi);
          valInp.hidden = false;
        } else {
          valInp.hidden = true;
        }
      } else {
        valInp.hidden = true;
      }
      renderItemPreview();
    };
  });

  document.querySelectorAll('.custom-item-affix-val').forEach(inp => {
    inp.oninput = renderItemPreview;
  });

  updateParts();
  updateAffixOptions();
}

async function createAndGrantCustomItem() {
  const targetAll = document.querySelector('#grantTargetAll')?.checked;
  if (!targetAll && !currentSelectedUser) {
    alert('Vui lòng chọn một tài khoản từ danh sách người chơi trước!');
    return;
  }

  const detail = +document.querySelector('#customItemDetail').value;
  const tier = Math.max(1, Math.min(10, Math.floor(+document.querySelector('#customItemTier').value || 1)));
  const part = +document.querySelector('#customItemPart').value;
  const row = getItemRow(detail, part, tier);

  if (!row) {
    alert('Không tìm thấy mẫu vật phẩm hợp lệ.');
    return;
  }

  const series = row.s >= 0 ? row.s : +document.querySelector('#customItemSeries').value;
  const enh = Math.max(0, Math.min(10, Math.floor(+document.querySelector('#customItemEnh').value || 0)));
  const customName = document.querySelector('#customItemName').value.trim() || row.n;

  // Lấy các dòng ma thuật đã chọn
  const mag = [];
  const sels = document.querySelectorAll('.custom-item-affix-sel');
  for (const sel of sels) {
    if (!sel.value) continue;
    const affObj = (window.JX?.affix || []).find(a => String(a.a) === sel.value);
    if (!affObj) continue;
    const valInp = sel.closest('.admin-item-affix').querySelector('.custom-item-affix-val');
    const p = affObj.p.map(([lo, hi]) => lo === -1 && hi === -1 ? -1 : Math.max(+lo || 0, +hi || 0));
    const paramIdx = affObj.p.findIndex(([lo, hi]) => (lo !== -1 || hi !== -1) && +lo !== +hi);
    if (paramIdx >= 0 && valInp && !valInp.hidden) {
      p[paramIdx] = Math.max(+valInp.min, Math.min(+valInp.max, Math.floor(+valInp.value || 0)));
    }
    mag.push({
      a: +affObj.a,
      n: affObj.n,
      pre: +affObj.pre,
      p
    });
  }

  const itemObj = {
    uid: Date.now() + Math.floor(Math.random() * 100000),
    d: detail,
    k: part,
    p: row.p,
    n: customName,
    ic: row.ic || '',
    lvl: row.lvl,
    s: series,
    base: (row.base || []).map(e => e.slice()),
    req: (row.req || []).map(e => e.slice()),
    price: row.price || 1000,
    mag,
    r: mag.length >= 4 ? 2 : (mag.length >= 2 ? 1 : 0),
    enh,
    locked: true
  };

  const statusEl = document.querySelector('#customItemStatus');
  if (statusEl) statusEl.innerHTML = '<span style="color:#ffd24a">⏳ Đang tạo và phát vật phẩm...</span>';

  const sendMail = document.querySelector('#grantMethodMail')?.checked;
  const target = targetAll ? 'all' : currentSelectedUser.id;
  const slot = currentSelectedSlot;

  try {
    const res = await api('/api/admin/grant', {
      method: 'POST',
      body: JSON.stringify({
        target,
        slot,
        items: [itemObj],
        sendMail,
        subject: `Phát trang bị: ${itemObj.n}`,
        text: `Admin đã phát trang bị [${itemObj.n} +${itemObj.enh}] cho bạn.`
      })
    });

    const targetDesc = targetAll ? 'Toàn bộ người chơi' : `Tài khoản ${currentSelectedUser.username} (Slot ${slot})`;
    if (statusEl) statusEl.innerHTML = `<span style="color:#44e37a">✔ Đã tạo và phát [${esc(itemObj.n)} +${enh}] thành công cho ${targetDesc}!</span>`;
  } catch (err) {
    if (statusEl) statusEl.innerHTML = `<span style="color:#ff6b6b">❌ Lỗi: ${err.message}</span>`;
  }
}
window.createAndGrantCustomItem = createAndGrantCustomItem;

// 5. PHÁT NHANH TRANG BỊ CÔNG THÀNH CHIẾN (AN BANG & ĐỊNH QUỐC)
function makeGoldItemFromTemplate(row) {
  const attr = i => {
    const a = window.JX?.ge?.[i];
    return a ? { a: a.a, p: a.p.map(([lo, hi]) => lo === -1 && hi === -1 ? -1 : hi), pre: 1 } : null;
  };
  return {
    uid: Date.now() + Math.floor(Math.random() * 100000),
    d: row.d,
    k: row.k,
    n: row.n,
    ic: row.ic || '',
    lvl: row.lvl,
    s: row.s,
    price: row.price || 0,
    base: (row.base || []).map(x => x.slice()),
    req: (row.req || []).map(x => x.slice()),
    r: 4,
    set: {
      kind: 'gold',
      grp: row.grp,
      n1: row.n1 || (row.grp === 34 ? 4 : (row.grp === 33 ? 5 : 99)),
      n2: row.n2 || (row.grp === 34 ? 4 : (row.grp === 33 ? 5 : 99)),
      sid: row.sid
    },
    mag: (row.mag || []).map(attr).filter(Boolean),
    ext: (row.ext || []).map(attr).filter(Boolean),
    locked: true
  };
}

const HORSE_CONFIGS = {
  'chiếu dạ': { p: 50, s: -1, r: 4, req: [[36, 1]], hlv: 0, hxp: 0 },
  'xích thố': { p: 51, s: -1, r: 4, req: [[36, 1]], hlv: 0, hxp: 0 },
  'tuyệt ảnh': { p: 52, s: -1, r: 4, req: [[36, 1]], hlv: 0, hxp: 0 },
  'tuyệt anh': { p: 52, s: -1, r: 4, req: [[36, 1]], hlv: 0, hxp: 0 },
  'đích lô': { p: 53, s: -1, r: 4, req: [[36, 1]], hlv: 0, hxp: 0 },
  'ô vân': { p: 49, s: -1, r: 4, req: [[36, 1]], hlv: 0, hxp: 0 },
  'bôn tiêu': { thanma: 'btieu', p: 54, s: -1, r: 4, req: [[36, 1]], hlv: 0, hxp: 0 },
  'phi vân': { thanma: 'pvan', p: 54, s: -1, r: 4, req: [[36, 1]], hlv: 0, hxp: 0 },
  'phiên vũ': { thanma: 'pvu', p: 54, s: -1, r: 4, req: [[36, 1]], hlv: 0, hxp: 0 }
};

async function quickGrantSet(setName) {
  const targetAll = document.querySelector('#grantTargetAll')?.checked;
  if (!targetAll && !currentSelectedUser) {
    alert('Vui lòng chọn một tài khoản từ danh sách người chơi trước!');
    return;
  }

  const target = targetAll ? 'all' : currentSelectedUser.id;
  const slot = currentSelectedSlot;
  const sendMail = document.querySelector('#grantMethodMail')?.checked;
  let items = [];
  let subject = 'Phát thưởng trang bị Công Thành Chiến';

  if (setName === 'anbang') {
    // 4 món An Bang chuẩn
    const abRows = (window.JX?.sets?.gold || []).filter(x => x.grp === 34 && !x.n.startsWith('[') && (!x.mag || !x.mag.length || x.mag[0] >= 500));
    const uniqueAB = [];
    const seen = new Set();
    for (const r of abRows) {
      if (!seen.has(r.n)) { seen.add(r.n); uniqueAB.push(r); }
    }
    items = uniqueAB.map(r => makeGoldItemFromTemplate(r));
    subject = 'Trọn bộ Hoàng Kim An Bang (4 món)';
  } else if (setName === 'dinhquoc') {
    // 5 món Định Quốc chuẩn
    const dqRows = (window.JX?.sets?.gold || []).filter(x => x.grp === 33 && !x.n.startsWith('[') && (!x.mag || !x.mag.length || x.mag[0] >= 500));
    const uniqueDQ = [];
    const seen = new Set();
    for (const r of dqRows) {
      if (!seen.has(r.n)) { seen.add(r.n); uniqueDQ.push(r); }
    }
    items = uniqueDQ.slice(0, 5).map(r => makeGoldItemFromTemplate(r));
    subject = 'Trọn bộ Hoàng Kim Định Quốc (5 món)';
  } else if (setName === 'combo_pots') {
    items = [
      { grant: 'potion', kind: 'life', tier: 5, qty: 99, n: 'Cửu Chuyển Hoàn Hồn Đan x99' },
      { grant: 'potion', kind: 'mana', tier: 5, qty: 99, n: 'Ô Đầu Hoàn Thần Đan x99' }
    ];
    subject = 'Phần thưởng Combo Thuốc T5 (Máu & Mana)';
  } else if (setName === 'bk90') {
    items = [
      { id: 'bk90', n: 'Võ Lâm Mật Tịch 90', qty: 10, d: 0, locked: true }
    ];
    subject = 'Phần thưởng 10 cuốn Võ Lâm Mật Tịch 90';
  }

  if (!items.length) {
    alert('Không tìm thấy danh sách món đồ.');
    return;
  }

  try {
    const res = await api('/api/admin/grant', {
      method: 'POST',
      body: JSON.stringify({
        target,
        slot,
        items,
        sendMail,
        subject,
        text: `Admin đã phát ${subject} cho bạn.`
      })
    });
    alert(`Đã phát thành công ${subject}!`);
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}
window.quickGrantSet = quickGrantSet;

async function quickGrantHorse(horseName) {
  const targetAll = document.querySelector('#grantTargetAll')?.checked;
  if (!targetAll && !currentSelectedUser) {
    alert('Vui lòng chọn một tài khoản từ danh sách người chơi trước!');
    return;
  }

  const horseList = window.JX?.items?.[10]?.list || [];
  const horseRow = horseList.find(h => h.n && h.n.toLowerCase().includes(horseName.toLowerCase()));

  if (!horseRow) {
    alert('Không tìm thấy thông tin ngựa: ' + horseName);
    return;
  }

  const lower = horseName.toLowerCase();
  let conf = null;
  for (const [k, v] of Object.entries(HORSE_CONFIGS)) {
    if (lower.includes(k)) {
      conf = v;
      break;
    }
  }

  const horseItem = {
    ...horseRow,
    uid: Date.now() + Math.floor(Math.random() * 100000),
    d: 10,
    autoEquipHorse: true,
    locked: true,
    mag: [],
    ext: [],
    ...(conf || { p: 54, s: -1, r: 4, req: [[36, 1]], hlv: 0, hxp: 0 })
  };

  const target = targetAll ? 'all' : currentSelectedUser.id;
  const slot = currentSelectedSlot;
  const sendMail = document.querySelector('#grantMethodMail')?.checked;

  try {
    await api('/api/admin/grant', {
      method: 'POST',
      body: JSON.stringify({
        target,
        slot,
        items: [horseItem],
        sendMail,
        subject: `Thần Mã: ${horseRow.n}`,
        text: `Admin đã phát chiến mã [${horseRow.n}] cho bạn.`
      })
    });
    alert(`Đã phát chiến mã [${horseRow.n}] thành công!`);
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}
window.quickGrantHorse = quickGrantHorse;

// 6. Khởi chạy khi load trang
window.addEventListener('load', () => {
  load();

  document.querySelector('#btnReload')?.addEventListener('click', () => load());
  document.querySelector('#userSearch')?.addEventListener('input', renderUsers);
  document.querySelector('#filterOnline')?.addEventListener('change', renderUsers);
  document.querySelector('#btnClearSearch')?.addEventListener('click', () => {
    const s = document.querySelector('#userSearch');
    if (s) s.value = '';
    const f = document.querySelector('#filterOnline');
    if (f) f.checked = false;
    renderUsers();
  });

  document.querySelectorAll('input[name="grantMethod"]').forEach(r => {
    r.addEventListener('change', () => {
      const isMail = document.querySelector('#grantMethodMail')?.checked;
      const opts = document.querySelector('#grantMailOptions');
      if (opts) opts.style.display = isMail ? 'flex' : 'none';
    });
  });

  setInterval(() => {
    if (document.querySelector('#autoRefresh')?.checked) {
      load(true);
    }
  }, 5000);

  initCustomItemCreator();
  loadSimbotStatus();
});

// 7. Quản lý trạng thái Simbot (Bật / Tắt Bot ảo)
let simbotCurrentEnabled = true;

async function loadSimbotStatus() {
  try {
    const res = await api('/api/admin/simbot');
    if (res && typeof res.enabled === 'boolean') {
      simbotCurrentEnabled = res.enabled;
      renderSimbotUI(simbotCurrentEnabled);
    }
  } catch (err) {
    console.error('Không thể lấy trạng thái simbot:', err);
  }
}

function renderSimbotUI(enabled) {
  const badge = document.querySelector('#simbotStatusBadge');
  const btn = document.querySelector('#btnToggleSimbot');
  if (badge) {
    if (enabled) {
      badge.textContent = '● ĐANG BẬT';
      badge.style.background = '#064e3b';
      badge.style.color = '#34d399';
      badge.style.borderColor = '#059669';
    } else {
      badge.textContent = '○ ĐÃ TẮT';
      badge.style.background = '#450a0a';
      badge.style.color = '#f87171';
      badge.style.borderColor = '#dc2626';
    }
  }
  if (btn) {
    if (enabled) {
      btn.innerHTML = '🛑 Tắt Simbot';
      btn.style.background = '#dc2626';
      btn.style.borderColor = '#ef4444';
      btn.style.color = '#ffffff';
    } else {
      btn.innerHTML = '▶ Bật Simbot';
      btn.style.background = '#16a34a';
      btn.style.borderColor = '#22c55e';
      btn.style.color = '#ffffff';
    }
  }
}

async function toggleSimbot() {
  const btn = document.querySelector('#btnToggleSimbot');
  const nextState = !simbotCurrentEnabled;
  const actionText = nextState ? 'BẬT' : 'TẮT';
  if (!confirm(`Bạn có chắc chắn muốn ${actionText} toàn bộ hệ thống Simbot (cả ngoài bãi quái và kênh chat)?`)) {
    return;
  }

  if (btn) btn.disabled = true;
  try {
    const res = await api('/api/admin/simbot', {
      method: 'POST',
      body: JSON.stringify({ enabled: nextState })
    });
    if (res && typeof res.enabled === 'boolean') {
      simbotCurrentEnabled = res.enabled;
      renderSimbotUI(simbotCurrentEnabled);
      try {
        localStorage.setItem('jx_simbot_enabled', res.enabled ? '1' : '0');
      } catch (e) {}
      alert(`Đã ${actionText} hệ thống Simbot thành công!`);
    }
  } catch (err) {
    alert('Lỗi thao tác Simbot: ' + err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}
window.toggleSimbot = toggleSimbot;
window.loadSimbotStatus = loadSimbotStatus;

/* ============================================================================
   XÓA TÀI KHOẢN NGƯỜI CHƠI (TỪNG TÀI KHOẢN HOẶC TẤT CẢ ACC CŨ)
   ============================================================================ */
async function wipeAllOldUsers() {
  const nonAdminCount = allLoadedUsers.filter(u => u.role !== 'admin').length;
  if (nonAdminCount === 0) {
    alert('Hiện không có tài khoản người chơi nào cần xóa (chỉ còn tài khoản Admin).');
    return;
  }
  const confirmed = confirm(
    `⚠ CẢNH BÁO XÓA TÀI KHOẢN:\n\n` +
    `Bạn có chắc chắn muốn XÓA TẤT CẢ ${nonAdminCount} TÀI KHOẢN NGƯỜI CHƠI CŨ?\n\n` +
    `• Toàn bộ nhân vật, trang bị, cấp độ cũ sẽ bị xóa sạch để làm mới máy chủ.\n` +
    `• Tài khoản Quản Trị Viên (Admin) hiện tại SẼ ĐƯỢC GIỮ NGUYÊN AN TOÀN.\n\n` +
    `Nhấn OK để thực hiện.`
  );
  if (!confirmed) return;

  const btn = document.querySelector('#btnWipeOldUsers');
  if (btn) btn.disabled = true;
  try {
    const res = await api('/api/admin/users/wipe', { method: 'POST' });
    alert(`✔ Thành công: Đã xóa ${res.deleted} tài khoản cũ!\nMáy chủ đã được làm mới sạch sẽ (còn lại ${res.remaining} tài khoản admin).`);
    currentSelectedUser = null;
    const uidInput = document.querySelector('#uid');
    if (uidInput) uidInput.value = '';
    const statusEl = document.querySelector('#userStatusTag');
    if (statusEl) statusEl.textContent = 'Chưa chọn người chơi';
    await load(true);
    await refreshRankingAdmin(true);
  } catch (err) {
    alert('Lỗi khi xóa tài khoản: ' + err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}
window.wipeAllOldUsers = wipeAllOldUsers;

async function resetAllCharactersProgress() {
  const confirmed = confirm(
    `⚠ XÁC NHẬN RESET TIẾN ĐỘ TOÀN SERVER:\n\n` +
    `Bạn có chắc chắn muốn RESET TOÀN BỘ NHÂN VẬT về:\n` +
    `• Cấp độ: Lv.1 (XP = 0, tiềm năng & kỹ năng làm mới về gốc)\n` +
    `• Ngân lượng (Tiền vạn): 0 lượng\n` +
    `• Tiến độ ải: Ải 1 (Tầng 1)\n\n` +
    `Tài khoản, tên nhân vật, vật phẩm và KNB vẫn được giữ nguyên an toàn.\n\n` +
    `Nhấn OK để thực hiện ngay!`
  );
  if (!confirmed) return;

  try {
    const res = await api('/api/admin/users/reset-progress', { method: 'POST' });
    alert(`✔ Thành công: Đã reset Cấp 1, 0 vạn, Ải 1 cho toàn bộ ${res.resetCount} nhân vật trên server!`);
    await load(true);
    if (typeof refreshRankingAdmin === 'function') await refreshRankingAdmin(true);
  } catch (err) {
    alert('Lỗi khi reset tiến độ: ' + err.message);
  }
}
window.resetAllCharactersProgress = resetAllCharactersProgress;

async function deleteSingleUser(id, username) {
  const confirmed = confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}"?\nNhân vật của tài khoản này sẽ bị xóa vĩnh viễn khỏi máy chủ.`);
  if (!confirmed) return;

  try {
    await api('/api/admin/users/' + id, { method: 'DELETE' });
    if (currentSelectedUser?.id === id) {
      currentSelectedUser = null;
      const uidInput = document.querySelector('#uid');
      if (uidInput) uidInput.value = '';
      const statusEl = document.querySelector('#userStatusTag');
      if (statusEl) statusEl.textContent = 'Chưa chọn người chơi';
    }
    await load(true);
    await refreshRankingAdmin(true);
    alert(`✔ Đã xóa tài khoản "${username}" thành công!`);
  } catch (err) {
    alert('Lỗi xóa tài khoản: ' + err.message);
  }
}
window.deleteSingleUser = deleteSingleUser;

async function toggleLockUser(id, username, currentlyLocked) {
  const confirmMsg = currentlyLocked
    ? `Bạn có chắc chắn muốn MỞ KHÓA tài khoản "${username}"?\nNgười chơi sẽ có thể đăng nhập lại vào game.`
    : `Bạn có chắc chắn muốn KHÓA tài khoản "${username}"?\nNgười chơi sẽ bị ngắt kết nối (kick) ngay lập tức và không thể đăng nhập!`;
  if (!confirm(confirmMsg)) return;

  let reason = '';
  if (!currentlyLocked) {
    reason = prompt('Nhập lý do khóa tài khoản (bung level / gian lận):', 'Bung level / gian lận') || 'Bung level / gian lận';
  }

  try {
    const res = await api('/api/admin/users/' + id + '/lock', {
      method: 'POST',
      body: JSON.stringify({ locked: !currentlyLocked, reason })
    });
    alert(res.message || (res.locked ? `✔ Đã KHÓA tài khoản "${username}" thành công!` : `✔ Đã MỞ KHÓA tài khoản "${username}" thành công!`));
    await load(true);
    if (typeof refreshRankingAdmin === 'function') await refreshRankingAdmin(true);
    if (currentSelectedUser?.id === id) {
      pick(id);
    }
  } catch (err) {
    alert('Lỗi thao tác khóa tài khoản: ' + err.message);
  }
}
window.toggleLockUser = toggleLockUser;

function toggleLockSelectedUser() {
  if (!currentSelectedUser) return alert('Vui lòng chọn một người chơi trước!');
  toggleLockUser(currentSelectedUser.id, currentSelectedUser.username, !!currentSelectedUser.locked);
}
window.toggleLockSelectedUser = toggleLockSelectedUser;

function pickAndSelectSlot(userId, slot) {
  pick(userId);
  if (slot) selectSlot(slot);
}
window.pickAndSelectSlot = pickAndSelectSlot;

/* ============================================================================
   QUẢN LÝ BẢNG XẾP HẠNG & CẬP NHẬT HẠNG TRONG ADMIN
   ============================================================================ */
let adminRankingList = [];
let adminRankSort = 'lvl'; // 'lvl' | 'stage' | 'gold'

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

function setRankSort(sort) {
  adminRankSort = sort;
  ['lvl', 'stage', 'gold'].forEach(s => {
    const btn = document.querySelector('#rankTab' + s.charAt(0).toUpperCase() + s.slice(1));
    if (btn) {
      if (s === sort) {
        btn.style.background = '#284c3a';
        btn.style.color = '#ffd24a';
        btn.style.borderColor = '#ffd24a';
      } else {
        btn.style.background = '#182e23';
        btn.style.color = '#c9ded3';
        btn.style.borderColor = '#365042';
      }
    }
  });
  renderRankingAdmin();
}
window.setRankSort = setRankSort;

async function loadRankingAdmin(silent = false) {
  try {
    const res = await api('/api/admin/ranking');
    adminRankingList = res.ranking || [];
    renderRankingAdmin();
  } catch (err) {
    if (!silent) console.warn('Lỗi tải BXH:', err);
  }
}
window.loadRankingAdmin = loadRankingAdmin;

async function refreshRankingAdmin(silent = false) {
  const btn = document.querySelector('#btnRefreshRanking');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Đang tính toán...';
  }
  try {
    const res = await api('/api/admin/ranking', { method: 'POST' });
    adminRankingList = res.ranking || [];
    renderRankingAdmin();
    if (!silent) {
      alert(`✔ Cập nhật Hạng thành công! Đã tính toán và đồng bộ thứ hạng của ${adminRankingList.length} nhân vật.`);
    }
  } catch (err) {
    alert('Lỗi cập nhật hạng: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🔄 Cập Nhật Hạng';
    }
  }
}
window.refreshRankingAdmin = refreshRankingAdmin;

function renderRankingAdmin() {
  const tbody = document.querySelector('#rankingTableBody');
  const countEl = document.querySelector('#rankCountInfo');
  if (!tbody) return;

  const facFilter = document.querySelector('#rankFacFilter')?.value || 'all';
  const query = (document.querySelector('#rankSearchInput')?.value || '').trim().toLowerCase();

  let list = [...adminRankingList];
  if (facFilter !== 'all') {
    list = list.filter(x => x.fac === facFilter);
  }
  if (query) {
    list = list.filter(x => (x.name && x.name.toLowerCase().includes(query)) || (x.username && x.username.toLowerCase().includes(query)));
  }

  if (adminRankSort === 'lvl') {
    list.sort((a, b) => b.lvl - a.lvl || b.stage - a.stage || b.gold - a.gold);
  } else if (adminRankSort === 'stage') {
    list.sort((a, b) => b.stage - a.stage || b.lvl - a.lvl || b.gold - a.gold);
  } else if (adminRankSort === 'gold') {
    list.sort((a, b) => b.gold - a.gold || b.lvl - a.lvl);
  }

  if (countEl) {
    countEl.textContent = `Hiển thị: ${list.length} / ${adminRankingList.length} nhân vật`;
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:18px;color:#8bb098">Chưa có dữ liệu xếp hạng phù hợp.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((item, idx) => {
    const rankNum = idx + 1;
    let badge = `<b style="color:#94a3b8">#${rankNum}</b>`;
    if (rankNum === 1) badge = `<span style="background:linear-gradient(180deg,#f59e0b,#b45309);color:#fff;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:12px;box-shadow:0 0 8px rgba(245,158,11,0.5)">🥇 1</span>`;
    else if (rankNum === 2) badge = `<span style="background:linear-gradient(180deg,#94a3b8,#475569);color:#fff;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:12px">🥈 2</span>`;
    else if (rankNum === 3) badge = `<span style="background:linear-gradient(180deg,#d97706,#78350f);color:#fff;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:12px">🥉 3</span>`;

    const facName = FACTION_NAMES[item.fac] || item.fac || 'Chưa vào phái';
    const facColor = FACTION_COLORS[item.fac] || '#ffd24a';
    const goldTxt = Number(item.gold || 0) >= 10000
      ? (Number(item.gold) / 10000).toFixed(1).replace(/\.0$/, '') + ' vạn'
      : Number(item.gold || 0).toLocaleString('vi-VN') + ' lượng';

    const lockedBadge = item.locked
      ? `<span style="background:#7f1d1d;color:#fca5a5;padding:1px 6px;border-radius:4px;font-size:11px;margin-left:6px;border:1px solid #dc2626;font-weight:bold">🔒 ĐÃ KHÓA</span>`
      : '';

    return `<tr style="${item.locked ? 'background:rgba(220,38,38,0.1)' : ''}">
      <td style="text-align:center">${badge}</td>
      <td><b style="color:#ffd24a">${esc(item.name)}</b>${lockedBadge}</td>
      <td><span style="color:${facColor};font-weight:500">${esc(facName)}</span></td>
      <td style="text-align:center"><b style="color:#44e37a">Lv.${item.lvl}</b></td>
      <td style="text-align:center;color:#93c5fd">Ải ${item.stage}</td>
      <td style="text-align:right;color:#fde047">${goldTxt}</td>
      <td><span style="color:#cbd5e1;font-size:13px">${esc(item.username)}</span></td>
      <td style="text-align:center;white-space:nowrap">
        <div style="display:inline-flex;gap:4px">
          <button type="button" class="quick-btn" onclick="window.pickAndSelectSlot('${item.userId}', ${item.slot})">
            👉 Quản lý
          </button>
          ${item.role !== 'admin' ? `
          <button type="button" class="quick-btn" style="${item.locked ? 'background:#064e3b;border:1px solid #059669;color:#34d399' : 'background:#451212;border:1px solid #b91c1c;color:#fca5a5'}" onclick="window.toggleLockUser('${item.userId}', '${esc(item.username)}', ${!!item.locked})">
            ${item.locked ? '🔓 Mở' : '🔒 Khóa'}
          </button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}
/* ============================================================================
   QUẢN LÝ BẢO TRÌ MÁY CHỦ (MAINTENANCE MODE)
   ============================================================================ */
let adminMaintenanceState = false;

async function loadMaintenanceAdmin() {
  try {
    const res = await api('/api/admin/maintenance');
    if (res) {
      adminMaintenanceState = Boolean(res.maintenance);
      renderMaintenanceAdminUI();
    }
  } catch (err) {
    console.error('Lỗi tải trạng thái bảo trì:', err);
  }
}

function renderMaintenanceAdminUI() {
  const badge = document.querySelector('#maintStatusBadge');
  const btn = document.querySelector('#btnToggleMaintenance');
  if (badge) {
    if (adminMaintenanceState) {
      badge.textContent = '🔴 ĐANG BẢO TRÌ UPDATE (Đã khóa người chơi ngoài)';
      badge.style.background = '#450a0a';
      badge.style.color = '#fca5a5';
      badge.style.border = '1px solid #ef4444';
    } else {
      badge.textContent = '🟢 Hoạt Động Bình Thường (Người chơi vào game)';
      badge.style.background = '#064e3b';
      badge.style.color = '#34d399';
      badge.style.border = '1px solid #10b981';
    }
  }
  if (btn) {
    if (adminMaintenanceState) {
      btn.textContent = '🔓 Tắt Bảo Trì (Mở Game Cho Người Chơi)';
      btn.style.background = '#065f46';
      btn.style.borderColor = '#10b981';
      btn.style.color = '#fff';
    } else {
      btn.textContent = '🛑 BẬT BẢO TRÌ NGAY (Khóa Vào Game Để Update)';
      btn.style.background = '#dc2626';
      btn.style.borderColor = '#ef4444';
      btn.style.color = '#fff';
    }
  }
}

async function toggleMaintenanceAdmin() {
  const next = !adminMaintenanceState;
  const msg = next
    ? 'Bạn có chắc chắn muốn BẬT BẢO TRÌ?\nNgười chơi bên ngoài (volamh5.top) sẽ thấy Bảng Thông Báo Bảo Trì và không thể vào game.\nBạn vẫn có thể vào game test trên Local (localhost:8092).'
    : 'Bạn có chắc chắn muốn TẮT BẢO TRÌ?\nMáy chủ sẽ mở lại cho tất cả người chơi bình thường.';
  if (!confirm(msg)) return;

  try {
    const res = await api('/api/admin/maintenance', {
      method: 'POST',
      body: JSON.stringify({ enabled: next })
    });
    adminMaintenanceState = Boolean(res.maintenance);
    renderMaintenanceAdminUI();
    alert(adminMaintenanceState ? '✔ Đã BẬT BẢO TRÌ thành công! Người chơi bên ngoài đã bị khóa vào game.' : '✔ Đã TẮT BẢO TRÌ! Máy chủ đã mở lại cho người chơi.');
  } catch (err) {
    alert('Lỗi chuyển trạng thái bảo trì: ' + err.message);
  }
}
window.toggleMaintenanceAdmin = toggleMaintenanceAdmin;
window.loadMaintenanceAdmin = loadMaintenanceAdmin;

/* ============================================================================
   QUẢN LÝ MỞ SERVER (OPEN SERVER 13H30)
   ============================================================================ */
let serverOpenState = null;
let serverOpenInterval = null;

async function loadServerOpenAdmin() {
  try {
    const res = await api('/api/admin/server-open');
    if (res) {
      serverOpenState = res;
      renderServerOpenAdminUI();
    }
  } catch (err) {
    console.error('Lỗi tải trạng thái mở server:', err);
  }
}

function renderServerOpenAdminUI() {
  if (!serverOpenState) return;
  const badge = document.querySelector('#serverOpenBadge');
  const btn = document.querySelector('#btnToggleForceOpen');
  const input = document.querySelector('#inputOpenTime');
  const cdEl = document.querySelector('#adminOpenCountdown');

  if (input && serverOpenState.openTime && !input.matches(':focus')) {
    input.value = serverOpenState.openTime;
  }

  const isOpen = serverOpenState.open;
  if (badge) {
    if (isOpen) {
      badge.textContent = '🟢 Đã Mở Server (Ải Đang Mở)';
      badge.style.background = '#064e3b';
      badge.style.color = '#34d399';
      badge.style.border = '1px solid #10b981';
    } else {
      badge.textContent = '🔴 Đang Khóa Ải (Chờ Open)';
      badge.style.background = '#451a03';
      badge.style.color = '#fca5a5';
      badge.style.border = '1px solid #dc2626';
    }
  }

  if (btn) {
    if (serverOpenState.forceOpen) {
      btn.textContent = 'Khóa Lại (Hủy Force Open)';
      btn.className = 'btn-sub';
    } else {
      btn.textContent = 'Mở Ngay (Force Open)';
      btn.className = 'btn-primary';
    }
  }

  if (cdEl) {
    if (isOpen) {
      cdEl.textContent = '✅ Máy chủ đang trong trạng thái OPEN!';
      cdEl.style.color = '#34d399';
    } else {
      const target = new Date(serverOpenState.openTime).getTime();
      const diff = target - Date.now();
      if (diff > 0) {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        cdEl.textContent = `⏳ Đếm ngược: ${h > 0 ? h + ' giờ ' : ''}${m} phút ${s < 10 ? '0' + s : s} giây`;
        cdEl.style.color = '#38bdf8';
      } else {
        cdEl.textContent = '⏰ Đã đến giờ Open!';
        cdEl.style.color = '#fde047';
      }
    }
  }

  if (!serverOpenInterval) {
    serverOpenInterval = setInterval(() => {
      renderServerOpenAdminUI();
    }, 1000);
  }
}

async function toggleForceOpenServer() {
  if (!serverOpenState) return;
  const nextForce = !serverOpenState.forceOpen;
  const msg = nextForce ? 'MỞ SERVER NGAY LẬP TỨC (Bỏ qua đếm ngược 13h30)' : 'ĐÓNG / KHÓA LẠI ẢI (Đợi đến đúng giờ)';
  if (!confirm(`Bạn có chắc chắn muốn ${msg}?`)) return;

  try {
    const res = await api('/api/admin/server-open', {
      method: 'POST',
      body: JSON.stringify({ forceOpen: nextForce })
    });
    if (res && res.ok) {
      serverOpenState = res;
      renderServerOpenAdminUI();
      alert(`Đã cập nhật: ${nextForce ? 'Server đã mở ngay lập tức!' : 'Đã khóa lại theo giờ đếm ngược!'}`);
    }
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

async function saveServerOpenTime() {
  const input = document.querySelector('#inputOpenTime');
  if (!input) return;
  const val = input.value.trim();
  if (!val) {
    alert('Vui lòng nhập định dạng thời gian (ví dụ: 2026-10-10T13:30:00+07:00)');
    return;
  }
  try {
    const res = await api('/api/admin/server-open', {
      method: 'POST',
      body: JSON.stringify({ openTime: val })
    });
    if (res && res.ok) {
      serverOpenState = res;
      renderServerOpenAdminUI();
      alert('Đã cập nhật thời gian mở server thành: ' + val);
    }
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

window.loadServerOpenAdmin = loadServerOpenAdmin;
window.renderServerOpenAdminUI = renderServerOpenAdminUI;
window.toggleForceOpenServer = toggleForceOpenServer;
window.saveServerOpenTime = saveServerOpenTime;

// ==========================================
// 8. QUẢN LÝ GIFTCODE (MÃ QUÀ TẶNG DÙNG 1 LẦN)
// ==========================================
let allLoadedGiftCodes = [];

function generateRandomCodeStr(prefix = 'TTL') {
  const p = (prefix || 'TTL').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'TTL';
  const r1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const r2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${p}-${r1}-${r2}`;
}

function generateRandomGcCodeInput() {
  const kind = document.querySelector('#customGcKind')?.value || 'ttl_knb';
  const prefix = kind === 'ttl_knb' ? 'TTL' : (kind === 'kimphong' ? 'KP' : 'GIFT');
  const code = generateRandomCodeStr(prefix);
  const input = document.querySelector('#customGcCode');
  if (input) input.value = code;
}

function copyGiftCode(code) {
  if (!code) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      showGcQuickStatus(`📋 Đã sao chép mã "${code}" vào bộ nhớ tạm!`);
    }).catch(() => fallbackCopy(code));
  } else {
    fallbackCopy(code);
  }
}

function fallbackCopy(code) {
  const ta = document.createElement('textarea');
  ta.value = code;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showGcQuickStatus(`📋 Đã sao chép mã "${code}"!`);
  } catch (e) {
    prompt('Sao chép mã này:', code);
  }
  document.body.removeChild(ta);
}

function showGcQuickStatus(msg, isError = false) {
  const el = document.querySelector('#giftCodeQuickStatus');
  if (!el) return;
  el.style.color = isError ? '#f87171' : '#44e37a';
  el.textContent = msg;
  setTimeout(() => {
    if (el.textContent === msg) el.textContent = '';
  }, 4000);
}

async function loadGiftCodesAdmin(silent = false) {
  try {
    const res = await api('/api/admin/gift-codes');
    allLoadedGiftCodes = Array.isArray(res.codes) ? res.codes : [];
    renderGiftCodesAdmin();
  } catch (err) {
    if (!silent) console.error('Lỗi tải danh sách giftcode:', err);
  }
}

function renderGiftCodesAdmin() {
  const tbody = document.querySelector('#giftCodesTableBody');
  const totalInfo = document.querySelector('#gcTotalInfo');
  if (!tbody) return;

  const q = (document.querySelector('#gcSearchInput')?.value || '').trim().toLowerCase();
  const filterStatus = document.querySelector('#gcFilterStatus')?.value || 'all';

  const filtered = allLoadedGiftCodes.filter(c => {
    const used = Number(c.used) || 0;
    const max = Number(c.maxUses) || 1;
    const isExhausted = used >= max;
    const isActive = c.active !== false;

    if (filterStatus === 'available' && (!isActive || isExhausted)) return false;
    if (filterStatus === 'used' && !isExhausted) return false;
    if (filterStatus === 'disabled' && isActive) return false;

    if (!q) return true;
    if (c.code && c.code.toLowerCase().includes(q)) return true;
    if (c.kind && c.kind.toLowerCase().includes(q)) return true;
    if (Array.isArray(c.usedBy) && c.usedBy.some(u => (u.username && u.username.toLowerCase().includes(q)) || (u.charName && u.charName.toLowerCase().includes(q)))) return true;
    return false;
  });

  if (totalInfo) {
    const availableCount = allLoadedGiftCodes.filter(c => c.active !== false && (Number(c.used) || 0) < (Number(c.maxUses) || 1)).length;
    totalInfo.textContent = `Tổng: ${allLoadedGiftCodes.length} mã · Còn hiệu lực: ${availableCount}`;
  }

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:16px;color:#a855f7">Không có mã giftcode nào phù hợp.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const used = Number(c.used) || 0;
    const max = Number(c.maxUses) || 1;
    const isExhausted = used >= max;
    const isActive = c.active !== false;

    let statusBadge = '';
    if (!isActive) {
      statusBadge = `<span style="padding:2px 8px;border-radius:12px;font-size:11px;background:#3b1e22;color:#fca5a5;border:1px solid #991b1b">Đã tắt</span>`;
    } else if (isExhausted) {
      statusBadge = `<span style="padding:2px 8px;border-radius:12px;font-size:11px;background:#262626;color:#a3a3a3;border:1px solid #525252">Đã dùng (${used}/${max})</span>`;
    } else {
      statusBadge = `<span style="padding:2px 8px;border-radius:12px;font-size:11px;background:#064e3b;color:#34d399;border:1px solid #059669">Còn lượt (${used}/${max})</span>`;
    }

    let rewardName = '';
    if (c.kind === 'vip') {
      rewardName = `<b style="color:#f59e0b">👑 Code VIP</b>: <span style="color:#c084fc">10 TTL</span> + <span style="color:#facc15">10 KNB</span> + <span style="color:#38bdf8">Ngựa Chiếu Dạ</span>`;
    } else if (c.kind === 'tanthu' || c.kind === 'ttl_knb') {
      rewardName = `<b style="color:#34d399">🌿 Code Tân Thủ</b>: <span style="color:#c084fc">${c.ttl || 5} TTL</span> + <span style="color:#facc15">${c.knb || 5} KNB</span>`;
    } else if (c.kind === 'kimphong') {
      rewardName = `<b style="color:#fbbf24">Bộ Kim Phong (9 món)</b> + 5 TTL + 5 KNB`;
    } else if (c.kind === 'faction') {
      rewardName = `<b style="color:#60a5fa">Bộ Hoàng Kim Môn Phái</b>`;
    } else if (c.kind === 'set') {
      rewardName = `<b style="color:#34d399">Bộ An Bang / Định Quốc</b>`;
    } else {
      rewardName = esc(c.kind);
    }

    let usedByHtml = '<span style="color:#6b7280;font-size:12px">Chưa ai dùng</span>';
    if (Array.isArray(c.usedBy) && c.usedBy.length) {
      usedByHtml = c.usedBy.map(u => {
        const timeStr = u.at ? new Date(u.at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
        return `<span style="display:block;font-size:12px;color:#d8b4fe">👤 <b>${esc(u.username)}</b>${u.charName ? ` (${esc(u.charName)})` : ''} <small style="color:#9ca3af">${timeStr}</small></span>`;
      }).join('');
    }

    return `
      <tr style="transition:background 0.15s">
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-family:monospace;font-size:14px;font-weight:bold;color:#facc15;letter-spacing:0.5px">${esc(c.code)}</span>
            <button type="button" class="quick-btn" onclick="window.copyGiftCode('${esc(c.code)}')" title="Sao chép mã" style="padding:2px 6px;font-size:11px">📋 Copy</button>
          </div>
        </td>
        <td style="font-size:13px">${rewardName}</td>
        <td style="text-align:center;font-weight:bold;color:${isExhausted ? '#9ca3af' : '#44e37a'}">${used} / ${max}</td>
        <td>${usedByHtml}</td>
        <td style="text-align:center">${statusBadge}</td>
        <td style="text-align:center;white-space:nowrap">
          <button type="button" class="quick-btn" onclick="window.toggleGiftCode('${c.id}', ${!isActive})" style="padding:3px 7px;font-size:11px;color:${isActive ? '#fca5a5' : '#34d399'}">
            ${isActive ? 'Tắt' : 'Bật'}
          </button>
          <button type="button" class="quick-btn" onclick="window.deleteGiftCode('${c.id}', '${esc(c.code)}')" style="padding:3px 7px;font-size:11px;color:#f87171;background:#3b1e22;border-color:#991b1b;margin-left:4px" title="Xóa mã này">
            🗑 Xóa
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function quickCreateSingleTtlCode() {
  const code = generateRandomCodeStr('TANTHU');
  try {
    const res = await api('/api/admin/gift-codes', {
      method: 'POST',
      body: JSON.stringify({
        code,
        kind: 'tanthu',
        maxUses: 1,
        ttl: 5,
        knb: 5
      })
    });
    if (res && res.code) {
      allLoadedGiftCodes.unshift(res.code);
      renderGiftCodesAdmin();
      copyGiftCode(res.code.code);
      showGcQuickStatus(`🎉 Đã tạo thành công Code Tân Thủ: ${res.code.code} (Đã tự động Copy)`);
    }
  } catch (err) {
    alert('Lỗi tạo mã: ' + err.message);
  }
}

async function quickBatchCreateTtlCodes(count = 5) {
  try {
    const res = await api('/api/admin/gift-codes', {
      method: 'POST',
      body: JSON.stringify({
        count,
        prefix: 'TANTHU',
        kind: 'tanthu',
        maxUses: 1,
        ttl: 5,
        knb: 5
      })
    });
    if (res && Array.isArray(res.codes)) {
      allLoadedGiftCodes.unshift(...res.codes);
      renderGiftCodesAdmin();
      const codeList = res.codes.map(c => c.code).join('\n');
      copyGiftCode(codeList);
      showGcQuickStatus(`🎉 Đã tạo ${res.codes.length} Code Tân Thủ (Đã copy toàn bộ mã)!`);
    }
  } catch (err) {
    alert('Lỗi tạo hàng loạt: ' + err.message);
  }
}

async function quickCreateSingleVipCode() {
  const code = generateRandomCodeStr('VIP');
  try {
    const res = await api('/api/admin/gift-codes', {
      method: 'POST',
      body: JSON.stringify({
        code,
        kind: 'vip',
        maxUses: 1,
        ttl: 10,
        knb: 10
      })
    });
    if (res && res.code) {
      allLoadedGiftCodes.unshift(res.code);
      renderGiftCodesAdmin();
      copyGiftCode(res.code.code);
      showGcQuickStatus(`👑 Đã tạo thành công Code VIP: ${res.code.code} (Đã tự động Copy)`);
    }
  } catch (err) {
    alert('Lỗi tạo mã: ' + err.message);
  }
}

async function quickBatchCreateVipCodes(count = 5) {
  try {
    const res = await api('/api/admin/gift-codes', {
      method: 'POST',
      body: JSON.stringify({
        count,
        prefix: 'VIP',
        kind: 'vip',
        maxUses: 1,
        ttl: 10,
        knb: 10
      })
    });
    if (res && Array.isArray(res.codes)) {
      allLoadedGiftCodes.unshift(...res.codes);
      renderGiftCodesAdmin();
      const codeList = res.codes.map(c => c.code).join('\n');
      copyGiftCode(codeList);
      showGcQuickStatus(`👑 Đã tạo ${res.codes.length} Code VIP (Đã copy toàn bộ mã)!`);
    }
  } catch (err) {
    alert('Lỗi tạo hàng loạt: ' + err.message);
  }
}

async function createCustomGiftCode() {
  let code = (document.querySelector('#customGcCode')?.value || '').trim().toUpperCase();
  const kind = document.querySelector('#customGcKind')?.value || 'tanthu';
  const maxUses = Math.max(1, Math.floor(Number(document.querySelector('#customGcMaxUses')?.value) || 1));

  if (!code) {
    const prefix = kind === 'vip' ? 'VIP' : (kind === 'tanthu' || kind === 'ttl_knb' ? 'TANTHU' : (kind === 'kimphong' ? 'KP' : 'GIFT'));
    code = generateRandomCodeStr(prefix);
  }

  try {
    const res = await api('/api/admin/gift-codes', {
      method: 'POST',
      body: JSON.stringify({
        code,
        kind,
        maxUses,
        ttl: kind === 'vip' ? 10 : 5,
        knb: kind === 'vip' ? 10 : 5
      })
    });
    if (res && res.code) {
      allLoadedGiftCodes.unshift(res.code);
      renderGiftCodesAdmin();
      copyGiftCode(res.code.code);
      const input = document.querySelector('#customGcCode');
      if (input) input.value = '';
      showGcQuickStatus(`🎉 Đã tạo mã: ${res.code.code} (${maxUses} lượt dùng)!`);
    }
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

async function toggleGiftCode(id, nextActive) {
  try {
    const res = await api(`/api/admin/gift-codes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: nextActive })
    });
    if (res && res.code) {
      const idx = allLoadedGiftCodes.findIndex(c => c.id === id);
      if (idx !== -1) allLoadedGiftCodes[idx] = res.code;
      renderGiftCodesAdmin();
    }
  } catch (err) {
    alert('Lỗi cập nhật mã: ' + err.message);
  }
}

async function deleteGiftCode(id, code) {
  if (!confirm(`Bạn có chắc chắn muốn xóa mã "${code}" khỏi hệ thống?`)) return;
  try {
    await api(`/api/admin/gift-codes/${id}`, { method: 'DELETE' });
    allLoadedGiftCodes = allLoadedGiftCodes.filter(c => c.id !== id);
    renderGiftCodesAdmin();
    showGcQuickStatus(`🗑 Đã xóa mã "${code}"`);
  } catch (err) {
    alert('Lỗi xóa mã: ' + err.message);
  }
}

window.loadGiftCodesAdmin = loadGiftCodesAdmin;
window.renderGiftCodesAdmin = renderGiftCodesAdmin;
window.generateRandomGcCodeInput = generateRandomGcCodeInput;
window.copyGiftCode = copyGiftCode;
window.quickCreateSingleTtlCode = quickCreateSingleTtlCode;
window.quickBatchCreateTtlCodes = quickBatchCreateTtlCodes;
window.quickCreateSingleVipCode = quickCreateSingleVipCode;
window.quickBatchCreateVipCodes = quickBatchCreateVipCodes;
window.createCustomGiftCode = createCustomGiftCode;
window.toggleGiftCode = toggleGiftCode;
window.deleteGiftCode = deleteGiftCode;

// --- QUẢN LÝ KỲ TRÂN CÁC (ADMIN) ---
let allLoadedKtcCatalog = [];

async function loadKtcCatalogAdmin() {
  try {
    const res = await api('/api/admin/ktc-catalog');
    allLoadedKtcCatalog = res.items || [];
    renderKtcCatalogAdmin();
  } catch (err) {
    console.error('Lỗi tải Kỳ Trân Các:', err);
  }
}

function renderKtcCatalogAdmin() {
  const tbody = document.getElementById('ktcCatalogTableBody');
  if (!tbody) return;
  if (!allLoadedKtcCatalog.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#8bb098">Chưa có mặt hàng nào trên Kỳ Trân Các.</td></tr>';
    return;
  }

  tbody.innerHTML = allLoadedKtcCatalog.map((item, idx) => `
    <tr style="border-bottom:1px solid #233e31;background:${item.active ? 'transparent' : '#221111'}">
      <td style="text-align:center;padding:6px">
        <img src="${item.ic ? (item.ic.startsWith('/') ? item.ic : '/' + item.ic) : '/img/ep/tt.png'}" style="width:28px;height:28px;object-fit:contain;border:1px solid #555;border-radius:4px" onerror="this.src='/img/ep/tt.png'">
      </td>
      <td style="padding:6px">
        <input type="text" value="${item.n || ''}" onchange="window.updateKtcField(${idx}, 'n', this.value)" style="width:100%;font-size:12.5px;font-weight:bold;color:#ffd24a;background:#060f0b;border:1px solid #365042">
      </td>
      <td style="text-align:center;padding:6px;font-family:monospace;color:#38bdf8;font-size:12px">
        ${item.k || ''}
      </td>
      <td style="text-align:center;padding:6px">
        <select onchange="window.updateKtcField(${idx}, 'priceType', this.value)" style="font-size:12px;background:#060f0b;border:1px solid #365042;color:#fff">
          <option value="knb" ${item.priceType === 'knb' ? 'selected' : ''}>Kim Nguyên Bảo</option>
          <option value="gold" ${item.priceType === 'gold' ? 'selected' : ''}>Tiền Vạn (Lượng)</option>
        </select>
      </td>
      <td style="text-align:center;padding:6px">
        <input type="number" min="0" value="${item.price || 0}" onchange="window.updateKtcField(${idx}, 'price', Number(this.value))" style="width:100px;font-size:13px;font-weight:bold;color:#44e37a;text-align:right;background:#060f0b;border:1px solid #365042">
      </td>
      <td style="padding:6px">
        <input type="text" value="${item.d || ''}" onchange="window.updateKtcField(${idx}, 'd', this.value)" style="width:100%;font-size:11.5px;color:#a8c7b0;background:#060f0b;border:1px solid #365042">
      </td>
      <td style="text-align:center;padding:6px">
        <input type="checkbox" ${item.active ? 'checked' : ''} onchange="window.updateKtcField(${idx}, 'active', this.checked)">
      </td>
      <td style="text-align:center;padding:6px">
        <button type="button" onclick="window.deleteKtcItemAdmin(${idx})" style="background:#451212;border:1px solid #b91c1c;color:#fca5a5;padding:2px 8px;font-size:11px;border-radius:4px;cursor:pointer">Xóa</button>
      </td>
    </tr>
  `).join('');
}

function updateKtcField(idx, field, value) {
  if (allLoadedKtcCatalog[idx]) {
    allLoadedKtcCatalog[idx][field] = value;
  }
}

function addKtcItemAdmin() {
  const nameInput = document.getElementById('newKtcName');
  const keyInput = document.getElementById('newKtcKey');
  const typeSelect = document.getElementById('newKtcPriceType');
  const priceInput = document.getElementById('newKtcPrice');
  const iconInput = document.getElementById('newKtcIcon');
  const descInput = document.getElementById('newKtcDesc');

  const n = (nameInput?.value || '').trim();
  const k = (keyInput?.value || '').trim();
  if (!n || !k) {
    alert('Vui lòng nhập tên và mã key vật phẩm!');
    return;
  }

  const priceType = typeSelect?.value || 'knb';
  const price = Math.max(0, Math.floor(Number(priceInput?.value) || 0));
  const ic = (iconInput?.value || 'img/ep/tt.png').trim();
  const d = (descInput?.value || '').trim();

  allLoadedKtcCatalog.push({
    k,
    n,
    ic,
    priceType,
    price,
    d,
    active: true
  });

  if (nameInput) nameInput.value = '';
  if (keyInput) keyInput.value = '';
  if (descInput) descInput.value = '';

  renderKtcCatalogAdmin();
}

function deleteKtcItemAdmin(idx) {
  if (confirm(`Xóa mặt hàng "${allLoadedKtcCatalog[idx]?.n}" khỏi Kỳ Trân Các?`)) {
    allLoadedKtcCatalog.splice(idx, 1);
    renderKtcCatalogAdmin();
  }
}

async function saveKtcCatalogAdmin() {
  const btn = document.getElementById('btnSaveKtcCatalog');
  try {
    if (btn) { btn.disabled = true; btn.textContent = 'Đang lưu…'; }
    await api('/api/admin/ktc-catalog', {
      method: 'POST',
      body: JSON.stringify({ items: allLoadedKtcCatalog })
    });
    alert('Đã lưu thành công cấu hình hàng hóa và giá trên Kỳ Trân Các!');
  } catch (err) {
    alert('Lỗi lưu Kỳ Trân Các: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '💾 LƯU THIẾT LẬP KỲ TRÂN CÁC'; }
  }
}

window.loadKtcCatalogAdmin = loadKtcCatalogAdmin;
window.renderKtcCatalogAdmin = renderKtcCatalogAdmin;
window.updateKtcField = updateKtcField;
window.addKtcItemAdmin = addKtcItemAdmin;
window.deleteKtcItemAdmin = deleteKtcItemAdmin;
window.saveKtcCatalogAdmin = saveKtcCatalogAdmin;

// Auto-load on admin init
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadKtcCatalogAdmin, 500);
});



