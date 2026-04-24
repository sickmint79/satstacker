import type {
  DCAInputs,
  DCAResult,
  DCAChartPoint,
  ScenarioResult,
  RetirementInputs,
  RetirementResult,
} from '../types'

function runScenario(inputs: DCAInputs, apr: number): ScenarioResult {
  const totalMonths = inputs.yearsInvesting * 12
  const monthlyContrib = inputs.weeklyContribution * (52 / 12) + inputs.monthlyContribution
  let totalBTC = 0
  let totalInvested = 0
  const dataPoints: ScenarioResult['dataPoints'] = []

  for (let month = 1; month <= totalMonths; month++) {
    // Buy at start-of-month price
    const btcPrice = inputs.startingBTCPrice * Math.pow(1 + apr / 12, month - 1)
    if (btcPrice > 0) {
      totalBTC += monthlyContrib / btcPrice
    }
    totalInvested += monthlyContrib

    if (month % 12 === 0) {
      const endYearPrice = inputs.startingBTCPrice * Math.pow(1 + apr / 12, month)
      dataPoints.push({
        year: month / 12,
        value: totalBTC * endYearPrice,
        btc: totalBTC,
        invested: totalInvested,
      })
    }
  }

  const finalBTCPrice =
    inputs.startingBTCPrice * Math.pow(1 + apr / 12, totalMonths)
  const finalValue = totalBTC * finalBTCPrice
  const cagr =
    totalInvested > 0
      ? Math.pow(finalValue / totalInvested, 1 / inputs.yearsInvesting) - 1
      : 0

  return { totalBTC, totalInvested, finalValue, finalBTCPrice, cagr, dataPoints }
}

export function calculateDCA(inputs: DCAInputs): DCAResult {
  if (inputs.yearsInvesting <= 0 || inputs.startingBTCPrice <= 0) {
    const empty: ScenarioResult = {
      totalBTC: 0,
      totalInvested: 0,
      finalValue: 0,
      finalBTCPrice: 0,
      cagr: 0,
      dataPoints: [],
    }
    return { bear: empty, base: empty, bull: empty, chartData: [] }
  }

  const bear = runScenario(inputs, inputs.bearCaseAPR / 100)
  const base = runScenario(inputs, inputs.baseCaseAPR / 100)
  const bull = runScenario(inputs, inputs.bullCaseAPR / 100)

  const chartData: DCAChartPoint[] = bear.dataPoints.map((_, i) => ({
    year: bear.dataPoints[i].year,
    bear: bear.dataPoints[i].value,
    base: base.dataPoints[i].value,
    bull: bull.dataPoints[i].value,
    bearBTC: bear.dataPoints[i].btc,
    baseBTC: base.dataPoints[i].btc,
    bullBTC: bull.dataPoints[i].btc,
    invested: bear.dataPoints[i].invested,
  }))

  return { bear, base, bull, chartData }
}

export function calculateRetirement(inputs: RetirementInputs): RetirementResult {
  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge)

  if (yearsToRetirement === 0) {
    return {
      yearsToRetirement: 0,
      inflationAdjustedSpending: inputs.desiredAnnualSpending,
      requiredPortfolioSize: inputs.desiredAnnualSpending / 0.035,
      requiredBTC:
        inputs.futureBTCPrice > 0
          ? inputs.desiredAnnualSpending / 0.035 / inputs.futureBTCPrice
          : 0,
      suggestedWeeklyDCA: 0,
      suggestedMonthlyDCA: 0,
    }
  }

  const inflationAdjustedSpending =
    inputs.desiredAnnualSpending *
    Math.pow(1 + inputs.inflationRate / 100, yearsToRetirement)

  // 3.5% safe withdrawal rate — conservative for Bitcoin's volatility profile
  const safeWithdrawalRate = 0.035
  const requiredPortfolioSize = inflationAdjustedSpending / safeWithdrawalRate
  const requiredBTC =
    inputs.futureBTCPrice > 0
      ? requiredPortfolioSize / inputs.futureBTCPrice
      : 0

  const suggestedWeeklyDCA = findRequiredWeeklyDCA(
    inputs.startingBTCPrice,
    inputs.baseCaseAPR / 100,
    yearsToRetirement,
    requiredPortfolioSize,
    inputs.futureBTCPrice
  )

  return {
    yearsToRetirement,
    inflationAdjustedSpending,
    requiredPortfolioSize,
    requiredBTC,
    suggestedWeeklyDCA,
    suggestedMonthlyDCA: suggestedWeeklyDCA * (52 / 12),
  }
}

function findRequiredWeeklyDCA(
  startingPrice: number,
  apr: number,
  years: number,
  targetValue: number,
  futureBTCPrice: number
): number {
  if (startingPrice <= 0 || years <= 0 || futureBTCPrice <= 0) return 0

  // Binary search for the weekly contribution that hits the target portfolio value
  let low = 0
  let high = targetValue / years // rough upper bound

  for (let i = 0; i < 64; i++) {
    const mid = (low + high) / 2
    const dcaInputs: DCAInputs = {
      weeklyContribution: mid,
      monthlyContribution: 0,
      yearsInvesting: years,
      startingBTCPrice: startingPrice,
      bearCaseAPR: apr * 100,
      baseCaseAPR: apr * 100,
      bullCaseAPR: apr * 100,
    }
    const result = runScenario(dcaInputs, apr)
    const portfolioValue = result.totalBTC * futureBTCPrice

    if (portfolioValue < targetValue) {
      low = mid
    } else {
      high = mid
    }
  }

  return (low + high) / 2
}
