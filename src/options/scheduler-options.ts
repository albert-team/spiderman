import { Logger } from 'pino'
import { LogLevel } from '../types'

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
  logger?: Logger
  logLevel?: LogLevel
}

/**
 * Scheduler options
 */
export class SchedulerOptions implements SchedulerOptionsInterface {
  shortRetries = 1
  longRetries = 2
  maxScrapers = 8
  maxDataProcessors = 4
  tasksPerMinPerQueue = 100
  useRedisBloom = false
  logger: Logger
  logLevel: LogLevel

  constructor(options: SchedulerOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
