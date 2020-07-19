import { ScraperInterface } from '../scraper/scraper.interface'

/** URL entity */
export class UrlEntity {
  url: string
  scraper: ScraperInterface
  retryCount = -1

  constructor(url: string, scraper: ScraperInterface) {
    this.url = url
    this.scraper = scraper
  }

  /** Unique fingerprint of the URL (the URL itself by default) */
  get fingerprint(): string {
    return this.url
  }
}
