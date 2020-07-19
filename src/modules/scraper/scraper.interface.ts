import { ScrapingResult } from './scraping-result.interface'

/**
 * Scraper interface
 */
export interface ScraperInterface {
  /**
   * Run
   */
  run(url: string): Promise<ScrapingResult>
}
