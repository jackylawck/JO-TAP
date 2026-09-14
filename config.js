/**
 * JO-TAP 全域設定檔 (東淦 HRF-043 正式環境)
 */
const APP_CONFIG = {
  // 1. 東淦 HRF-043 微軟表單收集回應完整連結
  formsBaseUrl: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=SekoVCLlN0icGNrZmiJqgHdrsKMMnEBEh_14oAG6bhBUNzJPMVNXSE5JVFNFMEhJWVBMQjFWNjZBSC4u",
  
  // 2. Q1: 培訓場次編號 (Session ID) 真實預填 Key
  sessionFieldKey: "r47260548a38342cfb911e2d607927fcc",

  // 3. Plan B 手動代簽 (共用同一張表單與後端通道)
  fallbackFormsUrl: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=SekoVCLlN0icGNrZmiJqgHdrsKMMnEBEh_14oAG6bhBUNzJPMVNXSE5JVFNFMEhJWVBMQjFWNjZBSC4u",
  fallbackFields: {
    sessionId: "r47260548a38342cfb911e2d607927fcc", // Q1: Session ID
    staffNo: "r193df0d8073b4d7dac5f5066afac5ea8",     // Q3: 職員號碼
    staffName: "r0e471e3898314fbda8f4bc503a387210"   // Q4: 中文姓名
  },

  // 4. 企業網域與系統邊界
  emailDomain: "@jumboorient.com.hk",
  maxAttendees: 100,           // 100 人試作限額
  sessionTimeoutHours: 4       // 4 小時自動失效
};
