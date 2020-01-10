import { Logger } from 'pino'
import { LogLevel } from '../entities'

/**
 * Scraper options interface
 */
export interface ScraperOptionsInterface {
  name?: string

  /** In milliseconds */
  timeout?: number

  logger?: Logger
  logLevel?: LogLevel
}

/**
 * Scraper options
 */
export class ScraperOptions implements ScraperOptionsInterface {
  name = 'spiderman-scraper'
  timeout = 10 * 1000
  logger: Logger
  logLevel: LogLevel = 'info'

  constructor(options: ScraperOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
