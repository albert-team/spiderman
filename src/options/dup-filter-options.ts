/**
 * DuplicateFilter options interface
 */
export interface DuplicateFilterOptionsInterface {
  useRedisBloom?: boolean
}

/**
 * DuplicateFilter options
 */
export default class DuplicateFilterOptions implements DuplicateFilterOptionsInterface {
  useRedisBloom: boolean = false

  constructor(options: DuplicateFilterOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
