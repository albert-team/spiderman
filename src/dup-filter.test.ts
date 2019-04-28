import DuplicateFilter from './dup-filter'

test("DuplicateFilter('name')", async () => {
  const filter = new DuplicateFilter('name')
  filter.add('item1')

  expect(await filter.exists('item1')).toBeTruthy()
  expect(await filter.exists('item2')).toBeFalsy()
})

test("DuplicateFilter('name', { useRedisBloom: true })", async () => {
  const filter = new DuplicateFilter('name', { useRedisBloom: true })
  await filter.connect()
  await filter.add('item1')

  expect(await filter.exists('item1')).toBeTruthy()
  expect(await filter.exists('item2')).toBeFalsy()

  filter.disconnect()
})
