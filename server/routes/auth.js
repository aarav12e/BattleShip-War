const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Helper: format user for API response
const formatUser = (user) => ({
  id:              user._id,
  name:            user.name,
  email:           user.email,
  picture:         user.picture,
  username:        user.username,
  age:             user.age,
  gender:          user.gender,
  profileComplete: user.profileComplete,
  gamesPlayed:     user.gamesPlayed,
  gamesWon:        user.gamesWon,
  totalScore:      user.totalScore,
  bestScore:       user.bestScore,
});

// ── Signup ────────────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email or username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: username.trim(), // Use username as name initially
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: formatUser(user), token });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: formatUser(user), token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Complete profile setup (first-time only) ──────────────────────────────────
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { age, gender } = req.body;

    if (!age || isNaN(age) || age < 5 || age > 120) {
      return res.status(400).json({ error: 'Please enter a valid age (5–120)' });
    }
    if (!['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({ error: 'Please select a gender' });
    }

    req.user.age             = Number(age);
    req.user.gender          = gender;
    req.user.profileComplete = true;
    
    await req.user.save();
    res.json(formatUser(req.user));
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Internal server error while saving profile' });
  }
});

// ── Get current user profile ──────────────────────────────────────────────────
router.get('/me', authMiddleware, (req, res) => {
  res.json(formatUser(req.user));
});

module.exports = router;
