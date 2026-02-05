'use client'

import { useTransition } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createLink, updateLink } from '@/app/actions/links'
import type { StepLink } from '@/types/database'

interface LinkModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  stepId: string
  editLink?: StepLink
}

export function LinkModal({ isOpen, onClose, projectId, stepId, editLink }: LinkModalProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      if (editLink) {
        formData.set('linkId', editLink.id)
        formData.set('projectId', projectId)
        await updateLink(formData)
      } else {
        formData.set('projectId', projectId)
        formData.set('stepId', stepId)
        await createLink(formData)
      }
      onClose()
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editLink ? '編輯連結' : '新增連結'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="title"
          name="title"
          label="標題"
          placeholder="例如：Google Docs 腳本"
          defaultValue={editLink?.title}
          required
        />

        <Input
          id="url"
          name="url"
          label="網址"
          type="url"
          placeholder="https://..."
          defaultValue={editLink?.url}
          required
        />

        <Input
          id="linkType"
          name="linkType"
          label="類型（選填）"
          placeholder="例如：文件、影片、試算表"
          defaultValue={editLink?.link_type || ''}
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            可見性
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                defaultChecked={editLink?.visibility === 'public' || !editLink}
                className="sr-only peer"
              />
              <span className="w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center transition-colors border-border peer-checked:border-primary peer-checked:bg-primary">
                <span className="w-2 h-2 rounded-full bg-white hidden peer-checked:block" />
              </span>
              <span className="text-foreground">公開</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                defaultChecked={editLink?.visibility === 'private'}
                className="sr-only peer"
              />
              <span className="w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center transition-colors border-border peer-checked:border-primary peer-checked:bg-primary">
                <span className="w-2 h-2 rounded-full bg-white hidden peer-checked:block" />
              </span>
              <span className="text-foreground">私人</span>
            </label>
          </div>
          <p className="mt-1 text-xs text-muted">
            私人連結僅管理員可見
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" isLoading={isPending}>
            {editLink ? '儲存變更' : '新增連結'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
