import axios from 'axios'

import { ProxyEntity } from './entities'
import { ScraperOptions } from './options'
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
abstract class Scraper {
  private userAgents: string[]
  private proxies: ProxyEntity[]
  private options: ScraperOptions
  private axios: any

  constructor(
    userAgents: string[] = [],
    proxies: ProxyEntity[] = [],
    options: ScraperOptions = new ScraperOptions()
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
  async run(url: string): Promise<ScrapingResult> {
    try {
      const start = process.hrtime()
      const { success = true, data, nextUrls } = await this.process(url)
      const end = process.hrtime(start)
      const executionTime = end[0] * 1e9 + end[1]

      return { success, data, nextUrls, executionTime }
    } catch (err) {
      return { success: false }
    }
  }
}

export default Scraper
