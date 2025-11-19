const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authMiddleware = require('../middleware/auth'); // Need to create this

router.post('/', authMiddleware, submissionController.submitSolution);
router.get('/', authMiddleware, submissionController.getUserSubmissions);

module.exports = router;
