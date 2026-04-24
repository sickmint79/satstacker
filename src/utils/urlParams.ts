import type { DCAInputs } from '../types'

export function encodeDCAToURL(inputs: DCAInputs): string {
  const params = new URLSearchParams({
    w: String(inputs.weeklyContribution),
    m: String(inputs.monthlyContribution),
    y: String(inputs.yearsInvesting),
    p: String(inputs.startingBTCPrice),
    bear: String(inputs.bearCaseAPR),
    base: String(inputs.baseCaseAPR),
    bull: String(inputs.bullCaseAPR),
  })
  return params.toString()
}

export function decodeDCAFromURL(search: string): Partial<DCAInputs> {
  const params = new URLSearchParams(search)
  const result: Partial<DCAInputs> = {}

  const w = params.get('w')
  const m = params.get('m')
  const y = params.get('y')
  const p = params.get('p')
  const bear = params.get('bear')
  const base = params.get('base')
  const bull = params.get('bull')

  if (w !== null) result.weeklyContribution = parseFloat(w)
  if (m !== null) result.monthlyContribution = parseFloat(m)
  if (y !== null) result.yearsInvesting = parseInt(y)
  if (p !== null) result.startingBTCPrice = parseFloat(p)
  if (bear !== null) result.bearCaseAPR = parseFloat(bear)
  if (base !== null) result.baseCaseAPR = parseFloat(base)
  if (bull !== null) result.bullCaseAPR = parseFloat(bull)

  return result
}

export async function copyShareURL(inputs: DCAInputs): Promise<void> {
  const params = encodeDCAToURL(inputs)
  const url = `${window.location.origin}${window.location.pathname}?${params}`
  await navigator.clipboard.writeText(url)
}
