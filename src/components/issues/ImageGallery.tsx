'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useFocusTrap } from '@/lib/useFocusTrap'
import type { IssueImage } from '@/types/issues'

interface ImageGalleryProps {
  images: IssueImage[]
  canDelete?: boolean
  onDelete?: (imageId: string) => void
}

export function ImageGallery({ images, canDelete = false, onDelete }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<IssueImage | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Focus trap for lightbox
  const lightboxRef = useFocusTrap<HTMLDivElement>({
    isOpen: selectedImage !== null,
    onClose: () => setSelectedImage(null),
  })

  // Focus trap for delete confirmation modal
  const deleteModalRef = useFocusTrap<HTMLDivElement>({
    isOpen: deleteConfirmId !== null,
    onClose: () => setDeleteConfirmId(null),
  })

  // Navigate to previous image
  const goToPrevious = useCallback(() => {
    if (!selectedImage || images.length <= 1) return
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id)
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    setSelectedImage(images[prevIndex])
  }, [selectedImage, images])

  // Navigate to next image
  const goToNext = useCallback(() => {
    if (!selectedImage || images.length <= 1) return
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id)
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    setSelectedImage(images[nextIndex])
  }, [selectedImage, images])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedImage) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage, goToPrevious, goToNext])

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, imageId: string) => {
      e.stopPropagation()
      if (!onDelete || deleting) return
      setDeleteConfirmId(imageId)
    },
    [onDelete, deleting]
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmId || !onDelete) return

    setDeleting(deleteConfirmId)
    setDeleteConfirmId(null)
    try {
      await onDelete(deleteConfirmId)
    } finally {
      setDeleting(null)
    }
  }, [deleteConfirmId, onDelete])

  if (images.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-zinc-600"
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
        <p className="mt-4 text-sm text-zinc-500">尚未上傳任何圖片</p>
      </div>
    )
  }

  return (
    <>
      {/* Image grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.filter((img) => img.url).map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-zinc-800"
            onClick={() => setSelectedImage(image)}
          >
            <Image
              src={image.url || ''}
              alt={image.filename}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
              unoptimized
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />

            {/* File info on hover */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="truncate text-xs text-white">{image.filename}</p>
              <p className="text-xs text-zinc-400">{formatFileSize(image.size)}</p>
            </div>

            {/* Delete button */}
            {canDelete && onDelete && (
              <button
                type="button"
                onClick={(e) => handleDeleteClick(e, image.id)}
                disabled={deleting === image.id}
                aria-label="刪除圖片"
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting === image.id ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            )}

            {/* Expand icon */}
            <div
              className="absolute right-2 bottom-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            ref={lightboxRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="圖片預覽"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              aria-label="關閉"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                  aria-label="上一張圖片 (←)"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  aria-label="下一張圖片 (→)"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image */}
            <motion.div
              key={selectedImage.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-h-[85vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage.url || ''}
                alt={selectedImage.filename}
                width={1200}
                height={800}
                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
                style={{ width: 'auto', height: 'auto' }}
                unoptimized
              />
            </motion.div>

            {/* Image info */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/60 px-4 py-2 text-center">
              <p className="text-sm text-white">{selectedImage.filename}</p>
              <p className="text-xs text-zinc-400">
                {formatFileSize(selectedImage.size)} • {images.findIndex((img) => img.id === selectedImage.id) + 1} / {images.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-image-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              ref={deleteModalRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="delete-image-modal-title" className="text-lg font-semibold text-foreground">確定要刪除這張圖片嗎？</h3>
              <p className="mt-2 text-sm text-zinc-400">
                此操作無法復原。
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirmId(null)}
                >
                  取消
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteConfirm}
                >
                  確定刪除
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
