class DataProcessor {
  constructor() {
    this.success = false
  }

  async process(data) { }

  async run(data) {
    for (let i = 0; i < 2; ++i) {
      await this.process(data)
      if (this.success) return { success: true }
      await wait(1000)
    }
    return { success: false, error: '' }
  }
}


module.exports = DataProcessor
