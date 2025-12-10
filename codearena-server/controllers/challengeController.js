const { Challenge, Submission } = require('../models');

// Use OpenRouter API which supports Google Gemini models
const OPENROUTER_API_KEY = process.env.GOOGLE_API_KEY; // Using GOOGLE_API_KEY env var but it's actually OpenRouter key
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

exports.generateChallenge = async (req, res) => {
    try {
        const { difficulty = 'easy', language = 'javascript' } = req.body;

        // Use OpenRouter to call Google Gemini model
        // OpenRouter model name for Gemini 2.5 Flash

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

        // Call OpenRouter API for Google Gemini
        const openRouterResponse = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3001',
                'X-Title': 'CodeArena Challenge Generator'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-flash', // OpenRouter model name for Gemini
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000  // Limit tokens for free tier
            })
        });

        if (!openRouterResponse.ok) {
            const errorData = await openRouterResponse.json().catch(() => ({}));
            throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${errorData.error?.message || openRouterResponse.statusText}`);
        }

        const openRouterData = await openRouterResponse.json();
        let responseText = openRouterData.choices[0]?.message?.content || '';
        
        // Clean up markdown code blocks if present
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Try to extract JSON - handle both single-line and multi-line JSON
        let jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            // Try to find JSON starting from first {
            const firstBrace = responseText.indexOf('{');
            if (firstBrace !== -1) {
                jsonMatch = [responseText.substring(firstBrace)];
            }
        }
        
        if (!jsonMatch) {
            console.error('No JSON found in response:', responseText.substring(0, 500));
            throw new Error('Invalid response format from AI - no JSON found');
        }

        let challengeData;
        try {
            challengeData = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('JSON parse error:', parseError.message);
            console.error('Attempted to parse:', jsonMatch[0].substring(0, 300));
            console.error('Full response:', responseText.substring(0, 1000));
            throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
        }
        
        // Validate and ensure all required fields are present
        if (!challengeData.title || !challengeData.description) {
            throw new Error('AI response missing required fields (title, description)');
        }
        
        // Ensure testCases is an array
        if (!challengeData.testCases || !Array.isArray(challengeData.testCases)) {
            challengeData.testCases = challengeData.testCases ? [challengeData.testCases] : [];
        }
        
        // Ensure template exists
        if (!challengeData.template) {
            challengeData.template = challengeData.template || `function solution() {\n  // Your code here\n}`;
        }
        
        // Ensure difficulty and language are set
        challengeData.difficulty = challengeData.difficulty || difficulty;
        challengeData.language = challengeData.language || language;

        const challenge = await Challenge.create({
            title: challengeData.title,
            description: challengeData.description,
            difficulty: challengeData.difficulty,
            language: challengeData.language,
            template: challengeData.template,
            testCases: challengeData.testCases,
            createdByAI: true
        });

        res.json(challenge);
    } catch (error) {
        console.error('=== Challenge generation error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error status:', error.status, error.statusCode);
        console.error('Full error:', error);
        if (error.stack) {
            console.error('Stack trace:', error.stack.substring(0, 500));
        }
        
        // Check for quota error - API returns status 429
        const errorMsg = String(error.message || '');
        const isQuotaError = error.status === 429 || 
                            error.statusCode === 429 ||
                            errorMsg.toLowerCase().includes('quota') || 
                            errorMsg.includes('429') || 
                            errorMsg.includes('Too Many Requests') ||
                            errorMsg.includes('exceeded');
        
        console.log('Quota check:', {
            status: error.status,
            statusCode: error.statusCode,
            isQuotaError,
            msgPreview: errorMsg.substring(0, 80)
        });
        
        // EXPLICIT CHECK: Check status first (most reliable)
        if (error.status === 429 || error.statusCode === 429 || isQuotaError) {
            console.log('✅ QUOTA ERROR DETECTED - Status:', error.status, '| Message check:', isQuotaError);
            let retryAfter = '60';
            try {
                if (error.errorDetails && Array.isArray(error.errorDetails)) {
                    const retryInfo = error.errorDetails.find(d => d && d['@type'] && d['@type'].includes('RetryInfo'));
                    if (retryInfo && retryInfo.retryDelay) {
                        retryAfter = String(Math.ceil(parseFloat(retryInfo.retryDelay)));
                    }
                }
            } catch (e) {
                // Ignore
            }
            
            console.log('Returning quota error response with status 503');
            return res.status(503).json({ 
                error: 'API quota exceeded',
                message: 'Google Gemini API daily quota has been reached. The free tier allows 20 requests per day. Please wait 24 hours for the quota to reset, or upgrade your API plan.',
                retryAfter: retryAfter,
                quotaInfo: 'Free tier limit: 20 requests/day',
                suggestion: 'Check your quota at https://ai.dev/usage?tab=rate-limit or try again tomorrow'
            });
        }
        
        // Return detailed error - ensure message is always present
        const errorMessage = error.message || 'Unknown error occurred';
        const errorResponse = {
            error: 'Failed to generate challenge',
            message: errorMessage
        };
        
        // Add more details in development
        if (process.env.NODE_ENV === 'development') {
            errorResponse.details = error.stack;
            errorResponse.errorType = error.constructor.name;
            // Include quota info if it's a quota error but wasn't caught
            if (error.status === 429 || String(error.message || '').includes('quota')) {
                errorResponse.message = 'Google Gemini API quota exceeded. Please wait 24 hours or upgrade your plan.';
                errorResponse.quotaInfo = 'Free tier limit: 20 requests/day';
            }
        }
        
        res.status(500).json(errorResponse);
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
            // Use OpenRouter API for Google Gemini
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

            // Call OpenRouter API
            const openRouterResponse = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3001',
                    'X-Title': 'CodeArena Daily Challenge'
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-flash',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!openRouterResponse.ok) {
                throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
            }

            const openRouterData = await openRouterResponse.json();
            let text = openRouterData.choices[0]?.message?.content || '';
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
