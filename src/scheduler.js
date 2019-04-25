const { EventEmitter } = require('events')
const Bottleneck = require('bottleneck').default
const pino = require('pino')

const { UrlEntity, DataEntity } = require('./entities')
const { SchedulerOptions } = require('./options')
const DuplicateFilter = require('./dup-filter')

/**
 * Manage and schedule crawling tasks
 * @abstract
 * @extends EventEmitter
 * @param {?string} initUrl - Initial URL
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
     * @type {DuplicateFilter}
     */
    this.dupUrlFilter = new DuplicateFilter('spiderman-urlfilter', {
      useRedisBloom: this.options.useRedisBloom
    })
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
      .on('idle', async () => {
        if (!this.dataProcessors.empty() || (await this.dataProcessors.running())) return
        this.emit('idle')
        this.emit('done')
      })
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
    this.dataProcessors
      .on('failed', async (err, task) => {
        if (task.retryCount < this.options.shortRetries) return 0
      })
      .on('idle', async () => {
        if (!this.scrapers.empty() || (await this.scrapers.running())) return
        this.emit('idle')
        this.emit('done')
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
   * Classify and return the scraper and data processor of a URL, or a URL entity directy.
   * @protected
   * @abstract
   * @param {string} url - URL
   * @returns {Object} An Object with required "scraper" and optional "dataProcessor" and "urlEntity"
   */
  classifyUrl(url) {}

  /**
   * Schedule a URL to be scraped
   * @public
   * @async
   * @param {string} url - URL
   * @param {boolean} [duplicateCheck=true] - Whether filter out duplicates or not
   */
  async scheduleUrl(url, duplicateCheck = true) {
    this.scrapers.schedule(() => this.scrapeUrl(url, duplicateCheck))
  }

  /**
   * Scrape a URL. Deprecated for public use since v1.7.0.
   * @private
   * @async
   * @param {string} url - URL
   * @param {boolean} [duplicateCheck=true] - Whether filter out duplicates or not
   */
  async scrapeUrl(url, duplicateCheck = true) {
    const result = this.classifyUrl(url)
    if (!result) return // discard
    const {
      scraper,
      dataProcessor,
      urlEntity = new UrlEntity(url, scraper, dataProcessor)
    } = result
    if (duplicateCheck) {
      const fp = urlEntity.getFingerprint()
      if (await this.dupUrlFilter.exists(fp)) return
      else this.dupUrlFilter.add(fp)
    }
    return this.scrapeUrlEntity(urlEntity)
  }

  /**
   * Scrape a URL entity
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
      for (const nextUrl of nextUrls) await this.scheduleUrl(nextUrl)
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
    return this.dupUrlFilter.connect()
  }

  /**
   * Start crawling
   * @async
   */
  async start() {
    await this.connect()
    if (this.initUrl) await this.scheduleUrl(this.initUrl, false)
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
