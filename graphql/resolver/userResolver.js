const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server-express')

const { SECRET_KEY } = require('../../config')
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../../utils/validators')
const User = require('../../models/User')
const checkAuth = require('../../utils/checkAuth')

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: '2d' }
  )
}

module.exports = {
  Query: {
    async getUsers() {
      try {
        const users = await User.find().sort({ createdAt: -1 })
        return users
      } catch (err) {
        throw new Error(err)
      }
    },
    async getUser(_, { userId }) {
      try {
        const user = await User.findById(userId)

        if (user) {
          return user
        } else {
          throw new Error('User not found')
        }
      } catch (err) {
        throw new Error('User not found')
      }
    },
  },
  Mutation: {
    async login(_, { email, password }) {
      const { errors, valid } = validateLoginInput(email, password)
      const user = await User.findOne({ email })

      if (!valid) {
        throw new UserInputError(`Errors`, { errors })
      }

      if (!user) {
        errors.email = 'Email not found'
        throw new UserInputError('Error', { errors })
      }

      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        errors.password = 'Wrong password'
        throw new UserInputError('Error', { errors })
      }

      const token = generateToken(user)

      return {
        ...user._doc,
        id: user._id,
        token,
      }
    },
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword, isAdmin } }
    ) {
      // Validate user Data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      )

      if (!valid) {
        throw new UserInputError(`Errors`, { errors })
      }
      // Make sure user doesnt already exist
      const user = await User.findOne({ email })

      if (user) {
        throw new UserInputError(' email is taken', {
          errors: {
            email: 'This email has taken',
          },
        })
      }

      // hash password and create auth token
      password = await bcrypt.hash(password, 12)

      const newUser = new User({
        email,
        username,
        password,
        isAdmin,
        createdAt: new Date().toISOString(),
      })

      const res = await newUser.save()

      const token = generateToken(res)

      return {
        ...res._doc,
        id: res._id,
        token,
      }
    },
    async updateProfile(
      _,
      { userId, email, username, password, confirmPassword },
      context
    ) {
      user = checkAuth(context)

      const findUser = await User.findById(userId)

      if (!user) {
        throw new Error('User Not Authorize')
      }

      if (password && password !== '' && password !== null) {
        if (password === confirmPassword) {
          password = await bcrypt.hash(password, 12)
        } else {
          throw new Error('Incorrect Confirm Password')
        }
      }

      try {
        const updateUser = await User.findOneAndUpdate(
          { _id: userId },
          {
            username:
              username !== '' || username !== null
                ? username
                : findUser.username,
            email: email !== '' || email !== null ? email : findUser.email,
            password: password ? password : findUser.password,
          },
          { new: true }
        )

        return updateUser
      } catch (err) {
        throw new Error(err)
      }
    },
    async deleteUser(_, { userId }, context) {
      const user = checkAuth(context)

      try {
        const targetUser = await User.findById(userId)

        if (!targetUser) {
          throw new Error('User Not Found')
        }

        if (user.id === targetUser.id) {
          await targetUser.delete()
          return 'User is deleted'
        } else if (user.isAdmin) {
          await targetUser.delete()
          return 'User is deleted'
        } else {
          throw new Error('Action not allow')
        }
      } catch (err) {
        throw new Error(err)
      }
    },
  },
}
