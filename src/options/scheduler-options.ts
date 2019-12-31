import pino from 'pino'

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
  logger?: pino
  logLevel?: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'

  /** @deprecated Since v1.14.0. Use [[SchedulerOptionsInterface.logLevel]] instead. */
  verbose?: boolean
}

/**
 * Scheduler options
 */
export default class SchedulerOptions implements SchedulerOptionsInterface {
  shortRetries = 1
  longRetries = 2
  maxScrapers = 8
  maxDataProcessors = 4
  tasksPerMinPerQueue = 100
  useRedisBloom = false
  logger: pino
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'

  /** @deprecated Since v1.14.0. Use [[SchedulerOptions.logLevel]] instead. */
  verbose = false

  constructor(options: SchedulerOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
