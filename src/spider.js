const getDefaultFingerprint = (url) => url


exports = class Spider {
  constructor(initUrl, classifiers, options) {
    this.urlQueue = []  // [{ url, fingerprint, scraper }]
    this.classifiers = classifiers
    this.getFingerprint = options.getFingerprint ? options.getFingerprint : getDefaultFingerprint

    this.enqueueUrl(initUrl)
  }

  enqueueUrl(...urls) {
    urls = urls.map((url) => {
      const fingerprint = this.getFingerprint(url)
      let scraper
      for (const regex of Object.keys(this.classifiers)) {
        if (url.search(regex) === -1) continue
        scraper = this.classifiers[regex].scraper
        break
      }
      return { url, fingerprint, scraper }
    })
    this.urlQueue.push.call(urls)
  }

  dequeueUrl() {
    return this.urlQueue.shift()
  }

  handleResult(result) { /* need overriding */ }

  async start() {
    do {
      const url = this.dequeueUrl()
      const result = await url.scraper(url.url)
      this.handleResult(result)
    } while (this.urlQueue)
  }
}
