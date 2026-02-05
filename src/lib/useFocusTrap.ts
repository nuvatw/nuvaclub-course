'use client'

import { useEffect, useRef, useCallback } from 'react'

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

interface UseFocusTrapOptions {
  isOpen: boolean
  onClose?: () => void
}

/**
 * Hook to trap focus within a modal/dialog and handle Escape key
 * Returns a ref to attach to the modal container
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
}: UseFocusTrapOptions) {
  const containerRef = useRef<T>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
    }
  }, [isOpen])

  // Focus the first focusable element when modal opens
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)

    if (focusableElements.length > 0) {
      // Small delay to ensure the modal is fully rendered
      requestAnimationFrame(() => {
        focusableElements[0].focus()
      })
    }
  }, [isOpen])

  // Return focus to previous element when modal closes
  useEffect(() => {
    if (!isOpen && previousActiveElement.current) {
      previousActiveElement.current.focus()
      previousActiveElement.current = null
    }
  }, [isOpen])

  // Handle keyboard events for focus trapping and Escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen || !containerRef.current) return

      // Handle Escape key
      if (event.key === 'Escape' && onClose) {
        event.preventDefault()
        onClose()
        return
      }

      // Handle Tab key for focus trapping
      if (event.key === 'Tab') {
        const container = containerRef.current
        const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)

        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        // Shift + Tab: if on first element, move to last
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
        // Tab: if on last element, move to first
        else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    },
    [isOpen, onClose]
  )

  // Add event listener
  useEffect(() => {
    if (!isOpen) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  return containerRef
}
