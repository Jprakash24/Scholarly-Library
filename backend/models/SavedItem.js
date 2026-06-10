const mongoose = require('mongoose')

const savedItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  },
  { timestamps: true }
)

savedItemSchema.index({ user: 1, material: 1 }, { unique: true })

module.exports = mongoose.model('SavedItem', savedItemSchema)
