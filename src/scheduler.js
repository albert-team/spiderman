const Bottleneck = require('bottleneck').default
const { BloomFilter } = require('@albert-team/rebloom')
const pino = require('pino')

const { UrlEntity, DataEntity } = require('./entities')

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
      { shortRetries: 1, longRetries: 2, maxScrapers: 4, maxDataProcessors: 4 },
      options
    )
    /**
     * @private
     * @type {BloomFilter}
     */
    this.dupUrlFilter = new BloomFilter('spiderman-urlfilter', { minCapacity: 10 ** 6 })
    /**
     * @private
     * @type {number}
     */
    this.activeQueues = 2
    /**
     * @private
     * @type {Bottleneck}
     */
    this.scrapers = new Bottleneck({
      maxConcurrent: this.options.maxScrapers,
      reservoir: 60,
      reservoirRefreshInterval: 60 * 1000,
      reservoirRefreshAmount: 60
    })
    this.scrapers
      .on('failed', async (err, task) => {
        if (task.retryCount < this.options.shortRetries) return task.retryCount * 1000
      })
      .once('idle', () => --this.activeQueues)
    /**
     * @private
     * @type {Bottleneck}
     */
    this.dataProcessors = new Bottleneck({
      maxConcurrent: this.options.maxDataProcessors,
      reservoir: 60,
      reservoirRefreshInterval: 60 * 1000,
      reservoirRefreshAmount: 60
    })
    this.dataProcessors
      .on('failed', async (err, task) => {
        if (task.retryCount < this.options.shortRetries) return task.retryCount * 1000
      })
      .once('idle', () => --this.activeQueues)
    /**
     * @private
     * @type {Object}
     */
    this.logger = pino({ name: 'spiderman-scheduler' })
  }

  /**
   * Classify URL into its respective scraper and data processor
   * @protected
   * @abstract
   * @param {string} url - URL
   * @returns {({ scraper: Scraper, dataProcessor: (DataProcessor|null) }|null)} Scraper and data processor
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
    const result = this.classifyUrl(url)
    if (!result) return // discard
    const { scraper, dataProcessor } = result
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
    ++urlEntity.retryCount
    const { url, scraper, dataProcessor, retryCount } = urlEntity
    const { success, data, nextUrls = [] } = await scraper.run(url)
    this.logger.info({ url, attempt: retryCount + 1, success })
    if (success) {
      for (const nextUrl of nextUrls)
        this.scrapers.schedule(() => this.scrapeUrl(nextUrl))
      if (!dataProcessor) return
      const dataEntity = new DataEntity(data, dataProcessor)
      this.dataProcessors.schedule(() => this.processDataEntity(dataEntity))
    } else {
      if (retryCount >= this.options.longRetries) return
      this.scrapers.schedule({ priority: 5 + Math.max(retryCount, 4) }, () =>
        this.scrapeUrlEntity(urlEntity)
      )
    }
  }

  /**
   * Run a data processing task
   * @private
   * @async
   * @param {DataEntity} dataEntity - Data entity
   */
  async processDataEntity(dataEntity) {
    ++dataEntity.retryCount
    const { data, dataProcessor, retryCount } = dataEntity
    const { success } = await dataProcessor.run(data)
    if (!success) {
      if (retryCount >= this.options.longRetries) return
      this.dataProcessors.schedule({ priority: 5 + Math.max(retryCount, 4) }, () =>
        this.processDataEntity(dataEntity)
      )
    }
  }

  /**
   * Connect to databases and prepare everything
   * @private
   * @async
   */
  async prepare() {
    this.logger.info('Preparing')
    await this.dupUrlFilter.connect()
    await this.dupUrlFilter.prepare()
  }

  /**
   * Start crawling
   * @async
   */
  async start() {
    await this.prepare()
    this.logger.info('Start crawling')
    this.scrapeUrl(this.initUrl, false)
    // automatically stop and disconnect once finished
    const timer = setInterval(async () => {
      if (this.activeQueues > 0) return
      clearInterval(timer)
      await this.stop()
      await this.disconnect()
    }, 1000)
  }

  /**
   * Stop crawling and clean up
   * @async
   * @param {boolean} [gracefully=true] - Whether complete all waiting tasks or not
   */
  async stop(gracefully = true) {
    this.logger.info('Stop crawling')
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
    this.logger.info('Disconnecting')
    return Promise.all([
      this.scrapers.disconnect(),
      this.dataProcessors.disconnect(),
      this.dupUrlFilter.disconnect()
    ])
  }
}

module.exports = Scheduler
