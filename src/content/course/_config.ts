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
    title: '基本小狗',
    subtitle: '入門與指示工程基本功',
    color: '#3b82f6',
    coreKnowledge: [
      'GPTs vs ChatGPT',
      'Builder 欄位',
      '需求 → Bullet 規格',
      'Instruction 鎖行為',
      '測試先行（tests.md）',
      'Publish & Share',
    ],
    sections: [
      { id: '1.0', title: '本章概要（內部用）', chapterDir: 'ch1' },
      { id: '1.1', title: 'ChatGPT 和 GPTs 差在哪？', chapterDir: 'ch1' },
      { id: '1.2', title: '講 Metadata', chapterDir: 'ch1' },
      { id: '1.3', title: '需求 → bullet points', chapterDir: 'ch1' },
      { id: '1.4', title: '寫 Instruction + Preview 驗收', chapterDir: 'ch1' },
      { id: '1.5', title: '寫測試：一般 / 極端 / Prompt Injection', chapterDir: 'ch1' },
      { id: '1.6', title: 'Publish + Share', chapterDir: 'ch1' },
      { id: '1.7', title: '章節總結與小驗收', chapterDir: 'ch1' },
    ],
  },
  {
    id: 'ch2',
    number: 2,
    title: '指示工程',
    subtitle: '把 Instruction 寫成行為合約',
    color: '#8b5cf6',
    coreKnowledge: [
      '行為合約（Behavior Contract）',
      '可測試輸出格式',
      'Ask-to-clarify',
      'Few-shot 範例',
      '失敗模式清單',
      '版本與維護',
    ],
    sections: [
      { id: '2.0', title: '本章概要', chapterDir: 'ch2' },
      { id: '2.1', title: 'Instruction 骨架', chapterDir: 'ch2' },
      { id: '2.2', title: '可測試輸出格式', chapterDir: 'ch2' },
      { id: '2.3', title: 'Ask-to-clarify', chapterDir: 'ch2' },
      { id: '2.4', title: 'Few-shot 範例', chapterDir: 'ch2' },
      { id: '2.5', title: '失敗模式清單', chapterDir: 'ch2' },
      { id: '2.6', title: '版本與維護', chapterDir: 'ch2' },
      { id: '2.7', title: 'GPT A v0 實作', chapterDir: 'ch2' },
    ],
  },
  {
    id: 'ch3',
    number: 3,
    title: 'Knowledge / RAG',
    subtitle: '把公司資料變成可檢索的回答',
    color: '#10b981',
    coreKnowledge: [
      'RAG 原理',
      'Chunking 分塊',
      'Semantic Search',
      'Evidence-based 回答',
      '文件治理',
      '資料最小化',
    ],
    sections: [
      { id: '3.0', title: '本章概要', chapterDir: 'ch3' },
      { id: '3.1', title: 'Knowledge 工作原理', chapterDir: 'ch3' },
      { id: '3.2', title: 'Chunking', chapterDir: 'ch3' },
      { id: '3.3', title: 'Semantic Search & Embeddings', chapterDir: 'ch3' },
      { id: '3.4', title: 'Evidence-based answering', chapterDir: 'ch3' },
      { id: '3.5', title: 'Document governance', chapterDir: 'ch3' },
      { id: '3.6', title: 'Data minimization', chapterDir: 'ch3' },
      { id: '3.7', title: 'GPT B v0 實作', chapterDir: 'ch3' },
    ],
  },
  {
    id: 'ch4',
    number: 4,
    title: 'Starters + Capabilities',
    subtitle: '讓 GPT 會用工具也不亂用',
    color: '#f59e0b',
    coreKnowledge: [
      'Conversation Starters',
      'Capabilities 全覽',
      'Web Search',
      'Canvas',
      'Image Generation',
      'Code Interpreter',
    ],
    sections: [
      { id: '4.0', title: '本章概要', chapterDir: 'ch4' },
      { id: '4.1', title: 'Conversation Starters', chapterDir: 'ch4' },
      { id: '4.2', title: 'Capabilities 全覽', chapterDir: 'ch4' },
      { id: '4.3', title: 'Web Search', chapterDir: 'ch4' },
      { id: '4.4', title: 'Canvas', chapterDir: 'ch4' },
      { id: '4.5', title: 'Image Generation', chapterDir: 'ch4' },
      { id: '4.6', title: 'Code Interpreter & Data Analysis', chapterDir: 'ch4' },
      { id: '4.7', title: 'GPT D v0 實作', chapterDir: 'ch4' },
    ],
  },
  {
    id: 'ch5',
    number: 5,
    title: 'Actions',
    subtitle: '把 GPT 接上公司系統',
    color: '#ef4444',
    coreKnowledge: [
      'Actions 概念',
      'OpenAPI Schema',
      'Authentication',
      'Tool-use 規格',
      'Write 安全門',
      '整合實作',
    ],
    sections: [
      { id: '5.0', title: '本章概要', chapterDir: 'ch5' },
      { id: '5.1', title: 'Actions 是什麼', chapterDir: 'ch5' },
      { id: '5.2', title: 'OpenAPI 最小 Schema', chapterDir: 'ch5' },
      { id: '5.3', title: 'Authentication', chapterDir: 'ch5' },
      { id: '5.4', title: 'Tool-use 規格', chapterDir: 'ch5' },
      { id: '5.5', title: 'Write actions 安全門', chapterDir: 'ch5' },
      { id: '5.6', title: 'GPT C v1 實作', chapterDir: 'ch5' },
    ],
  },
  {
    id: 'w6',
    number: 'W6',
    title: 'Capstone',
    subtitle: '公司部署與作品集收斂',
    color: '#ec4899',
    coreKnowledge: [
      '內部版 vs 公開版',
      '最終回歸測試',
      '作品集交付',
    ],
    sections: [
      { id: 'w6.1', title: '公司部署策略', chapterDir: 'w6' },
      { id: 'w6.2', title: '最終回歸測試', chapterDir: 'w6' },
      { id: 'w6.3', title: '作品集交付', chapterDir: 'w6' },
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
