import {
    login,
    register,
    logout,
    deleteAccount,
    googleAuthCallback,
    getMe,
    changePassword,
    updateProfile,
    updateNotificationSettings,
    forgotPassword,
    resetPassword,
} from '../controllers/authController.js';
import passport from 'passport';
import express from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { authMiddleware } from '../middlewares/authMiddleware.js'

const AuthRouter = express.Router();

const sendRateLimitResponse = (req, res) => {
    const retryAfterHeader = res.getHeader('Retry-After');
    const retryAfterSeconds = Number(retryAfterHeader) || 60;
    return res.status(429).json({
        success: false,
        message: `Too many requests. Try again in ${retryAfterSeconds} seconds.`,
        retryAfterSeconds,
    });
};

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: sendRateLimitResponse,
    keyGenerator: (req) => {
        const email = String(req.body?.email || '').toLowerCase().trim();
        return `${ipKeyGenerator(req.ip)}:${email || 'no-email'}`;
    },
});

const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: sendRateLimitResponse,
});

const googleOAuthEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
);

if (googleOAuthEnabled) {
    const clientUrl = String(process.env.CLIENT_URL || 'http://localhost:5173')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)[0] || 'http://localhost:5173';

    // Route to start Google Auth
    AuthRouter.get('/google', passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
    }));

    // Route for Google to call back to
    AuthRouter.get('/google/callback',
        passport.authenticate('google', { session: false, failureRedirect: `${clientUrl}/login` }),
        googleAuthCallback
    );
} else {
    AuthRouter.get('/google', (req, res) => {
        return res.status(503).json({
            success: false,
            message: 'Google login is not configured on this server',
        });
    });

    AuthRouter.get('/google/callback', (req, res) => {
        return res.status(503).json({
            success: false,
            message: 'Google login is not configured on this server',
        });
    });
}

// Get current user info (disable caching to avoid 304 with empty body)
AuthRouter.get('/me', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
}, authMiddleware, getMe);
 
AuthRouter.post('/signup', register);
AuthRouter.post('/login', login);
AuthRouter.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
AuthRouter.post('/reset-password/:token', resetPasswordLimiter, resetPassword);
AuthRouter.post('/logout', logout);
AuthRouter.delete('/account', authMiddleware, deleteAccount);
AuthRouter.patch('/password', authMiddleware, changePassword);
AuthRouter.patch('/profile', authMiddleware, updateProfile);
AuthRouter.patch('/settings/notifications', authMiddleware, updateNotificationSettings);
export default AuthRouter;
