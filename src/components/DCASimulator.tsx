import React, { useMemo, useState, useCallback, useRef } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Download, Share2, TrendingUp, TrendingDown, Minus, Check } from 'lucide-react'
import { toPng } from 'html-to-image'

import { calculateDCA } from '../utils/calculations'
import { copyShareURL } from '../utils/urlParams'
import { decodeDCAFromURL } from '../utils/urlParams'
import {
  formatUSD,
  formatBTC,
  formatPercent,
  chartAxisFormatter,
  parseInputNumber,
} from '../utils/formatting'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Card, CardHeader, CardTitle, CardDescription, Divider } from './ui/Card'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { UnitToggle } from './UnitToggle'
import { ScenarioManager } from './ScenarioManager'
import type { DCAInputs, BTCUnit } from '../types'

const DEFAULT_INPUTS: DCAInputs = {
  weeklyContribution: 100,
  monthlyContribution: 0,
  yearsInvesting: 10,
  startingBTCPrice: 95000,
  bearCaseAPR: 20,
  baseCaseAPR: 60,
  bullCaseAPR: 150,
}

interface DCASimulatorProps {
  unit: BTCUnit
  onUnitChange: (unit: BTCUnit) => void
}

const CHART_COLORS = {
  bear: '#ef4444',
  base: '#f7931a',
  bull: '#22c55e',
  invested: '#52525b',
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl text-sm min-w-[200px]">
      <p className="text-zinc-400 font-medium mb-3">Year {label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-6 mb-1.5">
          <span className="flex items-center gap-2 text-zinc-400 capitalize">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}
          </span>
          <span className="font-mono font-medium text-white">{formatUSD(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function DCASimulator({ unit, onUnitChange }: DCASimulatorProps) {
  const urlOverrides = useMemo(() => decodeDCAFromURL(window.location.search), [])
  const [inputs, setInputs] = useLocalStorage<DCAInputs>('satstacker-dca', {
    ...DEFAULT_INPUTS,
    ...urlOverrides,
  })
  const [copied, setCopied] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const result = useMemo(() => calculateDCA(inputs), [inputs])

  const update = useCallback(
    (key: keyof DCAInputs, value: string) => {
      const parsed = parseInputNumber(value)
      setInputs({ ...inputs, [key]: parsed })
    },
    [inputs, setInputs]
  )

  const handleShare = async () => {
    try {
      await copyShareURL(inputs)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard may be blocked
    }
  }

  const handleExport = async () => {
    if (!exportRef.current) return
    try {
      const dataUrl = await toPng(exportRef.current, { backgroundColor: '#09090b' })
      const a = document.createElement('a')
      a.download = 'satstacker-dca.png'
      a.href = dataUrl
      a.click()
    } catch {
      // export failed
    }
  }

  const totalMonthlyContrib = inputs.weeklyContribution * (52 / 12) + inputs.monthlyContribution
  const totalYearlyContrib = totalMonthlyContrib * 12

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Input Panel ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contribution Settings</CardTitle>
              <CardDescription>How much are you stacking?</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <Input
                label="Weekly Contribution"
                value={inputs.weeklyContribution}
                onChange={(v) => update('weeklyContribution', v)}
                prefix="$"
                min={0}
                step={10}
                tooltip="Amount you invest in Bitcoin each week, in USD."
              />
              <Input
                label="Monthly Contribution"
                value={inputs.monthlyContribution}
                onChange={(v) => update('monthlyContribution', v)}
                prefix="$"
                min={0}
                step={50}
                tooltip="Additional monthly contribution on top of weekly, in USD."
              />
              <div className="px-3 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-0.5">Effective monthly total</p>
                <p className="text-sm font-mono font-medium text-orange-400">
                  {formatUSD(totalMonthlyContrib)} / mo
                  <span className="text-zinc-500 text-xs ml-2">
                    ({formatUSD(totalYearlyContrib)} / yr)
                  </span>
                </p>
              </div>
              <Divider />
              <Input
                label="Years Investing"
                value={inputs.yearsInvesting}
                onChange={(v) => update('yearsInvesting', v)}
                min={1}
                max={50}
                step={1}
                suffix="yrs"
                tooltip="How many years you plan to accumulate Bitcoin via DCA."
              />
              <Input
                label="Starting BTC Price"
                value={inputs.startingBTCPrice}
                onChange={(v) => update('startingBTCPrice', v)}
                prefix="$"
                min={1}
                step={1000}
                tooltip="Current or assumed Bitcoin price at the start of your DCA journey."
              />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Annual Appreciation Scenarios</CardTitle>
              <CardDescription>BTC price growth assumptions per year</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="bear">Bear</Badge>
                <div className="flex-1">
                  <Input
                    label=""
                    value={inputs.bearCaseAPR}
                    onChange={(v) => update('bearCaseAPR', v)}
                    min={-50}
                    max={200}
                    step={5}
                    suffix="% APR"
                    tooltip="Pessimistic annual appreciation rate. Can be negative for bearish scenarios."
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="base">Base</Badge>
                <div className="flex-1">
                  <Input
                    label=""
                    value={inputs.baseCaseAPR}
                    onChange={(v) => update('baseCaseAPR', v)}
                    min={-50}
                    max={500}
                    step={5}
                    suffix="% APR"
                    tooltip="Most likely annual appreciation rate. Historical Bitcoin CAGR since 2013 is ~100-120%."
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="bull">Bull</Badge>
                <div className="flex-1">
                  <Input
                    label=""
                    value={inputs.bullCaseAPR}
                    onChange={(v) => update('bullCaseAPR', v)}
                    min={-50}
                    max={1000}
                    step={10}
                    suffix="% APR"
                    tooltip="Optimistic annual appreciation rate. Reflects strong adoption or hyperbitcoinization scenarios."
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ScenarioManager currentInputs={inputs} onLoad={setInputs} />
            <div className="ml-auto flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleExport} className="gap-1.5">
                <Download className="w-3.5 h-3.5" />
                PNG
              </Button>
              <Button variant="secondary" size="sm" onClick={handleShare} className="gap-1.5">
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Share'}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Results Panel ─────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4" ref={exportRef}>
          {/* Unit Toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">Display values in</p>
            <UnitToggle unit={unit} onChange={onUnitChange} />
          </div>

          {/* Summary stat grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Total Invested"
              value={formatUSD(result.base.totalInvested)}
              sub={`over ${inputs.yearsInvesting} years`}
              icon={<Minus className="w-3.5 h-3.5 text-zinc-500" />}
            />
            <StatCard
              label="BTC Accumulated"
              value={
                unit === 'sats'
                  ? `${Math.round(result.base.totalBTC * 1e8).toLocaleString()} sats`
                  : `${formatBTC(result.base.totalBTC, true)}`
              }
              sub="base case"
              variant="base"
            />
          </div>

          {/* Three scenario cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ScenarioCard
              label="Bear"
              apr={inputs.bearCaseAPR}
              result={result.bear}
              unit={unit}
              variant="bear"
            />
            <ScenarioCard
              label="Base"
              apr={inputs.baseCaseAPR}
              result={result.base}
              unit={unit}
              variant="base"
              highlighted
            />
            <ScenarioCard
              label="Bull"
              apr={inputs.bullCaseAPR}
              result={result.bull}
              unit={unit}
              variant="bull"
            />
          </div>

          {/* Portfolio Value Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Portfolio Value Over Time</CardTitle>
                  <CardDescription>USD value of accumulated BTC by scenario</CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bearGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.bear} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={CHART_COLORS.bear} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.base} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_COLORS.base} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="bullGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.bull} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={CHART_COLORS.bull} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `Yr ${v}`}
                  />
                  <YAxis
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={chartAxisFormatter}
                    width={56}
                  />
                  <ReTooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />
                  <Legend
                    wrapperStyle={{ paddingTop: '12px', fontSize: '12px', color: '#a1a1aa' }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    name="invested"
                    stroke={CHART_COLORS.invested}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    fill="none"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="bear"
                    name="bear"
                    stroke={CHART_COLORS.bear}
                    strokeWidth={1.5}
                    fill="url(#bearGrad)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="base"
                    name="base"
                    stroke={CHART_COLORS.base}
                    strokeWidth={2}
                    fill="url(#baseGrad)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="bull"
                    name="bull"
                    stroke={CHART_COLORS.bull}
                    strokeWidth={1.5}
                    fill="url(#bullGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* BTC Accumulated Chart */}
          <Card>
            <CardHeader>
              <CardTitle>BTC Accumulated</CardTitle>
              <CardDescription>Total bitcoin held over time (lower price = more BTC)</CardDescription>
            </CardHeader>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.base} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_COLORS.base} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `Yr ${v}`}
                  />
                  <YAxis
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v.toFixed(2)}₿`}
                    width={60}
                  />
                  <ReTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-2xl text-sm">
                          <p className="text-zinc-400 mb-2">Year {label}</p>
                          {payload.map((entry: any) => (
                            <div key={entry.name} className="flex items-center justify-between gap-4 mb-1">
                              <span className="flex items-center gap-1.5 text-zinc-400 capitalize">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}
                              </span>
                              <span className="font-mono text-white">{Number(entry.value).toFixed(6)} BTC</span>
                            </div>
                          ))}
                        </div>
                      )
                    }}
                    cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '12px', fontSize: '12px', color: '#a1a1aa' }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Area type="monotone" dataKey="bearBTC" name="bear" stroke={CHART_COLORS.bear} strokeWidth={1.5} fill="none" dot={false} />
                  <Area type="monotone" dataKey="baseBTC" name="base" stroke={CHART_COLORS.base} strokeWidth={2} fill="url(#btcGrad)" dot={false} />
                  <Area type="monotone" dataKey="bullBTC" name="bull" stroke={CHART_COLORS.bull} strokeWidth={1.5} fill="none" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon?: React.ReactNode
  variant?: 'bear' | 'base' | 'bull' | 'neutral'
}

function StatCard({ label, value, sub, icon, variant = 'neutral' }: StatCardProps) {
  const accentClasses: Record<string, string> = {
    bear: 'text-red-400',
    base: 'text-orange-400',
    bull: 'text-green-400',
    neutral: 'text-white',
  }
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <p className="text-xs text-zinc-500 font-medium">{label}</p>
      </div>
      <p className={`text-xl font-bold font-mono tabular-nums ${accentClasses[variant]}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </div>
  )
}

interface ScenarioCardProps {
  label: string
  apr: number
  result: ReturnType<typeof calculateDCA>['bear']
  unit: BTCUnit
  variant: 'bear' | 'base' | 'bull'
  highlighted?: boolean
}

function ScenarioCard({ label, apr, result, unit, variant, highlighted }: ScenarioCardProps) {
  const colorClasses = {
    bear: { text: 'text-red-400', border: 'border-red-500/20', badge: 'bg-red-500/10', icon: TrendingDown },
    base: { text: 'text-orange-400', border: 'border-orange-500/30', badge: 'bg-orange-500/10', icon: TrendingUp },
    bull: { text: 'text-green-400', border: 'border-green-500/20', badge: 'bg-green-500/10', icon: TrendingUp },
  }
  const c = colorClasses[variant]
  const Icon = c.icon

  const displayValue =
    unit === 'btc'
      ? formatBTC(result.totalBTC, true)
      : unit === 'sats'
      ? `${Math.round(result.totalBTC * 1e8).toLocaleString()} sats`
      : formatUSD(result.finalValue)

  return (
    <div
      className={`bg-zinc-900 border rounded-xl p-4 transition-all ${
        highlighted ? `${c.border} ring-1 ring-inset ring-orange-500/10` : 'border-zinc-800'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.badge} ${c.text} border ${c.border}`}>
          <Icon className="w-3 h-3" />
          {label}
        </div>
        <span className={`text-xs font-mono ${c.text}`}>{apr > 0 ? '+' : ''}{apr}%</span>
      </div>
      <p className={`text-lg font-bold font-mono tabular-nums ${c.text} mb-1`}>
        {displayValue}
      </p>
      {unit === 'usd' && (
        <p className="text-xs text-zinc-600 font-mono">{formatBTC(result.totalBTC, true)}</p>
      )}
      <div className="mt-3 pt-3 border-t border-zinc-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-600">CAGR</span>
          <span className={`font-mono font-medium ${result.cagr >= 0 ? 'text-zinc-300' : 'text-red-400'}`}>
            {formatPercent(result.cagr)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1.5">
          <span className="text-zinc-600">Final BTC price</span>
          <span className="font-mono text-zinc-400">{formatUSD(result.finalBTCPrice, true)}</span>
        </div>
      </div>
    </div>
  )
}
