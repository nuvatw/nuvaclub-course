'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * CSS selector for all focusable elements
 * Used to find elements that can receive keyboard focus
 */
const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Options for the useFocusTrap hook
 */
interface UseFocusTrapOptions {
  /** Whether the trap is active (modal is open) */
  isOpen: boolean
  /** Optional callback when Escape key is pressed */
  onClose?: () => void
}

/**
 * Hook to trap keyboard focus within a modal/dialog for accessibility
 *
 * Implements WCAG 2.1 focus management requirements:
 * - Traps Tab/Shift+Tab within the modal
 * - Handles Escape key to close the modal
 * - Restores focus to the previously focused element when closed
 * - Auto-focuses the first focusable element when opened
 *
 * @template T - The type of HTML element for the container ref
 * @param options - Configuration options
 * @param options.isOpen - Whether the modal/dialog is currently open
 * @param options.onClose - Optional callback invoked when Escape is pressed
 * @returns A ref to attach to the modal container element
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose, children }) {
 *   const containerRef = useFocusTrap({ isOpen, onClose })
 *
 *   if (!isOpen) return null
 *
 *   return (
 *     <div ref={containerRef} role="dialog" aria-modal="true">
 *       {children}
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   )
 * }
 * ```
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
