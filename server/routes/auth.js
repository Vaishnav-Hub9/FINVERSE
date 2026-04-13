const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password, onboardingAnswers } = req.body
    
    if (!fullName || !fullName.trim()) return res.status(400).json({ message: 'Full name is required' })
    if (!email || !email.includes('@')) return res.status(400).json({ message: 'Valid email required' })
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(409).json({ message: 'Email already registered' })

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      onboardingAnswers: onboardingAnswers || {}
    })
    
    await user.save()

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        onboardingAnswers: user.onboardingAnswers
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !email.includes('@')) return res.status(400).json({ message: 'Valid email required' })
    
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        onboardingAnswers: user.onboardingAnswers
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router
