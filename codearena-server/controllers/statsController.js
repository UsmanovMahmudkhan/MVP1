const { User, Submission, Challenge } = require('../models');
const { Op } = require('sequelize');

exports.getUserStats = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const submissions = await Submission.findAll({
            where: { userId: req.user.id },
        });

        const solvedChallengeIds = new Set(
            submissions.filter((s) => s.status === 'passed').map((s) => s.challengeId)
        );

        res.json({
            username: user.username,
            xp: user.xp,
            level: user.level,
            challengesSolved: solvedChallengeIds.size,
            totalSubmissions: submissions.length,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserStatsPublic = async (req, res) => {
    try {
        const user = await User.findOne({ where: { username: req.params.username } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const submissions = await Submission.findAll({
            where: { userId: user.id },
        });

        const solvedChallengeIds = new Set(
            submissions.filter((s) => s.status === 'passed').map((s) => s.challengeId)
        );

        res.json({
            username: user.username,
            xp: user.xp,
            level: user.level,
            challengesSolved: solvedChallengeIds.size,
            totalSubmissions: submissions.length,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'xp', 'level'],
            order: [['xp', 'DESC']],
            limit: 100,
        });

        const leaderboard = await Promise.all(
            users.map(async (user, index) => {
                const submissions = await Submission.findAll({
                    where: { userId: user.id },
                });

                const solvedChallengeIds = new Set(
                    submissions.filter((s) => s.status === 'passed').map((s) => s.challengeId)
                );

                return {
                    rank: index + 1,
                    username: user.username,
                    level: user.level,
                    xp: user.xp,
                    challengesSolved: solvedChallengeIds.size,
                };
            })
        );

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Global leaderboard (same as getLeaderboard but with API path)
exports.getGlobalLeaderboard = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'xp', 'level'],
            order: [['xp', 'DESC']],
            limit: 100,
        });

        const leaderboard = await Promise.all(
            users.map(async (user, index) => {
                const submissions = await Submission.findAll({
                    where: { userId: user.id },
                });

                const solvedChallengeIds = new Set(
                    submissions.filter((s) => s.status === 'passed').map((s) => s.challengeId)
                );

                return {
                    rank: index + 1,
                    username: user.username,
                    level: user.level,
                    xp: user.xp,
                    challengesSolved: solvedChallengeIds.size,
                };
            })
        );

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Daily leaderboard (submissions from today only)
exports.getDailyLeaderboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySubmissions = await Submission.findAll({
            where: {
                createdAt: {
                    [Op.gte]: today
                },
                status: 'passed'
            },
            include: [{ model: User, attributes: ['username'] }]
        });

        // Count submissions per user
        const userScores = {};
        todaySubmissions.forEach(sub => {
            const username = sub.User.username;
            userScores[username] = (userScores[username] || 0) + 1;
        });

        // Convert to array and sort
        const leaderboard = Object.entries(userScores)
            .map(([username, count]) => ({ username, solvedToday: count }))
            .sort((a, b) => b.solvedToday - a.solvedToday)
            .slice(0, 100)
            .map((entry, index) => ({
                rank: index + 1,
                ...entry
            }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Daily leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get daily leaderboard' });
    }
};

// Get user XP and level
exports.getUserXP = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'xp', 'level']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate XP needed for next level
        const nextLevelXP = user.level * 100;
        const currentLevelXP = (user.level - 1) * 100;
        const progress = ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

        res.json({
            username: user.username,
            level: user.level,
            xp: user.xp,
            nextLevelXP,
            progress: Math.round(progress)
        });
    } catch (error) {
        console.error('Get XP error:', error);
        res.status(500).json({ error: 'Failed to get XP' });
    }
};

// Get user badges (placeholder - can be expanded)
exports.getUserBadges = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        const submissions = await Submission.findAll({
            where: { userId: req.user.id, status: 'passed' }
        });

        const badges = [];

        // First solve badge
        if (submissions.length >= 1) {
            badges.push({ id: 'first_solve', name: 'First Steps', description: 'Solved your first challenge' });
        }

        // 10 solves badge
        if (submissions.length >= 10) {
            badges.push({ id: 'ten_solves', name: 'Getting Started', description: 'Solved 10 challenges' });
        }

        // 50 solves badge
        if (submissions.length >= 50) {
            badges.push({ id: 'fifty_solves', name: 'Dedicated', description: 'Solved 50 challenges' });
        }

        // Level 5 badge
        if (user.level >= 5) {
            badges.push({ id: 'level_5', name: 'Rising Star', description: 'Reached level 5' });
        }

        res.json(badges);
    } catch (error) {
        console.error('Get badges error:', error);
        res.status(500).json({ error: 'Failed to get badges' });
    }
};

// Get user activity (daily streak, etc.)
exports.getUserActivity = async (req, res) => {
    try {
        const submissions = await Submission.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 365
        });

        // Calculate daily streak
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const submissionDates = submissions.map(s => {
            const date = new Date(s.createdAt);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
        });

        const uniqueDates = [...new Set(submissionDates)].sort((a, b) => b - a);

        for (let i = 0; i < uniqueDates.length; i++) {
            const expectedDate = new Date(currentDate);
            expectedDate.setDate(expectedDate.getDate() - i);

            if (uniqueDates[i] === expectedDate.getTime()) {
                streak++;
            } else {
                break;
            }
        }

        // Activity by day of week
        const dayActivity = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        submissions.forEach(s => {
            const day = new Date(s.createdAt).getDay();
            dayActivity[day]++;
        });

        res.json({
            streak,
            totalSubmissions: submissions.length,
            lastActive: submissions.length > 0 ? submissions[0].createdAt : null,
            activityByDay: dayActivity
        });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ error: 'Failed to get activity' });
    }
};


exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: ['username', 'email', 'xp', 'level']
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

        // Calculate challenges solved (unique challengeIds with passed status)
        const solvedChallengeIds = new Set(
            submissions.filter(s => s.status === 'passed').map(s => s.challengeId)
        );
        const challengesSolved = solvedChallengeIds.size;

        // Calculate daily activity for the last year
        const dailyActivity = [];
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        // Map submissions to dates
        const submissionsByDate = {};
        submissions.forEach(s => {
            const date = new Date(s.createdAt).toISOString().split('T')[0];
            submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
        });

        // Fill in the last 365 days
        for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            dailyActivity.push({
                date: dateStr,
                count: submissionsByDate[dateStr] || 0
            });
        }

        res.json({
            username: user.username,
            xp: user.xp,
            level: user.level,
            totalSubmissions,
            passedSubmissions,
            challengesSolved,
            dailyActivity
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};

exports.getUserStatsPublic = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({
            where: { username },
            attributes: ['id', 'username', 'xp', 'level']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const submissions = await Submission.findAll({
            where: { userId: user.id },
            include: [{ model: Challenge, attributes: ['difficulty'] }]
        });

        const totalSubmissions = submissions.length;
        const passedSubmissions = submissions.filter(s => s.status === 'passed').length;

        const solvedChallengeIds = new Set(
            submissions.filter(s => s.status === 'passed').map(s => s.challengeId)
        );
        const challengesSolved = solvedChallengeIds.size;

        // Calculate daily activity for the last year
        const dailyActivity = [];
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        // Map submissions to dates
        const submissionsByDate = {};
        submissions.forEach(s => {
            const date = new Date(s.createdAt).toISOString().split('T')[0];
            submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
        });

        // Fill in the last 365 days
        for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            dailyActivity.push({
                date: dateStr,
                count: submissionsByDate[dateStr] || 0
            });
        }

        res.json({
            username: user.username,
            xp: user.xp,
            level: user.level,
            totalSubmissions,
            passedSubmissions,
            challengesSolved,
            dailyActivity
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.findAll({
            attributes: ['username', 'xp', 'level'],
            order: [['xp', 'DESC']],
            limit: 10
        });

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};
