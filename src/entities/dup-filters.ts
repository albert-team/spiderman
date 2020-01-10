import { BloomFilter as BloomDuplicateFilter } from '@albert-team/rebloom'

/**
 * Duplicate filter using Set
 */
export class SetDuplicateFilter {
  private readonly filter: Set<any> = new Set()

  /**
   * Add an item to the filter
   */
  public add(item: any): void {
    this.filter.add(item)
  }

  /**
   * Check if an item already exists in the filter
   */
  public exists(item: any): boolean {
    return this.filter.has(item)
  }
}

export type DuplicateFilter = BloomDuplicateFilter | SetDuplicateFilter

export { BloomDuplicateFilter }
