/**
 * JO-TAP (Jumbo Orient Training Attendance Portal)
 * 現場簽到投影中樞 - 運行時核心配置 (正式生產版)
 */
const APP_CONFIG = {
  // 1. 公司與合規基底設定
  companyName: "東淦工程有限公司",
  department: "人力資源組 (HRD)",
  hrAuditEmail: "hrd@jumboorient.com.hk",
  emailDomain: "@jumboorient.com.hk",
  documentCode: "HRF-043",

  // 2. Microsoft Forms 學員簽到表 (已精簡，只帶場次代碼)
  formsBaseUrl: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=SekoVCLlN0icGNrZmiJqgHdrsKMMnEBEh_14oAG6bhBUNzJPMVNXSE5JVFNFMEhJWVBMQjFWNjZBSC4u",
  sessionFieldKey: "r47260548a38342cfb911e2d607927fcc", // 學員表單：場次編號

  // 3. Microsoft Forms 免費即時發信觸發表單 (JO-TAP_發送電郵觸發表)
  triggerFormsUrl: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=SekoVCLlN0icGNrZmiJqgHdrsKMMnEBEh_14oAG6bhBUME1LOFJOVEQ5V05GWTJFU1hOTjFET0IzVy4u",
  triggerFields: {
    sessionId: "r8a15c54dff674ab6a888fe1bb04dd03c",
    trainingTitle: "r0691ffe18cde4760922391e974773845",
    trainerName: "r45215af122b64f30ab29fb9741eb1198",
    trainerEmail: "rfff90147e4864cf2b57f85e4d44f869a",
    trainingLocation: "re52fc3458c3f40dc8b5d54dd3b816fe0",
    trainingDate: "r495bb1c86b28493589590548ccabd8e7",
    trainingTime: "rbbe48207993c459fac84418aaf4a53e8"
  },

  // 4. Plan B 備用通道設定
  fallbackFormsUrl: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=SekoVCLlN0icGNrZmiJqgHdrsKMMnEBEh_14oAG6bhBUNzJPMVNXSE5JVFNFMEhJWVBMQjFWNjZBSC4u",

  // 5. 現場控場配額
  sessionRules: {
    maxAttendees: 100,
    sessionTimeoutHours: 8,
    allowPlanBFallback: true,
    autoFullscreenFallback: true
  }
};

// 保持與舊版相容
const CONFIG = {
  ORG_INFO: {
    COMPANY_NAME: APP_CONFIG.companyName,
    DEPARTMENT: APP_CONFIG.department,
    HR_AUDIT_EMAIL: APP_CONFIG.hrAuditEmail,
    DOCUMENT_CODE: APP_CONFIG.documentCode
  },
  FORMS: {
    BASE_URL: APP_CONFIG.formsBaseUrl,
    TRIGGER_URL: APP_CONFIG.triggerFormsUrl
  }
};

// 避免全局污染與物件意外篡改
Object.freeze(APP_CONFIG);
Object.freeze(APP_CONFIG.triggerFields);
Object.freeze(CONFIG.ORG_INFO);
Object.freeze(CONFIG.FORMS);
