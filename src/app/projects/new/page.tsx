'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { createProject } from '@/app/actions/projects'

export default function NewProjectPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string

    if (!title.trim()) {
      setError('請輸入課程標題')
      return
    }

    startTransition(async () => {
      try {
        await createProject(formData)
      } catch (err: unknown) {
        // Don't show error for redirect (Next.js throws NEXT_REDIRECT)
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
          return
        }
        setError('建立課程失敗，請再試一次')
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h1 className="text-2xl font-bold text-foreground">
            建立新課程
          </h1>
          <p className="text-muted mt-2">
            開始一個新的課程製作，包含 18 個預設步驟
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="title"
              name="title"
              label="課程標題"
              placeholder="例如：進階 TypeScript 課程"
              required
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                描述（選填）
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="課程的簡短描述..."
                className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <Input
              id="launchDate"
              name="launchDate"
              label="預計上線日期（選填）"
              type="date"
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                className="flex-1"
                isLoading={isPending}
              >
                建立課程
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
