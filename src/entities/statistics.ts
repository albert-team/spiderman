/**
 * Statistics collector for Scheduler
 */
export class Statistics {
  public readonly counts = {
    success: { scraping: 0, dataProcessing: 0 },
    softFailure: { scraping: 0, dataProcessing: 0 },
    hardFailure: { scraping: 0, dataProcessing: 0 }
  }
  public readonly time = {
    total: { scraping: 0, dataProcessing: 0 },
    avg: { scraping: 0, dataProcessing: 0 }
  }

  /**
   * Increase the number of `type` tasks with `state` by 1
   */
  public dumpCounts(
    type: 'scraping' | 'dataProcessing',
    state: 'success' | 'softFailure' | 'hardFailure'
  ): void {
    ++this.counts[state][type]
  }

  /**
   * Calculate new total and average time of successful `type` tasks
   */
  public dumpTime(type: 'scraping' | 'dataProcessing', t: number): void {
    this.time.total[type] += t
    this.time.avg[type] = (this.time.avg[type] + t) / 2
  }

  /**
   * Get all collected statistics as object
   * @deprecated Since v1.14.0
   */
  public get(): object {
    const { counts, time } = this
    return { counts, time }
  }
}
