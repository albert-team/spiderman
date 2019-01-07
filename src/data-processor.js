const { wait } = require('./utils')

class DataProcessor {
  constructor() {}

  async process() {}

  async run(data) {
    for (let i = 0; i < 2; ++i) {
      const { success } = await this.process(data)
      if (success)
        return {
          success: true
        }
      await wait(1000)
    }
    return {
      success: false,
      error: ''
    }
  }
}

module.exports = DataProcessor
