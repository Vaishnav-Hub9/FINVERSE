const mongoose = require('mongoose')

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: String, required: true },
  category: { type: String, default: 'Bills' },
  recurring: { type: String, enum: ['none', 'monthly', 'yearly'], default: 'none' },
  autoDetected: { type: Boolean, default: false },
  paid: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Reminder', reminderSchema)
