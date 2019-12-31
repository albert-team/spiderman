import { Logger } from 'pino'

/**
 * Scraper options interface
 */
export interface ScraperOptionsInterface {
  timeout?: number
  logger?: Logger
  logLevel?: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
}

/**
 * Scraper options
 */
export class ScraperOptions implements ScraperOptionsInterface {
  timeout: number = 10 * 1000
  logger: Logger
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent' = 'info'

  constructor(options: ScraperOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
