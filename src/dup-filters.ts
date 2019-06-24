import { BloomFilter } from '@albert-team/rebloom'

/**
 * Duplicate filter using Set
 */
class SetDuplicateFilter {
  private filter: Set<any>

  constructor() {
    this.filter = new Set()
  }

  /**
   * Do nothing
   */
  public connect() {}

  /**
   * Do nothing
   */
  public disconnect() {}

  /**
   * Add an item to the filter
   */
  public add(item: any) {
    this.filter.add(item)
  }

  /**
   * Check if an item already exists in the filter
   */
  public exists(item: any): boolean {
    return this.filter.has(item)
  }
}

export { SetDuplicateFilter, BloomFilter as BloomDuplicateFilter }
