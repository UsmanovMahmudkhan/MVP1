const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { User } = require('../models');
const jwt = require('jsonwebtoken');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.CALLBACK_URL}/auth/google/callback`
},
    async (accessToken, refreshToken, profile, done) => {
        console.log('Google Callback URL used:', `${process.env.CALLBACK_URL}/auth/google/callback`);
        try {
            // Check if user already exists
            let user = await User.findOne({ where: { googleId: profile.id } });

            if (user) {
                return done(null, user);
            }

            // Check if email already exists
            const emailExists = await User.findOne({ where: { email: profile.emails[0].value } });
            if (emailExists) {
                return done(null, false, { message: 'Email already registered with different provider' });
            }

            // Create new user
            user = await User.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                username: profile.displayName || profile.emails[0].value.split('@')[0],
                provider: 'google',
                password: null
            });

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.CALLBACK_URL}/auth/github/callback`,
    scope: ['user:email']
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ where: { githubId: profile.id } });

            if (user) {
                return done(null, user);
            }

            // Get primary email
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;

            // Check if email already exists
            const emailExists = await User.findOne({ where: { email } });
            if (emailExists) {
                return done(null, false, { message: 'Email already registered with different provider' });
            }

            // Create new user
            user = await User.create({
                githubId: profile.id,
                email,
                username: profile.username || profile.displayName || email.split('@')[0],
                provider: 'github',
                password: null
            });

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
