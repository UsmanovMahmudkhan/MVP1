const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/auth');

// Leaderboards (must come before /:username to avoid route conflicts)
router.get('/leaderboard/global', statsController.getGlobalLeaderboard);
router.get('/leaderboard/daily', statsController.getDailyLeaderboard);
router.get('/leaderboard', statsController.getLeaderboard);

// Gamification
router.get('/xp', authMiddleware, statsController.getUserXP);
router.get('/badges', authMiddleware, statsController.getUserBadges);
router.get('/activity', authMiddleware, statsController.getUserActivity);

// User stats (must come after specific routes)
router.get('/', authMiddleware, statsController.getUserStats);
router.get('/:username', statsController.getUserStatsPublic);

module.exports = router;
