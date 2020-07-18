import { Scraper } from '../scraper/scraper.class'

/** URL entity */
export class UrlEntity {
  url: string
  scraper: Scraper
  retryCount = -1

  constructor(url: string, scraper: Scraper) {
    this.url = url
    this.scraper = scraper
  }

  /** Unique fingerprint of the URL (the URL itself by default) */
  get fingerprint(): string {
    return this.url
  }
}
