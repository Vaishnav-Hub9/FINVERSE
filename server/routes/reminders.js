const express = require('express')
const router = express.Router()
const Reminder = require('../models/Reminder')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.userId }).sort({ dueDate: 1 })
    
    const enrichedReminders = reminders.map(r => {
      const dueDate = new Date(r.dueDate)
      const now = new Date()
      const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      const isOverdue = dueDate < now && !r.paid

      return {
        ...r._doc,
        daysUntil,
        isOverdue
      }
    })

    res.json(enrichedReminders)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, amount, dueDate, category, recurring, autoDetected } = req.body
    
    if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required' })
    if (amount === undefined || amount <= 0) return res.status(400).json({ message: 'Valid amount is required' })
    if (!dueDate) return res.status(400).json({ message: 'Due date is required' })

    const reminder = new Reminder({
      userId: req.userId,
      title,
      amount,
      dueDate,
      category: category || 'Bills',
      recurring: recurring || 'none',
      autoDetected: autoDetected || false
    })

    await reminder.save()
    res.status(201).json(reminder)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { title, amount, dueDate, paid, recurring, category } = req.body
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.userId })
    
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' })

    if (title !== undefined) reminder.title = title
    if (amount !== undefined) reminder.amount = amount
    if (dueDate !== undefined) reminder.dueDate = dueDate
    if (recurring !== undefined) reminder.recurring = recurring
    if (category !== undefined) reminder.category = category
    
    let isNewlyPaid = false
    if (paid !== undefined) {
      if (paid === true && !reminder.paid) {
        isNewlyPaid = true
      }
      reminder.paid = paid
    }

    await reminder.save()

    // Auto-create next occurrence if specifically configured
    if (isNewlyPaid && reminder.recurring !== 'none') {
      const nextDate = new Date(reminder.dueDate)
      if (reminder.recurring === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1)
      } else if (reminder.recurring === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1)
      }
      
      await Reminder.create({
        userId: req.userId,
        title: reminder.title,
        amount: reminder.amount,
        dueDate: nextDate.toISOString().split('T')[0],
        category: reminder.category,
        recurring: reminder.recurring,
        autoDetected: false,
        paid: false
      })
    }

    res.json(reminder)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' })
    res.json({ message: 'Reminder deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router
