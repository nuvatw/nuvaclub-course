'use client'

import { Children, ReactNode, isValidElement } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { TranscriptBlock } from './TranscriptBlock'

interface MarkdownRendererProps {
  content: string
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (!isValidElement(node)) return ''
  const props = node.props as { children?: ReactNode }
  const children = props.children
  if (!children) return ''
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(extractText).join('')
  return extractText(children)
}

function stripScriptMarker(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) {
      if (typeof child === 'string') {
        return child.replace(/^\[!SCRIPT\]\s*\n?/, '').replace(/^\[!SCRIPT\]\s*/, '')
      }
      return child
    }
    const text = extractText(child)
    if (text.startsWith('[!SCRIPT]')) {
      const newText = text.replace(/^\[!SCRIPT\]\s*\n?/, '').replace(/^\[!SCRIPT\]\s*/, '')
      if (!newText.trim()) return null
      return <p key="script-first">{newText}</p>
    }
    return child
  })
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-foreground mt-10 mb-4 pb-2 border-b border-border">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-foreground/90 mt-6 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium text-foreground/85 mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-foreground/80 leading-relaxed mb-4">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1 text-foreground/80">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1 text-foreground/80">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => {
            const text = extractText(children)
            if (text.trimStart().startsWith('[!SCRIPT]')) {
              return (
                <TranscriptBlock>
                  {stripScriptMarker(children)}
                </TranscriptBlock>
              )
            }
            return (
              <blockquote className="border-l-4 border-primary/40 pl-4 py-2 my-4 text-muted italic">
                {children}
              </blockquote>
            )
          },
          code: ({ className, children }) => {
            const isBlock = className?.includes('language-')
            if (isBlock) {
              return (
                <code className={`text-sm ${className || ''}`}>
                  {children}
                </code>
              )
            }
            return (
              <code className="bg-card-hover px-1.5 py-0.5 rounded text-sm font-mono text-primary">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="bg-[#0d0d0f] border border-border rounded-lg p-4 overflow-x-auto font-mono text-sm mb-4">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-card-hover">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border border-border px-3 py-2 text-left text-foreground font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2 text-foreground/80">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="border-border my-8" />
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt || ''} className="rounded-lg max-w-full my-4" />
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          input: ({ checked, ...props }) => (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-2 accent-primary"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
