'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error)
    console.error('Component stack:', errorInfo.componentStack)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI with Chinese text
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="mb-6 rounded-full bg-red-600/10 p-4">
            <svg
              className="h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            發生錯誤
          </h2>
          <p className="text-zinc-400 mb-6 max-w-md">
            很抱歉，頁面載入時發生問題。請點擊下方按鈕重試，或稍後再試。
          </p>
          {this.state.error && (
            <p className="text-xs text-zinc-500 mb-6 font-mono bg-zinc-800/50 px-4 py-2 rounded-lg max-w-md truncate">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-3">
            <Button onClick={this.handleRetry}>
              重試
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
            >
              重新整理頁面
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
