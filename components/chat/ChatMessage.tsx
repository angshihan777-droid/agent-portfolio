'use client'

import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={cn('flex gap-2 mb-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold',
          isUser ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/90',
        )}
      >
        {isUser ? 'U' : 'A'}
      </div>

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-blue-500/80 text-white rounded-tr-sm'
            : 'bg-white/10 text-white/90 rounded-tl-sm',
        )}
      >
        {isUser ? (
          <span>{content}</span>
        ) : (
          <>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 underline hover:text-blue-200 transition-colors"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li className="text-white/85">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                em: ({ children }) => <em className="italic text-white/80">{children}</em>,
                h1: ({ children }) => <h1 className="text-base font-bold text-white mt-2 mb-1">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold text-white mt-2 mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold text-white/90 mt-1.5 mb-0.5">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-white/30 pl-3 text-white/60 italic my-1">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-white/10 rounded px-1 py-0.5 text-xs font-mono text-blue-200">
                    {children}
                  </code>
                ),
                hr: () => <hr className="border-white/20 my-2" />,
              }}
            >
              {content}
            </ReactMarkdown>
            {/* 流式打字光标 */}
            {isStreaming && (
              <span className="inline-block h-3.5 w-0.5 bg-white/70 animate-pulse rounded-full ml-0.5 align-middle" />
            )}
          </>
        )}
      </div>
    </div>
  )
}
