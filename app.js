/**
 * JO-TAP 現場簽到投影中樞 - 運行邏輯 (依賴 i18n.js 與 config.js)
 */
let currentLang = localStorage.getItem('JO_LANG') || 'zh';
let countdownInterval = null;

window.addEventListener('DOMContentLoaded', () => {
  switchLanguage(currentLang);
  initDefaultCutoffDateTime();

  // 徹底移除自動回填個人資料：清空舊殘留快取並重設輸入框為空白
  localStorage.removeItem('JO_LAST_TRAINER');
  localStorage.removeItem('JO_LAST_PREFIX');
  const trainerInput = document.getElementById('trainerName');
  const prefixInput = document.getElementById('trainerEmailPrefix');
  if (trainerInput) trainerInput.value = '';
  if (prefixInput) prefixInput.value = '';

  // 檢查有無進行中場次（未過期即恢復）
  const saved = localStorage.getItem('JO_CURRENT_SESSION');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      const now = new Date().getTime();
      if (now < data.cutoffTimestamp) {
        renderActive(data);
      } else {
        localStorage.removeItem('JO_CURRENT_SESSION');
      }
    } catch (e) {
      localStorage.removeItem('JO_CURRENT_SESSION');
    }
  }
});

// 初始化預設截單日期（今天）與時間
function initDefaultCutoffDateTime() {
  const dateInput = document.getElementById('cutoffDateInput');
  const timeSelect = document.getElementById('cutoffTimeSelect');
  
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  if (dateInput) {
    dateInput.value = `${year}-${month}-${day}`;
    dateInput.min = `${year}-${month}-${day}`; // 限制不可選過去日期
  }

  if (timeSelect) {
    const currentHour = now.getHours();
    if (currentHour < 12) {
      timeSelect.value = "12:30";
    } else if (currentHour < 17) {
      timeSelect.value = "17:30";
    } else {
      timeSelect.value = "21:00";
    }
  }
}

function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('JO_LANG', lang);
  const dict = I18N_DICT[lang];
  if (!dict) return;

  document.querySelectorAll('.btn-lang').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.btn-lang[onclick="switchLanguage('${lang}')"]`);
  if (activeBtn) activeBtn.classList.add('active');

  setInnerText('i18n-header-title', dict.headerTitle);
  setInnerText('i18n-badge', dict.badge);
  setInnerText('i18n-lbl-title', dict.lblTitle);
  setPlaceholder('trainingTitle', dict.titlePlaceholder);
  setInnerText('i18n-lbl-trainer', dict.lblTrainer);
  setPlaceholder('trainerName', dict.trainerPlaceholder);
  setInnerText('i18n-lbl-email', dict.lblEmail);
  setPlaceholder('trainerEmailPrefix', dict.emailPlaceholder);
  setInnerText('i18n-lbl-cutoff-date', dict.lblCutoffDate);
  setInnerText('i18n-lbl-cutoff', dict.lblCutoff);
  setInnerText('i18n-btn-start', dict.btnStart);
  setInnerHtml('i18n-idle-text', dict.idleText);
  setInnerText('i18n-scan-hint', dict.scanHint);
  setInnerText('i18n-privacy-text', dict.privacyText);
  setInnerText('i18n-paper-alert', dict.paperAlert);
  setInnerText('i18n-cutoff-notice', dict.cutoffNotice);
  setInnerText('i18n-btn-fs', dict.btnFs);
  setInnerText('i18n-btn-planb', dict.btnPlanB);
  setInnerText('i18n-btn-extend', dict.btnExtend);
  setInnerText('i18n-btn-early-end', dict.btnEarlyEnd);
  setInnerText('i18n-btn-end', dict.btnEnd);
  setInnerText('i18n-modal-title', dict.modalTitle);
  setPlaceholder('manualStaffNo', dict.staffNoPlaceholder);
  setPlaceholder('manualStaffName', dict.staffNamePlaceholder);
  setInnerText('i18n-modal-submit', dict.modalSubmit);
  setInnerText('i18n-modal-cancel', dict.modalCancel);
}

function setInnerText(id, text) { const el = document.getElementById(id); if (el && text) el.innerText = text; }
function setInnerHtml(id, html) { const el = document.getElementById(id); if (el && html) el.innerHTML = html; }
function setPlaceholder(id, ph) { const el = document.getElementById(id); if (el && ph) el.placeholder = ph; }

function getSafeUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().split('-')[0].toUpperCase();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
}

function getHKDateString() {
  const f = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Hong_Kong', 
    year: 'numeric', month: '2-digit', day: '2-digit' 
  });
  return f.format(new Date()).replace(/-/g, '');
}

async function startSession() {
  const dict = I18N_DICT[currentLang];
  const title = document.getElementById('trainingTitle').value.trim();
  const trainer = document.getElementById('trainerName').value.trim();
  const prefix = document.getElementById('trainerEmailPrefix').value.trim();
  const cutoffDateVal = document.getElementById('cutoffDateInput')?.value;
  const cutoffTimeVal = document.getElementById('cutoffTimeSelect')?.value || "17:30";

  if (!title || !trainer || !prefix || !cutoffDateVal) {
    alert(dict.alertInput || "請完整填寫課程資料、講者資訊及截單時間！");
    return;
  }

  const domain = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.emailDomain) ? APP_CONFIG.emailDomain : "@jumboorient.com.hk";
  const trainerEmail = `${prefix}${domain}`;

  // 結合自選日期 (YYYY-MM-DD) 與時間 (HH:mm) 計算截止絕對毫秒數
  const [targetH, targetM] = cutoffTimeVal.split(':').map(Number);
  const [y, m, d] = cutoffDateVal.split('-').map(Number);
  const cutoffDate = new Date(y, m - 1, d, targetH, targetM, 0, 0);
  const cutoffTimestamp = cutoffDate.getTime();

  if (cutoffTimestamp <= new Date().getTime()) {
    alert(currentLang === 'zh' ? "截單時間不能早於當前時間！" : "Cutoff time cannot be in the past!");
    return;
  }

  const hkDate = getHKDateString();
  const sessionId = `TRN-${hkDate}-${getSafeUUID()}`;
  
  // 關鍵改動：生成 URL 時同時傳入 title 與 trainer 姓名
  const finalUrl = buildFormsUrl(sessionId, title, trainer, trainerEmail, "Self");

  const sessionData = {
    sessionId,
    title,
    trainer,
    trainerEmail,
    url: finalUrl,
    hkDate,
    createdAt: new Date().getTime(),
    cutoffTimestamp,
    cutoffTimeString: `${cutoffDateVal} ${cutoffTimeVal}`
  };

  localStorage.setItem('JO_CURRENT_SESSION', JSON.stringify(sessionData));
  registerSessionBackend(sessionData);

  renderActive(sessionData);
  executeFullscreen();
}

/**
 * 構建帶有真實 GUID 的 Forms 預填網址
 */
function buildFormsUrl(sessionId, title, trainerName, trainerEmail, signType) {
  const baseUrl = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.formsBaseUrl) 
    ? APP_CONFIG.formsBaseUrl 
    : "https://forms.cloud.microsoft/Pages/ResponsePage.aspx";
  const urlObj = new URL(baseUrl);
  
  // 1. 場次編號 (code)
  const sessionKey = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sessionFieldKey) 
    ? APP_CONFIG.sessionFieldKey 
    : "r47260548a38342cfb911e2d607927fcc";
  urlObj.searchParams.set(sessionKey, sessionId);

  // 2. 課程名稱 (class) 與主講者姓名 (tname)
  if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.fields) {
    if (APP_CONFIG.fields.trainingTitle) {
      urlObj.searchParams.set(APP_CONFIG.fields.trainingTitle, title);
    }
    if (APP_CONFIG.fields.trainerName) {
      urlObj.searchParams.set(APP_CONFIG.fields.trainerName, trainerName);
    }
    // 預留欄位
    if (APP_CONFIG.fields.trainerEmail && !APP_CONFIG.fields.trainerEmail.startsWith("r_")) {
      urlObj.searchParams.set(APP_CONFIG.fields.trainerEmail, trainerEmail);
    }
    if (APP_CONFIG.fields.signSource && !APP_CONFIG.fields.signSource.startsWith("r_")) {
      urlObj.searchParams.set(APP_CONFIG.fields.signSource, signType);
    }
  }
  return urlObj.toString();
}

function registerSessionBackend(data) {
  if (typeof APP_CONFIG === 'undefined' || !APP_CONFIG.webhookRegisterUrl) return;
  fetch(APP_CONFIG.webhookRegisterUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: "REGISTER_SCHEDULE",
      sessionId: data.sessionId,
      trainingTitle: data.title,
      trainerName: data.trainer,
      trainerEmail: data.trainerEmail,
      cutoffIso: new Date(data.cutoffTimestamp).toISOString()
    })
  }).catch(() => {
    console.warn("後端排程註冊離線，系統維持本地計時。");
  });
}

function renderActive(data) {
  document.getElementById('setupPanel').style.display = 'none';
  document.getElementById('idleView').style.display = 'none';
  const activeView = document.getElementById('activeView');
  activeView.style.display = 'flex';
  activeView.style.flexDirection = 'column';
  activeView.style.alignItems = 'center';

  document.getElementById('lblSession').innerText = data.sessionId;
  document.getElementById('lblTitle').innerText = data.title;

  const qrBox = document.getElementById('qrcode-box');
  qrBox.innerHTML = '';
  try {
    new QRCode(qrBox, {
      text: data.url,
      width: 280,
      height: 280,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (err) {
    qrBox.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(data.url)}" style="width:280px;height:280px;" alt="QR Code">`;
  }

  startCountdown(data.cutoffTimestamp);
}

function startCountdown(cutoffTimestamp) {
  if (countdownInterval) clearInterval(countdownInterval);
  const timerLabel = document.getElementById('lblTimer');

  function update() {
    const now = new Date().getTime();
    const diff = cutoffTimestamp - now;
    if (diff <= 0) {
      if (timerLabel) timerLabel.innerText = "已達截單時間 (排程處理中)";
      clearInterval(countdownInterval);
      return;
    }
    const d = Math.floor(diff / (3600000 * 24));
    const h = Math.floor((diff % (3600000 * 24)) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    if (timerLabel) {
      timerLabel.innerText = d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`;
    }
  }
  update();
  countdownInterval = setInterval(update, 1000);
}

function extendSession30Min() {
  const saved = JSON.parse(localStorage.getItem('JO_CURRENT_SESSION') || '{}');
  if (!saved.cutoffTimestamp) return;

  saved.cutoffTimestamp += 30 * 60 * 1000;
  localStorage.setItem('JO_CURRENT_SESSION', JSON.stringify(saved));

  startCountdown(saved.cutoffTimestamp);
  const newDate = new Date(saved.cutoffTimestamp);
  const timeStr = `${String(newDate.getHours()).padStart(2, '0')}:${String(newDate.getMinutes()).padStart(2, '0')}`;

  alert(`${I18N_DICT[currentLang].extendSuccess} ${timeStr}`);

  if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.webhookRegisterUrl) {
    fetch(APP_CONFIG.webhookRegisterUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: "EXTEND_SESSION",
        sessionId: saved.sessionId,
        cutoffIso: newDate.toISOString()
      })
    }).catch(() => {});
  }
}

function triggerEarlyEnd() {
  const dict = I18N_DICT[currentLang];
  if (!confirm(dict.confirmEarlyEnd)) return;

  const saved = JSON.parse(localStorage.getItem('JO_CURRENT_SESSION') || '{}');

  if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.webhookRegisterUrl) {
    fetch(APP_CONFIG.webhookRegisterUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: "EXECUTE_NOW",
        sessionId: saved.sessionId,
        trainingTitle: saved.title,
        trainerEmail: saved.trainerEmail
      })
    }).catch(() => {});
  }

  localStorage.removeItem('JO_CURRENT_SESSION');
  alert(currentLang === 'zh' ? "已發送結課訊號，報告將於數分鐘內寄達！" : "Session ended. Report is being sent!");
  location.reload();
}

function executeFullscreen() {
  const elem = document.getElementById('displayBox');
  if (elem && elem.requestFullscreen) {
    elem.requestFullscreen().catch(() => {});
  }
}

function endSession() {
  const dict = I18N_DICT[currentLang];
  if (confirm(dict.confirmEnd)) {
    if (countdownInterval) clearInterval(countdownInterval);
    localStorage.removeItem('JO_CURRENT_SESSION');
    location.reload();
  }
}

function openFallbackModal() {
  const saved = JSON.parse(localStorage.getItem('JO_CURRENT_SESSION') || '{}');
  const sessionText = saved.sessionId || 'N/A';
  document.getElementById('modalSessionId').innerText = sessionText;
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
    alert(currentLang === 'zh' ? "請輸入職員編號與中文姓名！" : "Please enter Staff ID and Full Name!");
    return;
  }

  const base = (typeof APP_CONFIG !== 'undefined' && (APP_CONFIG.fallbackFormsUrl || APP_CONFIG.formsBaseUrl)) 
    ? (APP_CONFIG.fallbackFormsUrl || APP_CONFIG.formsBaseUrl) 
    : "https://forms.cloud.microsoft/Pages/ResponsePage.aspx";
  const fallbackUrl = new URL(base);

  // 1. 場次編號
  const sessionKey = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sessionFieldKey) 
    ? APP_CONFIG.sessionFieldKey 
    : "r47260548a38342cfb911e2d607927fcc";
  fallbackUrl.searchParams.set(sessionKey, saved.sessionId);

  // 2. 課程名稱與講師姓名
  if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.fields) {
    if (APP_CONFIG.fields.trainingTitle) {
      fallbackUrl.searchParams.set(APP_CONFIG.fields.trainingTitle, saved.title);
    }
    if (APP_CONFIG.fields.trainerName) {
      fallbackUrl.searchParams.set(APP_CONFIG.fields.trainerName, saved.trainer);
    }
  }

  window.open(fallbackUrl.toString(), '_blank');
  document.getElementById('manualStaffNo').value = '';
  document.getElementById('manualStaffName').value = '';
  closeFallbackModal();
}
