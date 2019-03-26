class BloomFilter {
  constructor() {
    this.data = new Set()

    this.connect = jest.fn(async () => undefined)
    this.disconnect = jest.fn(async () => undefined)
    this.add = jest.fn(async (item) => this.data.add(item))
    this.exists = jest.fn(async (item) => this.data.has(item))
  }
}

module.exports = { BloomFilter }
