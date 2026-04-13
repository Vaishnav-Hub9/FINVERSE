const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  onboardingAnswers: {
    primaryGoal: { type: String, default: '' },
    household: { type: [String], default: [] },
    debts: { type: [String], default: [] },
    regularExpenses: { type: [String], default: [] },
    subscriptions: { type: [String], default: [] },
    financialGoals: { type: [String], default: [] },
    guiltFreeSpending: { type: [String], default: [] }
  },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', userSchema)
