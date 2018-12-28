const MetroHash64 = require('metrohash').MetroHash64

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
   * Classify URL into its respective scraper and data processor
   * @protected
   * @abstract
   * @param {string} url - URL
   * @return {{scraper: Object, dataProcessor: Object}} scraper and data processor as an object
  */
  classifyUrl(url) { }

  /**
   * Build URL entity from URL
   * @private
   * @param {string} url - URL
   * @return {UrlEntity} URL entity
   */
  getUrlEntity(url) {
    const fingerprint = this.getUrlFingerprint(url)
    const { scraper, dataProcessor } = this.classifyUrl(url)
    return new UrlEntity(url, fingerprint, scraper, dataProcessor)
  }

  /**
   * Schedule scraping tasks
   * @protected
   * @param {...UrlEntity} urlEntities - URL entities
   */
  enqueueUrlEntities = (...urlEntities) => this.urlEntityQueue.push(...urlEntities)

  /**
   * Schedule scraping tasks
   * @protected
   * @param {...string} urls - URLs
   */
  enqueueUrls = (...urls) => this.enqueueUrlEntities(...urls.map((url) => this.getUrlEntity(url)))

  /**
   * Get next scraping task
   * @private
   * @return {UrlEntity} URL entity
   */
  dequeueUrlEntity = () => this.urlEntityQueue.shift()

  enqueueDataEntities = (...dataEntities) => this.dataEntityQueue.push(...dataEntities)

  dequeueDataEntity = () => this.dataEntityQueue.shift()

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
