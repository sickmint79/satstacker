import React from 'react'
import { HelpCircle } from 'lucide-react'
import { Tooltip } from './Tooltip'

interface InputProps {
  label: string
  value: number | string
  onChange: (value: string) => void
  type?: 'number' | 'text'
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  tooltip?: string
  placeholder?: string
  className?: string
}

export function Input({
  label,
  value,
  onChange,
  type = 'number',
  min,
  max,
  step = 1,
  prefix,
  suffix,
  tooltip,
  placeholder,
  className = '',
}: InputProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
        {tooltip && (
          <Tooltip content={tooltip}>
            <HelpCircle className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400 cursor-help transition-colors" />
          </Tooltip>
        )}
      </div>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-zinc-500 text-sm pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className={`
            w-full bg-zinc-800/80 border border-zinc-700 rounded-lg py-2.5 text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/70
            hover:border-zinc-600 transition-all duration-150
            placeholder:text-zinc-600 font-mono tabular-nums
            [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
            ${prefix ? 'pl-8' : 'pl-3'}
            ${suffix ? 'pr-14' : 'pr-3'}
          `}
        />
        {suffix && (
          <span className="absolute right-3 text-zinc-500 text-xs pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}
