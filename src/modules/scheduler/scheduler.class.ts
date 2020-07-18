import Bottleneck from 'bottleneck'
import { EventEmitter } from 'events'
import pino, { Logger } from 'pino'
import { SetDuplicateFilter } from '../dup-filter/set-dup-filter.class'
import { DataEntity } from './data-entity.class'
import { QueueSettings } from './queue-settings.interface'
import { SchedulerOptions } from './scheduler-options.class'
import { SchedulerOptionsInterface } from './scheduler-options.interface'
import { Statistics } from './statistics.class'
import { UrlEntity } from './url-entity.class'

/**
 * Manage and schedule crawling tasks
 */
export abstract class Scheduler extends EventEmitter {
  private readonly scrapers: Bottleneck
  private readonly dataProcessors: Bottleneck
  private readonly queueSettings: QueueSettings
  private readonly urlFilter = new SetDuplicateFilter<string>()
  public readonly stats = new Statistics()
  private readonly logger: Logger

  constructor(options: SchedulerOptionsInterface = {}) {
    super()

    const opts = new SchedulerOptions(options)

    this.queueSettings = {
      tasksPerMinPerQueue: opts.tasksPerMinPerQueue,
      shortRetries: opts.shortRetries,
      longRetries: opts.longRetries,
    }

    this.logger =
      opts.logger ??
      pino({
        name: 'spiderman-scheduler',
        level: opts.logLevel,
        useLevelLabels: true,
      })

    this.scrapers = new Bottleneck({
      minTime: 100,
      maxConcurrent: opts.maxScrapers,
      reservoir: opts.tasksPerMinPerQueue,
      reservoirRefreshInterval: 60000,
      reservoirRefreshAmount: opts.tasksPerMinPerQueue,
    })
    this.scrapers.on('failed', (err, task) => {
      if (task.retryCount < opts.shortRetries) return 0
    })
    this.scrapers.on('idle', async () => {
      if (!this.dataProcessors.empty() || (await this.dataProcessors.running())) return
      this.emit('idle')
    })

    this.dataProcessors = new Bottleneck({
      minTime: 100,
      maxConcurrent: opts.maxDataProcessors,
      reservoir: opts.tasksPerMinPerQueue,
      reservoirRefreshInterval: 60000,
      reservoirRefreshAmount: opts.tasksPerMinPerQueue,
    })
    this.dataProcessors.on('failed', (err, task) => {
      if (task.retryCount < opts.shortRetries) return 0
    })
    this.dataProcessors.on('idle', async () => {
      if (!this.scrapers.empty() || (await this.scrapers.running())) return
      this.emit('idle')
    })
  }

  /**
   * Start crawling
   * @param initUrls Initial URLs
   */
  public async start(initUrls: string[] = []): Promise<void> {
    for (const url of initUrls) {
      this.scheduleUrl(url, false)
    }
    this.logger.info({ msg: 'STARTED' })
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
    const { tasksPerMinPerQueue } = this.queueSettings
    const opts = {
      reservoir: tasksPerMinPerQueue,
      reservoirRefreshAmount: tasksPerMinPerQueue,
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
      if (await this.urlFilter.exists(fp)) return
      else this.urlFilter.add(fp)
    }
    await this.scrapeUrlEntity(urlEntity)
  }

  /**
   * Scrape a URL entity
   */
  private async scrapeUrlEntity(urlEntity: UrlEntity): Promise<void> {
    ++urlEntity.retryCount
    const { url, scraper, retryCount } = urlEntity
    const { success, data = {}, nextUrls = [], executionTime } = await scraper.run(url)

    if (success) {
      this.stats.dumpCounts('scraping', 'success')
      this.stats.dumpTime('scraping', executionTime as number)

      for (const nextUrl of nextUrls) this.scheduleUrl(nextUrl)
      const dataEntity = this.classifyData(data)
      this.dataProcessors.schedule(() => this.processDataEntity(dataEntity))
    } else {
      if (retryCount >= this.queueSettings.longRetries) {
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
      this.stats.dumpTime('dataProcessing', executionTime as number)
    } else {
      if (retryCount >= this.queueSettings.longRetries) {
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
