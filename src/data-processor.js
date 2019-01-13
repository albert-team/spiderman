const { wait } = require('./utils')

/**
 * Data Processor
 */
class DataProcessor {
  /**
   * Constructor
   */
  constructor() {}

  /**
   * Process data
   * @private
   * @return {Object} Result
   */
  async process() {}

  /**
   * Run
   * @param {Object} data - Data
   * @return {Object} Result
   */
  async run(data) {
    for (let i = 0; i < 2; ++i) {
      const { success } = await this.process(data)
      if (success) return { success: true }
      await wait(1000)
    }
    return { success: false, error: '' }
  }
}

module.exports = DataProcessor
