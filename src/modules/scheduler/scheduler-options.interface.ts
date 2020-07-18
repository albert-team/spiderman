import { Logger } from 'pino'
import { LogLevel } from '../common/log-level.type'

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
