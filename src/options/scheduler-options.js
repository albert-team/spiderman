/**
 * Scheduler options
 * @param {Object} [options={}] - Custom options
 */
class SchedulerOptions {
  constructor(options = {}) {
    this.shortRetries = 1
    this.longRetries = 2
    this.maxScrapers = 4
    this.maxDataProcessors = 4
    this.tasksPerMinPerQueue = 100

    Object.assign(this, options)
  }
}

module.exports = SchedulerOptions
