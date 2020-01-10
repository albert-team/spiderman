import { SetDuplicateFilter, BloomDuplicateFilter } from './dup-filters'

test('SetDuplicateFilter', () => {
  const filter = new SetDuplicateFilter()
  filter.add('item1')

  expect(filter.exists('item1')).toBeTruthy()
  expect(filter.exists('item2')).toBeFalsy()
})

test('BloomDuplicateFilter', async () => {
  const filter = new BloomDuplicateFilter('name')
  await filter.connect()
  await filter.add('item1')

  expect(await filter.exists('item1')).toBeTruthy()
  expect(await filter.exists('item2')).toBeFalsy()

  filter.disconnect()
})
