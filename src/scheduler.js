const { UrlEntity, DataEntity } = require('./entities')
const { BloomFilter } = require('@albert-team/rebloom')

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
     * @type {string}
     */
    this.initUrl = initUrl
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
    /**
     * @private
     * @type {BloomFilter}
     */
    this.dupUrlFilter = new BloomFilter('duplicate-url-filter')
    /**
     * Interval timer when crawling
     * @private
     * @type {number}
     */
    this.timer = null
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
   * @async
   * @param {Array<UrlEntity>} urlEntities - URL entities
   * @param {boolean} [duplicateCheck=true] - Whether filter out duplicate URLs or not
   */
  async enqueueUrlEntities(urlEntities, duplicateCheck = true) {
    if (duplicateCheck) {
      urlEntities = await Promise.all(
        urlEntities.map(async (urlEntity) => {
          const fp = urlEntity.getFingerprint()
          if (await this.dupUrlFilter.exists(fp)) return null
          await this.dupUrlFilter.add(fp)
          return urlEntity
        })
      )
      urlEntities = urlEntities.filter((urlEntity) => urlEntity) // filter out all null items
    }
    this.urlEntityQueue.push(...urlEntities)
  }

  /**
   * Schedule scraping tasks
   * @private
   * @async
   * @param {Array<string>} urls - URLs
   * @param {boolean} [duplicateCheck=true] - Whether filter out duplicate URLs or not
   */
  async enqueueUrls(urls, duplicateCheck = true) {
    return this.enqueueUrlEntities(
      urls.map((url) => this.getUrlEntity(url)),
      duplicateCheck
    )
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
   * @param {Array<DataEntity>} dataEntities - Data entities
   */
  enqueueDataEntities(dataEntities) {
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
    const { success, data, nextUrls = [] } = await urlEntity.scraper.run(urlEntity.url)
    if (success) {
      this.enqueueDataEntities([new DataEntity(data, urlEntity.dataProcessor)])
      await this.enqueueUrls(nextUrls)
    } else await this.enqueueUrlEntities([urlEntity], false)
    this.scrapers -= 1
  }

  /**
   * Run a data processing task
   * @private
   * @async
   */
  async processData() {
    this.dataProcessors += 1
    const dataEntity = this.dequeueDataEntity()
    if (++dataEntity.attempts > this.options.maxTries) return
    const { success } = await dataEntity.dataProcessor.run(dataEntity.data)
    if (!success) this.enqueueDataEntities([dataEntity])
    this.dataProcessors -= 1
  }

  /**
   * Start crawling
   * @async
   */
  async start() {
    await this.dupUrlFilter.connect()
    await this.dupUrlFilter.prepare()

    await this.enqueueUrls([this.initUrl])

    this.timer = setInterval(async () => {
      if (this.urlEntityQueue.length && this.scrapers < this.options.maxScrapers)
        this.scrapeData()
      if (
        this.dataEntityQueue.length &&
        this.dataProcessors < this.options.maxDataProcessors
      )
        this.processData()
      if (!this.scrapers && !this.urlEntityQueue.length) await this.stop()
    }, 100)
  }

  /**
   * Stop crawling and clean up
   * @async
   */
  async stop() {
    clearInterval(this.timer)
    await this.dupUrlFilter.disconnect()
  }
}

module.exports = Scheduler
