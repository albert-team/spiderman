/**
 * Scheduler options interface
 */
export interface SchedulerOptionsInterface {
  shortRetries?: number
  longRetries?: number
  maxScrapers?: number
  maxDataProcessors?: number
  tasksPerMinPerQueue?: number
  useRedisBloom?: boolean
  verbose?: boolean
}

/**
 * Scheduler options
 */
export default class SchedulerOptions implements SchedulerOptionsInterface {
  shortRetries: number = 1
  longRetries: number = 2
  maxScrapers: number = 8
  maxDataProcessors: number = 4
  tasksPerMinPerQueue: number = 100
  useRedisBloom: boolean = false
  verbose: boolean = false

  constructor(options: SchedulerOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
