"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeScript = writeScript;
const lateral_thinking_agent_1 = require("./lateral-thinking-agent");
function parseAIJson(text) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    }
    catch (e) {
        return null;
    }
}
async function writeScript(concept, context) {
    let conceptTitle = concept?.title || 'Creative Concept';
    let tagline = concept?.tagline || 'The moment counts';
    let coreIdea = concept?.coreIdea || 'Core strategy';
    if (context?.useRealAI && context.provider) {
        const prompt = `Concept: ${conceptTitle}
    Tagline: ${tagline}
    Core Idea: ${coreIdea}
    
    Task: Write a 30-second emotional screenplay.
    Structure: Beat 1 (Recognition), Beat 2 (Surrender), Beat 3 (Arrival).
    Return JSON: { 
      "script": "...", 
      "beats": ["...", "...", "..."], 
      "cameraLanguage": "...", 
      "narrativeStrategy": "...", 
      "emotionalTurning": "..." 
    }`;
        try {
            const response = await context.provider.generateCreativeText(prompt, (0, lateral_thinking_agent_1.getLateralThinkingSystemPrompt)(context) + "\n\nSpecific Task: You are now writing a cinematic script. Focus on emotion, pacing, and visual storytelling.", context.providerConfig);
            const parsed = parseAIJson(response.text);
            if (parsed && parsed.script) {
                return {
                    ...parsed,
                    lateralThinkingTechniques: ['3-Beat emotional arc', 'Narrative subversion']
                };
            }
        }
        catch (e) {
            console.warn('Script AI writing failed, falling back to template.');
        }
    }
    // Fallback to Template
    return {
        script: `INT. A MOMENT IN TIME\n\nConcept: ${conceptTitle}\nTagline: ${tagline}\n\nBEAT 1: Recognition\nBEAT 2: Surrender\nBEAT 3: Arrival\n\nSUPER: ${tagline}`,
        beats: ['Recognition', 'Surrender', 'Arrival'],
        cameraLanguage: 'Close, warm, intentional.',
        narrativeStrategy: 'Emotional subversion.',
        emotionalTurning: 'Obligation → Identity',
        lateralThinkingTechniques: ['Template Scripting']
    };
}
