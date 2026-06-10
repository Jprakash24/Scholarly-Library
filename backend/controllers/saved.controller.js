const SavedItem = require('../models/SavedItem')
const SaveEvent = require('../models/SaveEvent')

async function toggle(req, res, next) {
  try {
    const { materialId } = req.params
    const userId = req.user._id
    const existing = await SavedItem.findOne({ user: userId, material: materialId })
    if (existing) {
      await existing.deleteOne()
      await SaveEvent.create({ user: userId, material: materialId, event: 'unsaved' })
      return res.json({ saved: false })
    }
    await SavedItem.create({ user: userId, material: materialId })
    await SaveEvent.create({ user: userId, material: materialId, event: 'saved' })
    res.json({ saved: true })
  } catch (err) {
    next(err)
  }
}

async function getMine(req, res, next) {
  try {
    const items = await SavedItem.find({ user: req.user._id }).select('material').lean()
    res.json({ savedIds: items.map((i) => i.material.toString()) })
  } catch (err) {
    next(err)
  }
}

async function getAll(req, res, next) {
  try {
    const { page = 1, limit = 20, materialId } = req.query
    const filter = {}
    if (materialId) filter.material = materialId
    const [items, total] = await Promise.all([
      SaveEvent.find(filter)
        .populate('user', 'name email')
        .populate('material', 'title author kind')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      SaveEvent.countDocuments(filter),
    ])
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
}

async function getMyHistory(req, res, next) {
  try {
    const { page = 1, limit = 200, materialId } = req.query
    const filter = { user: req.user._id }
    if (materialId) filter.material = materialId
    const [items, total] = await Promise.all([
      SaveEvent.find(filter)
        .populate('material', 'title author kind')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      SaveEvent.countDocuments(filter),
    ])
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
}

module.exports = { toggle, getMine, getAll, getMyHistory }
