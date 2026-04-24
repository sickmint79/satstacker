import React, { useState, useRef } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const show = () => {
    clearTimeout(timeoutRef.current)
    setVisible(true)
  }

  const hide = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 100)
  }

  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-700',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-700',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-700',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-700',
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </div>
      {visible && (
        <div
          className={`absolute z-50 ${positionClasses[side]} px-3 py-2 bg-zinc-800 border border-zinc-700
            rounded-lg text-xs text-zinc-300 whitespace-normal max-w-[220px] pointer-events-none
            shadow-2xl animate-fade-in leading-relaxed`}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {content}
          <div
            className={`absolute border-4 border-transparent ${arrowClasses[side]}`}
          />
        </div>
      )}
    </div>
  )
}
