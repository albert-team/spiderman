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
      const { success = true } = await this.process(data)
      if (success) return { success: true }
      else throw new Error()
    } catch (err) {
      return { success: false }
    }
  }
}

module.exports = DataProcessor
