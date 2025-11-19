const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function listModels() {
    try {
        // For some reason listModels is not directly on genAI instance in some versions?
        // Let's try to find where it is or use a different approach if needed.
        // Actually, usually it's on the client or model manager.
        // Let's try to just print the error from a simple generation attempt which might list models in the error message if we are lucky, 
        // OR try to use the model manager if available.

        // Wait, the error message said "Call ListModels".
        // In the Node SDK, it might be `genAI.getGenerativeModel({ model: ... })` doesn't have listModels.
        // It's usually a separate method.

        // Let's try to use the REST API directly to list models to be sure, as SDK might hide details.
        const key = process.env.GOOGLE_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

        const response = await fetch(url);
        const data = await response.json();

        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
