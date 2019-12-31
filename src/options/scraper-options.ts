/**
 * Scraper options interface
 */
export interface ScraperOptionsInterface {
  timeout?: number
}

/**
 * Scraper options
 */
export default class ScraperOptions implements ScraperOptionsInterface {
  timeout: number = 10 * 1000

  constructor(options: ScraperOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
