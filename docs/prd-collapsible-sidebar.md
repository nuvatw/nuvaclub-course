# PRD: Collapsible Sidebar

## Overview

將現有的固定寬度側邊欄改為可收合的設計，預設收合狀態只顯示圖示，展開後顯示完整文字標籤。

## Problem Statement

目前側邊欄固定寬度 240px，在小螢幕或需要更多工作空間時會佔用過多畫面。用戶無法自行控制側邊欄的展開/收合狀態。

## Goals

1. 增加內容區域的可用空間
2. 提供簡潔的圖示導航模式
3. 讓用戶自行控制側邊欄狀態
4. 保持良好的使用體驗和視覺一致性

## User Stories

- 作為用戶，我希望可以收合側邊欄以獲得更多工作空間
- 作為用戶，我希望在收合狀態下仍能透過圖示快速導航
- 作為用戶，我希望收合狀態下 hover 圖示時能看到 tooltip 提示
- 作為用戶，我希望我的展開/收合偏好能被記住

---

## Design Specifications

### 尺寸規格

| 狀態 | 寬度 | 說明 |
|------|------|------|
| 收合 (Collapsed) | 64px | 只顯示圖示，預設狀態 |
| 展開 (Expanded) | 240px | 顯示圖示 + 文字標籤 |

### 收合狀態設計

```
┌──────┐
│  ▶   │  ← Toggle button (展開箭頭)
├──────┤
│  ⚡  │  ← Logo icon only
├──────┤
│  +   │  ← Create button (icon only)
├──────┤
│  📖  │  ← Course (with tooltip on hover)
│  ⚠️  │  ← Issues (with tooltip on hover)
├──────┤
│  👤  │  ← User avatar
└──────┘
```

### 展開狀態設計

```
┌────────────────────────┐
│  ◀  nuvaClub          │  ← Toggle + Logo
├────────────────────────┤
│  [    + 新增    ]      │  ← Create button
├────────────────────────┤
│  📖 Course            │
│  ⚠️ Issues             │
├────────────────────────┤
│  👤 Username          │
│     管理員             │
└────────────────────────┘
```

### Toggle Button 設計

- **位置**：側邊欄頂部，Logo 區域旁邊
- **圖示**：
  - 收合狀態：`▶` (ChevronRight) - 點擊展開
  - 展開狀態：`◀` (ChevronLeft) - 點擊收合
- **樣式**：圓形按鈕，hover 時背景變亮

### Tooltip 設計

- **觸發**：收合狀態下，hover 任何可點擊項目
- **位置**：圖示右側，水平置中對齊
- **內容**：顯示該項目的文字標籤
- **樣式**：
  - 背景：`bg-zinc-800`
  - 文字：`text-foreground`
  - 圓角：`rounded-md`
  - 陰影：`shadow-lg`
  - 箭頭指向左側

### 動畫規格

| 屬性 | 數值 |
|------|------|
| Duration | 200ms |
| Easing | ease-out |
| 寬度過渡 | width: 64px ↔ 240px |
| 文字淡入淡出 | opacity: 0 ↔ 1 |

---

## Component Structure

```tsx
<SidebarProvider defaultCollapsed={true}>
  <Sidebar>
    <SidebarHeader>
      <SidebarToggle />
      <Logo />
    </SidebarHeader>

    <SidebarContent>
      <CreateButton />
      <SidebarNav>
        <SidebarNavItem icon={...} label="Course" href="/" />
        <SidebarNavItem icon={...} label="Issues" href="/issues" />
      </SidebarNav>
    </SidebarContent>

    <SidebarFooter>
      <UserMenu />
    </SidebarFooter>
  </Sidebar>
</SidebarProvider>
```

### State Management

```tsx
interface SidebarState {
  isCollapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggle: () => void
}
```

- 使用 React Context 管理收合狀態
- 使用 `localStorage` 持久化用戶偏好
- Key: `sidebar-collapsed`

---

## Interaction Details

### Toggle 行為

1. 點擊 toggle button → 切換收合/展開狀態
2. 狀態變更時儲存到 localStorage
3. 頁面重新載入時讀取儲存的狀態

### Tooltip 行為

1. 收合狀態下 hover 導航項目
2. 延遲 300ms 後顯示 tooltip
3. 滑鼠移開後 100ms 隱藏 tooltip
4. 展開狀態下不顯示 tooltip

### 收合狀態下的互動

| 元素 | 行為 |
|------|------|
| Logo | 只顯示圖示，可點擊回首頁 |
| 新增按鈕 | 只顯示 + 圖示，點擊展開選單 |
| 導航項目 | 只顯示圖示，hover 顯示 tooltip |
| 用戶頭像 | 只顯示頭像，點擊展開用戶選單 |

### 下拉選單行為

- 收合狀態下，下拉選單向右側展開
- 展開狀態下，下拉選單維持原本向下展開

---

## Visual States

### 導航項目狀態

| 狀態 | 收合模式 | 展開模式 |
|------|----------|----------|
| Default | 圖示 (zinc-400) | 圖示 + 文字 (zinc-400) |
| Hover | 圖示變亮 + tooltip | 背景變亮 |
| Active | 圖示高亮 + 左邊框 | 背景 + 左邊框 + 高亮文字 |

### 顏色定義

```css
/* Toggle button */
--toggle-bg: transparent
--toggle-bg-hover: rgba(255, 255, 255, 0.1)
--toggle-icon: #a1a1aa (zinc-400)
--toggle-icon-hover: #fafafa (foreground)

/* Tooltip */
--tooltip-bg: #27272a (zinc-800)
--tooltip-text: #fafafa (foreground)
--tooltip-border: #3f3f46 (zinc-700)
```

---

## Technical Implementation

### CSS Classes Strategy

```css
/* 收合狀態的條件樣式 */
.sidebar[data-collapsed="true"] {
  width: 64px;
}

.sidebar[data-collapsed="true"] .sidebar-label {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.sidebar[data-collapsed="true"] .create-button-text {
  display: none;
}
```

### Responsive Considerations

- **Desktop (≥1024px)**：支援收合/展開
- **Tablet (768px-1023px)**：預設收合
- **Mobile (<768px)**：使用 drawer/offcanvas 模式（未來考慮）

### Accessibility

- Toggle button 需要 `aria-label`
- 收合狀態下，導航項目需要 `aria-label` 或 `title`
- 支援鍵盤操作（Tab 導航）
- Toggle 快捷鍵：`Cmd/Ctrl + B`（可選）

---

## Success Metrics

1. 用戶可以成功切換側邊欄狀態
2. Tooltip 在收合狀態下正確顯示
3. 狀態在頁面重新載入後保持
4. 動畫流暢無卡頓
5. 所有現有功能在兩種狀態下皆可正常使用

---

## Edge Cases

| 情境 | 處理方式 |
|------|----------|
| localStorage 不可用 | 使用預設收合狀態，不持久化 |
| 快速連續點擊 toggle | Debounce 處理，避免動畫衝突 |
| 下拉選單打開時切換狀態 | 先關閉選單，再執行切換 |
| 視窗大小改變 | 維持當前狀態（不自動切換） |

---

## Implementation Phases

### Phase 1: Core Functionality
- [ ] 新增 SidebarContext 管理狀態
- [ ] 實作 toggle button
- [ ] 實作寬度切換動畫
- [ ] 隱藏/顯示文字標籤

### Phase 2: Polish
- [ ] 實作 Tooltip 組件
- [ ] 收合狀態下的下拉選單調整
- [ ] localStorage 持久化

### Phase 3: Enhancement
- [ ] 鍵盤快捷鍵支援
- [ ] 完善 accessibility
- [ ] 動畫微調

---

## References

- [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar) - 組件架構參考
- [UX Planet - Best Practices for Sidebar](https://uxplanet.org/best-ux-practices-for-designing-a-sidebar-9174ee0ecaa2) - UX 最佳實踐
- [Navbar Gallery - Sidebar Examples](https://www.navbar.gallery/blog/best-side-bar-navigation-menu-design-examples) - 設計靈感
- [Dribbble - Collapsible Sidebar](https://dribbble.com/tags/collapsible_sidebar) - 視覺參考

---

## Appendix: Real-World Examples

### Notion
- 側邊欄可完全收合或展開
- 支援 hover 自動展開（可選）
- 收合時只顯示 page icons

### Slack
- 側邊欄可收合至只顯示 workspace icon
- 使用 accordion 組織頻道分類

### VS Code
- Activity bar 固定顯示圖示
- 點擊圖示展開/收合對應的 side panel
- 支援拖拽調整寬度

### Linear
- 預設收合狀態
- Hover 時自動展開
- 流暢的動畫過渡
