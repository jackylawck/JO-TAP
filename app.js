// 雙語語言包定義
const I18N_DICT = {
  zh: {
    headerTitle: "東淦工程 · 現場簽到廣播系統",
    badge: "內部試點 (限額 100 人)",
    lblTitle: "培訓課程名稱",
    titlePlaceholder: "例如：高空工作安全訓練",
    lblTrainer: "主講者姓名",
    trainerPlaceholder: "例如：陳大文",
    lblEmail: "主講者公司電郵前綴",
    emailPlaceholder: "trainer.name",
    btnStart: "🚀 一鍵生成並全螢幕投影",
    idleText: "填妥左側資料後<br>點擊按鈕直接開啟投影",
    scanHint: "請使用手機相機掃描 QR Code 登記出席",
    privacyText: "【個資聲明】本簽到僅限東淦內部出勤核對與 HRF-043 存檔，受公司資訊政策嚴密保護。",
    btnFs: "全螢幕投影 (F11)",
    btnPlanB: "現場手動補簽 (Plan B)",
    btnEnd: "結束本場培訓",
    modalTitle: "現場手動代簽 (Plan B)",
    modalDesc: "當前場次：{SESSION}<br>資料將自動注入微軟後端流水線，確保與現場簽到即時合流。",
    staffNoPlaceholder: "職員編號 (例如: E1023)",
    staffNamePlaceholder: "中文姓名 (例如: 李大明)",
    modalSubmit: "開啟代登分頁並送出",
    modalCancel: "取消",
    confirmEnd: "確認結束當前培訓場次？",
    alertInput: "請完整輸入培訓名稱、姓名及電郵前綴！"
  },
  en: {
    headerTitle: "Jumbo Orient · Training Attendance Portal",
    badge: "Internal Pilot (Max 100 Pax)",
    lblTitle: "Training Course Title",
    titlePlaceholder: "e.g., Working at Height Safety Training",
    lblTrainer: "Trainer Full Name",
    trainerPlaceholder: "e.g., Chan Tai Man",
    lblEmail: "Trainer Corporate Email Prefix",
    emailPlaceholder: "trainer.name",
    btnStart: "🚀 Launch & Fullscreen Projection",
    idleText: "Fill in the details on the left<br>and click Launch to generate QR code",
    scanHint: "Please scan the QR Code with your mobile camera to check in",
    privacyText: "[Privacy Notice] This check-in is strictly for internal attendance verification and HRF-043 archiving under corporate security policy.",
    btnFs: "Fullscreen Mode (F11)",
    btnPlanB: "Manual Check-in (Plan B)",
    btnEnd: "End Session",
    modalTitle: "Manual Check-in (Plan B)",
    modalDesc: "Current Session: {SESSION}<br>Data will be submitted directly to backend M365 pipeline.",
    staffNoPlaceholder: "Staff ID (e.g., E1023)",
    staffNamePlaceholder: "Full Name (e.g., Lee Tai Ming)",
    modalSubmit: "Open Entry Tab & Submit",
    modalCancel: "Cancel",
    confirmEnd: "Are you sure you want to end this training session?",
    alertInput: "Please complete the course title, trainer name, and email prefix!"
  }
};

let currentLang = localStorage.getItem('JO_LANG') || 'zh';

window.addEventListener('DOMContentLoaded', () => {
  switchLanguage(currentLang);

  const lastTrainer = localStorage.getItem('JO_LAST_TRAINER') || '';
  const lastPrefix = localStorage.getItem('JO_LAST_PREFIX') || '';
  document.getElementById('trainerName').value = lastTrainer;
  document.getElementById('trainerEmailPrefix').value = lastPrefix;

  const saved = localStorage.getItem('JO_CURRENT_SESSION');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      const now = new Date().getTime();
      const currentHKDay = getHKDateString();
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

function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('JO_LANG', lang);
  const dict = I18N_DICT[lang];

  document.querySelectorAll('.btn-lang').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.btn-lang[onclick="switchLanguage('${lang}')"]`);
  if (activeBtn) activeBtn.classList.add('active');

  document.getElementById('i18n-header-title').innerText = dict.headerTitle;
  document.getElementById('i18n-badge').innerText = dict.badge;
  document.getElementById('i18n-lbl-title').innerText = dict.lblTitle;
  document.getElementById('trainingTitle').placeholder = dict.titlePlaceholder;
  document.getElementById('i18n-lbl-trainer').innerText = dict.lblTrainer;
  document.getElementById('trainerName').placeholder = dict.trainerPlaceholder;
  document.getElementById('i18n-lbl-email').innerText = dict.lblEmail;
  document.getElementById('trainerEmailPrefix').placeholder = dict.emailPlaceholder;
  document.getElementById('i18n-btn-start').innerText = dict.btnStart;
  document.getElementById('i18n-idle-text').innerHTML = dict.idleText;
  document.getElementById('i18n-scan-hint').innerText = dict.scanHint;
  document.getElementById('i18n-privacy-text').innerText = dict.privacyText;
  document.getElementById('i18n-btn-fs').innerText = dict.btnFs;
  document.getElementById('i18n-btn-planb').innerText = dict.btnPlanB;
  document.getElementById('i18n-btn-end').innerText = dict.btnEnd;
  document.getElementById('i18n-modal-title').innerText = dict.modalTitle;
  document.getElementById('manualStaffNo').placeholder = dict.staffNoPlaceholder;
  document.getElementById('manualStaffName').placeholder = dict.staffNamePlaceholder;
  document.getElementById('i18n-modal-submit').innerText = dict.modalSubmit;
  document.getElementById('i18n-modal-cancel').innerText = dict.modalCancel;
}

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
  const dict = I18N_DICT[currentLang];
  const title = document.getElementById('trainingTitle').value.trim();
  const trainer = document.getElementById('trainerName').value.trim();
  const prefix = document.getElementById('trainerEmailPrefix').value.trim();

  if (!title || !trainer || !prefix) {
    alert(dict.alertInput);
    return;
  }

  localStorage.setItem('JO_LAST_TRAINER', trainer);
  localStorage.setItem('JO_LAST_PREFIX', prefix);

  const hkDate = getHKDateString();
  const sessionId = `TRN-${hkDate}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

  const urlObj = new URL(APP_CONFIG.formsBaseUrl);
  urlObj.searchParams.set(APP_CONFIG.sessionFieldKey, sessionId);
  const finalUrl = urlObj.toString();

  localStorage.setItem('JO_CURRENT_SESSION', JSON.stringify({
    sessionId, title, trainer, url: finalUrl, hkDate, createdAt: new Date().getTime()
  }));

  renderActive(sessionId, title, finalUrl);
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

  const qrBox = document.getElementById('qrcode-box');
  qrBox.innerHTML = '';

  // 尺寸鎖定 280px，改用 M 級容錯，大幅降低點陣密度
  try {
    new QRCode(qrBox, {
      text: url,
      width: 280,
      height: 280,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (err) {
    qrBox.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(url)}" style="width:280px;height:280px;" alt="QR Code">`;
  }
}

function executeFullscreen() {
  const elem = document.getElementById('displayBox');
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch(() => {});
  }
}

function endSession() {
  const dict = I18N_DICT[currentLang];
  if (confirm(dict.confirmEnd)) {
    localStorage.removeItem('JO_CURRENT_SESSION');
    location.reload();
  }
}

function openFallbackModal() {
  const dict = I18N_DICT[currentLang];
  const saved = JSON.parse(localStorage.getItem('JO_CURRENT_SESSION') || '{}');
  const sessionText = saved.sessionId || 'N/A';
  document.getElementById('i18n-modal-desc').innerHTML = dict.modalDesc.replace('{SESSION}', sessionText);
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
    alert(currentLang === 'zh' ? "請輸入工號與中文姓名！" : "Please enter Staff ID and Full Name!");
    return;
  }

  const fallbackUrl = new URL(APP_CONFIG.fallbackFormsUrl);
  fallbackUrl.searchParams.set(APP_CONFIG.fallbackFields.sessionId, saved.sessionId);
  fallbackUrl.searchParams.set(APP_CONFIG.fallbackFields.staffNo, staffNo);
  fallbackUrl.searchParams.set(APP_CONFIG.fallbackFields.staffName, staffName);

  window.open(fallbackUrl.toString(), '_blank');
  document.getElementById('manualStaffNo').value = '';
  document.getElementById('manualStaffName').value = '';
  closeFallbackModal();
}
