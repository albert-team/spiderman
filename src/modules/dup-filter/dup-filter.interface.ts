/**
 * Duplicate filter
 */
export interface DuplicateFilter<T> {
  /**
   * Add an item to the filter
   */
  add(item: T): void

  /**
   * Check if an item already exists in the filter
   */
  exists(item: T): boolean
}
