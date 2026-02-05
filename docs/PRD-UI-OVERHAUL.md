# PRD: UI/UX 全面優化

**版本**: 2.0
**預計開發週期**: 5 週
**最後更新**: 2026-02-05

---

## 1. 專案概述

### 1.1 背景
目前系統有以下問題：
- Header 導覽過於擁擠，按鈕太多
- Issue 頁面顏色太多，資訊過載，難以閱讀
- 欄位過多（type、scope、severity 等），實際使用中不需要
- 缺乏統一的設計語言

### 1.2 目標
- 將 Header 改為左側 Sidebar 導覽
- 簡化 Issue 資料結構，只保留必要欄位
- 重新設計 Issue 詳情頁面，提升可讀性
- 建立一致的視覺設計系統

### 1.3 非目標
- 暫不考慮移動端專用介面
- 暫不實作多語言切換功能
- 暫不實作深色/淺色模式切換

---

## 2. 使用者故事

| ID | 角色 | 故事 | 優先級 |
|----|------|------|--------|
| US-01 | 內部成員 | 我希望透過左側 Sidebar 快速切換 Course 和 Issue 頁面 | P0 |
| US-02 | 內部成員 | 我希望點擊「新增」按鈕時可以選擇要建立 Course 還是 Issue | P0 |
| US-03 | 內部成員 | 我希望 Issue 詳情頁面簡潔易讀，資訊有清楚的層級 | P0 |
| US-04 | 內部成員 | 我希望用 ESC 鍵快速關閉圖片預覽 | P1 |
| US-05 | 內部成員 | 我希望只需要填寫必要的 Issue 欄位，不要太複雜 | P0 |

---

## 3. 功能規格

### 3.1 左側 Sidebar 導覽

#### 3.1.1 結構
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌───────┐                                                       │
│ │ Logo  │  nuvaClub                                             │
│ └───────┘                                                       │
│                                                                 │
│ ┌─────────────────────────────────────────┐                     │
│ │  ＋ 新增                                │  ← 主要 CTA 按鈕     │
│ └─────────────────────────────────────────┘                     │
│                                                                 │
│   📚 Course                                 ← 導覽項目           │
│   🐛 Issues                                                     │
│                                                                 │
│                                                                 │
│   ─────────────────────────                                     │
│                                                                 │
│   ⚙️ Settings (未來)                                            │
│                                                                 │
│ ┌─────────────────────────────────────────┐                     │
│ │  👤 Lin Shang Che                       │  ← 使用者資訊        │
│ │     Admin                               │                     │
│ └─────────────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.1.2 「新增」按鈕互動
點擊後顯示 Dropdown：
- **新增 Course** → `/projects/new`
- **新增 Issue** → `/issues/new`

#### 3.1.3 響應式行為
| 螢幕寬度 | Sidebar 狀態 |
|----------|--------------|
| ≥ 1024px | 展開（顯示文字 + icon） |
| 768-1023px | 收合（只顯示 icon） |
| < 768px | 隱藏，改為底部 Tab Bar 或漢堡選單 |

#### 3.1.4 Sidebar 規格
- 寬度：展開 240px，收合 64px
- 背景：`#18181b`（與現有 card 一致）
- 當前頁面項目：左側有 3px 藍色指示線 + 背景色 `#27272a`

---

### 3.2 Issue 資料結構簡化

#### 3.2.1 移除的欄位
| 欄位 | 原用途 | 移除原因 |
|------|--------|----------|
| `type` | Bug/Feat/Chore 分類 | 過於複雜，實際使用不需要細分 |
| `scope` | Web/iOS/Android/API 等 | 目前只有 Web，不需要 |
| `severity` | Blocker/Critical/High/Low | 與 priority 重複 |
| `short_description` | 簡短描述 | 合併到 title |

#### 3.2.2 保留的欄位
| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | UUID | 主鍵 |
| `title` | TEXT | Issue 標題（使用者自行輸入完整標題） |
| `priority` | ENUM | 緊急程度：`low` / `medium` / `high` |
| `status` | ENUM | 狀態：`not_started` / `in_progress` / `done` / `cancelled` |
| `why_background` | TEXT | 背景說明 |
| `current_behavior` | TEXT | 目前行為 |
| `expected_behavior` | TEXT | 預期行為 |
| `acceptance_criteria` | TEXT | 驗收條件 |
| `created_by` | UUID | 建立者 |
| `created_at` | TIMESTAMP | 建立時間 |
| `updated_at` | TIMESTAMP | 更新時間 |

#### 3.2.3 新的 Title 格式
不再自動產生，由使用者自行輸入完整標題，例如：
- `首頁載入速度過慢`
- `會員登入流程優化`
- `修復購物車金額計算錯誤`

---

### 3.3 Issue 詳情頁面重新設計

#### 3.3.1 新版 Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  ← 返回列表                                    [編輯] [刪除]        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Issue 標題                                                         │
│  ══════════════════════════════════════════════════                │
│                                                                     │
│  ┌──────────┐  建立者：Lin Shang Che                               │
│  │ 執行中 ▼ │  建立於：Feb 5, 2026                                 │
│  └──────────┘                                                       │
│                                                                     │
│  ┌───────────────────┐                                             │
│  │  🔴 高  ◯ 中  ◯ 低 │  ← 優先度選擇器（可直接點擊切換）          │
│  └───────────────────┘                                             │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ROW 1: 背景說明                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  背景說明內容...                                             │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ROW 2: 目前行為 vs 預期行為                                        │
│  ┌──────────────────────────┐  ┌──────────────────────────┐        │
│  │  目前行為                │  │  預期行為                │        │
│  │  ────────                │  │  ────────                │        │
│  │                          │  │                          │        │
│  │  內容...                 │  │  內容...                 │        │
│  │                          │  │                          │        │
│  └──────────────────────────┘  └──────────────────────────┘        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ROW 3: 驗收條件                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  驗收條件內容...                                             │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ROW 4: 附加圖片                                                    │
│  ┌─────┐ ┌─────┐ ┌─────┐                                           │
│  │ IMG │ │ IMG │ │ IMG │  ← 點擊放大，ESC 關閉                      │
│  └─────┘ └─────┘ └─────┘                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.3.2 設計原則
- **減少顏色使用**：只用 1-2 種強調色
- **清楚的層級**：標題 > 狀態/優先度 > 內容區塊
- **留白**：區塊之間有足夠間距
- **一致性**：所有區塊使用相同的 card 樣式

#### 3.3.3 顏色規範
| 元素 | 顏色 |
|------|------|
| 狀態 Badge | 灰底白字（統一） |
| 優先度 - 高 | 紅色圓點 `#ef4444` |
| 優先度 - 中 | 黃色圓點 `#eab308` |
| 優先度 - 低 | 藍色圓點 `#3b82f6` |
| 區塊標題 | `#ededed`（foreground） |
| 區塊內容 | `#a1a1aa`（zinc-400） |
| 區塊背景 | `#18181b`（card） |
| 區塊邊框 | `#27272a`（border） |

---

### 3.4 Issue 列表頁面

#### 3.4.1 簡化後的列表項目
```
┌─────────────────────────────────────────────────────────────────────┐
│  🔴  Issue 標題                                      執行中    →   │
│      Lin Shang Che · Feb 5, 2026                                   │
└─────────────────────────────────────────────────────────────────────┘
```

- 左側：優先度圓點（紅/黃/藍）
- 中間：標題 + 建立者 + 時間
- 右側：狀態 + 箭頭

#### 3.4.2 篩選器簡化
只保留：
- **狀態**：全部 / 尚未開始 / 執行中 / 完成 / 撤銷
- **優先度**：全部 / 高 / 中 / 低
- **搜尋**：標題關鍵字

---

### 3.5 Issue 建立/編輯表單

#### 3.5.1 表單欄位
| 順序 | 欄位 | 必填 | 說明 |
|------|------|------|------|
| 1 | 標題 | ✅ | 自由輸入，5-200 字 |
| 2 | 優先度 | ✅ | 高/中/低 三選一按鈕 |
| 3 | 背景說明 | ✅ | Textarea，說明為什麼需要處理 |
| 4 | 目前行為 | ✅ | Textarea，目前系統的行為 |
| 5 | 預期行為 | ✅ | Textarea，期望的行為 |
| 6 | 驗收條件 | ✅ | Textarea，如何驗證已修復 |
| 7 | 附加圖片 | ❌ | 圖片上傳區 |

---

### 3.6 圖片 Lightbox 優化

#### 3.6.1 功能
- 點擊圖片放大顯示
- **ESC 鍵關閉**（新增）
- 左右箭頭切換圖片
- 點擊背景關閉
- 顯示檔名和序號

---

## 4. 資料庫遷移

### 4.1 Schema 變更

```sql
-- 1. 備份現有資料
CREATE TABLE issues_backup AS SELECT * FROM issues;

-- 2. 移除不需要的欄位
ALTER TABLE issues DROP COLUMN IF EXISTS type;
ALTER TABLE issues DROP COLUMN IF EXISTS scope;
ALTER TABLE issues DROP COLUMN IF EXISTS severity;
ALTER TABLE issues DROP COLUMN IF EXISTS short_description;

-- 3. 移除不需要的 ENUM types
DROP TYPE IF EXISTS issue_type CASCADE;
DROP TYPE IF EXISTS issue_scope CASCADE;
DROP TYPE IF EXISTS issue_severity CASCADE;

-- 4. 更新 indexes
DROP INDEX IF EXISTS idx_issues_type;
DROP INDEX IF EXISTS idx_issues_scope;
DROP INDEX IF EXISTS idx_issues_severity;
```

### 4.2 資料遷移
現有 Issue 的 `title` 欄位已包含完整資訊，不需遷移。

---

## 5. API 變更

### 5.1 移除的欄位
所有 Issue 相關 API 移除以下欄位：
- `type`
- `scope`
- `severity`
- `short_description`

### 5.2 Validation Schema 更新
```typescript
// 簡化後的 createIssueSchema
const createIssueSchema = z.object({
  title: z.string().min(5).max(200),
  priority: z.enum(['low', 'medium', 'high']),
  why_background: z.string().min(10).max(5000),
  current_behavior: z.string().min(10).max(5000),
  expected_behavior: z.string().min(10).max(5000),
  acceptance_criteria: z.string().min(10).max(5000),
  image_ids: z.array(z.string().uuid()).optional(),
})
```

---

## 6. 檔案變更清單

### 6.1 新增檔案
| 檔案 | 說明 |
|------|------|
| `src/components/layout/Sidebar.tsx` | 左側導覽列 |
| `src/components/layout/CreateMenu.tsx` | 新增按鈕 Dropdown |
| `src/components/layout/AppLayout.tsx` | 包含 Sidebar 的主要 Layout |

### 6.2 修改檔案
| 檔案 | 變更 |
|------|------|
| `src/app/layout.tsx` | 改用 AppLayout |
| `src/components/layout/Header.tsx` | 移除或簡化為移動端用 |
| `src/components/issues/IssueDetail.tsx` | 重新設計 Layout |
| `src/components/issues/IssueForm.tsx` | 移除多餘欄位 |
| `src/components/issues/IssueCard.tsx` | 簡化設計 |
| `src/components/issues/IssueList.tsx` | 簡化篩選器 |
| `src/components/issues/StatusBadge.tsx` | 簡化，移除 Type/Scope/Severity |
| `src/components/issues/ImageGallery.tsx` | 加入 ESC 關閉功能 |
| `src/types/issues.ts` | 移除多餘類型 |
| `src/lib/validations/issue.ts` | 簡化 Schema |
| `src/app/actions/issues.ts` | 更新 CRUD 邏輯 |

### 6.3 移除檔案
無

---

## 7. 開發時程（5 週）

### Week 1: 設計系統 & Sidebar
| 天數 | 任務 |
|------|------|
| Day 1-2 | 建立設計系統（顏色、間距、元件規範） |
| Day 3-4 | 實作 Sidebar 元件 |
| Day 5 | 實作響應式行為 |

**交付物**：
- [ ] Sidebar 元件完成
- [ ] CreateMenu Dropdown 完成
- [ ] 響應式切換正常

### Week 2: 資料庫 & API 重構
| 天數 | 任務 |
|------|------|
| Day 1 | 備份現有資料 |
| Day 2 | 執行 Schema 遷移 |
| Day 3-4 | 更新 TypeScript 類型 & Validation |
| Day 5 | 更新 Server Actions |

**交付物**：
- [ ] 資料庫 Schema 更新完成
- [ ] API 正常運作
- [ ] 舊資料相容

### Week 3: Issue 詳情頁面重設計
| 天數 | 任務 |
|------|------|
| Day 1-2 | 重新設計 IssueDetail Layout |
| Day 3 | 實作優先度選擇器 |
| Day 4 | 圖片 Lightbox ESC 功能 |
| Day 5 | 細節調整 & 測試 |

**交付物**：
- [ ] Issue 詳情頁面新設計完成
- [ ] ESC 關閉圖片功能
- [ ] 所有區塊正確顯示

### Week 4: Issue 列表 & 表單重設計
| 天數 | 任務 |
|------|------|
| Day 1-2 | 重新設計 IssueList |
| Day 3-4 | 重新設計 IssueForm |
| Day 5 | 篩選器簡化 |

**交付物**：
- [ ] Issue 列表新設計完成
- [ ] Issue 建立/編輯表單簡化
- [ ] 篩選功能正常

### Week 5: 整合測試 & 修正
| 天數 | 任務 |
|------|------|
| Day 1-2 | 整合所有元件 |
| Day 3 | Bug 修正 |
| Day 4 | 效能優化 |
| Day 5 | 最終測試 & 部署 |

**交付物**：
- [ ] 所有功能整合完成
- [ ] 無重大 Bug
- [ ] 部署到生產環境

---

## 8. 風險與緩解

| 風險 | 影響 | 緩解措施 |
|------|------|----------|
| 資料庫遷移失敗 | 高 | 先備份所有資料 |
| 舊 Issue 資料不相容 | 中 | 確保 title 欄位已有完整內容 |
| 響應式設計複雜 | 中 | 先完成桌面版，再處理移動端 |
| 使用者不習慣新介面 | 低 | 保持核心功能不變 |

---

## 9. 成功指標

| 指標 | 目標 |
|------|------|
| Issue 建立表單欄位數 | 從 9 個減少到 6 個 |
| 頁面顏色使用數 | 從 8+ 種減少到 3 種 |
| 使用者建立 Issue 時間 | 減少 30% |
| 頁面載入效能 | 維持或提升 |

---

## 10. 附錄

### 10.1 設計參考
- Linear.app（簡潔的 Issue 追蹤介面）
- Notion（左側 Sidebar 設計）
- GitHub Issues（Issue 詳情頁面）

### 10.2 相關文件
- `docs/ARCHITECTURE.md` - 系統架構
- `docs/SETUP.md` - 設置指南
- `docs/INTEGRATION.md` - 整合指南
