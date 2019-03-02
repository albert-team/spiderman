module.exports = {
  create: jest.fn(function() {
    return this
  }),
  get: jest.fn(async (url) => {
    return { data: url }
  })
}
