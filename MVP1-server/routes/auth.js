const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);

// Google OAuth routes
router.get('/google', (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || 
        process.env.GOOGLE_CLIENT_ID === 'placeholder_google_client_id' ||
        !process.env.GOOGLE_CLIENT_SECRET ||
        process.env.GOOGLE_CLIENT_SECRET === 'placeholder_google_client_secret') {
        return res.status(503).json({ 
            error: 'Google OAuth is not configured. Please contact the administrator.',
            message: 'OAuth credentials are required to use Google sign-in.'
        });
    }
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })(req, res, next);
});

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
    (req, res) => {
        // Generate JWT token
        const token = jwt.sign(
            { id: req.user.id, username: req.user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

// GitHub OAuth routes
router.get('/github', (req, res, next) => {
    if (!process.env.GITHUB_CLIENT_ID || 
        process.env.GITHUB_CLIENT_ID === 'placeholder_github_client_id' ||
        !process.env.GITHUB_CLIENT_SECRET ||
        process.env.GITHUB_CLIENT_SECRET === 'placeholder_github_client_secret') {
        return res.status(503).json({ 
            error: 'GitHub OAuth is not configured. Please contact the administrator.',
            message: 'OAuth credentials are required to use GitHub sign-in.'
        });
    }
    passport.authenticate('github', {
        scope: ['user:email'],
        session: false
    })(req, res, next);
});

router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
    (req, res) => {
        // Generate JWT token
        const token = jwt.sign(
            { id: req.user.id, username: req.user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

module.exports = router;
