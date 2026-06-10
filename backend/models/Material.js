const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: '' },
    kind: { type: String, enum: ['book', 'notes', 'pyq'], required: true },
    categoryLabel: { type: String, trim: true, default: '' },
    coverUrl: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 5, default: null },
    checkedOut: { type: Boolean, default: false },
    description: { type: String, default: '' },
    totalCopies: { type: Number, default: 1 },
    availableCopies: { type: Number, default: 1 },
    tags: [{ type: String }],
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

materialSchema.index({ title: 'text', author: 'text', categoryLabel: 'text' })

module.exports = mongoose.model('Material', materialSchema)
