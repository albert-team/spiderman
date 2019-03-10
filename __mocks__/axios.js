module.exports = {
  create: jest.fn(function() {
    return this
  }),
  get: jest.fn(async (url) => {
    return { status: 200, data: url }
  })
}
