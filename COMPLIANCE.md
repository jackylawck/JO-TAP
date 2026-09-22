# 系統架構合規與法律適用性說明
# Compliance Architecture & Legal Applicability Statement

---

### 一、 系統架構邊界與法規適用性裁量 (Statutory Scoping & Applicability)

為防止防禦過當及引入不必要的法律審查成本，專案小組對全球及本港各項法規進行了實質性排查（Substantive Assessment），結論如下：

1. **排除歐盟 AI 法案 (EU AI Act) 及 ISO/IEC 42001 (人工智能管理體系)**:
   * **事實裁決**：JO-TAP（Jumbo Orient Training Attendance Portal）全系統僅利用 HTML5 投影中樞、Microsoft Forms 預填 API、SharePoint 結構化儲存清單及 Power Automate 原生工作流[cite: 1, 8, 25, 26]。
   * **法律定性**：系統不具備自主機器學習特徵，不存在模型推論、資料漂移或自適應黑箱算法，屬「確定性規則工作流」（Deterministic Rule-based Automation）。因此，**嚴格不適用 EU AI Act、網信辦演算法備案及 ISO 42001 AI 合規條款**。本文件明確排除上述標準，避免外部審計要求提供模型評估等無效負擔。
2. **排除歐盟通用數據保障條例 (EU GDPR)**:
   * **事實裁決**：JO-TAP 僅收集東淦工程本地合約員工出勤數據，無歐盟公民跨境收集或行為監控行為（GDPR Article 3 領土管轄權不觸發）[cite: 1, 8]。
3. **切實適用與落實之體系清單**:
   * **香港法例第 486 章《個人資料（私隱）條例》(PDPO)**：落實 DPP 1 至 DPP 6 全生命週期管理。
   * **ISO 9001:2015 質量管理體系**：覆蓋 Clause 7.2（Competence 培訓資歷追蹤）及 Clause 7.5（Documented Information 成文資訊控制，HRF-043）[cite: 1]。
   * **ISO 45001:2018 職業健康安全管理體系**：覆蓋 Clause 7.2 及 7.3（安全專項訓練出席追蹤與合規審計鏈）。
   * **ISO/IEC 27001 / 27701**：依託微軟雲端租戶（Tenant-level）商用加密機制與權限最小化策略。

---

### 二、 系統資安架構與個人防禦性保障 (Information Security & Safeguards)

為保障推行主管免於任何技術越權或資安審計指控，系統實施全鏈路物理性資安隔離：


```

[前端講者筆電 / GitHub Pages]
│
├─ 1. 僅保留 SessionID、地點、時段於暫時性本機記憶 (localStorage)
├─ 2. 徹底清空個人密碼及講者身份殘留 (零資料外洩風險)
│
▼ (HTTPS TLS 1.3 官方加密直連)
[Microsoft Forms] ──> [SharePoint: JO_Training_Attendance] ──> [Power Automate 自動彙整]
▲                                                             │
│                                                             ▼ (系統直接派發)
(工友個人手機掃碼)                                         [HRD / 講師存檔信箱]

```

1. **防窺視與端點零記憶 (Local Storage Hygiene)**:
   * 代碼部署已於 DOM 載入時主動清除 `JO_LAST_TRAINER` 及 `JO_LAST_PREFIX`，杜絕公用培訓室電腦遺留講師個人身份憑證。
2. **最小權限原則 (Principle of Least Privilege)**:
   * 學員填報僅需提供工號、姓名與組別[cite: 1, 8]；敏感密碼、身份證號等一律不設為收集欄位。
   * 簽到總庫 SharePoint `JO_Training_Attendance` 僅對 HRD 成員開放讀寫權限[cite: 21]，一般員工無法回溯瀏覽他人簽到紀錄。
3. **審計軌跡不可篡改性 (Tamper-evident Audit Trail)**:
   * 每筆簽到均由系統自動帶入唯一的全域識別碼 `SessionID` 及微軟雲端時間戳記 `SubmissionTime`[cite: 14]，符合 ISO 9001 / ISO 45001 外部認證機構對可追溯性（Traceability）之剛性要求。

---

### 三、 應急預案與備援機制 (Business Continuity - Plan B)

依據 ISO 9001:2015 應急運作規範，系統具備雙軌備援機制：
1. **個別員工手機問題**：大螢幕具備「現場手動補簽 (Plan B)」功能，即時開啟官方代填介面，並以系統標註確保數據一致性[cite: 26]。
2. **現場全面斷網**：大螢幕常態提示「⚠️ 若現場網絡持續中斷，請即時啟用 HRF-043 紙本簽到表備用」[cite: 28]，確保工地現場合規運作不因技術中斷而產生漏洞。

