const UrlEntity = require('./url-entity')
const xxhash = require('xxhashjs')

test('UrlEntity.getFingerprint()', () => {
  const url = 'https://jestjs.io'
  const urlEntity = new UrlEntity(url, null, null)
  expect(urlEntity.getFingerprint()).toBe(xxhash.h64(url, 0).toString())
})
