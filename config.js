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

  // 2. Microsoft Forms 官方表單真實鏈接
  formsBaseUrl: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=SekoVCLlN0icGNrZmiJqgHdrsKMMnEBEh_14oAG6bhBUNzJPMVNXSE5JVFNFMEhJWVBMQjFWNjZBSC4u",
  
  // 3. 欄位 Prefill 映射鍵（已完全對齊微軟 Forms 真實題目 GUID）
  sessionFieldKey: "r47260548a38342cfb911e2d607927fcc", // 第 4 題：場次編號
  fields: {
    trainingTitle: "rbfd9fb9b92d74180a4abd40a35761c86", // 第 5 題：課程名稱
    trainerName: "r4fe37acd8da24129bde0733b02ccf9dd",   // 第 6 題：主講者姓名
    trainerEmail: "r_TrainerEmail",                      // 保留供後續擴充
    signSource: "r_VerificationType",                     // Self（學員自簽）/ Manual（講者代簽）
    manualBy: "r_OperatorName"
  },

  // 4. Plan B 備用通道設定（共用同一張表單）
  fallbackFormsUrl: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=SekoVCLlN0icGNrZmiJqgHdrsKMMnEBEh_14oAG6bhBUNzJPMVNXSE5JVFNFMEhJWVBMQjFWNjZBSC4u",
  fallbackFields: {
    staffNo: "r_StaffNo",
    staffName: "r_StaffName"
  },

  // 5. 現場控場配額
  sessionRules: {
    maxAttendees: 100,
    sessionTimeoutHours: 8,
    allowPlanBFallback: true,
    autoFullscreenFallback: true
  }
};

// 保持與舊版 CONFIG 命名相容
const CONFIG = {
  ORG_INFO: {
    COMPANY_NAME: APP_CONFIG.companyName,
    DEPARTMENT: APP_CONFIG.department,
    HR_AUDIT_EMAIL: APP_CONFIG.hrAuditEmail,
    DOCUMENT_CODE: APP_CONFIG.documentCode,
    RETENTION_POLICY: "內部人事出勤政策（保存期依審計要求執行）"
  },

  FORMS: {
    BASE_URL: APP_CONFIG.formsBaseUrl,
    FIELD_KEYS: {
      SESSION_ID: APP_CONFIG.sessionFieldKey,
      TRAINING_TITLE: APP_CONFIG.fields.trainingTitle,
      TRAINER_NAME: APP_CONFIG.fields.trainerName,
      TRAINER_EMAIL: APP_CONFIG.fields.trainerEmail,
      SIGN_SOURCE: APP_CONFIG.fields.signSource,
      OPERATOR_NAME: APP_CONFIG.fields.manualBy
    }
  },

  SESSION_RULES: {
    MAX_ATTENDEES: APP_CONFIG.sessionRules.maxAttendees,
    SESSION_TIMEOUT_HOURS: APP_CONFIG.sessionRules.sessionTimeoutHours,
    ALLOW_PLAN_B_FALLBACK: APP_CONFIG.sessionRules.allowPlanBFallback,
    AUTO_FULLSCREEN_FALLBACK: APP_CONFIG.sessionRules.autoFullscreenFallback
  },

  HELPERS: {
    /**
     * 產出學員自主掃碼的 QR Code 專用 URL
     * 自動帶入：場次編號、培訓課程名稱、主講者姓名
     */
    buildAttendeeQrUrl: function(sessionId, title, trainerName, trainerEmail) {
      const p = CONFIG.FORMS.FIELD_KEYS;
      const base = CONFIG.FORMS.BASE_URL;
      const params = new URLSearchParams();
      
      params.append(p.SESSION_ID, sessionId);
      params.append(p.TRAINING_TITLE, title);
      params.append(p.TRAINER_NAME, trainerName);
      if (p.TRAINER_EMAIL && !p.TRAINER_EMAIL.startsWith("r_")) {
        params.append(p.TRAINER_EMAIL, trainerEmail);
      }
      
      return `${base}&${params.toString()}`;
    },

    /**
     * 產出講者現場代簽 (Plan B) 專用 URL
     */
    buildPlanBUrl: function(sessionId, title, trainerName) {
      const p = CONFIG.FORMS.FIELD_KEYS;
      const base = CONFIG.FORMS.BASE_URL;
      const params = new URLSearchParams();
      
      params.append(p.SESSION_ID, sessionId);
      params.append(p.TRAINING_TITLE, title);
      params.append(p.TRAINER_NAME, trainerName || "Trainer");
      
      return `${base}&${params.toString()}`;
    }
  }
};

// 避免全局污染與物件意外篡改
Object.freeze(APP_CONFIG);
Object.freeze(APP_CONFIG.fields);
Object.freeze(CONFIG.ORG_INFO);
Object.freeze(CONFIG.FORMS.FIELD_KEYS);
Object.freeze(CONFIG.SESSION_RULES);
