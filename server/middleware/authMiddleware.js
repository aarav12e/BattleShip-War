const { verifyToken, createClerkClient } = require('@clerk/express');
const User = require('../models/User');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const clerkId = payload.sub;

    const user = await User.findOne({ clerkId });
    if (!user) return res.status(401).json({ error: 'User not found. Please sync your account.' });

    req.user    = user;
    req.clerkId = clerkId;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Default export is the middleware function (so game.js/leaderboard.js don't break)
module.exports = authMiddleware;

// Named export for clerkClient (used in auth.js)
module.exports.clerkClient = clerkClient;
