const { Challenge, Submission } = require('../models');
const Groq = require('groq-sdk');

// Use OpenRouter API which supports Google Gemini models
const OPENROUTER_API_KEY = process.env.GOOGLE_API_KEY; // Using GOOGLE_API_KEY env var but it's actually OpenRouter key
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Initialize Groq SDK for AI assistance
let groq;
try {
    groq = new Groq({
        apiKey: process.env.GROQ_API_KEY || 'dummy_key_for_dev'
    });
} catch (error) {
    console.warn('Groq SDK initialization failed:', error.message);
}

exports.generateChallenge = async (req, res) => {
    try {
        // Check if OpenRouter API key is configured
        if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'dummy_key_for_dev') {
            return res.status(503).json({ 
                error: 'API key not configured',
                message: 'OpenRouter API key (GOOGLE_API_KEY) is required to generate challenges. Please configure it in the server environment variables.',
                suggestion: 'Contact the administrator to set up the API key.'
            });
        }

        const { difficulty = 'easy', language = 'javascript', topic } = req.body;

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

        // Use selected topic if provided, otherwise pick a random category that wasn't recently used
        let category;
        if (topic && problemCategories.includes(topic.toLowerCase())) {
            category = topic.toLowerCase();
        } else {
            const availableCategories = problemCategories.filter(cat =>
                !recentChallenges.some(title => title?.toLowerCase().includes(cat.split(' ')[0]))
            );
            category = availableCategories[Math.floor(Math.random() * availableCategories.length)] || problemCategories[0];
        }

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

        // Try OpenRouter API first, fallback to Groq if it fails
        let responseText = '';
        let useGroqFallback = false;

        try {
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
                const status = openRouterResponse.status;
                const errorMessage = errorData.error?.message || errorData.message || openRouterResponse.statusText;
                
                // If authentication fails, try Groq fallback
                if (status === 401 && groq && process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'dummy_key_for_dev') {
                    console.log('OpenRouter authentication failed, falling back to Groq API');
                    useGroqFallback = true;
                } else {
                    // Handle specific error cases
                    if (status === 401) {
                        throw new Error(`OpenRouter API authentication failed. Please check your API key configuration. Error: ${errorMessage}`);
                    } else if (status === 429) {
                        throw new Error(`OpenRouter API rate limit exceeded. Please try again later.`);
                    } else {
                        throw new Error(`OpenRouter API error (${status}): ${errorMessage}`);
                    }
                }
            } else {
                const openRouterData = await openRouterResponse.json();
                responseText = openRouterData.choices[0]?.message?.content || '';
            }
        } catch (openRouterError) {
            // If it's not a fallback case, rethrow the error
            if (!useGroqFallback) {
                throw openRouterError;
            }
        }

        // Use Groq as fallback if OpenRouter failed
        if (useGroqFallback || !responseText) {
            if (!groq || !process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'dummy_key_for_dev') {
                throw new Error('OpenRouter API failed and Groq API is not configured. Please configure at least one API key.');
            }

            console.log('Using Groq API for challenge generation');
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'llama-3.1-8b-instant',
                temperature: 0.7,
            });

            responseText = completion.choices[0]?.message?.content || '';
        }
        
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
            createdByAI: true,
            topic: category // Store the topic used for generation
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
                const errorData = await openRouterResponse.json().catch(() => ({}));
                const status = openRouterResponse.status;
                const errorMessage = errorData.error?.message || errorData.message || openRouterResponse.statusText;
                
                if (status === 401) {
                    throw new Error(`OpenRouter API authentication failed. Please check your API key configuration. Error: ${errorMessage}`);
                } else if (status === 429) {
                    throw new Error(`OpenRouter API rate limit exceeded. Please try again later.`);
                } else {
                    throw new Error(`OpenRouter API error (${status}): ${errorMessage}`);
                }
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

// Get AI assistance for a challenge
exports.getAIAssistance = async (req, res) => {
    try {
        const { challengeId, userCode, language, topic } = req.body;

        if (!challengeId) {
            return res.status(400).json({ error: 'Challenge ID is required' });
        }

        // Check if Groq API is configured
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'dummy_key_for_dev') {
            return res.status(503).json({ 
                error: 'AI assistance service is not configured.',
                message: 'GROQ_API_KEY is required to use AI assistance. Please contact the administrator.'
            });
        }

        if (!groq) {
            return res.status(500).json({ 
                error: 'AI assistance service initialization failed.',
                message: 'The AI assistance service could not be initialized.'
            });
        }

        // Get challenge details
        const challenge = await Challenge.findByPk(challengeId);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Get the topic from challenge or request body
        const challengeTopic = challenge.topic || topic || '';
        
        // Analyze the challenge and user's code to provide assistance
        const systemPrompt = `You are an AI coding tutor helping a student solve a ${challenge.difficulty} level ${challenge.language || language} coding challenge${challengeTopic ? ` focused on the topic: ${challengeTopic}` : ''}.

Your task is to analyze the challenge and the student's current code (if provided) and provide helpful guidance in the following JSON format:
{
  "topicsToLearn": ["topic1", "topic2", "topic3"],
  "youtubeVideos": [
    {
      "title": "Video Title",
      "url": "https://www.youtube.com/results?search_query=topic+name+tutorial",
      "description": "Brief description of what this video covers"
    }
  ],
  "hints": [
    "Hint 1: First hint that guides without giving away the solution",
    "Hint 2: Second hint that provides more direction",
    "Hint 3: Final hint that's more specific"
  ],
  "learningPath": "A brief explanation of the learning path and concepts needed"
}

IMPORTANT GUIDELINES:
1. Topics should be specific and relevant to the challenge (e.g., "Array manipulation", "Two pointers technique", "Hash maps")
2. Provide 3-5 YouTube video suggestions with descriptive titles that are high-quality, educational, and directly related to the topics
3. For YouTube URLs, use YouTube search URLs in this format: https://www.youtube.com/results?search_query=TOPIC_NAME+tutorial
   Example: https://www.youtube.com/results?search_query=array+manipulation+javascript+tutorial
4. Hints should be progressive - start general, become more specific
5. Do not provide the complete solution
6. Focus on teaching concepts, not just solving the problem
7. Ensure all fields are populated with valid data`;

        const userPrompt = `Challenge Title: ${challenge.title}

Challenge Description:
${challenge.description}

Challenge Difficulty: ${challenge.difficulty}
Language: ${challenge.language || language}
${challengeTopic ? `Topic: ${challengeTopic}` : ''}

${challenge.testCases && challenge.testCases.length > 0 ? `Test Cases:
${challenge.testCases.slice(0, 3).map((tc, i) => `Test ${i + 1}: Input: ${tc.input}, Expected Output: ${tc.output}`).join('\n')}` : ''}

${userCode ? `Student's Current Code:
\`\`\`${challenge.language || language}
${userCode}
\`\`\`

Analyze the code and provide guidance based on what the student has written so far.` : 'The student has not started coding yet. Provide initial learning guidance.'}

Provide your response in valid JSON format only. Do not include markdown code blocks.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            response_format: { type: 'json_object' }
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        
        let assistanceData;
        try {
            // Clean up markdown code blocks if present
            const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            assistanceData = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('Failed to parse AI assistance response:', parseError);
            console.error('Response text:', responseText.substring(0, 500));
            // Return a fallback response
            // Generate proper YouTube search URLs for fallback
            const fallbackTopics = ['Problem-solving', 'Algorithm design', 'Code implementation'];
            assistanceData = {
                topicsToLearn: fallbackTopics,
                youtubeVideos: fallbackTopics.map(topic => ({
                    title: `Learn ${topic}`,
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' ' + (challenge.language || language) + ' tutorial')}`,
                    description: `Educational videos about ${topic} in ${challenge.language || language}`
                })),
                hints: [
                    'Break down the problem into smaller steps',
                    'Think about the data structures you need',
                    'Consider edge cases'
                ],
                learningPath: 'Start by understanding the problem requirements, then identify the key concepts needed to solve it.'
            };
        }

        // Validate and ensure all required fields exist
        if (!assistanceData.topicsToLearn || !Array.isArray(assistanceData.topicsToLearn)) {
            assistanceData.topicsToLearn = ['Problem-solving', 'Algorithm design'];
        }
        if (!assistanceData.hints || !Array.isArray(assistanceData.hints)) {
            assistanceData.hints = ['Break down the problem into smaller steps'];
        }
        if (!assistanceData.learningPath) {
            assistanceData.learningPath = 'Focus on understanding the problem requirements and identifying the key concepts needed.';
        }

        // Fix YouTube URLs - generate proper search URLs based on topics
        if (assistanceData.youtubeVideos && Array.isArray(assistanceData.youtubeVideos)) {
            assistanceData.youtubeVideos = assistanceData.youtubeVideos.map((video, index) => {
                // If URL is invalid or placeholder, generate a proper YouTube search URL
                let videoUrl = video.url || '';
                
                // Check if URL is invalid (contains placeholder, invalid format, or not a valid YouTube URL)
                const isValidYouTubeUrl = videoUrl && (
                    videoUrl.includes('youtube.com/watch?v=') || 
                    videoUrl.includes('youtu.be/') ||
                    videoUrl.includes('youtube.com/embed/')
                ) && !videoUrl.includes('VIDEO_ID') && !videoUrl.includes('placeholder');
                
                if (!isValidYouTubeUrl) {
                    // Generate YouTube search URL based on topic or video title
                    const searchQuery = video.title || 
                                      assistanceData.topicsToLearn[index] || 
                                      assistanceData.topicsToLearn[0] || 
                                      challenge.title;
                    videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery + ' ' + (challenge.language || language) + ' tutorial')}`;
                }
                
                return {
                    title: video.title || `Learn about ${assistanceData.topicsToLearn[index] || 'programming'}`,
                    url: videoUrl,
                    description: video.description || `Educational video about ${assistanceData.topicsToLearn[index] || 'programming concepts'}`
                };
            });
        } else {
            // Generate YouTube search URLs based on topics if videos array is missing
            assistanceData.youtubeVideos = assistanceData.topicsToLearn.slice(0, 5).map((topic, index) => {
                const searchQuery = `${topic} ${challenge.language || language} programming tutorial`;
                return {
                    title: `Learn ${topic}`,
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
                    description: `Educational videos about ${topic} in ${challenge.language || language}`
                };
            });
        }

        res.json(assistanceData);

    } catch (error) {
        console.error('Error getting AI assistance:', error);
        res.status(500).json({ 
            error: 'Failed to get AI assistance',
            message: error.message 
        });
    }
};
