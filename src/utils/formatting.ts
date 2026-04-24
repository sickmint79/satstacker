import type { BTCUnit } from '../types'

export function formatUSD(value: number, compact = false): string {
  if (compact) {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatBTC(satsOrBTC: number, alreadyBTC = false): string {
  const btc = alreadyBTC ? satsOrBTC : satsOrBTC
  if (btc < 0.001) return `${btc.toFixed(8)} BTC`
  if (btc < 0.1) return `${btc.toFixed(6)} BTC`
  if (btc < 10) return `${btc.toFixed(4)} BTC`
  return `${btc.toFixed(2)} BTC`
}

export function formatSats(btc: number): string {
  const sats = Math.round(btc * 1e8)
  return `${new Intl.NumberFormat('en-US').format(sats)} sats`
}

export function formatPortfolioValue(
  usdValue: number,
  unit: BTCUnit,
  referenceBTCPrice: number
): string {
  if (referenceBTCPrice <= 0) return formatUSD(usdValue)
  const btcAmount = usdValue / referenceBTCPrice
  switch (unit) {
    case 'btc':
      return formatBTC(btcAmount, true)
    case 'sats':
      return formatSats(btcAmount)
    case 'usd':
    default:
      return formatUSD(usdValue)
  }
}

export function formatBTCAmount(btc: number, unit: BTCUnit): string {
  switch (unit) {
    case 'btc':
      return formatBTC(btc, true)
    case 'sats':
      return formatSats(btc)
    case 'usd':
    default:
      return formatBTC(btc, true)
  }
}

export function formatPercent(value: number, decimals = 1): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(decimals)}%`
}

export function formatCAGR(cagr: number): string {
  return formatPercent(cagr)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

export function parseInputNumber(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

export function chartAxisFormatter(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(0)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`
  return `$${value}`
}
