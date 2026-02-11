# PRD: 通知工程師功能 (Notify Engineer)

## 1. 概述

在「開發區」頁面右上角新增一個「通知工程師」按鈕，讓管理者可以勾選多張 issue 單，輸入工程師信箱，撰寫附加訊息後，透過 **hello@meetnuva.com** 寄出通知信件。

---

## 2. 使用情境

| 情境 | 描述 |
|------|------|
| 提醒新任務 | 新增了幾張單子，需要通知工程師開始處理 |
| 催促進度 | 有些單子一直停在「尚未開始」，需要提醒工程師 |
| 狀態更新 | 完成了一批修改，通知工程師來驗收 |
| 自由通知 | 附帶自訂訊息，針對特定問題補充說明 |

---

## 3. 使用者流程 (User Flow)

```
開發區頁面
  ↓
點擊右上角「通知工程師」按鈕
  ↓
開啟 Modal
  ├── 1. 輸入收件人信箱 (必填)
  ├── 2. 從當前 issue 列表中勾選要附帶的 issue (可多選, 至少1張)
  ├── 3. 輸入附加訊息 (選填, e.g. "請優先處理這幾張單")
  └── 4. 點擊「發送通知」
  ↓
API 發送 email (寄件人: hello@meetnuva.com)
  ↓
顯示成功/失敗 Toast 提示
```

---

## 4. UI 規格

### 4.1 觸發按鈕

- **位置**: 開發區頁面 Header 右上角，在「+ 建立項目」按鈕左邊
- **樣式**: `variant="secondary"` Button，帶信封 icon
- **文字**: 「通知工程師」
- **排列**: `flex gap-3` 與建立項目按鈕並排

### 4.2 通知 Modal

使用現有的 `Modal` 元件 (`src/components/ui/Modal.tsx`)，標題為「通知工程師」。

**表單欄位：**

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| 收件人信箱 | `<input type="email">` | 是 | 工程師的 email，支援驗證格式 |
| 選擇項目 | Checkbox 列表 | 是 (至少1) | 顯示當前列表中所有 issue，可全選/取消全選 |
| 附加訊息 | `<textarea>` | 否 | 自由文字，最多 500 字 |

**Issue Checkbox 列表項目顯示：**
- `[checkbox] #issue_number issue_title` + CategoryBadge + StatusBadge
- 每個 item 單行顯示，列表可滾動 (max-height: 300px)
- 頂部有「全選 / 取消全選」快捷操作

**按鈕區：**
- 「發送通知」 (`variant="primary"`, 帶發送 icon)
- 「取消」 (`variant="ghost"`)
- 發送中顯示 loading spinner (`isLoading` prop)

### 4.3 成功/失敗回饋

- 成功: Modal 關閉，頁面頂部顯示綠色 Toast「通知已發送」(3秒後自動消失)
- 失敗: Modal 保持開啟，表單上方顯示紅色錯誤訊息

---

## 5. 技術規格

### 5.1 Email 服務: Resend

選擇 [Resend](https://resend.com) 作為 email 發送服務：
- Next.js Server Action 友好，API 簡潔
- 免費額度 100 封/天，足夠內部使用
- 支援自訂寄件人 domain

**安裝：**
```bash
npm install resend
```

**環境變數新增：**
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
```

> 需要在 Resend 後台驗證 `meetnuva.com` domain 並設定 DNS records (SPF, DKIM)，讓 `hello@meetnuva.com` 可以作為寄件人。

### 5.2 新增檔案

| 檔案 | 用途 |
|------|------|
| `src/lib/resend.ts` | Resend client 初始化 |
| `src/app/actions/notify.ts` | Server Action: 發送通知信 |
| `src/components/issues/NotifyEngineerModal.tsx` | Modal UI 元件 |

### 5.3 修改檔案

| 檔案 | 變更 |
|------|------|
| `src/app/issues/page.tsx` | Header 新增「通知工程師」按鈕，改為 Client Component wrapper |
| `src/components/issues/IssueList.tsx` | 傳遞 issues 資料給 NotifyEngineerModal |
| `src/components/issues/index.ts` | Export NotifyEngineerModal |
| `.env.local` | 新增 `RESEND_API_KEY` |
| `package.json` | 新增 `resend` 依賴 |

### 5.4 Server Action 規格

```typescript
// src/app/actions/notify.ts
'use server'

interface NotifyEngineerInput {
  recipientEmail: string       // 收件人信箱
  issueIds: string[]           // 選中的 issue ID 陣列
  message?: string             // 附加訊息 (選填)
}

interface NotifyResult {
  success: boolean
  error?: string
}

export async function notifyEngineer(input: NotifyEngineerInput): Promise<NotifyResult>
```

**邏輯流程：**
1. 驗證登入狀態
2. Zod 驗證輸入 (email 格式、issueIds 非空陣列、message 長度 ≤500)
3. 從 Supabase 查詢選中 issue 的完整資料 (title, status, priority, category, issue_number)
4. 組裝 email HTML 內容
5. 透過 Resend API 發送
6. 回傳結果

### 5.5 Validation Schema

```typescript
// 新增到 src/lib/validations/issue.ts
export const notifyEngineerSchema = z.object({
  recipientEmail: z.email(),
  issueIds: z.array(z.uuid()).min(1, '請至少選擇一個項目'),
  message: z.string().max(500).optional(),
})
```

### 5.6 Email 內容模板

**Subject:** `[nuvaClub 開發區] 你有 {N} 個項目需要關注`

**Body (HTML):**
```
寄件人: hello@meetnuva.com
---
Hi,

你有以下項目需要關注：

┌──────────────────────────────────────┐
│ #5 校園大使批量匯入                    │
│ 分類: ✨ 願望 | 狀態: 尚未開始 | 優先度: 高  │
│ 🔗 查看詳情                           │
├──────────────────────────────────────┤
│ #3 首頁 SEO 優化                      │
│ 分類: 🔧 修理 | 狀態: 執行中 | 優先度: 中   │
│ 🔗 查看詳情                           │
└──────────────────────────────────────┘

{附加訊息 (如有)}

---
此通知由 nuvaClub 開發追蹤系統發出
```

每張 issue 的「查看詳情」連結指向 `/issues/{id}`，使用完整 URL (需要 `NEXT_PUBLIC_APP_URL` 或硬編碼)。

### 5.7 Rate Limiting

複用現有的 `src/lib/rateLimit.ts`：
- 限制：**10 封 / 小時 / 使用者**
- 防止濫用

---

## 6. 元件互動架構

```
page.tsx (Server Component)
  ├── Header 區塊
  │   ├── IssuePageHeader (新 Client Component)
  │   │   ├── 「通知工程師」按鈕 → 開啟 Modal
  │   │   └── 「+ 建立項目」按鈕
  │   └── NotifyEngineerModal
  │       ├── Email Input
  │       ├── Issue Checkbox List (接收 issues prop)
  │       ├── Message Textarea
  │       └── Submit → calls notifyEngineer() server action
  └── IssueList (不需改動)
```

**重點**: page.tsx 是 Server Component，但 Header 按鈕需要 onClick，所以把 Header 抽成一個小的 Client Component (`IssuePageHeader`)，接收 `issues` prop 來渲染 checkbox 列表。

---

## 7. 安全考量

| 項目 | 處理方式 |
|------|---------|
| 認證 | Server Action 內檢查登入狀態 |
| Email 格式 | Zod email() 驗證 |
| Rate limit | 10 封/小時/使用者 |
| XSS | Email 內容使用模板渲染，不直接插入 raw HTML |
| Issue 權限 | 只需讀取 issue 資料，使用現有 RLS (authenticated users 可 read) |
| 附加訊息 | 限制 500 字，HTML escape |

---

## 8. 實作步驟 (建議順序)

1. **安裝 Resend** + 設定環境變數
2. **建立 `src/lib/resend.ts`** - Resend client
3. **新增 Zod schema** - `notifyEngineerSchema`
4. **建立 Server Action** - `src/app/actions/notify.ts`
5. **建立 Modal 元件** - `NotifyEngineerModal.tsx`
6. **建立 Header 元件** - `IssuePageHeader.tsx` (Client Component)
7. **修改 page.tsx** - 整合新 Header
8. **測試**: 手動發送通知信、驗證 rate limit、驗證表單驗證

---

## 9. 未來擴展 (不在本次範圍)

- 支援多個收件人 (逗號分隔)
- 發送記錄 log (存 Supabase)
- 預設收件人名單
- 定期自動通知 (cron)
- Slack / LINE 通知整合
