const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/auth');

router.get('/leaderboard', statsController.getLeaderboard); // Public for now, or make it public
router.get('/:username', statsController.getUserStatsPublic); // Public profile
router.get('/', authMiddleware, statsController.getUserStats); // My stats

module.exports = router;
