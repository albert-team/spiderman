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
  }

  /**
   * Get the unique fingerprint of the URL (the URL itself by default)
   * @returns {string} Fingerprint
   */
  getFingerprint() {
    return this.url
  }
}

module.exports = UrlEntity
