/**
 * Statistics collector for Scheduler
 */
export default class Statistics {
  private counts = {
    scraping: { success: 0, softFailure: 0, hardFailure: 0 },
    dataProcessing: { success: 0, softFailure: 0, hardFailure: 0 }
  }
  private time = {
    scraping: { total: 0, avg: 0 },
    dataProcessing: { total: 0, avg: 0 }
  }

  constructor() {}

  /**
   * Increase the number of `type` tasks with `state` by 1
   */
  public dumpCounts(
    type: 'scraping' | 'dataProcessing',
    state: 'success' | 'softFailure' | 'hardFailure'
  ) {
    ++this.counts[type][state]
  }

  /**
   * Calculate new total and average time of successful `type` tasks
   */
  public dumpTime(type: 'scraping' | 'dataProcessing', t: number) {
    this.time[type].total += t
    this.time[type].avg = (this.time[type].avg + t) / 2
  }

  /**
   * Get all collected statistics
   */
  public get() {
    const { counts, time } = this
    return { counts, time }
  }
}
