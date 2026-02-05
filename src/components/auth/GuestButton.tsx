'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function GuestButton() {
  return (
    <Link href="/">
      <Button variant="ghost" size="lg" className="text-zinc-400 hover:text-foreground">
        以訪客身份瀏覽
      </Button>
    </Link>
  )
}
