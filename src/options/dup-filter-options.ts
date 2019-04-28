/**
 * DuplicateFilter options
 * @param {Object} [options={}] - Custom options
 */
class DuplicateFilterOptions {
  useRedisBloom: boolean

  constructor(options = {}) {
    /**
     * @public
     * @type {boolean}
     */
    this.useRedisBloom = false

    Object.assign(this, options)
  }
}

export default DuplicateFilterOptions
