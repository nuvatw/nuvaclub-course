'use client'

import { ReactNode } from 'react'

interface TranscriptBlockProps {
  children: ReactNode
}

export function TranscriptBlock({ children }: TranscriptBlockProps) {
  return (
    <div className="my-6 rounded-lg border border-amber-500/30 bg-amber-500/[0.07] p-5 relative">
      <div className="flex items-center gap-2 mb-3 text-amber-400 text-sm font-semibold">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span>逐字稿 / Script</span>
      </div>
      <div className="text-foreground/90 leading-relaxed text-[15px]">
        {children}
      </div>
    </div>
  )
}
