/**
 * Scraper options
 * @param {Object} [options={}] - Custom options
 */
class ScraperOptions {
  constructor(options = {}) {
    /**
     * Request timeout
     * @public
     * @type {number}
     */
    this.timeout = 10 * 1000
    /**
     * Whether use cache. If false, ignore cacheTimeout option
     * @public
     * @type {boolean}
     */
    this.useCache = false
    /**
     * @public
     * @type {number}
     */
    this.cacheTimeout = 60 * 60 * 1000 // 1 hour

    Object.assign(this, options)
  }
}

module.exports = ScraperOptions
