const mongoose = require('mongoose')

const borrowRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'returned', 'cancelled'],
      default: 'pending',
    },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    returnedAt: { type: Date },
    dueDate: { type: Date },
    renewCount: { type: Number, default: 0 },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

borrowRequestSchema.index({ user: 1, status: 1 })
borrowRequestSchema.index({ material: 1, status: 1 })

module.exports = mongoose.model('BorrowRequest', borrowRequestSchema)
