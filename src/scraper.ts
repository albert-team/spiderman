import axios from 'axios'
import pino from 'pino'

import { ProxyEntity } from './entities'
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
  private userAgents: string[]
  private proxies: ProxyEntity[]
  private options: ScraperOptions
  public readonly logger: pino
  private axios: any
  public url: string

  constructor(
    userAgents: string[] = [],
    proxies: ProxyEntity[] = [],
    options: ScraperOptionsInterface = {}
  ) {
    this.userAgents = userAgents
    this.proxies = proxies
    this.options = new ScraperOptions(options)

    this.logger = this.options.logger ? this.options.logger : pino({
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
    try {
      const start = Date.now()
      this.url = url
      const { success = true, data, nextUrls } = await this.process(url)
      const end = Date.now()

      return { success, data, nextUrls, executionTime: (end - start) / 1000 }
    } catch (err) {
      return { success: false }
    }
  }
}
