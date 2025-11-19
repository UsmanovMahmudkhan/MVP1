const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { User } = require('../models');

// Update user profile
router.put('/update', authMiddleware, async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if email is already taken by another user
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        // Update user
        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            xp: user.xp,
            level: user.level
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get user stats (detailed)
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { Submission, Challenge } = require('../models');

        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'xp', 'level', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const submissions = await Submission.findAll({
            where: { userId },
            include: [{ model: Challenge, attributes: ['difficulty'] }]
        });

        const totalSubmissions = submissions.length;
        const passedSubmissions = submissions.filter(s => s.status === 'passed').length;
        const solvedChallengeIds = new Set(
            submissions.filter(s => s.status === 'passed').map(s => s.challengeId)
        );
        const challengesSolved = solvedChallengeIds.size;

        // Calculate difficulty breakdown
        const difficultyBreakdown = {
            easy: 0,
            medium: 0,
            hard: 0
        };

        submissions.filter(s => s.status === 'passed').forEach(s => {
            if (s.Challenge) {
                difficultyBreakdown[s.Challenge.difficulty] =
                    (difficultyBreakdown[s.Challenge.difficulty] || 0) + 1;
            }
        });

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                xp: user.xp,
                level: user.level,
                joinedAt: user.createdAt
            },
            stats: {
                totalSubmissions,
                passedSubmissions,
                challengesSolved,
                difficultyBreakdown
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

module.exports = router;
