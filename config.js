/**
 * JO-TAP 系統全域設定
 * 注意：學員 QR 碼嚴格僅帶入 sessionId，杜絕講師電郵在前端被窺探或竄改。
 */
const APP_CONFIG = {
  // 1. 學員簽到 Microsoft Forms 收集回應完整連結
  formsBaseUrl: "https://forms.office.com/Pages/ResponsePage.aspx?id=YOUR_TENANT_ID",
  
  // 2. Forms 中「SessionID」這題的預填參數 Key（從 Forms「取得預先填寫的連結」取得）
  sessionFieldKey: "r88a1b2c3d4e",

  // 3. 備用手動補簽表單（Plan B：若工友無手機或斷網，講師點擊代簽直接送入此 Form）
  // 建議直接指向同一張 Forms 或專用補登表單
  fallbackFormsUrl: "https://forms.office.com/Pages/ResponsePage.aspx?id=YOUR_TENANT_ID",
  fallbackFields: {
    sessionId: "r88a1b2c3d4e",
    staffNo: "ra1b2c3d4e5f",   // 職員編號欄位 Key
    staffName: "rb2c3d4e5f6a"  // 中文姓名欄位 Key
  },

  // 4. 公司網域與試點限制
  emailDomain: "@jumboorient.com.hk",
  maxAttendees: 100,
  sessionTimeoutHours: 4 // 本機快取 4 小時過期防撞
};
