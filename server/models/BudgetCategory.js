const mongoose = require('mongoose')

const budgetCategorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  group: { type: String, enum: ['Bills', 'Needs', 'Wants'], required: true },
  assigned: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('BudgetCategory', budgetCategorySchema)
