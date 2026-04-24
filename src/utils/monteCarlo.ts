import type { MonteCarloInputs, MonteCarloResult } from '../types'

function normalRandom(): number {
  // Box-Muller transform
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function percentileOf(arr: number[], p: number): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const index = Math.floor(sorted.length * p)
  return sorted[Math.min(index, sorted.length - 1)]
}

export function runMonteCarlo(
  inputs: MonteCarloInputs,
  numSims = 500
): MonteCarloResult {
  if (inputs.yearsInvesting <= 0 || inputs.startingBTCPrice <= 0) {
    return {
      years: [0],
      p10: [0], p25: [0], p50: [0], p75: [0], p90: [0],
      chartData: [{ year: 0, p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 }],
      finalValues: [],
      medianFinal: 0, p10Final: 0, p90Final: 0, p25Final: 0, p75Final: 0,
    }
  }

  const monthlyContrib =
    inputs.weeklyContribution * (52 / 12) + inputs.monthlyContribution
  const meanReturn = inputs.annualMeanReturn / 100
  const volatility = inputs.annualVolatility / 100

  // Log-normal drift correction so arithmetic mean = meanReturn
  const logMean = Math.log(1 + meanReturn) - 0.5 * volatility * volatility
  const logStd = volatility

  const allSims: number[][] = []

  for (let sim = 0; sim < numSims; sim++) {
    const yearlyValues: number[] = [0]
    let totalBTC = 0
    let btcPrice = inputs.startingBTCPrice

    for (let year = 1; year <= inputs.yearsInvesting; year++) {
      // Contributions during year bought at start-of-year price
      if (btcPrice > 0) {
        totalBTC += (monthlyContrib * 12) / btcPrice
      }

      // Random annual return from log-normal distribution
      const z = normalRandom()
      const annualReturn = Math.exp(logMean + logStd * z) - 1

      btcPrice = Math.max(btcPrice * (1 + annualReturn), 0.01)
      yearlyValues.push(totalBTC * btcPrice)
    }

    allSims.push(yearlyValues)
  }

  const years = Array.from({ length: inputs.yearsInvesting + 1 }, (_, i) => i)

  const p10 = years.map(y => percentileOf(allSims.map(s => s[y]), 0.1))
  const p25 = years.map(y => percentileOf(allSims.map(s => s[y]), 0.25))
  const p50 = years.map(y => percentileOf(allSims.map(s => s[y]), 0.5))
  const p75 = years.map(y => percentileOf(allSims.map(s => s[y]), 0.75))
  const p90 = years.map(y => percentileOf(allSims.map(s => s[y]), 0.9))

  const chartData = years.map((year, i) => ({
    year,
    p10: p10[i],
    p25: p25[i],
    p50: p50[i],
    p75: p75[i],
    p90: p90[i],
  }))

  const finalValues = allSims.map(s => s[s.length - 1])

  return {
    years,
    p10, p25, p50, p75, p90,
    chartData,
    finalValues,
    medianFinal: percentileOf(finalValues, 0.5),
    p10Final: percentileOf(finalValues, 0.1),
    p25Final: percentileOf(finalValues, 0.25),
    p75Final: percentileOf(finalValues, 0.75),
    p90Final: percentileOf(finalValues, 0.9),
  }
}
