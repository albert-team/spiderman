const { UrlEntity, DataEntity } = require('./entities')

/**
 * Schedule crawling tasks
 * @abstract
 * @param {string} initUrl - Initial URL
 * @param {Object} [options={}] - Options
 */
class Scheduler {
  constructor(initUrl, options = {}) {
    /**
     * @private
     * @type {Object}
     */
    this.options = Object.assign(
      { maxTries: 3, maxScrapers: 4, maxDataProcessors: 4 },
      options
    )
    /**
     * @private
     * @type {Array<UrlEntity>}
     */
    this.urlEntityQueue = []
    /**
     * @private
     * @type {number}
     */
    this.scrapers = 0
    /**
     * @private
     * @type {Array<DataEntity>}
     */
    this.dataEntityQueue = []
    /**
     * @private
     * @type {number}
     */
    this.dataProcessors = 0

    this.enqueueUrls(initUrl)
  }

  /**
   * Classify URL into its respective scraper and data processor
   * @protected
   * @abstract
   * @param {string} url - URL
   * @returns {{ scraper: Scraper, dataProcessor: DataProcessor }} Scraper and data processor
   */
  classifyUrl(url) {}

  /**
   * Build URL entity from URL string
   * @private
   * @param {string} url - URL
   * @returns {UrlEntity} URL entity
   */
  getUrlEntity(url) {
    const { scraper, dataProcessor } = this.classifyUrl(url)
    return new UrlEntity(url, scraper, dataProcessor)
  }

  /**
   * Schedule scraping tasks
   * @private
   * @param {...UrlEntity} urlEntities - URL entities
   */
  enqueueUrlEntities(...urlEntities) {
    this.urlEntityQueue.push(...urlEntities)
  }

  /**
   * Schedule scraping tasks
   * @private
   * @param {...string} urls - URLs
   */
  enqueueUrls(...urls) {
    this.enqueueUrlEntities(...urls.map((url) => this.getUrlEntity(url)))
  }

  /**
   * Get next scraping task
   * @private
   * @returns {UrlEntity} URL entity
   */
  dequeueUrlEntity() {
    return this.urlEntityQueue.shift()
  }

  /**
   * Schedule data processing tasks
   * @private
   * @param {...DataEntity} dataEntities - Data entities
   */
  enqueueDataEntities(...dataEntities) {
    this.dataEntityQueue.push(...dataEntities)
  }

  /**
   * Get next data processing task
   * @private
   * @returns {DataEntity} Data entity
   */
  dequeueDataEntity() {
    return this.dataEntityQueue.shift()
  }

  /**
   * Run a scraping task
   * @private
   * @async
   */
  async scrapeData() {
    this.scrapers += 1
    const urlEntity = this.dequeueUrlEntity()
    if (++urlEntity.attempts > this.options.maxTries) return
    const { success, data, nextUrls } = await urlEntity.scraper.run(urlEntity.url)
    if (success) {
      this.enqueueDataEntities(new DataEntity(data, urlEntity.dataProcessor))
      this.enqueueUrls(...nextUrls)
    } else this.enqueueUrlEntities(urlEntity)
    this.scrapers -= 1
  }

  /**
   * Run a data processing task
   * @async
   * @private
   */
  async processData() {
    this.dataProcessors += 1
    const dataEntity = this.dequeueDataEntity()
    if (++dataEntity.attempts > this.options.maxTries) return
    const { success } = await dataEntity.dataProcessor.run(dataEntity.data)
    if (!success) this.enqueueDataEntities(dataEntity)
    this.dataProcessors -= 1
  }

  /**
   * Start crawling
   */
  start() {
    const timer = setInterval(() => {
      if (this.urlEntityQueue.length && this.scrapers < this.options.maxScrapers)
        this.scrapeData()
      if (
        this.dataEntityQueue.length &&
        this.dataProcessors < this.options.maxDataProcessors
      )
        this.processData()
      if (!this.scrapers && !this.urlEntityQueue.length) clearInterval(timer)
    }, 1)
  }
}

module.exports = Scheduler
