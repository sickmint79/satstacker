import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  id?: string
  glow?: boolean
}

export function Card({ children, className = '', id, glow = false }: CardProps) {
  return (
    <div
      id={id}
      className={`bg-zinc-900 border border-zinc-800 rounded-xl p-6 ${
        glow ? 'animate-glow' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-5 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-base font-semibold text-white ${className}`}>{children}</h2>
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-zinc-500 mt-1 ${className}`}>{children}</p>
}

export function Divider() {
  return <div className="border-t border-zinc-800 my-5" />
}
