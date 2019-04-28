/**
 * Scraper options
 * @param {Object} [options={}] - Custom options
 */
class ScraperOptions {
  timeout: number

  constructor(options = {}) {
    /**
     * Request timeout
     * @public
     * @type {number}
     */
    this.timeout = 10 * 1000

    Object.assign(this, options)
  }
}

export default ScraperOptions
