import React from 'react'
import { Bitcoin, TrendingUp, Shield, BarChart3 } from 'lucide-react'

export function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-950/20 via-zinc-950/50 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(247,147,26,0.08)_0%,transparent_60%)] pointer-events-none" />

      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Logo row */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Bitcoin className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Sat<span className="text-orange-400">Stacker</span>
          </span>
          <span className="ml-1 text-xs font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
            BETA
          </span>
        </div>

        {/* Hero text */}
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Plan your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              Bitcoin future
            </span>
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Model DCA strategies, stress-test retirement scenarios, and visualize
            long-term Bitcoin accumulation — all in your browser, no account required.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 mt-8">
          {[
            { icon: TrendingUp, label: 'DCA Projections' },
            { icon: Shield, label: 'Retirement Modeling' },
            { icon: BarChart3, label: 'Monte Carlo Simulation' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-400"
            >
              <Icon className="w-3.5 h-3.5 text-orange-400" />
              {label}
            </div>
          ))}
        </div>

        {/* Disclaimer strip */}
        <div className="mt-8 px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-500 flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-600" />
          <span>
            Educational tool only. Not financial advice. All projections are hypothetical
            and do not guarantee future returns. Bitcoin is highly volatile and speculative.
          </span>
        </div>
      </div>
    </header>
  )
}
