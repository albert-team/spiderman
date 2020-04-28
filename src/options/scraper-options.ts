import { Logger } from 'pino'
import { LogLevel, ScraperOptionsInterface } from '../types'

/**
 * Scraper options
 */
export class ScraperOptions implements ScraperOptionsInterface {
  name = 'spiderman-scraper'
  timeout = 10 * 1000
  logger: Logger
  logLevel: LogLevel = 'info'
  userAgents = []
  proxies = []

  constructor(options: ScraperOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
