/**import wait function */
const { wait } = require('./utils')
/**
 * Data Processor
 * @public
 */
class DataProcessor {
  /**
   * @constructor
   * @public
   */
  constructor() {}

  /**
   * process data
   * @private
   * @return {Object} - result after processing
   */
  async process() {}

  /**
   * @public
   * @param {Object} data - data
   * @return {Object} result
   */
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
