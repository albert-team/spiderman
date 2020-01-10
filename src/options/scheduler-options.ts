import { Logger } from 'pino'
import { LogLevel } from '../entities'

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

  /** @deprecated Since v1.14.0. Use [[SchedulerOptionsInterface.logLevel]] instead. */
  verbose?: boolean
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

  /** @deprecated Since v1.14.0. Use [[SchedulerOptions.logLevel]] instead. */
  verbose = false

  constructor(options: SchedulerOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
