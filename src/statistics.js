/**
 * @package
 * Statistics logger for Scheduler
 */
class Statistics {
  constructor() {
    /**
     * @public
     * @type {number}
     */
    this.successfulScrapingTasks = 0
    /**
     * @public
     * @type {number}
     */
    this.successfulDataProcessingTasks = 0
    /**
     * @public
     * @type {number}
     */
    this.softFailedScrapingTasks = 0
    /**
     * @public
     * @type {number}
     */
    this.softFailedDataProcessingTasks = 0
    /**
     * @public
     * @type {number}
     */
    this.hardFailedScrapingTasks = 0
    /**
     * @public
     * @type {number}
     */
    this.hardFailedDataProcessingTasks = 0
    /**
     * @public
     * @type {number}
     */
    this.avgScrapingTime = 0
    /**
     * @public
     * @type {number}
     */
    this.avgDataProcessingTime = 0
  }
}

module.exports = Statistics
