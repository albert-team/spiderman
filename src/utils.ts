import { BloomDuplicateFilter, DuplicateFilter } from './entities'

/**
 * Choose a random element from an array
 */
export const chooseRandom = <T>(arr: Array<T>): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const isBloomDuplicateFilter = (
  filter: DuplicateFilter
): filter is BloomDuplicateFilter => {
  return (filter as BloomDuplicateFilter).connect !== undefined
}
