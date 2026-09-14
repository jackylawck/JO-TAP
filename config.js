/**
 * JO-TAP 系統全域設定 (統一表單對齊 HRF-043 版)
 * 特點：
 * 1. 任何人均可填寫 (支援有 / 無 M365 帳號之全體同事)
 * 2. 學員 QR 碼嚴格僅帶入 sessionId
 * 3. Plan B 備用代簽共用同一表單，自動帶入 SessionID、工號、姓名及預設組別
 */
const APP_CONFIG = {
  // 1. 微軟表單收集回應完整連結 (請在 Forms 設定為「任何人均可回應」)
  formsBaseUrl: "https://forms.office.com/Pages/ResponsePage.aspx?id=YOUR_TENANT_ID",
  
  // 2. Q1「培訓場次編號 (Session ID)」的預填參數 Key
  sessionFieldKey: "r88a1b2c3d4e",

  // 3. 備用手動補簽 (Plan B：工友無手機或斷網時，講師於筆電代填，共用同一張 Form)
  fallbackFormsUrl: "https://forms.office.com/Pages/ResponsePage.aspx?id=YOUR_TENANT_ID",
  fallbackFields: {
    sessionId: "r88a1b2c3d4e", // Q1: Session ID Key
    staffNo: "ra1b2c3d4e5f",   // Q3: 職員編號 Key
    staffName: "rb2c3d4e5f6a", // Q4: 中文姓名 Key
    dept: "rc3d4e5f6a7b"       // Q5: 部門 Key (選填，可直接代填預設組別)
  },

  // 4. 系統邊界與過期控制
  emailDomain: "@jumboorient.com.hk",
  maxAttendees: 100,           // 100 人試作容量上限
  sessionTimeoutHours: 4       // 4 小時自動失效防跨日污染
};
