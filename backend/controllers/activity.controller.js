const Activity = require('../models/Activity')

// GET /api/activity/my  — logged-in user's activity
async function myActivity(req, res, next) {
  try {
    const activities = await Activity.find({ user: req.user._id, dismissed: false })
      .populate('material', 'title')
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(activities)
  } catch (err) {
    next(err)
  }
}

// PATCH /api/activity/:id/dismiss
async function dismiss(req, res, next) {
  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { dismissed: true },
      { new: true }
    )
    if (!activity) return res.status(404).json({ message: 'Activity not found' })
    res.json(activity)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/activity/my  — clear all for current user
async function clearAll(req, res, next) {
  try {
    await Activity.updateMany({ user: req.user._id }, { dismissed: true })
    res.json({ message: 'All activity cleared' })
  } catch (err) {
    next(err)
  }
}

// GET /api/activity  (admin: all users)
async function allActivity(req, res, next) {
  try {
    const { kind, page = 1, limit = 30 } = req.query
    const filter = kind ? { kind } : {}
    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate('user', 'name email')
        .populate('material', 'title')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Activity.countDocuments(filter),
    ])
    res.json({ activities, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
}

module.exports = { myActivity, dismiss, clearAll, allActivity }
