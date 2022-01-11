const { model, Schema } = require('mongoose')

const messageSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    username: String,
    content: String,
    createdAt: String,
  },
  { timestamps: true }
)

module.exports = model('Message', messageSchema)
