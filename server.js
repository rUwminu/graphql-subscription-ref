const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolver')

dotenv.config()

const port = process.env.PORT || 4000

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
})

const localMongoDB = 'mongodb://localhost:27017/'
mongoose
  .connect(localMongoDB, {
    dbName: 'chat-app',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    return server.listen({ port })
  })
  .then((res) => {
    console.log(`Server running on ${res.url}`)
  })
  .catch((err) => {
    console.log(err)
  })
