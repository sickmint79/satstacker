import React, { useMemo } from 'react'
import { Target, Calendar, DollarSign, Bitcoin, TrendingUp, AlertTriangle } from 'lucide-react'
import { calculateRetirement } from '../utils/calculations'
import { formatUSD, formatBTC, parseInputNumber } from '../utils/formatting'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Card, CardHeader, CardTitle, CardDescription, Divider } from './ui/Card'
import { Input } from './ui/Input'
import { Badge } from './ui/Badge'
import type { RetirementInputs, BTCUnit } from '../types'

const DEFAULT_INPUTS: RetirementInputs = {
  desiredAnnualSpending: 60000,
  currentAge: 35,
  retirementAge: 55,
  inflationRate: 3,
  futureBTCPrice: 1000000,
  startingBTCPrice: 95000,
  baseCaseAPR: 60,
}

interface RetirementPlannerProps {
  unit: BTCUnit
}

export function RetirementPlanner({ unit }: RetirementPlannerProps) {
  const [inputs, setInputs] = useLocalStorage<RetirementInputs>('satstacker-retirement', DEFAULT_INPUTS)

  const update = (key: keyof RetirementInputs, value: string) => {
    const parsed = parseInputNumber(value)
    setInputs({ ...inputs, [key]: parsed })
  }

  const result = useMemo(() => calculateRetirement(inputs), [inputs])

  const isValidAge = inputs.retirementAge > inputs.currentAge
  const safeWithdrawalRate = 3.5

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Input Panel ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retirement Goals</CardTitle>
              <CardDescription>What does your retirement look like?</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <Input
                label="Desired Annual Spending"
                value={inputs.desiredAnnualSpending}
                onChange={(v) => update('desiredAnnualSpending', v)}
                prefix="$"
                min={0}
                step={5000}
                tooltip="How much you want to spend per year in retirement, in today's dollars. Will be inflation-adjusted."
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Current Age"
                  value={inputs.currentAge}
                  onChange={(v) => update('currentAge', v)}
                  min={18}
                  max={80}
                  step={1}
                  suffix="yrs"
                  tooltip="Your current age."
                />
                <Input
                  label="Retirement Age"
                  value={inputs.retirementAge}
                  onChange={(v) => update('retirementAge', v)}
                  min={20}
                  max={90}
                  step={1}
                  suffix="yrs"
                  tooltip="Age at which you plan to retire and live off your portfolio."
                />
              </div>
              {!isValidAge && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Retirement age must be greater than current age.
                </div>
              )}
              <Input
                label="Inflation Rate"
                value={inputs.inflationRate}
                onChange={(v) => update('inflationRate', v)}
                min={0}
                max={20}
                step={0.5}
                suffix="% / yr"
                tooltip="Annual inflation rate used to adjust future spending. US historical average is ~3%."
              />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bitcoin Assumptions</CardTitle>
              <CardDescription>Future price and DCA parameters</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <Input
                label="Current BTC Price"
                value={inputs.startingBTCPrice}
                onChange={(v) => update('startingBTCPrice', v)}
                prefix="$"
                min={1}
                step={1000}
                tooltip="Current Bitcoin price — used as the baseline for DCA calculations."
              />
              <Input
                label="Future BTC Price at Retirement"
                value={inputs.futureBTCPrice}
                onChange={(v) => update('futureBTCPrice', v)}
                prefix="$"
                min={1}
                step={50000}
                tooltip="Your assumed Bitcoin price at the time of retirement. Used to calculate how much BTC you need."
              />
              <Input
                label="Expected Annual Appreciation"
                value={inputs.baseCaseAPR}
                onChange={(v) => update('baseCaseAPR', v)}
                min={1}
                max={500}
                step={5}
                suffix="% APR"
                tooltip="Annual BTC appreciation assumption used to back-calculate the required weekly DCA amount."
              />
              <div className="px-3 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">Safe withdrawal rate assumption</p>
                <p className="text-sm font-mono font-medium text-orange-400">{safeWithdrawalRate}%</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Conservative vs standard 4% — accounts for BTC volatility.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Results Panel ─────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Hero result */}
          {isValidAge && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <ResultCard
                  icon={<Calendar className="w-4 h-4 text-orange-400" />}
                  label="Years to Retirement"
                  value={`${result.yearsToRetirement} years`}
                  sub={`Age ${inputs.currentAge} → ${inputs.retirementAge}`}
                />
                <ResultCard
                  icon={<DollarSign className="w-4 h-4 text-orange-400" />}
                  label="Inflation-Adj. Annual Spending"
                  value={formatUSD(result.inflationAdjustedSpending)}
                  sub={`at ${inputs.inflationRate}% inflation`}
                />
              </div>

              {/* Main target card */}
              <Card glow>
                <div className="flex items-center gap-2 mb-5">
                  <Target className="w-5 h-5 text-orange-400" />
                  <h3 className="font-semibold text-white">Retirement Target</h3>
                  <Badge variant="base" className="ml-auto">{safeWithdrawalRate}% SWR</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Required Portfolio Size</p>
                    <p className="text-3xl font-bold font-mono text-white tabular-nums">
                      {formatUSD(result.requiredPortfolioSize, true)}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">
                      at {safeWithdrawalRate}% annual withdrawal
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Required BTC Holdings</p>
                    <p className="text-3xl font-bold font-mono text-orange-400 tabular-nums">
                      {formatBTC(result.requiredBTC, true)}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">
                      at {formatUSD(inputs.futureBTCPrice)} / BTC
                    </p>
                  </div>
                </div>
                <Divider />
                <div>
                  <p className="text-xs text-zinc-500 mb-3">In satoshis</p>
                  <p className="text-xl font-mono font-medium text-zinc-300">
                    {Math.round(result.requiredBTC * 1e8).toLocaleString()} sats
                  </p>
                </div>
              </Card>

              {/* DCA Recommendation */}
              <Card>
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  <h3 className="font-semibold text-white">Suggested DCA to Hit Goal</h3>
                </div>
                <p className="text-xs text-zinc-500 mb-4">
                  Based on {inputs.baseCaseAPR}% annual appreciation over {result.yearsToRetirement} years,
                  with BTC reaching {formatUSD(inputs.futureBTCPrice)}.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/15">
                    <p className="text-xs text-zinc-500 mb-1">Weekly DCA</p>
                    <p className="text-2xl font-bold font-mono text-orange-400">
                      {formatUSD(result.suggestedWeeklyDCA)}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">per week</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                    <p className="text-xs text-zinc-500 mb-1">Monthly DCA</p>
                    <p className="text-2xl font-bold font-mono text-white">
                      {formatUSD(result.suggestedMonthlyDCA)}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">per month</p>
                  </div>
                </div>
              </Card>

              {/* Assumptions breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Calculation Breakdown</CardTitle>
                </CardHeader>
                <div className="space-y-2.5">
                  {[
                    {
                      label: 'Today\'s annual spending',
                      value: formatUSD(inputs.desiredAnnualSpending),
                    },
                    {
                      label: `Inflation-adjusted (${inputs.inflationRate}% × ${result.yearsToRetirement} yrs)`,
                      value: formatUSD(result.inflationAdjustedSpending),
                    },
                    {
                      label: `Portfolio needed (÷ ${safeWithdrawalRate}% SWR)`,
                      value: formatUSD(result.requiredPortfolioSize, true),
                      highlight: true,
                    },
                    {
                      label: `BTC needed (÷ ${formatUSD(inputs.futureBTCPrice)})`,
                      value: formatBTC(result.requiredBTC, true),
                      highlight: true,
                    },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                      <span className="text-sm text-zinc-500">{label}</span>
                      <span className={`text-sm font-mono font-medium ${highlight ? 'text-orange-400' : 'text-zinc-300'}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* Warning */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-500">
            <Bitcoin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-500/50" />
            <span>
              This uses a {safeWithdrawalRate}% safe withdrawal rate — more conservative than the
              traditional 4% rule to account for Bitcoin's price volatility. Future BTC price is
              a user assumption and is not a prediction. Actual results will vary significantly.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────

interface ResultCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}

function ResultCard({ icon, label, value, sub }: ResultCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <p className="text-xs text-zinc-500 font-medium">{label}</p>
      </div>
      <p className="text-xl font-bold font-mono text-white tabular-nums">{value}</p>
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </div>
  )
}
