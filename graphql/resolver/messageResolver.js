const { UserInputError } = require('apollo-server')

// Model
const Message = require('../../models/Message')

// Utils
const checkAuth = require('../../utils/checkAuth')

module.exports = {
  Query: {
    async getMessages(_, __, context) {
      const user = checkAuth(context)

      if (!user) {
        throw new UserInputError('User Must Login', {
          errors: {
            login: 'User Not Login',
          },
        })
      }

      const messagess = await Message.find()

      return messagess
    },
  },
  Mutation: {
    async createMessage(_, { content }, context) {
      const user = checkAuth(context)

      if (!user) {
        throw new UserInputError('User Must Login', {
          errors: {
            login: 'User Not Login',
          },
        })
      }

      const newMessage = new Message({
        user: user.id,
        content,
      })

      const res = await newMessage.save()

      return res
    },
  },
}
