const DuplicateFilter = require('./dup-filter')

test("DuplicateFilter('name')", () => {
  const filter = new DuplicateFilter('name')
  filter.add('item1')

  expect(filter.exists('item1')).toBeTruthy()
  expect(filter.exists('item2')).toBeFalsy()
})

// redundant test suit to match RedisBloom version
test("async DuplicateFilter('name')", async () => {
  const filter = new DuplicateFilter('name')
  await filter.connect()
  await filter.add('item1')

  expect(await filter.exists('item1')).toBeTruthy()
  expect(await filter.exists('item2')).toBeFalsy()

  await filter.disconnect()
})

test("DuplicateFilter('name', { useRedisBloom: true })", async () => {
  const filter = new DuplicateFilter('name', { useRedisBloom: true })
  await filter.connect()
  await filter.add('item1')

  expect(await filter.exists('item1')).toBeTruthy()
  expect(await filter.exists('item2')).toBeFalsy()

  await filter.disconnect()
})
