const Groq = require('groq-sdk');
let groq;
try {
    groq = new Groq({
        apiKey: process.env.GROQ_API_KEY || 'dummy_key_for_dev'
    });
} catch (error) {
    console.warn('Groq SDK initialization failed:', error.message);
}

const fs = require('fs');
const path = require('path');

exports.getMentorResponse = async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'Server configuration error: GROQ_API_KEY is missing.' });
        }

        let userMessage = req.body.message;

        // Handle Audio Input
        if (req.file) {
            try {
                const transcription = await groq.audio.transcriptions.create({
                    file: fs.createReadStream(req.file.path),
                    model: "whisper-large-v3-turbo",
                    response_format: "json",
                    language: "en",
                    temperature: 0.0
                });
                userMessage = transcription.text;
                console.log('Transcribed text:', userMessage);

                // Clean up uploaded file
                fs.unlinkSync(req.file.path);
            } catch (transcriptionError) {
                console.error('Transcription error:', transcriptionError);
                // Clean up file even on error
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                return res.status(500).json({ error: 'Failed to transcribe audio.' });
            }
        }

        if (!userMessage) {
            return res.status(400).json({ error: 'Message or audio is required' });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are CodeArena Mentor, a strict programming tutor that ONLY helps with Java or JavaScript learning.
                    
                    Your rules:
                    1. You must ONLY answer questions related to Java or JavaScript programming.
                    2. If the user asks anything unrelated to Java or JavaScript (e.g., general knowledge, other languages, personal questions), you must politely refuse and redirect them back to programming learning topics.
                    3. Keep your answers concise, helpful, and encouraging, but strict about the topic.
                    4. You are a voice-interactive assistant, so keep your responses natural and suitable for speech synthesis (avoid excessive special characters or long code blocks unless necessary, but you can provide code snippets).
                    5. If providing code, keep it brief and focused on the concept.`
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            model: 'llama-3.1-8b-instant',
        });

        const answer = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        res.json({ answer, transcribedText: userMessage });

    } catch (error) {
        console.error('Error calling Groq API:', error);
        res.status(500).json({ error: 'Failed to get response from Mentor' });
    }
};
