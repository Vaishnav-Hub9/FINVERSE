const express = require('express')
const router = express.Router()
const BudgetCategory = require('../models/BudgetCategory')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  try {
    const categories = await BudgetCategory.find({ userId: req.userId })
    res.json(categories)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, group } = req.body
    
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' })
    if (!['Bills', 'Needs', 'Wants'].includes(group)) {
      return res.status(400).json({ message: 'Group must be Bills, Needs, or Wants' })
    }

    const existing = await BudgetCategory.findOne({ name, userId: req.userId })
    if (existing) return res.status(409).json({ message: 'Category already exists' })

    const category = new BudgetCategory({
      userId: req.userId,
      name,
      group,
      assigned: req.body.assigned || 0
    })

    await category.save()
    res.status(201).json(category)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { name, assigned } = req.body
    const category = await BudgetCategory.findOne({ _id: req.params.id, userId: req.userId })
    
    if (!category) return res.status(404).json({ message: 'Category not found' })

    if (name !== undefined) category.name = name
    if (assigned !== undefined) category.assigned = assigned

    await category.save()
    res.json(category)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const category = await BudgetCategory.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!category) return res.status(404).json({ message: 'Category not found' })
    res.json({ message: 'Category deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router
