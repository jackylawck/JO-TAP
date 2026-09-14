window.addEventListener('DOMContentLoaded', () => {
  // 自動載入常用講師資訊（記憶於本機）
  const lastTrainer = localStorage.getItem('JO_LAST_TRAINER');
  const lastPrefix = localStorage.getItem('JO_LAST_PREFIX');
  if (lastTrainer) document.getElementById('trainerName').value = lastTrainer;
  if (lastPrefix) document.getElementById('trainerEmailPrefix').value = lastPrefix;

  // 使用香港時區檢查是否有當前場次快取
  const saved = localStorage.getItem('JO_CURRENT_SESSION');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      const now = new Date().getTime();
      const currentHKDay = getHKDateString();
      
      // 同日且在有效小時內才恢復，避免隔日髒數據
      if (data.hkDate === currentHKDay && (now - data.createdAt < APP_CONFIG.sessionTimeoutHours * 3600 * 1000)) {
        renderActive(data.sessionId, data.title, data.url);
      } else {
        localStorage.removeItem('JO_CURRENT_SESSION');
      }
    } catch (e) {
      localStorage.removeItem('JO_CURRENT_SESSION');
    }
  }
});

// 統一取得香港時區 YYYYMMDD
function getHKDateString() {
  const f = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Hong_Kong', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
  return f.format(new Date()).replace(/-/g, '');
}

function startSession() {
  const title = document.getElementById('trainingTitle').value.trim();
  const trainer = document.getElementById('trainerName').value.trim();
  const prefix = document.getElementById('trainerEmailPrefix').value.trim();

  if (!title || !trainer || !prefix) {
    alert("請完整輸入培訓名稱、姓名及電郵前綴！");
    return;
  }

  // 記憶常用講師
  localStorage.setItem('JO_LAST_TRAINER', trainer);
  localStorage.setItem('JO_LAST_PREFIX', prefix);

  const hkDate = getHKDateString();
  const sessionId = `TRN-${hkDate}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

  // 核心架構約束：QR 碼只注入 Session ID，不放講師 Email，防止前端被改
  const urlObj = new URL(APP_CONFIG.formsBaseUrl);
  urlObj.searchParams.set(APP_CONFIG.sessionFieldKey, sessionId);
  const finalUrl = urlObj.toString();

  // 儲存狀態供刷新時恢復
  localStorage.setItem('JO_CURRENT_SESSION', JSON.stringify({
    sessionId,
    title,
    trainer,
    url: finalUrl,
    hkDate,
    createdAt: new Date().getTime()
  }));

  renderActive(sessionId, title, finalUrl);

  // 嘗試一鍵全螢幕（若瀏覽器攔截，保留按鈕供手動進入）
  executeFullscreen();
}

function renderActive(sessionId, title, url) {
  document.getElementById('setupPanel').style.display = 'none';
  document.getElementById('idleView').style.display = 'none';
  document.getElementById('activeView').style.display = 'flex';
  document.getElementById('activeView').style.flexDirection = 'column';
  document.getElementById('activeView').style.alignItems = 'center';

  document.getElementById('lblSession').innerText = sessionId;
  document.getElementById('lblTitle').innerText = title;

  // 繪製 800px 高解析畫布，放大至 55vmin 依舊銳利
  const qrBox = document.getElementById('qrcode-box');
  qrBox.innerHTML = '';
  new QRCode(qrBox, {
    text: url,
    width: 800,
    height: 800,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

function executeFullscreen() {
  const elem = document.getElementById('displayBox');
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch(() => {
      console.log("瀏覽器攔截自動全螢幕，可使用手動按鈕。");
    });
  }
}

function endSession() {
  if (confirm("確認結束當前培訓場次？")) {
    localStorage.removeItem('JO_CURRENT_SESSION');
    location.reload();
  }
}

// ====== 真 Plan B：直接向 M365 後台送出，走同一條落庫 Flow ======
function openFallbackModal() {
  const saved = JSON.parse(localStorage.getItem('JO_CURRENT_SESSION') || '{}');
  document.getElementById('modalSessionId').innerText = saved.sessionId || '無場次';
  document.getElementById('fallbackModal').style.display = 'flex';
}

function closeFallbackModal() {
  document.getElementById('fallbackModal').style.display = 'none';
}

function submitRealPlanB() {
  const staffNo = document.getElementById('manualStaffNo').value.trim();
  const staffName = document.getElementById('manualStaffName').value.trim();
  const saved = JSON.parse(localStorage.getItem('JO_CURRENT_SESSION') || '{}');

  if (!staffNo || !staffName) {
    alert("請輸入工號與中文姓名！");
    return;
  }

  // 組合帶有當前 Session ID 的補登連結，在新分頁開啟提交
  const fallbackUrl = new URL(APP_CONFIG.fallbackFormsUrl);
  fallbackUrl.searchParams.set(APP_CONFIG.fallbackFields.sessionId, saved.sessionId);
  fallbackUrl.searchParams.set(APP_CONFIG.fallbackFields.staffNo, staffNo);
  fallbackUrl.searchParams.set(APP_CONFIG.fallbackFields.staffName, staffName);

  window.open(fallbackUrl.toString(), '_blank');

  document.getElementById('manualStaffNo').value = '';
  document.getElementById('manualStaffName').value = '';
  closeFallbackModal();
}
