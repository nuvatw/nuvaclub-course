# PRD: Course Production Tracker - UI/UX 全面升級

## 📋 概述

### 目標
將 Course Production Tracker 從基礎功能型應用升級為具有頂級視覺體驗的現代化 Web 應用，打造流暢、精緻、令人愉悅的使用體驗。

### 設計理念
- **Netflix-inspired Dark Theme**: 深邃的暗色主題，搭配微妙的光影效果
- **Glassmorphism**: 玻璃態設計，增加層次感和現代感
- **Purposeful Motion**: 有意義的動畫，引導用戶注意力
- **Micro-interactions**: 細膩的交互反饋，提升操作確認感

---

## 🎨 Phase 1: 視覺設計系統升級

### 1.1 色彩系統增強

```css
/* 新增色彩變數 */
:root {
  /* 基礎色 */
  --background: #09090b;
  --card: #18181b;
  --card-hover: #27272a;

  /* 主色調 - 漸層藍 */
  --primary: #3b82f6;
  --primary-glow: rgba(59, 130, 246, 0.5);
  --primary-gradient: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);

  /* 狀態色 */
  --success: #22c55e;
  --success-glow: rgba(34, 197, 94, 0.4);
  --warning: #eab308;
  --warning-glow: rgba(234, 179, 8, 0.4);
  --in-progress: #f97316;
  --in-progress-glow: rgba(249, 115, 22, 0.4);

  /* 玻璃效果 */
  --glass-bg: rgba(24, 24, 27, 0.8);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

### 1.2 Typography 增強

- 標題使用 `font-weight: 700` 搭配微妙的 `text-shadow`
- 數字使用 `tabular-nums` 確保對齊
- 重要信息使用漸層文字效果

### 1.3 Glassmorphism 組件

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: 16px;
}
```

---

## ✨ Phase 2: 首頁重新設計

### 2.1 Hero Section

**動畫效果:**
- 標題文字逐字漸入 (stagger animation)
- 背景使用微妙的漸層動畫 (gradient shift)
- CTA 按鈕帶有呼吸光暈效果

**實現:**
```jsx
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  Course Production Tracker
</motion.h1>
```

### 2.2 Project Cards 重新設計

**卡片結構:**
```
┌─────────────────────────────────────────────────────┐
│  Project Title                        [Category]    │
│  Description text...                                │
│                                                     │
│  ═══════════════════════════════════════════════   │
│  ●────●────●────●────◐────○────○────○────○         │
│  1    2    3    4    5    6    7    8    9         │
│       Kickoff  R&D  Outline [Current: Script]      │
│                                                     │
│  Step 5/18 • Est. 40h remaining                    │
└─────────────────────────────────────────────────────┘
```

**進度條設計:**
- 18 個步驟用圓點表示
- 已完成: 實心圓 `●` + 綠色
- 進行中: 半圓 `◐` + 橙色 + **發光脈衝動畫**
- 未開始: 空心圓 `○` + 灰色

**發光效果 CSS:**
```css
.step-active {
  background: var(--in-progress);
  box-shadow:
    0 0 10px var(--in-progress-glow),
    0 0 20px var(--in-progress-glow),
    0 0 30px var(--in-progress-glow);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow:
      0 0 5px var(--in-progress-glow),
      0 0 10px var(--in-progress-glow);
  }
  50% {
    box-shadow:
      0 0 15px var(--in-progress-glow),
      0 0 30px var(--in-progress-glow),
      0 0 45px var(--in-progress-glow);
  }
}
```

**懸停效果:**
- 卡片輕微上浮 `translateY(-4px)`
- 邊框發光
- 背景漸變增強

### 2.3 項目列表動畫

**進場動畫:**
- Cards stagger animation (依次進入)
- 每張卡片延遲 100ms
- 使用 `opacity` + `translateY` 組合

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
```

---

## 🔄 Phase 3: 載入狀態與骨架屏

### 3.1 全局載入動畫

**設計:**
- Logo 或品牌標識
- 下方有流動的進度條
- 微妙的背景粒子效果

```jsx
function GlobalLoader() {
  return (
    <div className="loader-container">
      <motion.div
        className="loader-logo"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      <div className="loader-bar">
        <motion.div
          className="loader-progress"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      </div>
    </div>
  )
}
```

### 3.2 骨架屏設計

**原則:**
- 與實際內容佈局完全一致
- 使用 shimmer 動畫而非靜態灰塊
- 顏色使用 `#27272a` → `#3f3f46` 漸變

**Shimmer 效果:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--card) 0%,
    var(--card-hover) 50%,
    var(--card) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 3.3 項目詳情頁骨架

```
┌─────────────────────────────────────────────────────┐
│  ████████████████                    [████████]     │
│  ████████████████████████████                       │
│  ════════════════════════════════════════════       │
│                                                     │
│  ┌───────────┐  ┌──────────────────────────────┐   │
│  │ ████████  │  │  ████████████████████████    │   │
│  │ ████████  │  │  ████████████                │   │
│  │ ████████  │  │                              │   │
│  │ ████████  │  │  ┌────────────────────────┐  │   │
│  │ ████████  │  │  │ ████████████████████   │  │   │
│  │ ████████  │  │  └────────────────────────┘  │   │
│  └───────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Phase 4: 交互與微動畫

### 4.1 按鈕交互

**狀態:**
- Default: 標準樣式
- Hover: 輕微放大 (1.02) + 光暈
- Active: 縮小 (0.98) + 顏色加深
- Loading: 內部 spinner + disabled

```jsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="btn-primary"
>
  {isLoading ? <Spinner /> : children}
</motion.button>
```

### 4.2 步驟完成動畫

**完成時:**
1. 圓點從橙色漸變為綠色 (300ms)
2. 短暫放大 (scale 1.2) 後恢復
3. 綠色成功光暈閃爍
4. 下一個步驟開始發光脈衝
5. Confetti 粒子效果 (可選)

```jsx
<motion.div
  initial={{ scale: 1, backgroundColor: "#f97316" }}
  animate={{
    scale: [1, 1.3, 1],
    backgroundColor: "#22c55e"
  }}
  transition={{ duration: 0.5 }}
/>
```

### 4.3 卡片展開動畫

**點擊項目卡片:**
- 平滑過渡到詳情頁
- 使用 `layoutId` 實現共享元素動畫
- 卡片「展開」成全屏視圖

### 4.4 列表項交互

- Hover: 背景顏色變化 + 左側出現指示條
- Click: Ripple 效果
- Focus: 清晰的 focus ring

### 4.5 表單交互

**Input Focus:**
- 邊框顏色變化
- 底部出現發光線條
- Label 上浮動畫 (floating label)

**Submit 成功:**
- 按鈕變綠 + checkmark 動畫
- Toast 通知滑入

---

## 📊 Phase 5: 進度視覺化增強

### 5.1 橫向步驟進度條

**組件結構:**
```jsx
<StepProgressBar
  steps={18}
  currentStep={5}
  completedSteps={[1,2,3,4]}
/>
```

**視覺設計:**
```
已完成        進行中        未開始
  ●────────────◐·············○
  ↑            ↑             ↑
 綠色         橙色+發光      灰色
 連接線實線    脈衝動畫      連接線虛線
```

### 5.2 圓形進度指示

**用於:**
- 項目整體完成度
- 單個步驟的子任務

**設計:**
- SVG 圓環
- 漸層描邊
- 中心顯示百分比
- 動畫填充效果

```jsx
<CircularProgress
  value={28}
  max={100}
  size={120}
  strokeWidth={8}
  gradient={['#3b82f6', '#8b5cf6']}
/>
```

### 5.3 時間軸視圖

**項目詳情頁側邊欄:**
```
┌─ Production ─────────────────┐
│                              │
│  ✓ Kickoff         2h       │
│  │                          │
│  ✓ R&D Research    14h      │
│  │                          │
│  ✓ Outline         8h       │
│  │                          │
│  ◐ Script Writing  ████░░   │  ← 當前步驟，發光
│  │  [20h est.]              │
│  │                          │
│  ○ Script Review            │
│  ⋮                          │
└──────────────────────────────┘
```

---

## 🌊 Phase 6: 頁面過渡動畫

### 6.1 路由切換效果

**方案: Slide + Fade**
```jsx
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  enter: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    variants={pageVariants}
    initial="initial"
    animate="enter"
    exit="exit"
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### 6.2 共享元素過渡

**從首頁 → 詳情頁:**
- 項目標題保持位置，平滑移動到新位置
- 進度條展開為完整步驟列表
- 背景模糊過渡

```jsx
// 首頁卡片
<motion.h3 layoutId={`title-${project.id}`}>
  {project.title}
</motion.h3>

// 詳情頁
<motion.h1 layoutId={`title-${project.id}`}>
  {project.title}
</motion.h1>
```

---

## 💬 Phase 7: 反饋系統

### 7.1 Toast 通知

**設計:**
- 右上角滑入
- 圖標 + 文字
- 自動消失 (3s)
- 支持 success/error/info 類型

**動畫:**
```jsx
<motion.div
  initial={{ opacity: 0, y: -20, x: 20 }}
  animate={{ opacity: 1, y: 0, x: 0 }}
  exit={{ opacity: 0, x: 100 }}
>
```

### 7.2 確認對話框

- 背景模糊 (backdrop-blur)
- 彈出動畫 (scale + opacity)
- 按鈕帶有適當反饋

### 7.3 操作成功反饋

**步驟完成:**
- 綠色閃爍
- 數字遞增動畫
- 可選: 慶祝粒子效果

---

## 📱 Phase 8: 響應式與觸控優化

### 8.1 斷點設計

| 斷點 | 寬度 | 佈局 |
|------|------|------|
| Mobile | < 640px | 單列，底部導航 |
| Tablet | 640-1024px | 雙列，側邊欄可收起 |
| Desktop | > 1024px | 三列，完整側邊欄 |

### 8.2 觸控優化

- 最小點擊區域: 44x44px
- 滑動手勢支持
- 長按顯示快捷操作

---

## 🛠 技術實現

### 依賴項

```json
{
  "dependencies": {
    "framer-motion": "^11.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  }
}
```

### 文件結構

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # 增強版按鈕
│   │   ├── Card.tsx            # 玻璃態卡片
│   │   ├── ProgressBar.tsx     # 發光進度條
│   │   ├── StepIndicator.tsx   # 步驟指示器
│   │   ├── Skeleton.tsx        # 骨架屏組件
│   │   ├── Toast.tsx           # 通知組件
│   │   └── Spinner.tsx         # 載入動畫
│   ├── animations/
│   │   ├── PageTransition.tsx  # 頁面過渡
│   │   ├── FadeIn.tsx          # 漸入動畫
│   │   └── StaggerContainer.tsx # 錯開動畫容器
│   └── projects/
│       ├── ProjectCard.tsx     # 重新設計的卡片
│       ├── StepProgress.tsx    # 步驟進度組件
│       └── StepTimeline.tsx    # 時間軸組件
├── styles/
│   ├── animations.css          # 自定義動畫
│   └── glassmorphism.css       # 玻璃效果
└── lib/
    └── animations.ts           # Framer Motion variants
```

---

## 📅 實施計劃

### Week 1: 基礎設施
- [ ] 安裝 Framer Motion
- [ ] 更新色彩系統
- [ ] 創建基礎動畫 variants
- [ ] 實現骨架屏組件

### Week 2: 首頁重構
- [ ] 重新設計 ProjectCard
- [ ] 實現發光進度條
- [ ] 添加卡片動畫
- [ ] Hero section 動畫

### Week 3: 詳情頁增強
- [ ] 步驟時間軸組件
- [ ] 步驟完成動畫
- [ ] 優化側邊欄
- [ ] 評論區動畫

### Week 4: 精修與優化
- [ ] 頁面過渡動畫
- [ ] Toast 系統
- [ ] 響應式調整
- [ ] 性能優化

---

## 📏 成功指標

| 指標 | 目標 |
|------|------|
| Lighthouse Performance | > 90 |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| 用戶滿意度 | 4.5/5 |

---

## 🔗 參考資源

- [UI/UX Design Trends 2025](https://shakuro.com/blog/ui-ux-design-trends-for-2025)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [CSS Skeleton Loading Examples](https://www.subframe.com/tips/css-skeleton-loading-examples)
- [Next.js Page Transitions](https://blog.olivierlarose.com/articles/nextjs-page-transition-guide)
- [Glassmorphism CSS Generator](https://hype4.academy/tools/glassmorphism-generator)
- [CSS Glow Effects](https://www.testmu.ai/blog/glowing-effects-in-css/)

---

## 📝 附錄: 關鍵動畫代碼片段

### A. 發光脈衝效果
```css
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
    transform: scale(1.05);
  }
}
```

### B. Shimmer 骨架效果
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, #27272a 0%, #3f3f46 50%, #27272a 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### C. 頁面進入動畫
```typescript
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
}
```

### D. 錯開進入動畫
```typescript
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}
```
