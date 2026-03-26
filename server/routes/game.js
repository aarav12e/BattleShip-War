const express = require('express');
const Game = require('../models/Game');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ── Save game result ───────────────────────────────────────────────────────────
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { score, won, turns, hits, misses, shipsDestroyed, durationSecs } = req.body;

    // Save game record
    await Game.create({
      userId:         req.user._id,
      email:          req.user.email,
      playerName:     req.user.name,
      score,
      won,
      turns,
      hits,
      misses,
      shipsDestroyed,
      durationSecs,
    });

    // Update user stats
    const update = {
      $inc: {
        gamesPlayed: 1,
        gamesWon:    won ? 1 : 0,
        totalScore:  score,
      },
    };
    if (score > req.user.bestScore) {
      update.$set = { bestScore: score };
    }
    await User.findByIdAndUpdate(req.user._id, update);

    res.json({ success: true, score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save game' });
  }
});

// ── Get user's recent games ────────────────────────────────────────────────────
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const games = await Game.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
