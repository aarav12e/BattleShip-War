require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── MongoDB Connection ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // ── One-time cleanup: drop the stale non-sparse googleId index ──
    // The old schema had googleId as unique WITHOUT sparse:true, which caused
    // every regular signup (null googleId) to throw a duplicate key error.
    // This drops that old index so Mongoose can recreate it correctly as sparse.
    try {
      const db = mongoose.connection.db;
      const collection = db.collection('users');
      const indexes = await collection.indexes();
      const hasOldIndex = indexes.some(
        idx => idx.key && idx.key.googleId !== undefined && !idx.sparse
      );
      if (hasOldIndex) {
        await collection.dropIndex('googleId_1');
        console.log('✅ Dropped stale googleId index — signup now works for all users');
      }
    } catch (e) {
      // Index may not exist (already cleaned up) — safe to ignore
      if (e.codeName !== 'IndexNotFound') {
        console.warn('⚠️  googleId index cleanup skipped:', e.message);
      }
    }
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));


// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/game', gameRoutes);
app.use('/leaderboard', leaderboardRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', message: 'Battleship War API is running 🚀' }));

// ─── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
