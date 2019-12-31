import axios, { AxiosInstance } from 'axios'
import pino, { Logger } from 'pino'

import { ProxyEntityInterface, ProxyEntity } from './entities'
import { ScraperOptions, ScraperOptionsInterface } from './options'
import { chooseRandom } from './utils'

interface ParsingResult {
  success?: boolean
  data?: object
  nextUrls?: string[]
}

interface ParsingMeta {
  url: string
  reqHeaders: object
  resHeaders: object
}

interface ScrapingResult {
  success: boolean
  data?: object
  nextUrls?: string[]
  executionTime?: number
}

/**
 * Scraper
 */
abstract class Scraper {
  private readonly userAgents: string[]
  private readonly proxies: ProxyEntityInterface[] | ProxyEntity[]
  private readonly options: ScraperOptions
  private readonly axios: AxiosInstance

  /** @deprecated Since v1.14.0. Use [[ParsingMeta]] instead. */
  protected url: string

  public readonly logger: Logger

  constructor(
    userAgents: string[] = [],
    proxies: ProxyEntityInterface[] | ProxyEntity[] = [],
    options: ScraperOptionsInterface = {}
  ) {
    this.userAgents = userAgents
    this.proxies = proxies
    this.options = new ScraperOptions(options)

    this.logger = this.options.logger
      ? this.options.logger
      : pino({
          name: 'spiderman-scraper',
          level: this.options.logLevel,
          useLevelLabels: true
        })

    this.axios = axios.create({
      timeout: this.options.timeout
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
      proxy: chooseRandom(this.proxies)
    })
    if (res.status < 200 || res.status >= 300) throw new Error() // will be catched in run()
    return this.parse(res.data, { url, reqHeaders, resHeaders: res.headers })
  }

  /**
   * Run
   */
  public async run(url: string): Promise<ScrapingResult> {
    this.url = url

    try {
      const start = Date.now()
      const { success = true, data, nextUrls } = await this.process(url)
      const end = Date.now()

      this.logger.debug({ msg: 'SUCCESS', url })
      return {
        success,
        data,
        nextUrls,
        executionTime: (end - start) / 1000
      }
    } catch (err) {
      this.logger.debug({ msg: 'FAILURE', url })
      return { success: false }
    }
  }
}

export default Scraper
export { ParsingResult, ScrapingResult }
