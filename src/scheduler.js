const { UrlEntity, DataEntity } = require('./entities')
const { BloomFilter } = require('@albert-team/rebloom')
const Bottleneck = require('bottleneck').default

/**
 * Manage and schedule crawling tasks
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
      { shortRetries: 1, longRetries: 1, maxScrapers: 4, maxDataProcessors: 4 },
      options
    )
    /**
     * @private
     * @type {BloomFilter}
     */
    this.dupUrlFilter = new BloomFilter('duplicate-url-filter')
    /**
     * @private
     * @type {Bottleneck}
     */
    this.scrapers = new Bottleneck({
      maxConcurrent: this.options.maxScrapers,
      minTime: 100,
      reservoir: 60,
      reservoirRefreshInterval: 60 * 1000,
      reservoirRefreshAmount: 60
    })
    this.scrapers.on('failed', async (err, task) => {
      if (task.retryCount < this.options.shortRetries) return task.retryCount * 1000
    })
    /**
     * @private
     * @type {Bottleneck}
     */
    this.dataProcessors = new Bottleneck({
      maxConcurrent: this.options.maxDataProcessors,
      minTime: 100,
      reservoir: 60,
      reservoirRefreshInterval: 60 * 1000,
      reservoirRefreshAmount: 60
    })
    this.dataProcessors.on('failed', async (err, task) => {
      if (task.retryCount < this.options.shortRetries) return task.retryCount * 1000
    })
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
   * Run a scraping task
   * @private
   * @async
   * @param {string} url - URL
   * @param {boolean} [duplicateCheck=true] - Whether filter out duplicates or not
   */
  async scrapeUrl(url, duplicateCheck = true) {
    const { scraper, dataProcessor } = this.classifyUrl(url)
    const urlEntity = new UrlEntity(url, scraper, dataProcessor)
    if (duplicateCheck) {
      const fp = urlEntity.getFingerprint()
      if (await this.dupUrlFilter.exists(fp)) return
      await this.dupUrlFilter.add(fp)
    }
    return this.scrapeUrlEntity(urlEntity)
  }

  /**
   * Run a scraping task
   * @private
   * @async
   * @param {UrlEntity} urlEntity - URL entity
   */
  async scrapeUrlEntity(urlEntity) {
    if (urlEntity.retryCount >= this.options.longRetries) return
    ++urlEntity.retryCount
    const { success, data, nextUrls = [] } = await urlEntity.scraper.run(urlEntity.url)
    if (success) {
      const dataEntity = new DataEntity(data, urlEntity.dataProcessor)
      this.dataProcessors.schedule(() => this.processDataEntity(dataEntity))
      for (const url of nextUrls) this.scrapers.schedule(() => this.scrapeUrl(url))
    } else this.scrapers.schedule(() => this.scrapeUrlEntity(urlEntity))
  }

  /**
   * Run a data processing task
   * @private
   * @async
   * @param {DataEntity} dataEntity - Data entity
   */
  async processDataEntity(dataEntity) {
    if (dataEntity.retryCount >= this.options.longRetries) return
    ++dataEntity.retryCount
    const { success } = await dataEntity.dataProcessor.run(dataEntity.data)
    if (!success) this.dataProcessors.schedule(() => this.processDataEntity(dataEntity))
  }

  /**
   * Start crawling
   * @async
   */
  async start() {
    await this.dupUrlFilter.connect()
    await this.dupUrlFilter.prepare()
    this.scrapeUrl(this.initUrl, false)
  }

  /**
   * Stop crawling and clean up
   * @async
   * @param {boolean} [gracefully=true] - Whether complete all waiting tasks or not
   */
  async stop(gracefully = true) {
    return Promise.all([
      this.scrapers.stop({ dropWaitingJobs: !gracefully }),
      this.dataProcessors.stop({ dropWaitingJobs: !gracefully })
    ])
  }

  /**
   * Disconnect all connections
   * @async
   */
  async disconnect() {
    return Promise.all([
      this.scrapers.disconnect(),
      this.dataProcessors.disconnect(),
      this.dupUrlFilter.disconnect()
    ])
  }
}

module.exports = Scheduler
