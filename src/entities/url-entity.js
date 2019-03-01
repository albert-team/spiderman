const xxhash = require('xxhashjs')

/**
 * URL entity
 * @param {string} url - URL
 * @param {Scraper} scraper - Scraper
 * @param {DataProcessor} dataProcessor - Data processor
 */
class UrlEntity {
  constructor(url, scraper, dataProcessor) {
    /** @type {string} */
    this.url = url
    /** @type {Scraper} */
    this.scraper = scraper
    /** @type {DataProcessor} */
    this.dataProcessor = dataProcessor
    /** @type {number} */
    this.attempts = 0
    /** @type {string} */
    this.fingerprint = this.getFingerprint()
  }

  /**
   * Get fingerprint
   * @private
   * @returns {string} Fingerprint
   */
  getFingerprint() {
    return xxhash.h64(this.url, 0).toString()
  }
}

module.exports = UrlEntity
