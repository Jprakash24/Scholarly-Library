const mongoose = require('mongoose')

const saveEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    event: { type: String, enum: ['saved', 'unsaved'], required: true },
  },
  { timestamps: true }
)

saveEventSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('SaveEvent', saveEventSchema)
