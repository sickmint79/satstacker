import React from 'react'

type BadgeVariant = 'bear' | 'base' | 'bull' | 'neutral' | 'info' | 'success' | 'warning'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  bear: 'bg-red-500/10 text-red-400 border-red-500/20',
  base: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  bull: 'bg-green-500/10 text-green-400 border-green-500/20',
  neutral: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-full
        ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
