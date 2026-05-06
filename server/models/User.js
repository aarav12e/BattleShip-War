const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:        { type: String, required: true, unique: true },
  email:           { type: String, required: true, unique: true },
  password:        { type: String, required: true },
  name:            { type: String, default: '' },
  picture:         { type: String, default: '' },
  // Profile setup fields (filled on first sign-up)
  age:             { type: Number, default: null },
  gender:          { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  profileComplete: { type: Boolean, default: false },
  // Game stats
  gamesPlayed: { type: Number, default: 0 },
  gamesWon:    { type: Number, default: 0 },
  totalScore:  { type: Number, default: 0 },
  bestScore:   { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
