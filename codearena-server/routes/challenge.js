const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');

router.post('/generate', challengeController.generateChallenge);
router.get('/:id', challengeController.getChallenge);

module.exports = router;
