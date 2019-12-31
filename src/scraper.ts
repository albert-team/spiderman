import axios, { AxiosInstance } from 'axios'
import pino from 'pino'

import { ProxyEntityInterface, ProxyEntity } from './entities'
import { ScraperOptions, ScraperOptionsInterface } from './options'
import { chooseRandom } from './utils'

export interface ParsingResult {
  success?: boolean
  data?: object
  nextUrls?: string[]
}

export interface ScrapingResult {
  success: boolean
  data?: object
  nextUrls?: string[]
  executionTime?: number
}

/**
 * Scraper
 */
export default abstract class Scraper {
  private readonly userAgents: string[]
  private readonly proxies: ProxyEntityInterface[] | ProxyEntity[]
  private readonly options: ScraperOptions
  private readonly axios: AxiosInstance
  protected url: string
  public static logger = pino({
    name: 'spiderman-scraper',
    useLevelLabels: true
  })

  constructor(
    userAgents: string[] = [],
    proxies: ProxyEntityInterface[] | ProxyEntity[] = [],
    options: ScraperOptionsInterface = {}
  ) {
    this.userAgents = userAgents
    this.proxies = proxies
    this.options = new ScraperOptions(options)

    this.axios = axios.create({
      timeout: this.options.timeout
    })
  }

  /**
   * Parse result from the response body
   */
  protected abstract async parse(resBody: string): Promise<ParsingResult>

  /**
   * Process a URL. You can override this method to change its default behavior.
   */
  protected async process(url: string): Promise<ParsingResult> {
    const res = await this.axios.get(url, {
      headers: { 'User-Agent': chooseRandom(this.userAgents) },
      proxy: chooseRandom(this.proxies)
    })
    if (res.status < 200 || res.status >= 300) throw new Error() // will be catched in run()
    return this.parse(res.data)
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

      Scraper.logger.debug({ msg: 'SUCCESS', url })
      return {
        success,
        data,
        nextUrls,
        executionTime: (end - start) / 1000
      }
    } catch (err) {
      Scraper.logger.debug({ msg: 'FAILURE', url })
      return { success: false }
    }
  }
}
