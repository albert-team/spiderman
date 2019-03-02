const { BloomFilter } = require('@albert-team/rebloom')

/**
 * Duplicate URL filter using @albert-team/rebloom
 */
class DuplicateUrlFilter extends BloomFilter {
  constructor() {
    super('duplicate-url-filter')
  }

  /**
   * Check if an URL entity is already exists
   * @async
   * @param {UrlEntity} urlEntity - URL entity
   * @returns {UrlEntity|null} If the URL entity doesn't exist, add and return it. Otherwise, return null
   */
  async check(urlEntity) {
    const fingerprint = urlEntity.getFingerprint()
    if (await this.exists(fingerprint)) return null
    await this.add(fingerprint)
    return urlEntity
  }
}

module.exports = DuplicateUrlFilter
