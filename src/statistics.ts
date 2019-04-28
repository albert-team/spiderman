/**
 * Statistics logger for Scheduler
 */
class Statistics {
  successfulScrapingTasks: number = 0
  successfulDataProcessingTasks: number = 0
  softFailedScrapingTasks: number = 0
  softFailedDataProcessingTasks: number = 0
  hardFailedScrapingTasks: number = 0
  hardFailedDataProcessingTasks: number = 0
  avgScrapingTime: number = 0
  avgDataProcessingTime: number = 0

  constructor() {}
}

export default Statistics
