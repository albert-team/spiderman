/**
 * Scheduler options
 * @param {Object} [options={}] - Custom options
 */
class SchedulerOptions {
  constructor(options = {}) {
    /**
     * @public
     * @type {number}
     */
    this.shortRetries = 1
    /**
     * @public
     * @type {number}
     */
    this.longRetries = 2
    /**
     * @public
     * @type {number}
     */
    this.maxScrapers = 8
    /**
     * @public
     * @type {number}
     */
    this.maxDataProcessors = 4
    /**
     * @public
     * @type {number}
     */
    this.tasksPerMinPerQueue = 100
    /**
     * @public
     * @type {boolean}
     */
    this.useRedisBloom = false
    /**
     * @public
     * @type {boolean}
     */
    this.verbose = false

    Object.assign(this, options)
  }
}

module.exports = SchedulerOptions
