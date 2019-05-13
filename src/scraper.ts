import axios from 'axios'

import { ProxyEntity } from './entities'
import { ScraperOptions, ScraperOptionsInterface } from './options'
import { chooseRandom } from './utils'

interface ScrapingResult {
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
    this.axios = axios.create({
      timeout: this.options.timeout
    })
  }

  /**
   * Parse result from HTML
   */
  protected abstract async parse(
    html: string
  ): Promise<{ success?: boolean; data?: object; nextUrls?: string[] }>

  /**
   * Process a URL
   */
  protected async process(
    url: string
  ): Promise<{ success?: boolean; data?: object; nextUrls?: string[] }> {
    const res = await this.axios.get(url, {
      headers: { 'User-Agent': chooseRandom(this.userAgents) },
      proxy: chooseRandom(this.proxies)
    })
    if (res.status !== 200) throw new Error() // will be catched in run()
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
