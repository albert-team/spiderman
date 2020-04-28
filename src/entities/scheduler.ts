import Bottleneck from 'bottleneck'
import { EventEmitter } from 'events'
import pino, { Logger } from 'pino'
import { SchedulerOptions, SchedulerOptionsInterface } from '../options'
import { DuplicateFilter } from '../types'
import { isBloomDuplicateFilter } from '../utils'
import { DataEntity } from './data-entity'
import { BloomDuplicateFilter, SetDuplicateFilter } from './dup-filters'
import { Statistics } from './statistics'
import { UrlEntity } from './url-entity'

/**
 * Manage and schedule crawling tasks
 */
export abstract class Scheduler extends EventEmitter {
  private readonly options: SchedulerOptions
  private readonly dupUrlFilter: DuplicateFilter
  private readonly scrapers: Bottleneck
  private readonly dataProcessors: Bottleneck
  public readonly stats = new Statistics()
  public readonly logger: Logger

  constructor(options: SchedulerOptionsInterface = {}) {
    super()

    this.options = new SchedulerOptions(options)

    if (this.options.useRedisBloom) {
      this.dupUrlFilter = new BloomDuplicateFilter('spiderman-urlfilter')
    } else {
      this.dupUrlFilter = new SetDuplicateFilter()
    }

    this.logger =
      this.options.logger ??
      pino({
        name: 'spiderman-scheduler',
        level: this.options.logLevel,
        formatters: {
          level: (label): object => {
            return { level: label }
          },
        },
      })

    this.scrapers = new Bottleneck({
      minTime: 100,
      maxConcurrent: this.options.maxScrapers,
      reservoir: this.options.tasksPerMinPerQueue,
      reservoirRefreshInterval: 60 * 1000,
      reservoirRefreshAmount: this.options.tasksPerMinPerQueue,
    })
    this.scrapers.on('failed', (err, task) => {
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
      reservoirRefreshAmount: this.options.tasksPerMinPerQueue,
    })
    this.dataProcessors.on('failed', (err, task) => {
      if (task.retryCount < this.options.shortRetries) return 0
    })
    this.dataProcessors.on('idle', async () => {
      if (!this.scrapers.empty() || (await this.scrapers.running())) return
      this.emit('idle')
      this.emit('done')
    })
  }

  /**
   * Connect to Redis if [[BloomDuplicateFilter]] is used
   */
  public async connect(): Promise<void> {
    if (isBloomDuplicateFilter(this.dupUrlFilter)) {
      await this.dupUrlFilter.connect()
      this.dupUrlFilter.reserve(0.001, 10 ** 6)
    }
    this.logger.info({ msg: 'CONNECTED' })
  }

  /**
   * Connect and start crawling
   * @param initUrls Initial URLs, in addition to the one passed to the constructor
   */
  public async start(initUrls: string[] = []): Promise<void> {
    await this.connect()
    for (const url of initUrls) this.scheduleUrl(url, false)
    this.logger.info({ msg: 'STARTED', options: this.options })
  }

  /**
   * Pause crawling. Finish all running tasks and prevent new tasks from being added
   */
  public pause(): void {
    const opts = { reservoir: 0, reservoirRefreshAmount: 0 }
    this.scrapers.updateSettings(opts)
    this.dataProcessors.updateSettings(opts)
    this.logger.info({ msg: 'PAUSED' })
  }

  /**
   * Resume crawling
   */
  public resume(): void {
    const opts = {
      reservoir: this.options.tasksPerMinPerQueue,
      reservoirRefreshAmount: this.options.tasksPerMinPerQueue,
    }
    this.scrapers.updateSettings(opts)
    this.dataProcessors.updateSettings(opts)
    this.logger.info({ msg: 'RESUMED' })
  }

  /**
   * Stop crawling
   */
  public async stop(gracefully = true): Promise<void> {
    await Promise.all([
      this.scrapers.stop({ dropWaitingJobs: !gracefully }),
      this.dataProcessors.stop({ dropWaitingJobs: !gracefully }),
    ])
    this.logger.info({ msg: 'STOPPED' })
  }

  /**
   * Disconnect all connections
   */
  public async disconnect(): Promise<void> {
    await Promise.all([
      this.scrapers.disconnect(),
      this.dataProcessors.disconnect(),
      isBloomDuplicateFilter(this.dupUrlFilter) ? this.dupUrlFilter.disconnect() : null,
    ])
    this.logger.info({ msg: 'DISCONNECTED', statistics: this.stats })
  }

  /**
   * Classify a URL
   * @param url URL
   * @returns URL entity
   */
  protected abstract classifyUrl(url: string): UrlEntity

  /**
   * Classify a data object
   * @param data Data object
   * @returns Data entity
   */
  protected abstract classifyData(data: object): DataEntity

  /**
   * Schedule a URL to be scraped
   */
  public scheduleUrl(url: string, duplicateCheck = true): void {
    this.scrapers.schedule(() => this.scrapeUrl(url, duplicateCheck))
  }

  /**
   * Schedule a URL entity to be scraped
   */
  public scheduleUrlEntity(urlEntity: UrlEntity): void {
    this.scrapers.schedule(() => this.scrapeUrlEntity(urlEntity))
  }

  /**
   * Scrape a URL. Deprecated for public use since v1.7.0.
   */
  private async scrapeUrl(url: string, duplicateCheck = true): Promise<void> {
    const urlEntity = this.classifyUrl(url)
    if (duplicateCheck) {
      const fp = urlEntity.fingerprint
      if (await this.dupUrlFilter.exists(fp)) return
      else this.dupUrlFilter.add(fp)
    }
    await this.scrapeUrlEntity(urlEntity)
  }

  /**
   * Scrape a URL entity
   */
  private async scrapeUrlEntity(urlEntity: UrlEntity): Promise<void> {
    ++urlEntity.retryCount
    const { url, scraper, retryCount } = urlEntity
    const { success, data, nextUrls = [], executionTime } = await scraper.run(url)

    if (success) {
      this.stats.dumpCounts('scraping', 'success')
      this.stats.dumpTime('scraping', executionTime)

      for (const nextUrl of nextUrls) this.scheduleUrl(nextUrl)
      const dataEntity = this.classifyData(data)
      this.dataProcessors.schedule(() => this.processDataEntity(dataEntity))
    } else {
      if (retryCount >= this.options.longRetries) {
        this.stats.dumpCounts('scraping', 'hardFailure')
        return // discard
      }
      this.stats.dumpCounts('scraping', 'softFailure')

      const priority = 5 + Math.max(retryCount, 4) // lower priority
      this.scrapers.schedule({ priority }, () => this.scrapeUrlEntity(urlEntity))
    }
  }

  /**
   * Process data
   */
  private async processDataEntity(dataEntity: DataEntity): Promise<void> {
    ++dataEntity.retryCount
    const { data, dataProcessor, retryCount } = dataEntity
    const { success, executionTime } = await dataProcessor.run(data)

    if (success) {
      this.stats.dumpCounts('dataProcessing', 'success')
      this.stats.dumpTime('dataProcessing', executionTime)
    } else {
      if (retryCount >= this.options.longRetries) {
        this.stats.dumpCounts('dataProcessing', 'hardFailure')
        return // discard
      }
      this.stats.dumpCounts('dataProcessing', 'softFailure')

      this.dataProcessors.schedule({ priority: 5 + Math.max(retryCount, 4) }, () =>
        this.processDataEntity(dataEntity)
      )
    }
  }
}
