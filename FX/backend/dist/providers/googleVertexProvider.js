"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeVertexAI = initializeVertexAI;
exports.generateCreativeText = generateCreativeText;
exports.generateCreativeVariations = generateCreativeVariations;
exports.getVertexAISetupGuide = getVertexAISetupGuide;
const vertexai_1 = require("@google-cloud/vertexai");
/**
 * Initialize Vertex AI client
 */
function initializeVertexAI() {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.VERTEX_PROJECT_ID;
    const location = process.env.VERTEX_LOCATION || 'us-central1';
    const modelName = process.env.VERTEX_MODEL || 'gemini-pro';
    if (!projectId) {
        throw new Error('GOOGLE_CLOUD_PROJECT or VERTEX_PROJECT_ID environment variable is required');
    }
    return {
        projectId,
        location,
        modelName,
        apiVersion: 'v1'
    };
}
/**
 * Generate creative text using Vertex AI
 */
async function generateCreativeText(prompt, systemPrompt, config) {
    try {
        // Fallback to mock if using development key
        if (config.projectId.includes('mock')) {
            const mockResponse = generateMockResponse(prompt, systemPrompt);
            return {
                text: mockResponse,
                finishReason: 'STOP',
                usage: { inputTokens: 0, outputTokens: 0 }
            };
        }
        const vertexAI = new vertexai_1.VertexAI({
            project: config.projectId,
            location: config.location,
        });
        const model = vertexAI.getGenerativeModel({
            model: config.modelName,
        });
        // Vertex AI (Gemini) takes system instruction optionally or in contents
        // Newer versions of the SDK support systemInstruction property
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }] },
                { role: 'model', parts: [{ text: "Understood. I will act as the Creative Director with the specified brand personality." }] }
            ]
        });
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return {
            text,
            finishReason: response.candidates?.[0]?.finishReason || 'STOP',
            usage: {
                inputTokens: response.usageMetadata?.promptTokenCount || 0,
                outputTokens: response.usageMetadata?.candidatesTokenCount || 0
            }
        };
    }
    catch (error) {
        console.error('Error calling Vertex AI:', error);
        // Return mock as fallback
        return {
            text: generateMockResponse(prompt, systemPrompt),
            finishReason: 'ERROR_FALLBACK',
            usage: { inputTokens: 0, outputTokens: 0 }
        };
    }
}
/**
 * Generate multiple creative variations
 */
async function generateCreativeVariations(prompt, systemPrompt, config, count = 3) {
    const variations = [];
    for (let i = 0; i < count; i++) {
        const variation = await generateCreativeText(`${prompt}\n\nVariation ${i + 1} of ${count}: Generate a unique alternative.`, systemPrompt, config);
        variations.push(variation);
    }
    return variations;
}
/**
 * Mock response generator
 */
function generateMockResponse(prompt, systemPrompt) {
    // Extract key elements from prompt
    const insightMatch = prompt.match(/Generate.*insight.*about:(.+?)[\n.]/i);
    const key = insightMatch ? insightMatch[1].trim() : 'the product';
    if (prompt.toLowerCase().includes('insight')) {
        return `🎯 [MOCK] CREATIVE INSIGHT:
The breakthrough: Reposition from a utilitarian solution to a ritual anchor.`;
    }
    if (prompt.toLowerCase().includes('concept')) {
        return `🎨 [MOCK] STRATEGIC CONCEPT:
Title: The Moment That Matters`;
    }
    if (prompt.toLowerCase().includes('script')) {
        return `🎬 [MOCK] EMOTIONAL SCREENPLAY:
Beat 1: Recognition...`;
    }
    return `[MOCK RESPONSE] processed through lateral thinking.`;
}
/**
 * Configuration guide
 */
function getVertexAISetupGuide() {
    return `
## Google Vertex AI Setup Guide
1. Create Google Cloud Project
2. Enable Vertex AI API
3. export GOOGLE_CLOUD_PROJECT=your-project-id
4. gcloud auth application-default login
`;
}
