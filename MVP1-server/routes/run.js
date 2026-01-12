const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const executionService = require('../services/executionService');

// Get supported languages
router.get('/languages', (req, res) => {
    res.json({
        languages: [
            { id: 'javascript', name: 'JavaScript', version: 'Node.js 18+' },
            { id: 'java', name: 'Java', version: 'JDK 11+' }
        ]
    });
});

// Run code (without saving to database)
router.post('/run', authMiddleware, async (req, res) => {
    try {
        const { code, language, testCases } = req.body;

        if (!code || !language) {
            return res.status(400).json({ error: 'Code and language are required' });
        }

        if (!testCases || !Array.isArray(testCases)) {
            return res.status(400).json({ error: 'Test cases are required' });
        }

        // Execute code with test cases
        const result = await executionService.executeCode(code, language, testCases);

        res.json({
            success: result.success,
            output: result.output,
            error: result.error
        });
    } catch (error) {
        console.error('Run code error:', error);
        res.status(500).json({ error: 'Failed to run code' });
    }
});

module.exports = router;
