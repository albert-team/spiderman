const { BloomFilter } = require('@albert-team/rebloom')

const { DuplicateFilterOptions } = require('./options')

/**
 * Duplicate filter
 * @param {string} name - Name of the filter
 * @param {DuplicateFilterOptions} [options={}] - Options
 */
class DuplicateFilter {
  constructor(name, options = {}) {
    /**
     * @private
     * @type {string}
     */
    this.name = name
    /**
     * @private
     * @type {DuplicateFilterOptions}
     */
    this.options = new DuplicateFilterOptions(options)
    /**
     * @private
     * @type {(BloomFilter|Set)}
     */
    this.filter = new Set()
    /**
     * @public
     * @async
     */
    this.connect = () => {}
    /**
     * @public
     * @async
     */
    this.disconnect = () => {}
    /**
     * Add an item to the filter
     * @public
     * @async
     * @param {any} item - Item
     */
    this.add = (item) => this.filter.add(item)
    /**
     * Check if an item already exists in the filter
     * @public
     * @async
     * @param {any} item - Item
     */
    this.exists = (item) => this.filter.has(item)

    if (this.options.useRedisBloom) {
      this.filter = new BloomFilter(this.name, { minCapacity: 10 ** 6 })
      this.connect = async () => this.filter.connect()
      this.disconnect = async () => this.filter.disconnect()
      this.add = async (item) => this.filter.add(item)
      this.exists = async (item) => this.filter.exists(item)
    }
  }
}

module.exports = DuplicateFilter
