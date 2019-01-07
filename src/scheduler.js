const { UrlEntity, DataEntity } = require('./entities')


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
    this.hasher = new MetroHash64()

    this.urlEntityQueue = []
    // number of running scrapers
    this.scrapers = 0
    this.maxScrapers = 8

    this.dataEntityQueue = []
    // number of running data processors
    this.dataProcessors = 0
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
  classifyUrl(url) { }

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
  enqueueUrlEntities = (...urlEntities) => this.urlEntityQueue.push(...urlEntities)

  /**
   * Schedule scraping tasks
   * @private
   * @param {...string} urls - URLs
   */
  enqueueUrls = (...urls) => this.enqueueUrlEntities(...urls.map((url) => this.getUrlEntity(url)))

  /**
   * Get next scraping task
   * @private
   * @return {UrlEntity} URL entity
   */
  dequeueUrlEntity = () => this.urlEntityQueue.shift()

  /**
   * Schedule data processing tasks
   * @private
   * @param {...DataEntity} dataEntities - Data entities
   */
  enqueueDataEntities = (...dataEntities) => this.dataEntityQueue.push(...dataEntities)

  /**
   * Get next data processing task
   * @private
   * @return {DataEntity} Data entity
   */
  dequeueDataEntity = () => this.dataEntityQueue.shift()

  /**
   * Run a scraping task
   * @private
   */
  async scrapeData() {
    ++this.scrapers
    const urlEntity = this.dequeueUrlEntity()
    ++urlEntity.attempts
    const { success, data, nextUrls } = await urlEntity.scraper.run(urlEntity.url)
    if (success) {
      this.enqueueDataEntities(new DataEntity(data, urlEntity.dataProcessor))
      this.enqueueUrls(...nextUrls)
    } else { /* handle failed result */ }
    --this.scrapers
  }

  /**
   * Run a data processing task
   * @private
   */
  async processData() {
    ++this.dataProcessors
    const dataEntity = this.dequeueDataEntity()
    ++dataEntity.attempts
    const { success } = await dataEntity.dataProcessor.run(dataEntity.data)
    if (!success) { /* handle failed result */ }
    --this.dataProcessors
  }

  /**
   * Start crawling
   * @public
   */
  start() {
    do {
      if (this.urlEntityQueue && this.scrapers < this.maxScrapers) this.scrapeData()
      if (this.dataEntityQueue && this.dataProcessors < this.maxDataProcessors) this.processData()
    } while (this.scrapers)
  }
}


module.exports = Scheduler
