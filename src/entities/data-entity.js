/**
 * Data entity
 */
class DataEntity {
  /**
   * @param {Object} data - Data
   * @param {DataProcessor} dataProcessor - Data processor
   */
  constructor(data, dataProcessor) {
    /** @type {Object} */
    this.data = data
    /** @type {DataProcessor} */
    this.dataProcessor = dataProcessor
    /** @type {number} */
    this.attempts = 0
  }
}

module.exports = DataEntity
