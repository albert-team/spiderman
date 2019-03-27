/**
 * DuplicateFilter options
 * @param {Object} [options={}] - Custom options
 */
class DuplicateFilterOptions {
  constructor(options = {}) {
    /**
     * @public
     * @type {boolean}
     */
    this.useRedisBloom = false

    Object.assign(this, options)
  }
}

module.exports = DuplicateFilterOptions
