'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PresignResponse } from '@/types/issues'

interface UploadingImage {
  id: string
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'confirming' | 'done' | 'error'
  error?: string
  imageId?: string // The database ID after presign
}

interface ImageUploaderProps {
  onImagesReady: (imageIds: string[]) => void
  maxImages?: number
  existingImages?: { id: string; url: string; filename: string }[]
  onRemoveExisting?: (imageId: string) => void
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function ImageUploader({
  onImagesReady,
  maxImages = 10,
  existingImages = [],
  onRemoveExisting,
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadingImage[]>([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update parent when images change - use useEffect to avoid setState during render
  useEffect(() => {
    const ids = images
      .filter((img) => img.status === 'done' && img.imageId)
      .map((img) => img.imageId!)
    onImagesReady(ids)
  }, [images, onImagesReady])

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return '不支援的檔案格式，僅支援 jpg, png, webp'
    }
    if (file.size > MAX_SIZE) {
      return '檔案大小超過 10MB'
    }
    return null
  }

  // Upload a single file
  const uploadFile = async (uploadingImage: UploadingImage): Promise<void> => {
    const { file, id } = uploadingImage

    // Update status to uploading
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, status: 'uploading' as const, progress: 0 } : img))
    )

    try {
      // 1. Get presigned URL
      const presignResponse = await fetch('/api/issues/images/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          content_type: file.type,
          size: file.size,
        }),
      })

      if (!presignResponse.ok) {
        const error = await presignResponse.json()
        throw new Error(error.error || '無法取得上傳網址')
      }

      const presignData: PresignResponse = await presignResponse.json()

      // Update with imageId
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, imageId: presignData.imageId, progress: 20 } : img
        )
      )

      // 2. Upload to R2 with progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = 20 + (e.loaded / e.total) * 60 // 20-80%
            setImages((prev) =>
              prev.map((img) => (img.id === id ? { ...img, progress: Math.round(progress) } : img))
            )
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error('上傳失敗'))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('網路錯誤')))
        xhr.addEventListener('abort', () => reject(new Error('上傳已取消')))

        xhr.open('PUT', presignData.uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      // Update progress
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: 'confirming' as const, progress: 85 } : img
        )
      )

      // 3. Confirm upload
      const confirmResponse = await fetch('/api/issues/images/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id: presignData.imageId }),
      })

      if (!confirmResponse.ok) {
        throw new Error('無法確認上傳')
      }

      // Success!
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: 'done' as const, progress: 100 } : img
        )
      )
    } catch (error) {
      console.error('Upload error:', error)
      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? {
                ...img,
                status: 'error' as const,
                error: error instanceof Error ? error.message : '上傳失敗',
              }
            : img
        )
      )
    }
  }

  // Handle file selection
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return

      const currentCount = images.length + existingImages.length
      const remainingSlots = maxImages - currentCount

      if (remainingSlots <= 0) {
        alert(`最多只能上傳 ${maxImages} 張圖片`)
        return
      }

      const filesToProcess = Array.from(files).slice(0, remainingSlots)
      const newImages: UploadingImage[] = []

      for (const file of filesToProcess) {
        const error = validateFile(file)
        const id = crypto.randomUUID()

        const uploadingImage: UploadingImage = {
          id,
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: error ? 'error' : 'pending',
          error: error || undefined,
        }

        newImages.push(uploadingImage)
      }

      setImages((prev) => [...prev, ...newImages])

      // Start uploading valid files
      for (const img of newImages) {
        if (img.status === 'pending') {
          uploadFile(img)
        }
      }
    },
    [images.length, existingImages.length, maxImages]
  )

  // Remove an image
  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img) {
        URL.revokeObjectURL(img.preview)
        // If uploaded, delete from server
        if (img.imageId) {
          fetch(`/api/issues/images/${img.imageId}`, { method: 'DELETE' }).catch(console.error)
        }
      }
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  // Retry failed upload
  const retryUpload = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img) {
        uploadFile({ ...img, status: 'pending', progress: 0, error: undefined })
      }
      return prev.map((i) =>
        i.id === id ? { ...i, status: 'pending' as const, progress: 0, error: undefined } : i
      )
    })
  }, [])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const totalImages = images.length + existingImages.length

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? 'border-primary bg-primary/10'
            : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <svg
          className="mx-auto h-12 w-12 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        <p className="mt-4 text-sm text-zinc-400">
          拖放圖片到這裡，或<span className="text-primary">點擊選擇</span>
        </p>
        <p className="mt-1 text-xs text-zinc-500">支援 JPG, PNG, WebP (最大 10MB)</p>
        <p className="mt-1 text-xs text-zinc-500">
          已選擇 {totalImages} / {maxImages} 張
        </p>
      </div>

      {/* Existing images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-zinc-400">已上傳的圖片</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {existingImages.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg">
                <img
                  src={img.url}
                  alt={img.filename}
                  className="h-full w-full object-cover"
                />
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={() => onRemoveExisting(img.id)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploading images */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-sm text-zinc-400">新上傳</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              <AnimatePresence>
                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-800"
                  >
                    {/* Preview image */}
                    <img
                      src={img.preview}
                      alt={img.file.name}
                      className={`h-full w-full object-cover transition-opacity ${
                        img.status === 'done' ? 'opacity-100' : 'opacity-50'
                      }`}
                    />

                    {/* Progress overlay */}
                    {img.status !== 'done' && img.status !== 'error' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                        <div className="h-12 w-12">
                          <svg className="h-full w-full animate-spin" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        </div>
                        <p className="mt-2 text-xs text-white">{img.progress}%</p>
                      </div>
                    )}

                    {/* Error overlay */}
                    {img.status === 'error' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/70 p-2 text-center">
                        <svg
                          className="h-8 w-8 text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="mt-1 text-xs text-red-200">{img.error}</p>
                        <button
                          type="button"
                          onClick={() => retryUpload(img.id)}
                          className="mt-2 text-xs text-white underline hover:text-red-200"
                        >
                          重試
                        </button>
                      </div>
                    )}

                    {/* Success indicator */}
                    {img.status === 'done' && (
                      <div className="absolute bottom-2 right-2 rounded-full bg-green-500 p-1">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
