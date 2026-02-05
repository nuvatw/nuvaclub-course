export const PRODUCTION_STEPS = [
  { index: 1, name: '決定教的軟體 / 大方向', category: 'Pre-Production', timing: 'Week 1', hours: 4 },
  { index: 2, name: '深度研究軟體有的技術、理論', category: 'Research', timing: 'Week 1-2', hours: 16 },
  { index: 3, name: '決定受眾跟核心 Take Away', category: 'Planning', timing: 'Week 2', hours: 4 },
  { index: 4, name: '撰寫完整課綱', category: 'Content', timing: 'Week 2-3', hours: 20 },
  { index: 5, name: '發想影集/紀錄片創意靈感', category: 'Creative', timing: 'Week 3', hours: 8 },
  { index: 6, name: '進行故事撰寫', category: 'Content', timing: 'Week 3-4', hours: 16 },
  { index: 7, name: 'IG 找演員 + 拍攝 Reels', category: 'Marketing', timing: 'Week 4', hours: 8 },
  { index: 8, name: '課程線拍攝', category: 'Production', timing: 'Week 4-5', hours: 16 },
  { index: 9, name: '故事線拍攝', category: 'Production', timing: 'Week 5', hours: 12 },
  { index: 10, name: 'Rough Edit', category: 'Post-Production', timing: 'Week 5-6', hours: 12 },
  { index: 11, name: 'Graphic Motion', category: 'Post-Production', timing: 'Week 6', hours: 10 },
  { index: 12, name: 'Color Grading', category: 'Post-Production', timing: 'Week 6', hours: 6 },
  { index: 13, name: 'Sound Effect', category: 'Post-Production', timing: 'Week 6', hours: 6 },
  { index: 14, name: 'Final Review', category: 'QA', timing: 'Week 7', hours: 4 },
  { index: 15, name: 'Revisions', category: 'Post-Production', timing: 'Week 7', hours: 6 },
  { index: 16, name: 'Export & Compress', category: 'Delivery', timing: 'Week 7', hours: 2 },
  { index: 17, name: 'Platform Upload', category: 'Delivery', timing: 'Week 7', hours: 2 },
  { index: 18, name: 'Launch & Announce', category: 'Marketing', timing: 'Launch Day', hours: 2 },
  { index: 19, name: '發布短影片說明課程內容', category: 'Marketing', timing: 'Post-Launch', hours: 4 },
  { index: 20, name: '發布幕後花絮', category: 'Marketing', timing: 'Post-Launch', hours: 4 },
] as const

export type ProductionStep = typeof PRODUCTION_STEPS[number]

// Category colors
export const CATEGORY_COLORS: Record<string, string> = {
  'Pre-Production': 'bg-purple-600',
  'Research': 'bg-blue-600',
  'Planning': 'bg-cyan-600',
  'Content': 'bg-emerald-600',
  'Creative': 'bg-pink-600',
  'Production': 'bg-orange-600',
  'Post-Production': 'bg-amber-600',
  'QA': 'bg-red-600',
  'Delivery': 'bg-green-600',
  'Marketing': 'bg-violet-600',
}

// Total hours for all steps
export const TOTAL_PRODUCTION_HOURS = PRODUCTION_STEPS.reduce((sum, step) => sum + step.hours, 0)
