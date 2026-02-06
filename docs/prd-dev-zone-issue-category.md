# PRD: 開發區重新命名 + Issue 分類（Fix / Wish）

## Overview

將現有的「問題」區域重新命名為「開發區」，並為每個 issue 新增分類欄位，讓使用者在建立 issue 時選擇「fix 修理」或「wish 願望」兩種類型。Fix 代表需要修復的 bug 或錯誤，Wish 代表期望新增的功能或改善。

## Problem Statement

目前所有 issue 都沒有分類機制，無法區分是「修理既有問題」還是「許願新功能」。團隊在檢視 issue 列表時，難以快速判斷每個 issue 的性質，也無法按類型篩選。此外，「問題」這個名稱偏向負面，改為「開發區」能更好地涵蓋 fix 與 wish 兩種用途。

## Goals

1. 將整個 issue 區域重新命名為「開發區」
2. 為每個 issue 新增 `category` 分類欄位（fix / wish）
3. 在建立和編輯 issue 時可以選擇分類
4. 在列表、詳情頁面顯示分類標籤
5. 支援按分類篩選 issue
6. 資料庫層面完整支援新欄位

## User Stories

- 作為用戶，我希望看到側邊欄顯示「開發區」而非「問題」
- 作為用戶，我希望建立 issue 時可以選擇是「fix 修理」還是「wish 願望」
- 作為用戶，我希望在 issue 列表中一眼看出每個 issue 的分類
- 作為用戶，我希望可以按分類篩選 issue 列表
- 作為用戶，我希望在 issue 詳情頁看到分類資訊

---

## Design Specifications

### 分類定義

| 值 | 中文標籤 | 英文標籤 | 說明 | 視覺樣式 |
|------|----------|----------|------|----------|
| `fix` | 修理 | Fix | 修復 bug、錯誤、異常行為 | 橘色標籤 `bg-orange-500/15 text-orange-400 border-orange-500/30` |
| `wish` | 願望 | Wish | 期望新增的功能或改善 | 紫色標籤 `bg-violet-500/15 text-violet-400 border-violet-500/30` |

### UI 文字更新總覽

| 位置 | 目前文字 | 新文字 |
|------|----------|--------|
| Sidebar 導航名稱 | 問題 | 開發區 |
| Sidebar 新增按鈕 | 新增問題 | 新增項目 |
| Sidebar tooltip（收合時） | 問題 | 開發區 |
| 頁面標題 `<h1>` | 問題 | 開發區 |
| 頁面副標題 | 內部問題追蹤系統 | 內部開發追蹤系統 |
| metadata title | 問題 \| nuvaClub | 開發區 \| nuvaClub |
| metadata description | 內部問題追蹤系統 | 內部開發追蹤系統 |
| layout description | 課程製作與問題追蹤系統 | 課程製作與開發追蹤系統 |
| 搜尋 placeholder | 搜尋問題... | 搜尋項目... |
| 新增按鈕 | 建立問題單 | 建立項目 |
| 空狀態標題 | 沒有找到問題 | 沒有找到項目 |
| 空狀態描述 | 建立第一個問題開始追蹤 | 建立第一個項目開始追蹤 |
| 新增頁面標題 | 建立問題單 | 建立項目 |
| 編輯頁面標題 | 編輯問題 | 編輯項目 |
| 表單送出按鈕 | 建立問題 | 建立項目 |
| 刪除確認 | 確定要刪除這個問題？ | 確定要刪除這個項目？ |
| Toast 訊息 | 各種「問題」相關文字 | 改為「項目」 |

### Issue Card 設計（列表頁）

```
┌─────────────────────────────────────────────────────────┐
│ ● #1  [fix 修理]  首頁載入速度過慢                        │
│   User Name · 2 hours ago                    [===] →    │
├─────────────────────────────────────────────────────────┤
│ ● #2  [wish 願望]  希望能新增深色模式                     │
│   Another User · 1 day ago                   [===] →    │
└─────────────────────────────────────────────────────────┘
```

- 分類標籤顯示在 issue number 之後、標題之前
- 使用小型 badge 樣式，帶有對應顏色背景

### Issue Form 設計（新增 / 編輯頁面）

```
標題 *
[例：首頁載入速度過慢....................]

分類 *
[● fix 修理]  [● wish 願望]
    ↑ 按鈕選擇器，類似現有的 Priority Selector

優先度 *
[● 高] [● 中] [● 低]

... (其他欄位不變)
```

- 分類選擇器放在「標題」之後、「優先度」之前
- 使用按鈕選擇器樣式（類似 PrioritySelector）
- 預設值：`fix`
- 必填欄位

### Issue Detail 設計（詳情頁）

```
#1
[fix 修理]                        ← 分類 badge
首頁載入速度過慢

狀態
[尚未開始][執行中][完成]

優先度
[● 高] [● 中] [● 低]

... (其他不變)
```

- 分類 badge 顯示在 issue number 下方、標題上方
- 分類在詳情頁為唯讀（需進入編輯頁才能修改）

### 篩選器設計（列表頁）

```
[🔍 搜尋項目...]  [搜尋]
分類: [▼ 全部]   狀態: [▼ 全部]   優先度: [▼ 全部]
```

- 新增「分類」下拉篩選，放在狀態篩選之前
- 選項：全部 / fix 修理 / wish 願望

---

## Technical Implementation

### 1. Supabase 資料庫變更

#### 新增 Migration 檔案：`005_add_issue_category.sql`

```sql
-- Migration: Add issue category (fix/wish)

-- 1. Create category enum
CREATE TYPE issue_category AS ENUM ('fix', 'wish');

-- 2. Add category column to issues table (default: 'fix')
ALTER TABLE issues ADD COLUMN category issue_category NOT NULL DEFAULT 'fix';

-- 3. Add index for category filtering
CREATE INDEX idx_issues_category ON issues (category);

-- 4. Update comments
COMMENT ON COLUMN issues.category IS 'Issue category: fix (bug repair) or wish (feature request)';
```

**重點**：
- 使用 PostgreSQL ENUM 類型，與現有的 `issue_priority` / `issue_status` 一致
- 預設值為 `fix`，確保既有資料向下相容
- 既有 issue 會自動歸類為 `fix`

### 2. TypeScript 類型定義更新

#### `src/types/issues.ts`

```typescript
// 新增
export type IssueCategory = 'fix' | 'wish'

// 更新 Issue interface
export interface Issue {
  id: string
  issue_number: number
  title: string
  category: IssueCategory        // ← 新增
  priority: IssuePriority
  status: IssueStatus
  why_background: string | null
  current_behavior: string | null
  expected_behavior: string | null
  acceptance_criteria: string | null
  created_by: string
  created_at: string
  updated_at: string
}

// 更新 IssueFormData
export interface IssueFormData {
  title: string
  category: IssueCategory         // ← 新增
  priority: IssuePriority
  why_background: string
  current_behavior: string
  expected_behavior: string
  acceptance_criteria: string
  image_ids?: string[]
}

// 更新 IssueFilters
export interface IssueFilters {
  category?: IssueCategory | 'all'  // ← 新增
  status?: IssueStatus | 'all'
  priority?: IssuePriority | 'all'
  search?: string
  createdBy?: string
}

// 新增 label mapping
export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, { en: string; zh: string }> = {
  fix: { en: 'Fix', zh: '修理' },
  wish: { en: 'Wish', zh: '願望' },
}

// 新增 category colors
export const ISSUE_CATEGORY_COLORS: Record<IssueCategory, string> = {
  fix: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  wish: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
}
```

### 3. Zod 驗證更新

#### `src/lib/validations/issue.ts`

```typescript
// 新增
export const issueCategorySchema = z.enum(['fix', 'wish'])

// 更新 createIssueSchema — 新增 category 欄位
createIssueSchema: {
  category: issueCategorySchema,
  // ... 其他欄位不變
}

// 更新 updateIssueSchema — 新增 category 欄位 (optional)
updateIssueSchema: {
  category: issueCategorySchema.optional(),
  // ... 其他欄位不變
}

// 更新 issueFiltersSchema — 新增 category 篩選
issueFiltersSchema: {
  category: z.union([issueCategorySchema, z.literal('all')]).optional().default('all'),
  // ... 其他欄位不變
}
```

### 4. Server Actions 更新

#### `src/app/actions/issues.ts`

- `createIssue()`：insert 時加入 `category` 欄位
- `updateIssue()`：update 時支援 `category` 欄位
- `getIssues()`：查詢時支援 `category` 篩選條件
  ```typescript
  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }
  ```

### 5. 前端元件更新

#### 需要修改的檔案清單

| 檔案 | 修改內容 |
|------|----------|
| `src/components/layout/Sidebar.tsx` | 「問題」→「開發區」，「新增問題」→「新增項目」，圖示更換（可選） |
| `src/app/layout.tsx` | metadata description 更新 |
| `src/app/issues/page.tsx` | 頁面標題、metadata、文字更新，傳遞 category filter |
| `src/app/issues/new/page.tsx` | 頁面標題文字更新 |
| `src/app/issues/[id]/page.tsx` | 頁面 metadata 更新 |
| `src/app/issues/[id]/edit/page.tsx` | 頁面標題文字更新 |
| `src/app/issues/loading.tsx` | 無需修改（骨架屏） |
| `src/components/issues/IssueList.tsx` | 新增 category 篩選器、搜尋 placeholder 更新、空狀態文字更新 |
| `src/components/issues/IssueCard.tsx` | 在 issue number 後顯示 category badge |
| `src/components/issues/IssueDetail.tsx` | 顯示 category badge、刪除確認文字更新 |
| `src/components/issues/IssueForm.tsx` | 新增 CategorySelector、表單提交邏輯更新、按鈕文字更新 |
| `src/components/issues/StatusBadge.tsx` | 新增 `CategoryBadge` 元件和 `CategorySelector` 元件 |
| `src/components/issues/index.ts` | 匯出新元件 |
| `src/types/issues.ts` | 新增 type、labels、colors（如上所述） |
| `src/lib/validations/issue.ts` | 新增 schema（如上所述） |
| `src/app/actions/issues.ts` | CRUD 邏輯更新（如上所述） |

### 6. 新增 UI 元件

#### `CategoryBadge`（在 `StatusBadge.tsx` 中新增）

```tsx
// 用於顯示分類標籤（列表卡片、詳情頁）
export function CategoryBadge({ category }: { category: IssueCategory }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${ISSUE_CATEGORY_COLORS[category]}`}>
      {category === 'fix' ? '🔧' : '✨'} {ISSUE_CATEGORY_LABELS[category].zh}
    </span>
  )
}
```

#### `CategorySelector`（在 `StatusBadge.tsx` 中新增）

```tsx
// 用於表單中選擇分類（類似 PrioritySelector 的按鈕樣式）
export function CategorySelector({
  category,
  onChange,
  disabled,
}: {
  category: IssueCategory
  onChange: (category: IssueCategory) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      {(['fix', 'wish'] as IssueCategory[]).map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          disabled={disabled}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            category === cat
              ? ISSUE_CATEGORY_COLORS[cat]
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {cat === 'fix' ? '🔧' : '✨'} {ISSUE_CATEGORY_LABELS[cat].zh}
        </button>
      ))}
    </div>
  )
}
```

### 7. URL 路由

- 路由路徑維持 `/issues` 不變（只改顯示文字，不改路由結構）
- 新增 query parameter：`?category=fix` 或 `?category=wish`

---

## Migration 策略

1. **向下相容**：既有 issue 自動獲得 `category = 'fix'` 預設值
2. **零停機**：新增欄位有預設值，不影響現有查詢
3. **前端相容**：新增的 category 篩選預設為 `all`，不影響既有使用體驗

## 完整修改檔案列表

### 資料庫
1. `supabase/migrations/005_add_issue_category.sql` — **新增**

### TypeScript 類型 & 驗證
2. `src/types/issues.ts` — **修改**
3. `src/lib/validations/issue.ts` — **修改**

### Server Actions
4. `src/app/actions/issues.ts` — **修改**

### Pages（路由頁面）
5. `src/app/layout.tsx` — **修改**（description 文字）
6. `src/app/issues/page.tsx` — **修改**（標題、metadata、filter 傳遞）
7. `src/app/issues/new/page.tsx` — **修改**（標題文字）
8. `src/app/issues/[id]/page.tsx` — **修改**（metadata）
9. `src/app/issues/[id]/edit/page.tsx` — **修改**（標題文字）

### Components
10. `src/components/layout/Sidebar.tsx` — **修改**（導航文字）
11. `src/components/issues/IssueList.tsx` — **修改**（篩選器、文字）
12. `src/components/issues/IssueCard.tsx` — **修改**（category badge）
13. `src/components/issues/IssueDetail.tsx` — **修改**（category badge、文字）
14. `src/components/issues/IssueForm.tsx` — **修改**（category selector、文字）
15. `src/components/issues/StatusBadge.tsx` — **修改**（新增 CategoryBadge、CategorySelector）
16. `src/components/issues/index.ts` — **修改**（匯出新元件）

**總計：1 個新增檔案 + 15 個修改檔案**
