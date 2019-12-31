import { UrlEntity } from './url-entity'

test('UrlEntity.getFingerprint()', () => {
  const url = 'https://jestjs.io'
  const urlEntity = new UrlEntity(url, null, null)
  expect(urlEntity.getFingerprint()).toBe(url)
})
