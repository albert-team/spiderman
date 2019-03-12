/**
 * Scraper options
 * @param {Object} [options={}] - Custom options
 */
class ScraperOptions {
  constructor(options = {}) {
    this.timeout = 10 * 1000

    Object.assign(this, options)
  }
}

module.exports = ScraperOptions
