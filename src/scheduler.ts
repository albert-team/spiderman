import { EventEmitter } from 'events'
import Bottleneck from 'bottleneck'
import pino from 'pino'

import { UrlEntity, DataEntity } from './entities'
import { SchedulerOptions, SchedulerOptionsInterface } from './options'
import DataProcessor from './data-processor'
import DuplicateFilter from './dup-filter'
import Scraper from './scraper'
import Statistics from './statistics'

interface ClassificationResult {
  urlEntity?: UrlEntity
  scraper?: Scraper
  dataProcessor?: DataProcessor
}

/**
 * Manage and schedule crawling tasks
 */
export default abstract class Scheduler extends EventEmitter {
  private initUrl: string | null
  private options: SchedulerOptions
  private dupUrlFilter: DuplicateFilter
  private scrapers: Bottleneck
  private dataProcessors: Bottleneck
  private logger: pino
  private stats: Statistics

  constructor(initUrl: string | null, options: SchedulerOptionsInterface = {}) {
    super()

    this.initUrl = initUrl
    this.options = new SchedulerOptions(options)
    this.dupUrlFilter = new DuplicateFilter('spiderman-urlfilter', {
      useRedisBloom: this.options.useRedisBloom
    })
    this.logger = pino({
      name: 'spiderman-scheduler',
      level: this.options.verbose ? 'debug' : 'info',
      useLevelLabels: true
    })
    this.stats = new Statistics()

    this.scrapers = new Bottleneck({
      minTime: 100,
      maxConcurrent: this.options.maxScrapers,
      reservoir: this.options.tasksPerMinPerQueue,
      reservoirRefreshInterval: 60 * 1000,
      reservoirRefreshAmount: this.options.tasksPerMinPerQueue
    })
    this.scrapers.on('failed', async (err, task) => {
      if (task.retryCount < this.options.shortRetries) return 0
    })
    this.scrapers.on('idle', async () => {
      if (!this.dataProcessors.empty() || (await this.dataProcessors.running())) return
      this.emit('idle')
      this.emit('done')
    })

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
    this.dataProcessors.on('idle', async () => {
      if (!this.scrapers.empty() || (await this.scrapers.running())) return
      this.emit('idle')
      this.emit('done')
    })
  }

  /**
   * Classify a URL
   * @returns Classification result, containing a URL entity directy or scraper and optional data processor
   */
  protected abstract classifyUrl(url: string): ClassificationResult

  /**
   * Schedule a URL to be scraped
   */
  public async scheduleUrl(url: string, duplicateCheck: boolean = true) {
    this.scrapers.schedule(() => this.scrapeUrl(url, duplicateCheck))
  }

  /**
   * Schedule a URL entity to be scraped
   */
  public async scheduleUrlEntity(urlEntity: UrlEntity) {
    this.scrapers.schedule(() => this.scrapeUrlEntity(urlEntity))
  }

  /**
   * Scrape a URL. Deprecated for public use since v1.7.0.
   */
  private async scrapeUrl(url: string, duplicateCheck: boolean = true) {
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
   */
  private async scrapeUrlEntity(urlEntity: UrlEntity) {
    ++urlEntity.retryCount
    const { url, scraper, dataProcessor, retryCount } = urlEntity
    const attempt = retryCount + 1
    const { success, data, nextUrls = [], executionTime } = await scraper.run(url)

    if (success) {
      this.logger.debug({ msg: 'SUCCESS', url, attempt })
      this.stats.dumpCounts('scraping', 'success')
      this.stats.dumpTime('scraping', executionTime)

      for (const nextUrl of nextUrls) this.scheduleUrl(nextUrl)
      if (!dataProcessor) return
      const dataEntity = new DataEntity(data, dataProcessor)
      this.dataProcessors.schedule(() => this.processDataEntity(dataEntity))
    } else {
      if (retryCount >= this.options.longRetries) {
        this.logger.error({ msg: 'HARD FAILURE', url, attempt })
        this.stats.dumpCounts('scraping', 'hardFailure')
        return // discard
      }
      this.logger.warn({ msg: 'SOFT FAILURE', url, attempt })
      this.stats.dumpCounts('scraping', 'softFailure')

      this.scrapers.schedule({ priority: 5 + Math.max(retryCount, 4) }, () =>
        this.scrapeUrlEntity(urlEntity)
      )
    }
  }

  /**
   * Run a data processing task
   */
  private async processDataEntity(dataEntity: DataEntity) {
    ++dataEntity.retryCount
    const { data, dataProcessor, retryCount } = dataEntity
    const attempt = retryCount + 1
    const { success, executionTime } = await dataProcessor.run(data)

    if (success) {
      this.logger.debug({ msg: 'SUCCESS', data, attempt })
      this.stats.dumpCounts('dataProcessing', 'success')
      this.stats.dumpTime('dataProcessing', executionTime)
    } else {
      if (retryCount >= this.options.longRetries) {
        this.logger.error({ msg: 'HARD FAILURE', data, attempt })
        this.stats.dumpCounts('dataProcessing', 'hardFailure')
        return // discard
      }
      this.logger.warn({ msg: 'SOFT FAILURE', data, attempt })
      this.stats.dumpCounts('dataProcessing', 'softFailure')

      this.dataProcessors.schedule({ priority: 5 + Math.max(retryCount, 4) }, () =>
        this.processDataEntity(dataEntity)
      )
    }
  }

  /**
   * Get statistics
   */
  public getStats(): object {
    return this.stats.get()
  }

  /**
   * Connect to databases
   */
  private async connect() {
    this.logger.info({ msg: 'STARTING', options: this.options })
    return this.dupUrlFilter.connect()
  }

  /**
   * Start crawling
   */
  public async start() {
    await this.connect()
    if (this.initUrl) this.scheduleUrl(this.initUrl, false)
  }

  /**
   * Stop crawling
   */
  public async stop(gracefully: boolean = true) {
    this.logger.info('STOPPING')
    return Promise.all([
      this.scrapers.stop({ dropWaitingJobs: !gracefully }),
      this.dataProcessors.stop({ dropWaitingJobs: !gracefully })
    ])
  }

  /**
   * Disconnect all connections
   */
  public async disconnect() {
    this.logger.info('DISCONNECTING')
    await Promise.all([
      this.scrapers.disconnect(),
      this.dataProcessors.disconnect(),
      this.dupUrlFilter.disconnect()
    ])
    this.logger.info({ statistics: this.getStats() })
  }
}
