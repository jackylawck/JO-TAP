function getHKDateString() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date()).replace(/-/g, '');
}

function generateSecureSessionId() {
  const datePart = getHKDateString();
  const randomHex = crypto.getRandomValues(new Uint16Array(1))[0]
    .toString(16)
    .toUpperCase()
    .padStart(4, '0');
  return `TRN-${datePart}-${randomHex}`;
}

function initiateSession() {
  const baseUrl = document.getElementById('formsUrl').value.trim();
  const fieldKey = document.getElementById('fieldId').value.trim();
  const title = document.getElementById('trainingName').value.trim();
  const email = document.getElementById('trainerEmail').value.trim();

  if (!baseUrl || !title || !email) {
    alert("請完整填寫表單 URL、培訓名稱及主講者電郵。");
    return;
  }

  const sessionId = generateSecureSessionId();
  const separator = baseUrl.includes('?') ? '&' : '?';
  const finalUrl = `${baseUrl}${separator}${encodeURIComponent(fieldKey)}=${encodeURIComponent(sessionId)}`;

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('activeState').style.display = 'block';
  document.getElementById('lblSessionId').innerText = sessionId;
  document.getElementById('lblTitle').innerText = title;

  const qrContainer = document.getElementById('qrcode-box');
  qrContainer.innerHTML = '';
  new QRCode(qrContainer, {
    text: finalUrl,
    width: 280,
    height: 280,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

function toggleFullscreen() {
  const elem = document.getElementById('displayArea');
  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(err => alert(`無法進入全螢幕: ${err.message}`));
  } else {
    document.exitFullscreen();
  }
}
