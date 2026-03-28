const express = require('express');
const { verifyToken } = require('@clerk/express');
const authMiddleware = require('../middleware/authMiddleware');
const { clerkClient } = require('../middleware/authMiddleware');
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

// ── Sync Clerk user into MongoDB (called once after sign-in) ──────────────────
router.post('/sync', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Use standalone verifyToken, not clerkClient.verifyToken
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const clerkId = payload.sub;

    // Fetch full user profile from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkId);

    const email   = clerkUser.emailAddresses[0]?.emailAddress || '';
    const name    = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email;
    const picture = clerkUser.imageUrl || '';

    // Upsert — handle migration & strict-mode race conditions safely
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.clerkId = clerkId;
      } else {
        user = new User({ clerkId, email });
      }
    }

    user.name    = name;
    user.picture = picture;

    try {
      await user.save();
    } catch (saveErr) {
      if (saveErr.code === 11000) {
        // Race condition: concurrent /sync request just created this user.
        user = await User.findOne({ clerkId });
        if (!user) user = await User.findOne({ email });
      } else {
        throw saveErr;
      }
    }

    res.json(formatUser(user));
  } catch (err) {
    console.error('Sync error:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ── Complete profile setup (first-time only) ──────────────────────────────────
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, age, gender } = req.body;

    if (!username?.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }
    if (!age || isNaN(age) || age < 5 || age > 120) {
      return res.status(400).json({ error: 'Please enter a valid age (5–120)' });
    }
    if (!['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({ error: 'Please select a gender' });
    }

    // Username uniqueness check
    const existing = await User.findOne({ username: username.trim(), _id: { $ne: req.user._id } });
    if (existing) {
      return res.status(409).json({ error: 'Username already taken. Try another.' });
    }

    req.user.username        = username.trim();
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
