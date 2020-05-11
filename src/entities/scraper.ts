import axios, { AxiosInstance } from 'axios'
import pino, { Logger } from 'pino'
import { ScraperOptions, ScraperOptionsInterface } from '../options'
import { HttpProxy, ParsingMeta, ParsingResult, ScrapingResult } from '../types'
import { chooseRandom } from '../utils'

/**
 * Scraper
 */
export abstract class Scraper {
  private readonly axios: AxiosInstance
  private readonly logger: Logger
  protected readonly userAgents: string[]
  protected readonly proxies: HttpProxy[]

  constructor(options: ScraperOptionsInterface = {}) {
    const opts = new ScraperOptions(options)

    this.axios = axios.create({ timeout: opts.timeout, validateStatus: null })
    this.logger =
      opts.logger ??
      pino({
        name: opts.name,
        level: opts.logLevel,
        formatters: {
          level: (label): object => new Object({ level: label }),
        },
      })
    this.userAgents = opts.userAgents
    this.proxies = opts.proxies
  }

  /**
   * Parse result from the response body
   */
  protected abstract async parse(
    resBody: string,
    meta: ParsingMeta
  ): Promise<ParsingResult>

  /**
   * Process a URL. You can override this method to change its default behavior.
   */
  protected async process(url: string): Promise<ParsingResult> {
    const reqHeaders = { 'User-Agent': chooseRandom(this.userAgents) }
    const proxy = chooseRandom(this.proxies)

    const res = await this.axios.get(url, {
      headers: reqHeaders,
      proxy,
    })
    if (res.status < 200 || res.status >= 300)
      throw new Error(`Could not process URL ${url}`)

    return this.parse(res.data, {
      url,
      request: {
        headers: reqHeaders,
        proxy,
      },
      response: {
        headers: res.headers,
        statusCode: res.status,
        statusText: res.statusText,
      },
    })
  }

  /**
   * Run
   */
  public async run(url: string): Promise<ScrapingResult> {
    try {
      const start = Date.now()
      const { success = true, data, nextUrls } = await this.process(url)
      const end = Date.now()

      this.logger.debug({ msg: 'SUCCESS', url })
      return {
        success,
        data,
        nextUrls,
        executionTime: (end - start) / 1000,
      }
    } catch (err) {
      this.logger.debug({ msg: 'FAILURE', url })
      return { success: false }
    }
  }
}
