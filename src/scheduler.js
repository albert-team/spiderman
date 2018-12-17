/**
 * Schedule crawling tasks
 * @public
 */
class Scheduler {
  /**
   * Constructor
   * @public
   * @param {string} initUrl - Initial URL
  */
  constructor(initUrl) {
    /**
     * Scraping task queue
     * @private
     * @type {Array<Object>}
     */
    this.urlEntityQueue = []
    this.enqueueUrls(initUrl)
  }

  /**
   * Get URL unique fingerprint. Duplicates will be filtered out.
   * @protected
   * @param {string} url - URL
   * @return {string} Unique fingerprint
  */
  getUrlFingerprint = (url) => url

  /**
   * Classify URL into its respective scraper
   * @protected
   * @abstract
   * @param {string} url - URL
   * @return {function(url: string): Object} A scraper that takes an URL, scrapes data then returns result object
  */
  classifyUrl(url) { }

  /**
   * Build URL entity from URL
   * @private
   * @param {string} url - URL
   * @return {{ url: string, fingerprint: string, scraper: function, attempt: number }} URL entity
   */
  getUrlEntity(url) {
    const fingerprint = this.getUrlFingerprint(url)
    const scraper = this.classifyUrl(url)
    return { url, fingerprint, scraper, attempt: 0 }
  }

  /**
   * Schedule scraping tasks
   * @protected
   * @param {...{ url: string, fingerprint: string, scraper: function, attempt: number }} urlEntities - URL entities
   */
  enqueueUrlEntities = (...urlEntities) => this.urlEntityQueue.push.call(urlEntities)

  /**
   * Schedule scraping tasks
   * @protected
   * @param {...string} urls - URLs
   */
  enqueueUrls = (...urls) => this.enqueueUrlEntities(...urls.map((url) => this.getUrlEntity(url)))

  /**
   * Get next scraping task
   * @private
   * @return {{ url: string, fingerprint: string, scraper: function, attempt: number }} URL entity
   */
  dequeueUrlEntity() {
    return this.urlEntityQueue.shift()
  }

  /**
   * Handle scraping result
   * @protected
   * @abstract
   * @param {Object} result - Scraping result object
   */
  handleResult(result) { }

  /**
   * Start crawling
   * @public
   */
  async start() {
    do {
      const urlEntity = this.dequeueUrlEntity()
      ++urlEntity.attempt
      const result = await urlEntity.scraper(urlEntity.url)
      this.handleResult(result)
    } while (this.urlEntityQueue)
  }
}


exports = Scheduler
