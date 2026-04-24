export type BTCUnit = 'btc' | 'sats' | 'usd'

export type ActiveTab = 'dca' | 'retirement' | 'montecarlo' | 'education'

export interface DCAInputs {
  weeklyContribution: number
  monthlyContribution: number
  yearsInvesting: number
  startingBTCPrice: number
  bearCaseAPR: number
  baseCaseAPR: number
  bullCaseAPR: number
}

export interface ScenarioYearData {
  year: number
  value: number
  btc: number
  invested: number
}

export interface ScenarioResult {
  totalBTC: number
  totalInvested: number
  finalValue: number
  finalBTCPrice: number
  cagr: number
  dataPoints: ScenarioYearData[]
}

export interface DCAChartPoint {
  year: number
  bear: number
  base: number
  bull: number
  bearBTC: number
  baseBTC: number
  bullBTC: number
  invested: number
}

export interface DCAResult {
  bear: ScenarioResult
  base: ScenarioResult
  bull: ScenarioResult
  chartData: DCAChartPoint[]
}

export interface RetirementInputs {
  desiredAnnualSpending: number
  currentAge: number
  retirementAge: number
  inflationRate: number
  futureBTCPrice: number
  startingBTCPrice: number
  baseCaseAPR: number
}

export interface RetirementResult {
  yearsToRetirement: number
  inflationAdjustedSpending: number
  requiredPortfolioSize: number
  requiredBTC: number
  suggestedWeeklyDCA: number
  suggestedMonthlyDCA: number
}

export interface MonteCarloInputs {
  weeklyContribution: number
  monthlyContribution: number
  yearsInvesting: number
  startingBTCPrice: number
  annualMeanReturn: number
  annualVolatility: number
}

export interface MonteCarloChartPoint {
  year: number
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
}

export interface MonteCarloResult {
  years: number[]
  p10: number[]
  p25: number[]
  p50: number[]
  p75: number[]
  p90: number[]
  chartData: MonteCarloChartPoint[]
  finalValues: number[]
  medianFinal: number
  p10Final: number
  p90Final: number
  p25Final: number
  p75Final: number
}

export interface SavedScenario {
  id: string
  name: string
  type: 'dca' | 'retirement'
  inputs: DCAInputs | RetirementInputs
  savedAt: string
}
