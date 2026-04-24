import { useLocalStorage } from './useLocalStorage'
import type { BTCUnit } from '../types'

export function useUnit() {
  const [unit, setUnit] = useLocalStorage<BTCUnit>('satstacker-unit', 'usd')
  return { unit, setUnit }
}
