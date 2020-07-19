import { Level as LogLevel, Logger } from 'pino'
import { SchedulerOptionsInterface } from './scheduler-options.interface'

/**
 * Scheduler options class
 */
export class SchedulerOptions implements SchedulerOptionsInterface {
  shortRetries = 1
  longRetries = 2
  maxScrapers = 8
  maxDataProcessors = 8
  tasksPerMinPerQueue = 100
  logLevel: LogLevel = 'info'
  logger?: Logger

  constructor(options: SchedulerOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
