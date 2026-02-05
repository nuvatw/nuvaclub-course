'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { completeOnboarding } from '@/app/actions/auth'

export default function OnboardingPage() {
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('請輸入你的姓名')
      return
    }

    if (!gender) {
      setError('請選擇性別')
      return
    }

    const formData = new FormData()
    formData.set('fullName', fullName.trim())
    formData.set('gender', gender)

    startTransition(async () => {
      try {
        await completeOnboarding(formData)
      } catch (err: unknown) {
        // Don't show error for redirect (Next.js throws NEXT_REDIRECT)
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
          return
        }
        setError('設定失敗，請再試一次')
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-foreground text-center">
            完成你的個人資料
          </h1>
          <p className="text-muted text-center mt-2">
            填寫以下資料以開始使用
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="fullName"
              label="姓名"
              placeholder="請輸入你的姓名"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <RadioGroup
              name="gender"
              label="性別"
              value={gender}
              onChange={setGender}
              options={[
                { value: 'male', label: '男' },
                { value: 'female', label: '女' },
              ]}
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isPending}
            >
              完成設定
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
