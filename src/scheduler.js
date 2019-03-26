const { EventEmitter } = require('events')
const Bottleneck = require('bottleneck').default
const { BloomFilter } = require('@albert-team/rebloom')
const pino = require('pino')

const { UrlEntity, DataEntity } = require('./entities')
const { SchedulerOptions } = require('./options')

/**
 * Manage and schedule crawling tasks
 * @abstract
 * @extends EventEmitter
 * @param {string} initUrl - Initial URL
 * @param {SchedulerOptions} [options={}] - Options
 */
class Scheduler extends EventEmitter {
  constructor(initUrl, options = {}) {
    super()
    /**
     * @private
     * @type {string}
     */
    this.initUrl = initUrl
    /**
     * @private
     * @type {SchedulerOptions}
     */
    this.options = new SchedulerOptions(options)
    /**
     * @private
     * @type {BloomFilter}
     */
    this.dupUrlFilter = new BloomFilter('spiderman-urlfilter', { minCapacity: 10 ** 6 })
    /**
     * @private
     * @type {Bottleneck}
     */
    this.scrapers = new Bottleneck({
      minTime: 100,
      maxConcurrent: this.options.maxScrapers,
      reservoir: this.options.tasksPerMinPerQueue,
      reservoirRefreshInterval: 60 * 1000,
      reservoirRefreshAmount: this.options.tasksPerMinPerQueue
    })
    this.scrapers
      .on('failed', async (err, task) => {
        if (task.retryCount < this.options.shortRetries) return 0
      })
      .once('idle', () => this.dataProcessors.once('idle', () => this.emit('done')))
    /**
     * @private
     * @type {Bottleneck}
     */
    this.dataProcessors = new Bottleneck({
      minTime: 100,
      maxConcurrent: this.options.maxDataProcessors,
      reservoir: this.options.tasksPerMinPerQueue,
      reservoirRefreshInterval: 60 * 1000,
      reservoirRefreshAmount: this.options.tasksPerMinPerQueue
    })
    this.dataProcessors.on('failed', async (err, task) => {
      if (task.retryCount < this.options.shortRetries) return 0
    })
    /**
     * @private
     * @type {Object}
     */
    this.logger = pino({
      name: 'spiderman-scheduler',
      level: this.options.verbose ? 'debug' : 'info',
      useLevelLabels: true
    })
  }

  /**
   * Classify URL into its respective scraper and data processor
   * @protected
   * @abstract
   * @param {string} url - URL
   * @returns {{ scraper: Scraper, dataProcessor: DataProcessor, urlEntity: UrlEntity }} Scraper, data processor and optional custom URL entity
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
    let { urlEntity } = result
    urlEntity = urlEntity ? urlEntity : new UrlEntity(url, scraper, dataProcessor)
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
    const attempt = retryCount + 1
    const { success, data, nextUrls = [] } = await scraper.run(url)
    if (success) {
      this.logger.debug({ url, attempt, msg: 'SUCCESS' })
      for (const nextUrl of nextUrls)
        this.scrapers.schedule(() => this.scrapeUrl(nextUrl))
      if (!dataProcessor) return
      const dataEntity = new DataEntity(data, dataProcessor)
      this.dataProcessors.schedule(() => this.processDataEntity(dataEntity))
    } else {
      if (retryCount >= this.options.longRetries) {
        this.logger.error({ url, attempt, msg: 'HARD FAILURE' })
        return // discard
      }
      this.logger.warn({ url, attempt, msg: 'SOFT FAILURE' })
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
    const attempt = retryCount + 1
    const { success } = await dataProcessor.run(data)
    if (success) {
      this.logger.debug({ data, attempt, msg: 'SUCCESS' })
    } else {
      if (retryCount >= this.options.longRetries) {
        this.logger.error({ data, attempt, msg: 'HARD FAILURE' })
        return // discard
      }
      this.logger.warn({ data, attempt, msg: 'SOFT FAILURE' })
      this.dataProcessors.schedule({ priority: 5 + Math.max(retryCount, 4) }, () =>
        this.processDataEntity(dataEntity)
      )
    }
  }

  /**
   * Connect to databases
   * @private
   * @async
   */
  async connect() {
    this.logger.info({ options: this.options, msg: 'STARTING' })
    await this.dupUrlFilter.connect()
  }

  /**
   * Start crawling
   * @async
   */
  async start() {
    await this.connect()
    this.scrapeUrl(this.initUrl, false)
  }

  /**
   * Stop crawling
   * @async
   * @param {boolean} [gracefully=true] - Whether complete all waiting tasks or not
   */
  async stop(gracefully = true) {
    this.logger.info('STOP CRAWLING')
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
    this.logger.info('DISCONNECTING')
    return Promise.all([
      this.scrapers.disconnect(),
      this.dataProcessors.disconnect(),
      this.dupUrlFilter.disconnect()
    ])
  }
}

module.exports = Scheduler
