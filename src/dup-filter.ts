import { BloomFilter } from '@albert-team/rebloom'
import { DuplicateFilterOptions, DuplicateFilterOptionsInterface } from './options'

/**
 * Duplicate filter
 */
class DuplicateFilter {
  private name: string
  private options: DuplicateFilterOptions
  private filter: BloomFilter | Set<any>

  constructor(name: string, options: DuplicateFilterOptionsInterface = {}) {
    this.name = name
    this.options = new DuplicateFilterOptions(options)
    this.filter = new Set()

    if (this.options.useRedisBloom) {
      this.filter = new BloomFilter(this.name, { minCapacity: 10 ** 6 })
      this.connect = async () => this.filter.connect()
      this.disconnect = async () => this.filter.disconnect()
      this.add = async (item) => this.filter.add(item)
      this.exists = async (item) => this.filter.exists(item)
    }
  }

  /**
   * Connect to Redis server when RedisBloom is used
   */
  async connect() {}

  /**
   * Disconnect from Redis server when RedisBloom is used
   */
  async disconnect() {}

  /**
   * Add an item to the filter
   */
  async add(item: any) {
    this.filter.add(item)
  }

  /**
   * Check if an item already exists in the filter
   */
  async exists(item: any): Promise<boolean> {
    return this.filter.has(item)
  }
}

export default DuplicateFilter
