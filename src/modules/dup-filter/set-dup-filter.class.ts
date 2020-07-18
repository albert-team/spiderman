import { DuplicateFilter } from './dup-filter.interface'

/**
 * Duplicate filter using Set
 */
export class SetDuplicateFilter<T> implements DuplicateFilter<T> {
  private readonly filter = new Set<T>()

  public add(item: T): void {
    this.filter.add(item)
  }

  public exists(item: T): boolean {
    return this.filter.has(item)
  }
}
