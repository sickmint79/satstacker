import React from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { Tooltip } from './Tooltip'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  tooltip?: string
  className?: string
}

export function Select({ label, value, onChange, options, tooltip, className = '' }: SelectProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-zinc-300">{label}</label>
          {tooltip && (
            <Tooltip content={tooltip}>
              <HelpCircle className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400 cursor-help transition-colors" />
            </Tooltip>
          )}
        </div>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2.5
            text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40
            focus:border-orange-500/70 hover:border-zinc-600 transition-all cursor-pointer pr-9"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-900">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
      </div>
    </div>
  )
}
