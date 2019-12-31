import { EventEmitter } from 'events'
import Bottleneck from 'bottleneck'
import pino from 'pino'
import { UrlEntity, DataEntity } from './entities'
import { SchedulerOptions, SchedulerOptionsInterface } from './options'
import DataProcessor from './data-processor'
import { SetDuplicateFilter, BloomDuplicateFilter } from './dup-filters'
import Scraper from './scraper'
import Statistics from './statistics'

type DuplicateFilter = SetDuplicateFilter | BloomDuplicateFilter

function isBloomDuplicateFilter(filter: DuplicateFilter): filter is BloomDuplicateFilter {
  return (filter as BloomDuplicateFilter).connect !== undefined
}

export interface ClassificationResult {
  urlEntity?: UrlEntity
  scraper?: Scraper
  dataProcessor?: DataProcessor
}

/**
 * Manage and schedule crawling tasks
 */
export default abstract class Scheduler extends EventEmitter {
  public readonly stats = new Statistics()
  private readonly initUrl: string | null
  private readonly options: SchedulerOptions
  private readonly dupUrlFilter: DuplicateFilter
  private readonly scrapers: Bottleneck
  private readonly dataProcessors: Bottleneck
  public readonly logger: pino

  constructor(initUrl: string | null, options: SchedulerOptionsInterface = {}) {
    super()

    this.initUrl = initUrl
    this.options = new SchedulerOptions(options)
    if (this.options.useRedisBloom) {
      this.dupUrlFilter = new BloomDuplicateFilter('spiderman-urlfilter')
    } else {
      this.dupUrlFilter = new SetDuplicateFilter()
    }
    if (this.options.logger) {
      this.logger = this.options.logger
    } else {
      const logLevel = this.options.logLevel
        ? this.options.logLevel
        : this.options.verbose
        ? 'debug'
        : 'info'
      this.logger = pino({
        name: 'spiderman-scheduler',
        level: logLevel,
        useLevelLabels: true
      })
    }

    this.scrapers = new Bottleneck({
      minTime: 100,
      maxConcurrent: this.options.maxScrapers,
      reservoir: this.options.tasksPerMinPerQueue,
      reservoirRefreshInterval: 60 * 1000,
      reservoirRefreshAmount: this.options.tasksPerMinPerQueue
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
      reservoirRefreshAmount: this.options.tasksPerMinPerQueue
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
   * Classify a URL
   * @returns Classification result, containing a URL entity directy or scraper and optional data processor
   */
  protected abstract classifyUrl(url: string): ClassificationResult

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
    await this.scrapeUrlEntity(urlEntity)
  }

  /**
   * Scrape a URL entity
   */
  private async scrapeUrlEntity(urlEntity: UrlEntity): Promise<void> {
    ++urlEntity.retryCount
    const { url, scraper, dataProcessor, retryCount } = urlEntity
    const { success, data, nextUrls = [], executionTime } = await scraper.run(url)

    if (success) {
      this.stats.dumpCounts('scraping', 'success')
      this.stats.dumpTime('scraping', executionTime)

      for (const nextUrl of nextUrls) this.scheduleUrl(nextUrl)
      if (!dataProcessor) return
      const dataEntity = new DataEntity(data, dataProcessor)
      this.dataProcessors.schedule(() => this.processDataEntity(dataEntity))
    } else {
      if (retryCount >= this.options.longRetries) {
        this.stats.dumpCounts('scraping', 'hardFailure')
        return // discard
      }
      this.stats.dumpCounts('scraping', 'softFailure')

      this.scrapers.schedule({ priority: 5 + Math.max(retryCount, 4) }, () =>
        this.scrapeUrlEntity(urlEntity)
      )
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

  /**
   * Get statistics
   * @deprecated Since v1.14.0. Use [[Scheduler.stats]] instead.
   */
  public getStats(): Statistics {
    return this.stats
  }

  /**
   * Connect to databases
   */
  private async connect(): Promise<void> {
    if (isBloomDuplicateFilter(this.dupUrlFilter)) {
      await this.dupUrlFilter.connect()
      this.dupUrlFilter.reserve(0.001, 10 ** 6)
    }
    this.logger.info({ msg: 'CONNECTED' })
  }

  /**
   * Start crawling
   */
  public async start(): Promise<void> {
    this.logger.info({ msg: 'STARTING', options: this.options })
    await this.connect()
    if (this.initUrl) this.scheduleUrl(this.initUrl, false)
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
      reservoirRefreshAmount: this.options.tasksPerMinPerQueue
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
      this.dataProcessors.stop({ dropWaitingJobs: !gracefully })
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
      isBloomDuplicateFilter(this.dupUrlFilter) ? this.dupUrlFilter.disconnect() : null
    ])
    this.logger.info({ msg: 'DISCONNECTED', statistics: this.stats.get() })
  }
}
