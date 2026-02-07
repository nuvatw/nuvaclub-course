'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Chapter } from '@/content/course/_config'

interface MindMapHeroProps {
  chapters: Chapter[]
  currentChapter: string
}

export function MindMapHero({ chapters, currentChapter }: MindMapHeroProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const activeChapter = chapters.find((c) => c.id === currentChapter)

  // Layout calculations
  const cx = 400
  const cy = 180
  const chapterRadius = 140
  const knowledgeRadius = 70

  return (
    <div className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 py-2.5">
        <h2 className="text-sm font-semibold text-muted flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          知識地圖
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted hover:text-foreground transition-colors p-1 rounded hover:bg-card-hover"
          aria-label={isExpanded ? '收合知識地圖' : '展開知識地圖'}
        >
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <svg viewBox="0 0 800 360" className="w-full h-[300px]">
              {/* Background grid pattern */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="800" height="360" fill="url(#grid)" />

              {/* Lines from center to chapters */}
              {chapters.map((chapter, i) => {
                const angle = ((i - (chapters.length - 1) / 2) * Math.PI) / (chapters.length + 1)
                const x = cx + chapterRadius * Math.cos(angle - Math.PI / 2 + Math.PI)
                const y = cy + chapterRadius * Math.sin(angle - Math.PI / 2 + Math.PI)
                const isActive = chapter.id === currentChapter

                return (
                  <line
                    key={`line-${chapter.id}`}
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    stroke={isActive ? chapter.color : 'rgba(255,255,255,0.1)'}
                    strokeWidth={isActive ? 2 : 1}
                    strokeDasharray={isActive ? 'none' : '4 4'}
                  />
                )
              })}

              {/* Knowledge point lines (for active chapter) */}
              {activeChapter &&
                activeChapter.coreKnowledge.map((_, ki) => {
                  const chapterIdx = chapters.indexOf(activeChapter)
                  const chapterAngle =
                    ((chapterIdx - (chapters.length - 1) / 2) * Math.PI) / (chapters.length + 1)
                  const chapterX =
                    cx + chapterRadius * Math.cos(chapterAngle - Math.PI / 2 + Math.PI)
                  const chapterY =
                    cy + chapterRadius * Math.sin(chapterAngle - Math.PI / 2 + Math.PI)

                  const kAngle =
                    ((ki - (activeChapter.coreKnowledge.length - 1) / 2) * Math.PI) /
                    (activeChapter.coreKnowledge.length + 2)
                  const kx = chapterX + knowledgeRadius * Math.cos(kAngle - Math.PI / 2 + Math.PI)
                  const ky = chapterY + knowledgeRadius * Math.sin(kAngle - Math.PI / 2 + Math.PI)

                  return (
                    <motion.line
                      key={`kline-${ki}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: ki * 0.05 }}
                      x1={chapterX}
                      y1={chapterY}
                      x2={kx}
                      y2={ky}
                      stroke={activeChapter.color}
                      strokeWidth={1}
                      strokeOpacity={0.4}
                    />
                  )
                })}

              {/* Center node */}
              <circle cx={cx} cy={cy} r={28} fill="#18181b" stroke="#3b82f6" strokeWidth={2} />
              <text x={cx} y={cy - 5} textAnchor="middle" fill="#ededed" fontSize="10" fontWeight="600">
                GPTs
              </text>
              <text x={cx} y={cy + 8} textAnchor="middle" fill="#737373" fontSize="8">
                課程
              </text>

              {/* Chapter nodes */}
              {chapters.map((chapter, i) => {
                const angle = ((i - (chapters.length - 1) / 2) * Math.PI) / (chapters.length + 1)
                const x = cx + chapterRadius * Math.cos(angle - Math.PI / 2 + Math.PI)
                const y = cy + chapterRadius * Math.sin(angle - Math.PI / 2 + Math.PI)
                const isActive = chapter.id === currentChapter

                return (
                  <g key={chapter.id}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={isActive ? 22 : 18}
                      fill={isActive ? chapter.color : '#18181b'}
                      stroke={chapter.color}
                      strokeWidth={isActive ? 2 : 1}
                      initial={false}
                      animate={{
                        r: isActive ? 22 : 18,
                        fill: isActive ? chapter.color : '#18181b',
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    <text
                      x={x}
                      y={y + 1}
                      textAnchor="middle"
                      fill={isActive ? '#fff' : '#a1a1aa'}
                      fontSize="9"
                      fontWeight="600"
                      dominantBaseline="middle"
                    >
                      Ch{chapter.number}
                    </text>
                    <text
                      x={x}
                      y={y + (isActive ? 36 : 30)}
                      textAnchor="middle"
                      fill={isActive ? '#ededed' : '#737373'}
                      fontSize="9"
                    >
                      {chapter.title}
                    </text>
                  </g>
                )
              })}

              {/* Knowledge points for active chapter */}
              {activeChapter &&
                activeChapter.coreKnowledge.map((point, ki) => {
                  const chapterIdx = chapters.indexOf(activeChapter)
                  const chapterAngle =
                    ((chapterIdx - (chapters.length - 1) / 2) * Math.PI) / (chapters.length + 1)
                  const chapterX =
                    cx + chapterRadius * Math.cos(chapterAngle - Math.PI / 2 + Math.PI)
                  const chapterY =
                    cy + chapterRadius * Math.sin(chapterAngle - Math.PI / 2 + Math.PI)

                  const kAngle =
                    ((ki - (activeChapter.coreKnowledge.length - 1) / 2) * Math.PI) /
                    (activeChapter.coreKnowledge.length + 2)
                  const kx = chapterX + knowledgeRadius * Math.cos(kAngle - Math.PI / 2 + Math.PI)
                  const ky = chapterY + knowledgeRadius * Math.sin(kAngle - Math.PI / 2 + Math.PI)

                  return (
                    <motion.g
                      key={`k-${ki}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: ki * 0.05 }}
                    >
                      <circle cx={kx} cy={ky} r={4} fill={activeChapter.color} fillOpacity={0.6} />
                      <text
                        x={kx}
                        y={ky + 14}
                        textAnchor="middle"
                        fill="#a1a1aa"
                        fontSize="7.5"
                      >
                        {point}
                      </text>
                    </motion.g>
                  )
                })}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
