const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ── Initiate Google OAuth ──────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account',
}));

// ── Google OAuth Callback ──────────────────────────────────────────────────────
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=gmail_only` }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// ── Get current user ───────────────────────────────────────────────────────────
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    id:          req.user._id,
    name:        req.user.name,
    email:       req.user.email,
    picture:     req.user.picture,
    gamesPlayed: req.user.gamesPlayed,
    gamesWon:    req.user.gamesWon,
    totalScore:  req.user.totalScore,
    bestScore:   req.user.bestScore,
  });
});

module.exports = router;
