import { Level as LogLevel, Logger } from 'pino'

/**
 * Scheduler options interface
 */
export interface SchedulerOptionsInterface {
  shortRetries?: number
  longRetries?: number
  maxScrapers?: number
  maxDataProcessors?: number
  tasksPerMinPerQueue?: number
  logLevel?: LogLevel
  logger?: Logger
}
