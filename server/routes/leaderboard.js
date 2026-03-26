const express = require('express');
const User = require('../models/User');

const router = express.Router();

// ── Get Top 20 players by best score ──────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const leaders = await User.find({ gamesPlayed: { $gt: 0 } })
      .select('name email picture gamesPlayed gamesWon totalScore bestScore')
      .sort({ bestScore: -1, gamesWon: -1 })
      .limit(20);

    const leaderboard = leaders.map((u, index) => ({
      rank:        index + 1,
      name:        u.name,
      email:       u.email,
      picture:     u.picture,
      gamesPlayed: u.gamesPlayed,
      gamesWon:    u.gamesWon,
      winRate:     u.gamesPlayed > 0
        ? Math.round((u.gamesWon / u.gamesPlayed) * 100)
        : 0,
      totalScore:  u.totalScore,
      bestScore:   u.bestScore,
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
