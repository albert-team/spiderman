const MetroHash64 = require('metrohash').MetroHash64


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
    this.urlEntityQueue = []
    this.hasher = new MetroHash64()
    this.maxTaskCount = 8
    this.taskCount = 0  // number of current crawling tasks

    this.enqueueUrls(initUrl)
  }

  /**
   * Get URL unique fingerprint. Duplicates will be filtered out.
   * @protected
   * @param {string} url - URL
   * @return {string} Unique fingerprint
  */
  getUrlFingerprint = (url) => {
    this.hasher.update(url)
    return this.hasher.digest()
  }

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
   * @return {{ url: string, fingerprint: string, scraper: function, attemptCount: number }} URL entity
   */
  getUrlEntity(url) {
    const fingerprint = this.getUrlFingerprint(url)
    const scraper = this.classifyUrl(url)
    return { url, fingerprint, scraper, attemptCount: 0 }
  }

  /**
   * Schedule scraping tasks
   * @protected
   * @param {...{ url: string, fingerprint: string, scraper: function, attemptCount: number }} urlEntities - URL entities
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
   * @return {{ url: string, fingerprint: string, scraper: function, attemptCount: number }} URL entity
   */
  dequeueUrlEntity() {
    return this.urlEntityQueue.shift()
  }

  /**
   * Process scraping result data
   * @protected
   * @abstract
   * @param {Object} data - Scraping result data object
   */
  async processData(data) { }

  async handleTask(urlEntity) {
    ++this.taskCount
    ++urlEntity.attemptCount
    const result = await urlEntity.scraper(urlEntity.url)
    if (result.sucess) await this.processData(result.data)
    else { /* handle failed result */ }
    --this.taskCount
  }

  /**
   * Start crawling
   * @public
   */
  start() {
    do {
      while (this.urlEntityQueue) {
        if (this.taskCount >= this.maxTaskCount) continue
        const urlEntity = this.dequeueUrlEntity()
        this.handleTask(urlEntity)
      }
    } while (this.taskCount)
  }
}


exports = Scheduler
