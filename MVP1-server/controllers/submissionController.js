const { Submission, Challenge } = require('../models');
const executionService = require('../services/executionService');

exports.submitSolution = async (req, res) => {
    try {
        const { challengeId, code, language } = req.body;
        const userId = req.user.id; // From auth middleware

        const challenge = await Challenge.findByPk(challengeId);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Execute Code
        const result = await executionService.executeCode(code, language, challenge.testCases);

        // Save Submission
        const submission = await Submission.create({
            userId,
            challengeId,
            code,
            language,
            status: result.status,
            output: result.output,
        });

        // Update User XP if passed (logic can be added later)

        res.json(submission);
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: `Failed to process submission: ${error.message}` });
    }
};

exports.getUserSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.findAll({ where: { userId: req.user.id } });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
