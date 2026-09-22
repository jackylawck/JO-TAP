/**
 * JO-TAP 現場簽到投影中樞 - 運行邏輯 (依賴 i18n.js 與 config.js)
 */
let currentLang = localStorage.getItem('JO_LANG') || 'zh';
let countdownInterval = null;

window.addEventListener('DOMContentLoaded', () => {
  switchLanguage(currentLang);
  initDefaultCutoffTime();

  // 自動回填上次記錄的講者資料
  document.getElementById('trainerName').value = localStorage.getItem('JO_LAST_TRAINER') || '';
  document.getElementById('trainerEmailPrefix').value = localStorage.getItem('JO_LAST_PREFIX') || '';

  // 檢查有無進行中場次
  const saved = localStorage.getItem('JO_CURRENT_SESSION');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      const now = new Date().getTime();
      if (data.hkDate === getHKDateString() && now < data.cutoffTimestamp) {
        renderActive(data);
      } else {
        localStorage.removeItem('JO_CURRENT_SESSION');
      }
    } catch (e) {
      localStorage.removeItem('JO_CURRENT_SESSION');
    }
  }
});

function initDefaultCutoffTime() {
  const cutoffSelect = document.getElementById('cutoffTimeSelect');
  if (!cutoffSelect) return;
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    cutoffSelect.value = "12:30";
  } else if (currentHour < 17) {
    cutoffSelect.value = "17:30";
  } else {
    cutoffSelect.value = "19:00";
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
  const cutoffTimeVal = document.getElementById('cutoffTimeSelect')?.value || "17:30";

  if (!title || !trainer || !prefix) {
    alert(dict.alertInput);
    return;
  }

  const domain = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.emailDomain) ? APP_CONFIG.emailDomain : "@jumboorient.com.hk";
  const trainerEmail = `${prefix}${domain}`;
  localStorage.setItem('JO_LAST_TRAINER', trainer);
  localStorage.setItem('JO_LAST_PREFIX', prefix);

  const now = new Date();
  const [targetH, targetM] = cutoffTimeVal.split(':').map(Number);
  const cutoffDate = new Date();
  cutoffDate.setHours(targetH, targetM, 0, 0);

  if (cutoffDate.getTime() <= now.getTime()) {
    cutoffDate.setDate(cutoffDate.getDate() + 1);
  }
  const cutoffTimestamp = cutoffDate.getTime();

  const hkDate = getHKDateString();
  const sessionId = `TRN-${hkDate}-${getSafeUUID()}`;
  const finalUrl = buildFormsUrl(sessionId, title, trainerEmail, "Self");

  const sessionData = {
    sessionId,
    title,
    trainer,
    trainerEmail,
    url: finalUrl,
    hkDate,
    createdAt: now.getTime(),
    cutoffTimestamp,
    cutoffTimeString: cutoffTimeVal
  };

  localStorage.setItem('JO_CURRENT_SESSION', JSON.stringify(sessionData));
  registerSessionBackend(sessionData);

  renderActive(sessionData);
  executeFullscreen();
}

function buildFormsUrl(sessionId, title, trainerEmail, signType) {
  const baseUrl = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.formsBaseUrl) ? APP_CONFIG.formsBaseUrl : "https://forms.office.com/Pages/ResponsePage.aspx";
  const urlObj = new URL(baseUrl);
  const sessionKey = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sessionFieldKey) ? APP_CONFIG.sessionFieldKey : "r_SessionID";
  
  urlObj.searchParams.set(sessionKey, sessionId);
  if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.fields) {
    if (APP_CONFIG.fields.trainerEmail) urlObj.searchParams.set(APP_CONFIG.fields.trainerEmail, trainerEmail);
    if (APP_CONFIG.fields.signSource) urlObj.searchParams.set(APP_CONFIG.fields.signSource, signType);
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
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (timerLabel) {
      timerLabel.innerText = `${h}h ${m}m ${s}s`;
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
  const dict = I18N_DICT[currentLang];
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
    : "https://forms.office.com/Pages/ResponsePage.aspx";
  const fallbackUrl = new URL(base);
  const sessionKey = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sessionFieldKey) ? APP_CONFIG.sessionFieldKey : "r_SessionID";

  fallbackUrl.searchParams.set(sessionKey, saved.sessionId);
  if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.fallbackFields) {
    if (APP_CONFIG.fallbackFields.staffNo) fallbackUrl.searchParams.set(APP_CONFIG.fallbackFields.staffNo, staffNo);
    if (APP_CONFIG.fallbackFields.staffName) fallbackUrl.searchParams.set(APP_CONFIG.fallbackFields.staffName, staffName);
  }
  if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.fields && APP_CONFIG.fields.signSource) {
    fallbackUrl.searchParams.set(APP_CONFIG.fields.signSource, "Manual");
  }

  window.open(fallbackUrl.toString(), '_blank');
  document.getElementById('manualStaffNo').value = '';
  document.getElementById('manualStaffName').value = '';
  closeFallbackModal();
}
