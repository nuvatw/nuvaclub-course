'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { NotifyEngineerModal } from './NotifyEngineerModal'
import type { IssueWithCreator } from '@/types/issues'

interface IssuePageHeaderProps {
  issues: IssueWithCreator[]
}

export function IssuePageHeader({ issues }: IssuePageHeaderProps) {
  const [showNotifyModal, setShowNotifyModal] = useState(false)

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">開發區</h1>
          <p className="mt-1 text-zinc-500">內部開發追蹤系統</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setShowNotifyModal(true)}>
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            通知工程師
          </Button>
          <Link href="/issues/new">
            <Button>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              建立項目
            </Button>
          </Link>
        </div>
      </div>

      <NotifyEngineerModal
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        issues={issues}
      />
    </>
  )
}
