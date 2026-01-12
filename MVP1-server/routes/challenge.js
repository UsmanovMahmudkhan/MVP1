const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const authMiddleware = require('../middleware/auth');

router.post('/generate', challengeController.generateChallenge);
router.get('/history', authMiddleware, challengeController.getUserChallengeHistory);
router.get('/daily', challengeController.getDailyChallenge);
router.post('/assistance', authMiddleware, challengeController.getAIAssistance);
router.get('/:id', challengeController.getChallenge);

module.exports = router;
