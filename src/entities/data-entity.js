/**
 * Data entity
 * @param {Object} data - Data
 * @param {DataProcessor} dataProcessor - Data processor
 */
class DataEntity {
  constructor(data, dataProcessor) {
    /** @type {Object} */
    this.data = data
    /** @type {DataProcessor} */
    this.dataProcessor = dataProcessor
    /** @type {number} */
    this.retryCount = -1
  }
}

module.exports = DataEntity
