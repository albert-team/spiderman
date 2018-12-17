exports = class Scheduler {
  constructor(initUrl) {
    this.urlEntityQueue = []
    this.enqueueUrls(initUrl)
  }

  getUrlFingerprint = (url) => url

  classifyUrl(url) { /* need overriding */ }

  getUrlEntity(url) {
    const fingerprint = this.getUrlFingerprint(url)
    const scrape = this.classifyUrl(url)
    return { url, fingerprint, scrape, attempt: 0 }
  }

  enqueueUrlEntities = (...urlEntities) => this.urlEntityQueue.push.call(urlEntities)

  enqueueUrls = (...urls) => this.enqueueUrlEntities(...urls.map((url) => this.getUrlEntity(url)))

  dequeueUrlEntity() {
    return this.urlEntityQueue.shift()
  }

  handleResult(result) { /* need overriding */ }

  async start() {
    do {
      const urlEntity = this.dequeueUrlEntity()
      ++urlEntity.attempt
      const result = await urlEntity.scrape(urlEntity.url)
      this.handleResult(result)
    } while (this.urlEntityQueue)
  }
}
