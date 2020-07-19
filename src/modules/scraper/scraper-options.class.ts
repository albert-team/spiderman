import { Level as LogLevel, Logger } from 'pino'
import { HttpProxy } from './http-proxy.interface'
import { ScraperOptionsInterface } from './scraper-options.interface'

/**
 * Scraper options class
 */
export class ScraperOptions implements ScraperOptionsInterface {
  name = 'spiderman-scraper'
  timeout = 10000
  userAgents: string[] = []
  proxies: HttpProxy[] = []
  logLevel: LogLevel = 'info'
  logger?: Logger

  constructor(options: ScraperOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
