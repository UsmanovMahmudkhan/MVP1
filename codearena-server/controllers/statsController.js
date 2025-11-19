const { User, Submission, Challenge } = require('../models');

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

        res.json({
            username: user.username,
            xp: user.xp,
            level: user.level,
            totalSubmissions,
            passedSubmissions,
            challengesSolved
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

        res.json({
            username: user.username,
            xp: user.xp,
            level: user.level,
            totalSubmissions,
            passedSubmissions,
            challengesSolved
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
