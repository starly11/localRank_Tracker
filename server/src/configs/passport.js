import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const hasGoogleOAuthConfig = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL,
);

if (hasGoogleOAuthConfig) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        proxy: true,
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // 1. Check if user exists (By Google ID OR Email)
            let user = await User.findOne({
                $or: [{ googleId: profile.id }, { email: profile.emails[0].value }]
            });

            if (user) {
                // Link Google ID if they previously registered with email/pass
                if (!user.googleId) {
                    user.googleId = profile.id;
                    await user.save();
                }
                return done(null, user);
            }

            // 2. If new user, create them (Industry normalization)
            user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
                provider: 'google'
                // Industry Tip: No password needed for OAuth users
            });

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));
} else {
    console.warn('Google OAuth is disabled: missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_CALLBACK_URL');
}

// Required for Passport internal handshake
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
