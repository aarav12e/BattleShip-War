const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email:         { type: String, required: true },
  playerName:    { type: String, required: true },
  score:         { type: Number, required: true },
  won:           { type: Boolean, required: true },
  turns:         { type: Number, required: true },
  hits:          { type: Number, default: 0 },
  misses:        { type: Number, default: 0 },
  shipsDestroyed:{ type: Number, default: 0 },
  durationSecs:  { type: Number, default: 0 },
  createdAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model('Game', gameSchema);
