const userResolvers = require('./userResolver')
const messageResolvers = require('./messageResolver')

module.exports = {
  Query: {
    ...userResolvers.Query,
    ...messageResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
}
