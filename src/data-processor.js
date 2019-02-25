/**
 * Data Processor
 * @abstract
 */
class DataProcessor {
  /**
   * Process data
   * @protected
   * @abstract
   * @param {Object} data - Data
   * @return {{ success: boolean }} Result
   */
  async process(data) {}

  /**
   * Run
   * @param {Object} data - Data
   * @return {Object} Final result
   */
  async run(data) {
    const { success } = await this.process(data)
    if (success) return { success: true }
    return { success: false }
  }
}

module.exports = DataProcessor
