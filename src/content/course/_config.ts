export interface Section {
  id: string
  title: string
  chapterDir: string
}

export interface Chapter {
  id: string
  number: number | string
  title: string
  subtitle: string
  color: string
  coreKnowledge: string[]
  sections: Section[]
}

export const COURSE_TOC: Chapter[] = [
  {
    id: 'ch1',
    number: 1,
    title: 'GPTs 開發生命週期與基礎設定',
    subtitle: '建立對 GPTs 的正確認知，並掌握標準開發流程 S2P',
    color: '#3b82f6',
    coreKnowledge: [
      'S2P 開發流程',
      'Metadata 設定',
      'Instruction 撰寫',
      '測試先行（N/E/IP）',
      'Prompt Injection 防護',
      'Publish & Share',
    ],
    sections: [
      { id: '1.1', title: '預期目標 (Expectation)', chapterDir: 'ch1' },
      { id: '1.2', title: '核心差異：GPTs vs ChatGPT', chapterDir: 'ch1' },
      { id: '1.3', title: 'Metadata 的重要性', chapterDir: 'ch1' },
      { id: '1.4', title: 'S2P 詳細流程拆解', chapterDir: 'ch1' },
      { id: '1.5', title: '規格定義 (Spec)', chapterDir: 'ch1' },
      { id: '1.6', title: '建置階段 (Build)', chapterDir: 'ch1' },
      { id: '1.7', title: '測試階段 (Test)', chapterDir: 'ch1' },
      { id: '1.8', title: '預發布階段 (STAGE)', chapterDir: 'ch1' },
      { id: '1.9', title: '發布階段 (Publish)', chapterDir: 'ch1' },
      { id: '1.10', title: '本章小結', chapterDir: 'ch1' },
    ],
  },
  {
    id: 'ch2',
    number: 2,
    title: '指令工程邏輯與結構',
    subtitle: '學習 Instruction 背後的邏輯，讓 GPT 輸出精準且穩定',
    color: '#8b5cf6',
    coreKnowledge: [
      'Good / Bad Instruction',
      'Markdown 語法結構化',
      'Few-shot prompting',
      'Granular steps / Workflow',
      '限制條件 (Restriction)',
      '版本控管 (Version)',
    ],
    sections: [
      { id: '2.1', title: '案例拆解 — 對話小狗', chapterDir: 'ch2' },
      { id: '2.2', title: 'Markdown 語法應用', chapterDir: 'ch2' },
      { id: '2.3', title: '少樣本學習 (Few-shot prompting)', chapterDir: 'ch2' },
      { id: '2.4', title: '細粒度步驟 (Granular steps)', chapterDir: 'ch2' },
      { id: '2.5', title: '負面表述的避諱 (Avoid negative)', chapterDir: 'ch2' },
      { id: '2.6', title: '限制條件 (Restriction)', chapterDir: 'ch2' },
      { id: '2.7', title: '版本控管 (Version)', chapterDir: 'ch2' },
      { id: '2.8', title: '本章總結', chapterDir: 'ch2' },
    ],
  },
  {
    id: 'ch3',
    number: 3,
    title: 'RAG 知識庫優化與資料準備',
    subtitle: '掌握檢索增強生成（RAG），解決 GPT 的幻覺問題',
    color: '#10b981',
    coreKnowledge: [
      'RAG 原理',
      'Chunk 分塊',
      'Semantic Search & Embedding',
      'Evidence-based 回覆',
      '誠實機制',
      '資料最小化',
    ],
    sections: [
      { id: '3.1', title: '實作示範 — 上班小狗', chapterDir: 'ch3' },
      { id: '3.2', title: '破解迷思', chapterDir: 'ch3' },
      { id: '3.3', title: '高品質資料結構', chapterDir: 'ch3' },
      { id: '3.4', title: '動手做', chapterDir: 'ch3' },
      { id: '3.5', title: '檢索原理', chapterDir: 'ch3' },
      { id: '3.6', title: '證據導向回覆 (Evidence based)', chapterDir: 'ch3' },
      { id: '3.7', title: '誠實機制', chapterDir: 'ch3' },
      { id: '3.8', title: '文件治理 (Document Governance)', chapterDir: 'ch3' },
      { id: '3.9', title: '資料最小化 (Data minimization)', chapterDir: 'ch3' },
      { id: '3.10', title: '本章小結', chapterDir: 'ch3' },
    ],
  },
  {
    id: 'ch4',
    number: 4,
    title: '內建功能與多模態擴展',
    subtitle: '靈活運用 GPTs 的原生 Capabilities 解決複雜問題',
    color: '#f59e0b',
    coreKnowledge: [
      'Conversation Starter',
      'Capabilities 全覽',
      'Web Search',
      'Canva 整合',
      'Image Generation',
      'Code Interpreter & Data Analysis',
    ],
    sections: [
      { id: '4.1', title: '實作結果 — 貼心小狗', chapterDir: 'ch4' },
      { id: '4.2', title: '對話啟動器 (Conversation Starter)', chapterDir: 'ch4' },
      { id: '4.3', title: '功能概覽 (Capabilities Overview)', chapterDir: 'ch4' },
      { id: '4.4', title: '聯網搜尋 (Web Search)', chapterDir: 'ch4' },
      { id: '4.5', title: 'Canva 整合', chapterDir: 'ch4' },
      { id: '4.6', title: '影像生成 (Image generation)', chapterDir: 'ch4' },
      { id: '4.7', title: '程式碼解釋器 (Code Interpreter)', chapterDir: 'ch4' },
      { id: '4.8', title: '數據分析 (Data Analysis)', chapterDir: 'ch4' },
      { id: '4.9', title: '本章小結', chapterDir: 'ch4' },
    ],
  },
  {
    id: 'ch5',
    number: 5,
    title: '進階 Actions API 串接',
    subtitle: '讓 GPT 具備執行力，與外部系統連動',
    color: '#ef4444',
    coreKnowledge: [
      'Action 概念',
      'OpenAPI Schema',
      'Authentication',
      'Tool Instruction',
      'Dry run 測試',
      '整合實作',
    ],
    sections: [
      { id: '5.1', title: '實作結果展示', chapterDir: 'ch5' },
      { id: '5.2', title: '什麼是 Action？', chapterDir: 'ch5' },
      { id: '5.3', title: '如何建置 Schema', chapterDir: 'ch5' },
      { id: '5.4', title: '深入理解 Schema', chapterDir: 'ch5' },
      { id: '5.5', title: '驗證機制 (Authentication)', chapterDir: 'ch5' },
      { id: '5.6', title: '工具指令優化 (Tool Instruction)', chapterDir: 'ch5' },
      { id: '5.7', title: '測試運行 (Dry run)', chapterDir: 'ch5' },
      { id: '5.8', title: '本章小結', chapterDir: 'ch5' },
    ],
  },
  {
    id: 'ch6',
    number: 6,
    title: '企業治理與流程轉化',
    subtitle: '將技術落實於企業場景，解決真實痛點',
    color: '#ec4899',
    coreKnowledge: [
      'IKWDA 核心指標',
      '會議決策場景',
      '企業知識庫',
      '市場調查',
      '報表自動化',
      '流程自動化',
    ],
    sections: [
      { id: '6.1', title: '核心指標 (IKWDA)', chapterDir: 'ch6' },
      { id: '6.2', title: '會議決策場景', chapterDir: 'ch6' },
      { id: '6.3', title: '企業知識庫', chapterDir: 'ch6' },
      { id: '6.4', title: '市場調查', chapterDir: 'ch6' },
      { id: '6.5', title: '報表自動化', chapterDir: 'ch6' },
      { id: '6.6', title: '流程自動化', chapterDir: 'ch6' },
      { id: '6.7', title: '未來展望', chapterDir: 'ch6' },
    ],
  },
]

export function findSection(chapterDir: string, sectionId: string) {
  const chapter = COURSE_TOC.find(c => c.id === chapterDir)
  if (!chapter) return null
  const section = chapter.sections.find(s => s.id === sectionId)
  if (!section) return null
  return { chapter, section }
}

export function getAdjacentSections(chapterDir: string, sectionId: string) {
  const allSections = COURSE_TOC.flatMap(c =>
    c.sections.map(s => ({ ...s, chapterTitle: c.title }))
  )
  const idx = allSections.findIndex(
    s => s.chapterDir === chapterDir && s.id === sectionId
  )
  return {
    prev: idx > 0 ? allSections[idx - 1] : null,
    next: idx < allSections.length - 1 ? allSections[idx + 1] : null,
  }
}
