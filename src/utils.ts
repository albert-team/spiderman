import { BloomDuplicateFilter } from './entities'
import { DuplicateFilter } from './types'

/**
 * Choose a random element from an array
 */
export function chooseRandom<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Check if a duplicate filter is [[BloomDuplicateFilter]]
 */
export function isBloomDuplicateFilter(
  filter: DuplicateFilter
): filter is BloomDuplicateFilter {
  return (filter as BloomDuplicateFilter).connect !== undefined
}
