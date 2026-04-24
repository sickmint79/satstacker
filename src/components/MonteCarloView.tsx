import React, { useState, useCallback } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Play, Loader2, BarChart2, AlertTriangle } from 'lucide-react'
import { runMonteCarlo } from '../utils/monteCarlo'
import { formatUSD, chartAxisFormatter, parseInputNumber } from '../utils/formatting'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Card, CardHeader, CardTitle, CardDescription } from './ui/Card'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import type { MonteCarloInputs, MonteCarloResult, BTCUnit } from '../types'

const DEFAULT_INPUTS: MonteCarloInputs = {
  weeklyContribution: 100,
  monthlyContribution: 0,
  yearsInvesting: 10,
  startingBTCPrice: 95000,
  annualMeanReturn: 60,
  annualVolatility: 80,
}

interface MonteCarloViewProps {
  unit: BTCUnit
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const find = (name: string) => payload.find((p: any) => p.name === name)?.value ?? 0
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl text-xs min-w-[180px]">
      <p className="text-zinc-400 font-medium mb-3">Year {label}</p>
      {[
        { key: '90th pct', color: '#22c55e' },
        { key: '75th pct', color: '#86efac' },
        { key: 'Median', color: '#f7931a' },
        { key: '25th pct', color: '#fdba74' },
        { key: '10th pct', color: '#ef4444' },
      ].map(({ key, color }) => (
        <div key={key} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {key}
          </span>
          <span className="font-mono text-white">{formatUSD(find(key))}</span>
        </div>
      ))}
    </div>
  )
}

export function MonteCarloView({ unit: _unit }: MonteCarloViewProps) {
  const [inputs, setInputs] = useLocalStorage<MonteCarloInputs>('satstacker-montecarlo', DEFAULT_INPUTS)
  const [result, setResult] = useState<MonteCarloResult | null>(null)
  const [running, setRunning] = useState(false)
  const [simCount, setSimCount] = useLocalStorage<number>('satstacker-mc-sims', 500)

  const update = useCallback(
    (key: keyof MonteCarloInputs, value: string) => {
      setInputs({ ...inputs, [key]: parseInputNumber(value) })
    },
    [inputs, setInputs]
  )

  const handleRun = useCallback(() => {
    setRunning(true)
    // Use setTimeout to let React render the loading state first
    setTimeout(() => {
      const r = runMonteCarlo(inputs, simCount)
      setResult(r)
      setRunning(false)
    }, 50)
  }, [inputs, simCount])

  const chartData = result?.chartData.map((pt) => ({
    year: pt.year,
    '10th pct': pt.p10,
    '25th pct': pt.p25,
    'Median': pt.p50,
    '75th pct': pt.p75,
    '90th pct': pt.p90,
  }))

  const totalMonthlyContrib = inputs.weeklyContribution * (52 / 12) + inputs.monthlyContribution

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Input Panel ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulation Parameters</CardTitle>
              <CardDescription>Configure your Monte Carlo run</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <Input
                label="Weekly Contribution"
                value={inputs.weeklyContribution}
                onChange={(v) => update('weeklyContribution', v)}
                prefix="$"
                min={0}
                step={10}
                tooltip="Weekly Bitcoin purchase amount in USD."
              />
              <Input
                label="Monthly Contribution"
                value={inputs.monthlyContribution}
                onChange={(v) => update('monthlyContribution', v)}
                prefix="$"
                min={0}
                step={50}
                tooltip="Additional monthly contribution in USD."
              />
              <div className="px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <p className="text-xs text-zinc-500">Monthly total: <span className="text-orange-400 font-mono">{formatUSD(totalMonthlyContrib)}</span></p>
              </div>
              <Input
                label="Years Investing"
                value={inputs.yearsInvesting}
                onChange={(v) => update('yearsInvesting', v)}
                min={1}
                max={50}
                step={1}
                suffix="yrs"
              />
              <Input
                label="Starting BTC Price"
                value={inputs.startingBTCPrice}
                onChange={(v) => update('startingBTCPrice', v)}
                prefix="$"
                min={1}
                step={1000}
              />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Return Distribution</CardTitle>
              <CardDescription>Log-normal return model parameters</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <Input
                label="Mean Annual Return"
                value={inputs.annualMeanReturn}
                onChange={(v) => update('annualMeanReturn', v)}
                min={-50}
                max={500}
                step={5}
                suffix="% / yr"
                tooltip="Expected average annual return. Used as the drift term in the log-normal model. BTC historical geometric mean ≈ 50-100%."
              />
              <Input
                label="Annual Volatility"
                value={inputs.annualVolatility}
                onChange={(v) => update('annualVolatility', v)}
                min={10}
                max={300}
                step={5}
                suffix="% σ"
                tooltip="Standard deviation of annual returns. BTC historical annualized volatility ≈ 60-100%. Higher = wider outcome spread."
              />
              <div className="px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 text-xs text-amber-500/80">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    High volatility means extreme outcomes in both directions are possible.
                    The 10th percentile often approaches zero.
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Simulations</label>
                <div className="flex gap-2">
                  {[100, 250, 500, 1000].map((n) => (
                    <button
                      key={n}
                      onClick={() => setSimCount(n)}
                      className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                        simCount === n
                          ? 'bg-orange-500 border-orange-500 text-white font-medium'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-600">More simulations = more accurate but slower</p>
              </div>
            </div>
          </Card>

          <Button
            onClick={handleRun}
            loading={running}
            disabled={running}
            size="lg"
            className="w-full"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running {simCount} simulations…
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Monte Carlo
              </>
            )}
          </Button>
        </div>

        {/* ── Results Panel ─────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {!result && !running && (
            <div className="flex flex-col items-center justify-center h-80 bg-zinc-900 border border-zinc-800 rounded-xl text-center px-8">
              <BarChart2 className="w-12 h-12 text-zinc-700 mb-4" />
              <p className="text-zinc-400 font-medium mb-1">No simulation run yet</p>
              <p className="text-sm text-zinc-600">
                Configure your parameters and click Run Monte Carlo to generate randomized portfolio outcomes.
              </p>
            </div>
          )}

          {running && (
            <div className="flex flex-col items-center justify-center h-80 bg-zinc-900 border border-zinc-800 rounded-xl">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-3" />
              <p className="text-zinc-400">Running {simCount} simulations…</p>
            </div>
          )}

          {result && !running && (
            <>
              {/* Percentile outcome cards */}
              <div className="grid grid-cols-3 gap-3">
                <OutcomeCard label="10th Percentile" value={result.p10Final} badge="bear" />
                <OutcomeCard label="Median (50th)" value={result.medianFinal} badge="base" highlighted />
                <OutcomeCard label="90th Percentile" value={result.p90Final} badge="bull" />
              </div>

              {/* Main chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Portfolio Value Distribution</CardTitle>
                      <CardDescription>
                        {simCount} simulations — shaded bands show percentile ranges
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="outerBandGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f7931a" stopOpacity={0.04} />
                          <stop offset="95%" stopColor="#f7931a" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="innerBandGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f7931a" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#f7931a" stopOpacity={0.03} />
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

                      {/* 10th–90th outer band */}
                      <Area
                        type="monotone"
                        dataKey="10th pct"
                        stroke="none"
                        fill="none"
                        dot={false}
                        legendType="none"
                      />
                      <Area
                        type="monotone"
                        dataKey="90th pct"
                        name="90th pct"
                        stroke="#22c55e"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        fill="url(#outerBandGrad)"
                        dot={false}
                        fillOpacity={1}
                        activeDot={{ r: 3 }}
                      />

                      {/* 25th–75th inner band */}
                      <Area
                        type="monotone"
                        dataKey="25th pct"
                        stroke="#ef4444"
                        strokeWidth={1}
                        strokeDasharray="4 3"
                        fill="none"
                        dot={false}
                        name="10th pct"
                        activeDot={{ r: 3 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="75th pct"
                        name="75th pct"
                        stroke="#86efac"
                        strokeWidth={1}
                        fill="url(#innerBandGrad)"
                        dot={false}
                        fillOpacity={1}
                        activeDot={{ r: 3 }}
                      />

                      {/* Median */}
                      <Area
                        type="monotone"
                        dataKey="Median"
                        name="Median"
                        stroke="#f7931a"
                        strokeWidth={2.5}
                        fill="none"
                        dot={false}
                        activeDot={{ r: 4, fill: '#f7931a' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="25th pct"
                        stroke="none"
                        fill="none"
                        dot={false}
                        legendType="none"
                        name="25th pct"
                      />

                      <ReferenceLine
                        x={inputs.yearsInvesting}
                        stroke="#52525b"
                        strokeDasharray="4 2"
                        label={{ value: 'end', fill: '#71717a', fontSize: 10 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat label="25th Pct" value={formatUSD(result.p25Final, true)} />
                <MiniStat label="Median" value={formatUSD(result.medianFinal, true)} accent />
                <MiniStat label="75th Pct" value={formatUSD(result.p75Final, true)} />
                <MiniStat
                  label="Total Invested"
                  value={formatUSD((inputs.weeklyContribution * (52 / 12) + inputs.monthlyContribution) * 12 * inputs.yearsInvesting)}
                />
              </div>

              {/* Histogram of final values */}
              <Card>
                <CardHeader>
                  <CardTitle>Final Value Distribution</CardTitle>
                  <CardDescription>Histogram of portfolio values at year {inputs.yearsInvesting}</CardDescription>
                </CardHeader>
                <FinalValueHistogram finalValues={result.finalValues} />
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────

function OutcomeCard({
  label,
  value,
  badge,
  highlighted = false,
}: {
  label: string
  value: number
  badge: 'bear' | 'base' | 'bull'
  highlighted?: boolean
}) {
  const textColor = { bear: 'text-red-400', base: 'text-orange-400', bull: 'text-green-400' }[badge]
  return (
    <div
      className={`bg-zinc-900 border rounded-xl p-4 ${
        highlighted ? 'border-orange-500/30 ring-1 ring-inset ring-orange-500/10' : 'border-zinc-800'
      }`}
    >
      <Badge variant={badge} className="mb-3 text-xs">
        {label}
      </Badge>
      <p className={`text-lg font-bold font-mono tabular-nums ${textColor}`}>
        {formatUSD(value, true)}
      </p>
    </div>
  )
}

function MiniStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`text-sm font-mono font-semibold ${accent ? 'text-orange-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}

function FinalValueHistogram({ finalValues }: { finalValues: number[] }) {
  if (finalValues.length === 0) return null

  const sorted = [...finalValues].sort((a, b) => a - b)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const binCount = 20
  const binSize = (max - min) / binCount

  const bins = Array.from({ length: binCount }, (_, i) => ({
    start: min + i * binSize,
    end: min + (i + 1) * binSize,
    count: 0,
  }))

  for (const v of finalValues) {
    const idx = Math.min(Math.floor((v - min) / binSize), binCount - 1)
    bins[idx].count++
  }

  const maxCount = Math.max(...bins.map((b) => b.count))

  return (
    <div className="flex items-end gap-0.5 h-24">
      {bins.map((bin, i) => (
        <div
          key={i}
          className="flex-1 bg-orange-500/30 hover:bg-orange-500/50 rounded-t transition-colors"
          style={{ height: `${(bin.count / maxCount) * 100}%` }}
          title={`${formatUSD(bin.start, true)}–${formatUSD(bin.end, true)}: ${bin.count} sims`}
        />
      ))}
    </div>
  )
}
