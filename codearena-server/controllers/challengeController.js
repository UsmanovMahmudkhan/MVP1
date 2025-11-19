const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Challenge, Submission } = require('../models');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.generateChallenge = async (req, res) => {
    try {
        const { difficulty = 'easy', language = 'javascript' } = req.body;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Get user's recent challenges to avoid duplicates
        const userId = req.user?.id;
        let recentChallenges = [];
        if (userId) {
            const recentSubmissions = await Submission.findAll({
                where: { userId },
                include: [{ model: Challenge, attributes: ['title', 'description'] }],
                order: [['createdAt', 'DESC']],
                limit: 10
            });
            recentChallenges = recentSubmissions.map(s => s.Challenge?.title).filter(Boolean);
        }

        // Diverse problem categories to ensure variety
        const problemCategories = [
            'array manipulation', 'string processing', 'hash map usage', 'two pointers',
            'sliding window', 'binary search', 'recursion', 'dynamic programming',
            'stack operations', 'queue operations', 'linked list', 'tree traversal',
            'graph algorithms', 'sorting algorithms', 'mathematical computation',
            'bit manipulation', 'greedy algorithms', 'backtracking'
        ];

        // Pick a random category that wasn't recently used
        const availableCategories = problemCategories.filter(cat =>
            !recentChallenges.some(title => title?.toLowerCase().includes(cat.split(' ')[0]))
        );
        const category = availableCategories[Math.floor(Math.random() * availableCategories.length)] || problemCategories[0];

        // Add timestamp and random seed for uniqueness
        const uniqueSeed = Date.now() + Math.random();

        const prompt = `Generate a UNIQUE ${difficulty} level ${language} coding challenge about ${category}.

IMPORTANT REQUIREMENTS:
1. Create a COMPLETELY NEW and ORIGINAL problem - do not repeat common problems
2. The problem should be creative and interesting
3. Include a clear problem description with examples
4. Provide 5-7 diverse test cases covering edge cases
5. Include a code template with function signature
6. Make it different from these recent problems: ${recentChallenges.slice(0, 5).join(', ') || 'none'}

Uniqueness seed: ${uniqueSeed}

Return ONLY valid JSON in this exact format:
{
  "title": "Problem Title",
  "description": "Detailed problem description with examples",
  "difficulty": "${difficulty}",
  "language": "${language}",
  "template": "function/class template code",
  "testCases": [
    {"input": "[input]", "output": "expected output"},
    ...
  ]
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        let jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format from AI');
        }

        const challengeData = JSON.parse(jsonMatch[0]);

        const challenge = await Challenge.create({
            ...challengeData,
            createdByAI: true
        });

        res.json(challenge);
    } catch (error) {
        console.error('Challenge generation error:', error);
        res.status(500).json({ error: 'Failed to generate challenge' });
    }
};

exports.getChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.findByPk(req.params.id);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }
        res.json(challenge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user's challenge history
exports.getUserChallengeHistory = async (req, res) => {
    try {
        const { Submission } = require('../models');
        const userId = req.user.id;

        const submissions = await Submission.findAll({
            where: { userId },
            include: [{
                model: Challenge,
                attributes: ['id', 'title', 'difficulty', 'language']
            }],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json(submissions);
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to get challenge history' });
    }
};

// Get daily challenge (generates one challenge per day)
exports.getDailyChallenge = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if daily challenge already exists for today
        let dailyChallenge = await Challenge.findOne({
            where: {
                createdAt: {
                    [require('sequelize').Op.gte]: today
                },
                difficulty: 'medium' // Daily challenges are medium difficulty
            },
            order: [['createdAt', 'DESC']]
        });

        // If no challenge for today, generate one
        if (!dailyChallenge) {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const prompt = `Generate a coding challenge in javascript with medium difficulty.
Return the response in strictly valid JSON format with the following structure:
{
  "title": "Challenge Title",
  "description": "Problem description...",
  "template": "Starter code...",
  "testCases": [
    { "input": "[arg1, arg2]", "output": "expected_output" }
  ]
}
Do not include markdown formatting like \`\`\`json. Just the raw JSON string.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const challengeData = JSON.parse(text);

            dailyChallenge = await Challenge.create({
                ...challengeData,
                difficulty: 'medium',
                language: 'javascript',
            });
        }

        res.json(dailyChallenge);
    } catch (error) {
        console.error('Get daily challenge error:', error);
        res.status(500).json({ error: 'Failed to get daily challenge' });
    }
};
