export { BloomFilter as BloomDuplicateFilter } from '@albert-team/rebloom'

/**
 * Duplicate filter using Set
 */
export class SetDuplicateFilter {
  private readonly filter: Set<unknown> = new Set()

  /**
   * Add an item to the filter
   */
  public add(item: unknown): void {
    this.filter.add(item)
  }

  /**
   * Check if an item already exists in the filter
   */
  public exists(item: unknown): boolean {
    return this.filter.has(item)
  }
}
