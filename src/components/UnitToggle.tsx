import React from 'react'
import type { BTCUnit } from '../types'

interface UnitToggleProps {
  unit: BTCUnit
  onChange: (unit: BTCUnit) => void
  className?: string
}

const OPTIONS: { value: BTCUnit; label: string; description: string }[] = [
  { value: 'usd', label: 'USD', description: 'US Dollars' },
  { value: 'btc', label: 'BTC', description: 'Bitcoin' },
  { value: 'sats', label: 'sats', description: 'Satoshis (1 BTC = 100M sats)' },
]

export function UnitToggle({ unit, onChange, className = '' }: UnitToggleProps) {
  return (
    <div className={`inline-flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 gap-0.5 ${className}`}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.description}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
            unit === opt.value
              ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
