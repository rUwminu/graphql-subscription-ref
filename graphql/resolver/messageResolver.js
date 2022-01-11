const { PubSub } = require('graphql-subscriptions')
const { UserInputError } = require('apollo-server-express')

// Model
const Message = require('../../models/Message')

// Utils
const checkAuth = require('../../utils/checkAuth')

const pubsub = new PubSub()

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

      const res = await Message.find()

      return res
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
        username: user.username,
        content,
      })

      const res = await newMessage.save()

      console.log(res)

      pubsub.publish('MESSAGE_CREATED', {
        messageCreated: {
          id: res.id,
          ...res._doc,
        },
      })

      return res
    },
  },
  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator('MESSAGE_CREATED'),
    },
  },
}
