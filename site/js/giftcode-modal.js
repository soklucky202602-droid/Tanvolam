/* ============================================================================
   GIFTCODE MODAL - VÕ LÂM H5 (BẢN CÔNG THÀNH CHIẾN)
   - Nút Giftcode cạnh nút Cài đặt Auto
   - Nhập mã nhận 5 bình Tiên Thảo Lộ + 5 KNB hoặc trang bị Hoàng Kim
   ============================================================================ */
'use strict';

(function () {
  const zaloUrl = 'https://zalo.me/g/spnv6daqu8lvtilahypo';

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function showModalBox(html, bind) {
    if (typeof window.modal === 'function') {
      window.modal(html, bind);
      return;
    }
    const modalEl = document.getElementById('modal');
    const mBodyEl = document.getElementById('mBody');
    if (modalEl && mBodyEl) {
      mBodyEl.innerHTML = html;
      modalEl.classList.remove('hidden');
      if (typeof bind === 'function') bind();
    }
  }

  function hideModalBox() {
    if (typeof window.closeModal === 'function') {
      window.closeModal();
      return;
    }
    const modalEl = document.getElementById('modal');
    if (modalEl) modalEl.classList.add('hidden');
  }

  function openGiftcodeModal() {
    const html = `
      <div style="text-align:center;max-width:320px;margin:0 auto;padding:6px 0">
        <h3 style="margin:0 0 6px 0;color:#ffd875;font-size:17px;display:flex;align-items:center;justify-content:center;gap:6px">
          <span>🎁</span> <span>Nhập GiftCode Võ Lâm H5</span>
        </h3>
        <p style="font-size:12.5px;color:#d8e2dc;margin:0 0 10px 0;line-height:1.45">
          Nhập mã quà tặng nhận <b>5 Tiên Thảo Lộ (+50% EXP)</b>, <b>5 KNB</b> và trang bị quý.
        </p>

        <!-- Khung quét QR Zalo -->
        <div style="background:#ffffff;padding:6px;border-radius:10px;display:inline-block;box-shadow:0 4px 16px rgba(0,0,0,0.6);margin-bottom:8px;border:2px solid #e6b955">
          <img src="img/zalo-qr.png?v=1" alt="Mã QR Nhóm Zalo Võ Lâm H5" style="display:block;max-width:180px;width:100%;height:auto;border-radius:6px">
        </div>

        <div style="margin-bottom:10px">
          <a href="${zaloUrl}" target="_blank" rel="noopener" class="btn on" style="display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:7px 18px;text-decoration:none;font-weight:bold;font-size:12.5px;border-radius:6px;background:linear-gradient(180deg,#c4372a,#8a1a10);border:1px solid #ff7b62;color:#fff">
            👉 Vào Nhóm Zalo Lấy Code Mới
          </a>
        </div>

        <!-- Ô nhập mã GiftCode -->
        <div style="display:flex;gap:6px;width:100%;box-sizing:border-box">
          <input id="gcCodeInput" type="text" placeholder="Nhập mã code tại đây..." maxlength="32" autocomplete="off" autocapitalize="characters" spellcheck="false"
            style="flex:1;min-width:0;background:#090f0c;border:1.5px solid #cba450;color:#ffe699;padding:9px 12px;border-radius:6px;font-size:13.5px;font-weight:bold;font-family:monospace;outline:none;text-transform:uppercase;box-shadow:inset 0 1px 3px rgba(0,0,0,0.6)" />
          <button id="gcRedeemBtn" class="btn on" style="padding:9px 16px;font-size:13px;font-weight:bold;border-radius:6px;white-space:nowrap;cursor:pointer;background:linear-gradient(180deg,#d4a024,#8c650e);border:1px solid #ffd24a;color:#1c1302">
            Nhận quà
          </button>
        </div>

        <div id="gcStatusMsg" style="font-size:12.5px;margin-top:8px;display:none;min-height:18px;line-height:1.4;font-weight:600"></div>
        <div id="gcChoiceArea" style="display:none;margin-top:10px;text-align:left;background:#131c18;border:1px solid #3c4b44;border-radius:6px;padding:10px"></div>
      </div>
    `;

    showModalBox(html, () => {
      const input = document.querySelector('#gcCodeInput');
      const redeemBtn = document.querySelector('#gcRedeemBtn');
      const statusEl = document.querySelector('#gcStatusMsg');
      const choiceArea = document.querySelector('#gcChoiceArea');

      if (input) {
        setTimeout(() => input.focus(), 100);
      }

      const doRedeem = async () => {
        const code = (input ? input.value : '').trim().toUpperCase();
        if (!code) {
          if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.style.color = '#ff7b62';
            statusEl.textContent = 'Vui lòng nhập mã Giftcode!';
          }
          if (input) input.focus();
          return;
        }

        if (redeemBtn) { redeemBtn.disabled = true; redeemBtn.textContent = 'Đang nhận...'; }
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.style.color = '#ffd875';
          statusEl.textContent = 'Đang kiểm tra mã quà tặng...';
        }
        if (choiceArea) choiceArea.style.display = 'none';

        try {
          if (typeof window.jxSync === 'function') await window.jxSync();
          const curSlot = typeof window.SLOT !== 'undefined' ? window.SLOT : 0;
          const res = await fetch('/api/gift-codes/redeem', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ code, slot: curSlot })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Mã quà tặng không hợp lệ');

          const choices = Array.isArray(data.choices) ? data.choices : [];
          if (choices.length > 1) {
            if (statusEl) {
              statusEl.style.display = 'block';
              statusEl.style.color = '#7fe37a';
              statusEl.textContent = 'Mã hợp lệ! Vui lòng chọn bộ trang bị:';
            }
            if (choiceArea) {
              choiceArea.style.display = 'block';
              choiceArea.innerHTML = `
                <div style="font-size:12px;color:#ffd875;margin-bottom:6px;font-weight:bold">Chọn phần thưởng:</div>
                <select id="gcChoiceSelect" style="width:100%;box-sizing:border-box;padding:8px;background:#090f0c;border:1px solid #cba450;color:#ffe699;border-radius:4px;font-size:12px;margin-bottom:8px;outline:none">
                  ${choices.map(c => `<option value="${c.value}">${esc(c.label)}</option>`).join('')}
                </select>
                <button id="gcConfirmBtn" class="btn on" style="width:100%;padding:8px;font-size:13px;font-weight:bold;background:linear-gradient(180deg,#d4a024,#8c650e);color:#1c1302">Xác nhận nhận thưởng</button>
              `;
              const cBtn = document.querySelector('#gcConfirmBtn');
              if (cBtn) {
                cBtn.onclick = async () => {
                  const selVal = document.querySelector('#gcChoiceSelect').value;
                  cBtn.disabled = true;
                  cBtn.textContent = 'Đang nhận...';
                  try {
                    const cRes = await fetch('/api/gift-codes/choose', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ code, choice: selVal })
                    });
                    const cData = await cRes.json();
                    if (!cRes.ok) throw new Error(cData.error || 'Lỗi nhận thưởng');

                    const successMsg = (cData.kind === 'ttl_knb' || cData.kind === 'tienthaolo')
                      ? '🎉 Nhận đủ: 5 bình Tiên Thảo Lộ + 5 Kim Nguyên Bảo!'
                      : (cData.kind === 'kimphong'
                        ? '🎉 Nhận đủ: Bộ Kim Phong (9 món) + 5 Tiên Thảo Lộ + 5 KNB!'
                        : `🎉 Nhận thành công ${cData.count || ''} món trang bị!`);

                    if (typeof window.toast === 'function') window.toast(successMsg);
                    if (statusEl) {
                      statusEl.style.display = 'block';
                      statusEl.style.color = '#7fe37a';
                      statusEl.textContent = successMsg;
                    }
                    setTimeout(() => {
                      if (typeof window.jxReload === 'function') window.jxReload();
                      else location.reload();
                    }, 1200);
                  } catch (err) {
                    cBtn.disabled = false;
                    cBtn.textContent = 'Thử lại';
                    if (statusEl) {
                      statusEl.style.display = 'block';
                      statusEl.style.color = '#ff7b62';
                      statusEl.textContent = err.message;
                    }
                  }
                };
              }
            }
            return;
          }

          // Trường hợp 1 lựa chọn duy nhất (ví dụ: 5 Tiên Thảo Lộ + 5 KNB)
          const singleChoice = choices.length === 1 ? choices[0].value : 0;
          const cRes = await fetch('/api/gift-codes/choose', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ code, choice: singleChoice })
          });
          const cData = await cRes.json();
          if (!cRes.ok) throw new Error(cData.error || 'Lỗi nhận thưởng');

          const successMsg = (cData.kind === 'ttl_knb' || cData.kind === 'tienthaolo')
            ? '🎉 Nhận đủ: 5 bình Tiên Thảo Lộ + 5 Kim Nguyên Bảo!'
            : (cData.kind === 'kimphong'
              ? '🎉 Nhận đủ: Bộ Kim Phong (9 món) + 5 Tiên Thảo Lộ + 5 KNB!'
              : `🎉 Nhận thành công ${cData.count || ''} món trang bị!`);

          if (typeof window.toast === 'function') window.toast(successMsg);
          if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.style.color = '#7fe37a';
            statusEl.textContent = successMsg;
          }

          // Cập nhật ngay KNB trên nhân vật nếu có
          const p = window.P || (typeof window.getP === 'function' ? window.getP() : null);
          if (p && (cData.kind === 'ttl_knb' || cData.kind === 'tienthaolo' || cData.kind === 'kimphong')) {
            p.knb = (Number(p.knb) || 0) + 5;
            p.stackItems = p.stackItems || {};
            p.stackItems.tt = (Number(p.stackItems.tt) || 0) + 5;
            p.mats = p.mats || {};
            p.mats.misc = p.mats.misc || {};
            p.mats.misc.tt = (Number(p.mats.misc.tt) || 0) + 5;
            if (typeof window.updateHud === 'function') window.updateHud();
          }

          setTimeout(() => {
            if (typeof window.jxReload === 'function') window.jxReload();
            else location.reload();
          }, 1200);

        } catch (err) {
          if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.style.color = '#ff7b62';
            statusEl.textContent = err.message || 'Mã quà không hợp lệ';
          }
        } finally {
          if (redeemBtn) { redeemBtn.disabled = false; redeemBtn.textContent = 'Nhận quà'; }
        }
      };

      if (redeemBtn) redeemBtn.onclick = doRedeem;
      if (input) {
        input.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            doRedeem();
          }
        });
      }
    });
  }

  // Đăng ký toàn cục
  window.openGiftcodeModal = openGiftcodeModal;

  // Lắng nghe sự kiện click trên nút #giftcodeBtn (kể cả khi re-render)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#giftcodeBtn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      openGiftcodeModal();
    }
  }, true);

})();
