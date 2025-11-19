const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Challenge } = require('../models');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.generateChallenge = async (req, res) => {
    try {
        const { difficulty = 'easy', language = 'javascript' } = req.body;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `Generate a coding challenge in ${language} with ${difficulty} difficulty.
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

        // Clean up potential markdown formatting if the model ignores the instruction
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const challengeData = JSON.parse(text);

        const challenge = await Challenge.create({
            ...challengeData,
            difficulty,
            language,
        });

        res.status(201).json(challenge);
    } catch (error) {
        console.error('Error generating challenge:', error);
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
