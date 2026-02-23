"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapConcept = mapConcept;
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
async function mapConcept(insight, context) {
    // Extract insights from the lateral thinking breakdown
    let insightText = insight?.mainInsight || insight?.insight || (typeof insight === 'string' ? insight : 'creative insight');
    if (context?.useRealAI && context.provider) {
        const prompt = `Insight: ${insightText}
    
    Task: Transform this insight into a strategic creative concept.
    Return JSON: { 
      "title": "...", 
      "tagline": "...", 
      "coreIdea": "...", 
      "visualNotes": "...", 
      "creativeDevice": "...", 
      "emotionalArc": "...", 
      "targetParadox": "..." 
    }`;
        try {
            const response = await context.provider.generateCreativeText(prompt, (0, lateral_thinking_agent_1.getLateralThinkingSystemPrompt)(context) + "\n\nSpecific Task: You are now mapping the insight to a concrete creative concept. Focus on strategy and visual metaphor.", context.providerConfig);
            const parsed = parseAIJson(response.text);
            if (parsed && parsed.title) {
                return {
                    ...parsed,
                    lateralThinkingTechniques: ['Cognitive Shift', 'Emotional Subversion', 'Metaphor strategy']
                };
            }
        }
        catch (e) {
            console.warn('Concept AI mapping failed, falling back to template.');
        }
    }
    // Fallback to Template (Existing Logic)
    const analogies = insight?.lateralThinkingBreakdown?.analogies || [];
    const analogy = analogies[0] || { metaphor: 'transformation', sourceField: 'ritual' };
    const randomWord = insight?.lateralThinkingBreakdown?.randomStimulus?.randomWord || 'momentum';
    return {
        title: buildTitle(insightText, analogy),
        tagline: buildTagline(insightText, randomWord),
        coreIdea: buildCoreIdea(insightText, analogy, 'choice vs obligation'),
        visualNotes: 'Aesthetic: warm, intimate, intentional.',
        creativeDevice: analogy.metaphor,
        emotionalArc: 'From obligation → inspiration → identity',
        targetParadox: 'Make the easy choice the irresistible choice',
        lateralThinkingTechniques: ['Template Mapping']
    };
}
// Keep helper functions for template fallback
function buildTitle(insight, analogy) {
    const conceptMap = {
        ritual: 'The Sacred Pause',
        celebration: 'The Daily Victory',
        identity: 'Becoming Who You Are'
    };
    for (const [key, title] of Object.entries(conceptMap)) {
        if (insight.toLowerCase().includes(key) || analogy?.sourceField?.toLowerCase().includes(key))
            return title;
    }
    return 'The Moment That Matters';
}
function buildTagline(insight, randomWord) {
    return 'The moment you choose yourself';
}
function buildCoreIdea(insight, analogy, paradox) {
    return `This isn't a ${analogy.sourceField} — it's a ${analogy.metaphor}.\n\nInsight: ${insight}`;
}
