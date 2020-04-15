import axios, { AxiosInstance } from 'axios'
import pino, { Logger } from 'pino'
import {
  ParsingMeta,
  ParsingResult,
  ProxyEntityInterface,
  ScrapingResult,
} from './entities'
import { ScraperOptions, ScraperOptionsInterface } from './options'
import { chooseRandom } from './utils'

/**
 * Scraper
 */
export abstract class Scraper {
  private readonly userAgents: string[]
  private readonly proxies: ProxyEntityInterface[]
  private readonly options: ScraperOptions
  private readonly axios: AxiosInstance

  public readonly logger: Logger

  constructor(
    userAgents: string[] = [],
    proxies: ProxyEntityInterface[] = [],
    options: ScraperOptionsInterface = {}
  ) {
    this.userAgents = userAgents
    this.proxies = proxies
    this.options = new ScraperOptions(options)

    this.logger =
      this.options.logger ??
      pino({
        name: this.options.name,
        level: this.options.logLevel,
        formatters: {
          level(label): object {
            return { level: label }
          },
        },
      })

    this.axios = axios.create({
      timeout: this.options.timeout,
      validateStatus: null,
    })
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
    const res = await this.axios.get(url, {
      headers: reqHeaders,
      proxy: chooseRandom(this.proxies),
    })
    if (res.status < 200 || res.status >= 300)
      throw new Error(`Could not process URL ${url}`)
    return this.parse(res.data, { url, reqHeaders, resHeaders: res.headers })
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
