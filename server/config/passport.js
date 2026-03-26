const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${process.env.BACKEND_URL || 'http://localhost:5000'}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // ── Gmail-only restriction ─────────────────────────────────────────────
        if (!email.endsWith('@gmail.com')) {
          return done(null, false, {
            message: 'Only @gmail.com accounts are allowed to play.',
          });
        }

        // ── Upsert user in MongoDB ─────────────────────────────────────────────
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email,
            name:    profile.displayName,
            picture: profile.photos?.[0]?.value || '',
          });
        } else {
          // Update picture in case it changed
          user.picture = profile.photos?.[0]?.value || user.picture;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
