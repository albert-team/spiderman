import { Logger } from 'pino'
import { LogLevel } from '../common/log-level.type'
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
