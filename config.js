/**
 * JO-TAP (Jumbo Orient Training Attendance Portal)
 * 現場簽到投影中樞 - 運行時核心配置
 */
const CONFIG = {
  // 1. 公司與合規基底設定
  ORG_INFO: {
    COMPANY_NAME: "東淦工程有限公司",
    DEPARTMENT: "人力資源組 (HRD)",
    HR_AUDIT_EMAIL: "hrd@jumboorient.com.hk",
    DOCUMENT_CODE: "HRF-043",
    RETENTION_POLICY: "內部人事出勤政策（保存期依審計要求執行）"
  },

  // 2. 常設內部培訓師名錄（前端下拉自動帶出，免手打）
  TRAINERS: [
    { id: "jackylaw", name: "Jacky Law", emailPrefix: "jackylaw", title: "HRD Manager" },
    { id: "safety", name: "安全主任 (Safety Team)", emailPrefix: "safety", title: "Safety Officer" },
    { id: "engineering", name: "工程部技術主管", emailPrefix: "eng.tech", title: "Senior Engineer" }
  ],

  // 3. Microsoft Forms 官方表單對接端點與欄位 Prefill Key
  FORMS: {
    // 正式 Forms 回應鏈接
    BASE_URL: "https://forms.office.com/Pages/ResponsePage.aspx?id=YOUR_TENANT_ID_HERE",
    
    // 欄位 Prefill 映射鍵（請依據貴司 Forms 實際 GUID 設定）
    FIELD_KEYS: {
      SESSION_ID: "r_SessionID",          // 場次識別碼
      TRAINING_TITLE: "r_TrainingTitle",  // 課程名稱
      TRAINER_EMAIL: "r_TrainerEmail",    // 講者電郵（關鍵：確保完課自動回傳講者郵箱）
      SIGN_SOURCE: "r_VerificationType",  // 簽到來源：Self（學員自主掃碼） / Manual（講者代簽）
      OPERATOR_NAME: "r_OperatorName"     // 代簽操作人（Plan B 審計溯源）
    }
  },

  // 4. 現場安全與控場配額
  SESSION_RULES: {
    MAX_ATTENDEES: 100,                   // 試點上限配額
    SESSION_TIMEOUT_HOURS: 4,             // 場次有效時間（小時）
    ALLOW_PLAN_B_FALLBACK: true,          // 啟用現場人工補簽通道
    AUTO_FULLSCREEN_FALLBACK: true        // 全螢幕受限時啟用手動按鈕
  },

  // 5. 業務邏輯輔助函式（封裝業務閉環）
  HELPERS: {
    /**
     * 產出學員自主掃碼的 QR Code 專用 URL
     * 包含 SessionID、課程名稱，並自動標記來源為「Self」
     */
    buildAttendeeQrUrl: function(sessionId, title, trainerEmail) {
      const p = CONFIG.FORMS.FIELD_KEYS;
      const base = CONFIG.FORMS.BASE_URL;
      const params = new URLSearchParams();
      
      params.append(p.SESSION_ID, sessionId);
      params.append(p.TRAINING_TITLE, title);
      params.append(p.TRAINER_EMAIL, trainerEmail);
      params.append(p.SIGN_SOURCE, "Self"); // 審計標籤：學員手機自簽
      
      return `${base}&${params.toString()}`;
    },

    /**
     * 產出講者現場代簽 (Plan B) 專用 URL
     * 自動鎖定場次編號，並標記來源為「Manual」與代簽人姓名
     */
    buildPlanBUrl: function(sessionId, title, trainerName) {
      const p = CONFIG.FORMS.FIELD_KEYS;
      const base = CONFIG.FORMS.BASE_URL;
      const params = new URLSearchParams();
      
      params.append(p.SESSION_ID, sessionId);
      params.append(p.TRAINING_TITLE, title);
      params.append(p.SIGN_SOURCE, "Manual"); // 審計標籤：現場代簽
      params.append(p.OPERATOR_NAME, trainerName || "Trainer"); // 記錄代簽人
      
      return `${base}&${params.toString()}`;
    }
  }
};

// 避免全局污染與物件意外篡改
Object.freeze(CONFIG.ORG_INFO);
Object.freeze(CONFIG.FORMS.FIELD_KEYS);
Object.freeze(CONFIG.SESSION_RULES);
