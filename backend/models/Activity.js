const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    kind: {
      type: String,
      enum: ['borrow', 'return', 'cancel', 'renew', 'alert', 'news'],
      required: true,
    },
    title: { type: String, required: true },
    detail: { type: String, default: '' },
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', default: null },
    icon: { type: String, default: 'info' },
    iconBg: { type: String, default: 'bg-surface-container-high' },
    iconColor: { type: String, default: 'text-on-surface-variant' },
    dismissed: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Activity', activitySchema)
