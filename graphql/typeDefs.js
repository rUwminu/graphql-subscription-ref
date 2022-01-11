const { gql } = require('apollo-server-express')

module.exports = gql`
  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    password: String!
    createdAt: String!
  }

  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }

  type Message {
    id: ID!
    user: String!
    username: String!
    content: String!
  }

  type Query {
    getUsers: [User]
    getUser(userId: ID!): User
    getMessages: [Message!]
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(email: String!, password: String!): User!
    updateProfile(
      userId: ID!
      email: String
      username: String
      password: String
      confirmPassword: String
    ): User!
    deleteUser(userId: ID!): String!
    createMessage(content: String!): Message!
  }

  type Subscription {
    messageCreated: Message
  }
`
