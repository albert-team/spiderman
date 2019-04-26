/**
 * Data Processor
 * @abstract
 */
class DataProcessor {
  /**
   * Process data
   * @protected
   * @abstract
   * @async
   * @param {Object} data - Data
   * @returns {{ success: boolean }} Result
   */
  async process(data) {}

  /**
   * Run
   * @async
   * @param {Object} data - Data
   * @returns {Object} Final result
   */
  async run(data) {
    try {
      const start = process.hrtime()
      const { success = true } = await this.process(data)
      const end = process.hrtime(start)
      const executionTime = end[0] * 1e9 + end[1]

      if (success) return { success: true, executionTime }
      else throw new Error()
    } catch (err) {
      return { success: false }
    }
  }
}

module.exports = DataProcessor
