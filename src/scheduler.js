const { UrlEntity, DataEntity } = require('./entities')

/**
 * Schedule crawling tasks
 * @abstract
 */
class Scheduler {
  /**
   * Constructor
   * @param {string} initUrl - Initial URL
   */
  constructor(initUrl) {
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
     * @type {number}
     */
    this.maxScrapers = 8
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
    /**
     * @private
     * @type {number}
     */
    this.maxDataProcessors = 8

    this.enqueueUrls(initUrl)
  }

  /**
   * Classify URL into its respective scraper and data processor
   * @protected
   * @abstract
   * @param {string} url - URL
   * @return {{scraper: Object, dataProcessor: Object}} Scraper and data processor
   */
  classifyUrl(url) {}

  /**
   * Build URL entity from URL string
   * @private
   * @param {string} url - URL
   * @return {UrlEntity} URL entity
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
   * @return {UrlEntity} URL entity
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
   * @return {DataEntity} Data entity
   */
  dequeueDataEntity() {
    return this.dataEntityQueue.shift()
  }

  /**
   * Run a scraping task
   * @private
   */
  async scrapeData() {
    this.scrapers += 1
    const urlEntity = this.dequeueUrlEntity()
    urlEntity.attempts += 1
    const { success, data, nextUrls } = await urlEntity.scraper.run(
      urlEntity.url
    )
    if (success) {
      this.enqueueDataEntities(new DataEntity(data, urlEntity.dataProcessor))
      this.enqueueUrls(...nextUrls)
    } else {
      /* handle failed result */
    }
    this.scrapers -= 1
  }

  /**
   * Run a data processing task
   * @private
   */
  async processData() {
    this.dataProcessors += 1
    const dataEntity = this.dequeueDataEntity()
    dataEntity.attempts += 1
    const { success } = await dataEntity.dataProcessor.run(dataEntity.data)
    if (!success) {
      /* handle failed result */
    }
    this.dataProcessors -= 1
  }

  /**
   * Start crawling
   */
  start() {
    const timer = setInterval(() => {
      if (this.urlEntityQueue.length && this.scrapers < this.maxScrapers)
        this.scrapeData()
      if (
        this.dataEntityQueue.length &&
        this.dataProcessors < this.maxDataProcessors
      )
        this.processData()
      if (!this.scrapers && !this.urlEntityQueue.length) clearInterval(timer)
    }, 1)
  }
}

module.exports = Scheduler
