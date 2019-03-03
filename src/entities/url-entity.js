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
    this.retryCount = -1
    /**
     * @private
     * @type {string} */
    this.fingerprint = ''
  }

  /**
   * Get fingerprint
   * @returns {string} Fingerprint
   */
  getFingerprint() {
    if (!this.fingerprint) this.fingerprint = xxhash.h64(this.url, 0).toString()
    return this.fingerprint
  }
}

module.exports = UrlEntity
