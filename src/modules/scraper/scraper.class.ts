import axios, { AxiosInstance } from 'axios'
import pino, { Logger } from 'pino'
import { chooseRandom } from '../common/utils'
import { HttpProxy } from './http-proxy.interface'
import { ParsingMeta } from './parsing-meta.interface'
import { ParsingResult } from './parsing-result.interface'
import { ScraperOptions } from './scraper-options.class'
import { ScraperOptionsInterface } from './scraper-options.interface'
import { ScraperInterface } from './scraper.interface'
import { ScrapingResult } from './scraping-result.interface'

/**
 * Scraper class
 */
export abstract class Scraper implements ScraperInterface {
  private readonly axios: AxiosInstance
  protected readonly userAgents: string[]
  protected readonly proxies: HttpProxy[]
  private readonly logger: Logger

  constructor(options: ScraperOptionsInterface = {}) {
    const opts = new ScraperOptions(options)

    this.axios = axios.create({ timeout: opts.timeout, validateStatus: () => true })
    this.userAgents = opts.userAgents
    this.proxies = opts.proxies
    this.logger =
      opts.logger ??
      pino({
        name: opts.name,
        level: opts.logLevel,
        useLevelLabels: true,
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

      if (success) {
        this.logger.debug({ msg: 'SUCCESS', url })
        return {
          success,
          data,
          nextUrls,
          executionTime: end - start,
        }
      } else throw new Error()
    } catch (err) {
      this.logger.debug({ msg: 'FAILURE', url })
      return { success: false }
    }
  }

  /**
   * Process a URL. You can override this method to change its default behavior
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
   * Parse result from the response body
   */
  protected abstract async parse(
    resBody: string,
    meta: ParsingMeta
  ): Promise<ParsingResult>
}
