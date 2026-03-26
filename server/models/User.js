const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId:    { type: String, required: true, unique: true },
  email:       { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  picture:     { type: String, default: '' },
  gamesPlayed: { type: Number, default: 0 },
  gamesWon:    { type: Number, default: 0 },
  totalScore:  { type: Number, default: 0 },
  bestScore:   { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
