"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInsight = generateInsight;
const lateral_thinking_agent_1 = require("./lateral-thinking-agent");
const knowledge_base_1 = require("./knowledge-base");
const openaiProvider = __importStar(require("../providers/openaiProvider"));
const vertexProvider = __importStar(require("../providers/googleVertexProvider"));
async function generateInsight(brief, archetype, brandVoice, language = 'en') {
    try {
        // Parse brief into structured context
        const context = parseBrief(brief);
        // RAG: Retrieve knowledge from library
        const knowledgeSnippets = await (0, knowledge_base_1.retrieveKnowledge)(brief + ' ' + context.domain);
        const knowledgePrompt = (0, knowledge_base_1.getKnowledgeInjectPrompt)(knowledgeSnippets);
        // Inject knowledge and personality into context
        const contextWithKnowledge = { ...context, knowledgePrompt, archetype, brandVoice, language };
        // Run all 5 lateral thinking techniques
        // Choose Provider
        let provider = null;
        let providerConfig = null;
        let useRealAI = false;
        if (process.env.OPENAI_API_KEY) {
            provider = openaiProvider;
            providerConfig = openaiProvider.initializeOpenAI();
            useRealAI = true;
        }
        else if (process.env.GOOGLE_CLOUD_PROJECT || process.env.VERTEX_PROJECT_ID) {
            provider = vertexProvider;
            providerConfig = vertexProvider.initializeVertexAI();
            useRealAI = true;
        }
        const lateralOutput = await (0, lateral_thinking_agent_1.synthesizeLateralThinking)({
            ...contextWithKnowledge,
            useRealAI,
            provider,
            providerConfig
        });
        // Extract key insights
        const mainInsight = extractMainInsight(lateralOutput);
        const constraints = extractConstraints(context);
        const opportunities = extractOpportunities(lateralOutput);
        const metaphoricFraming = extractMetaphor(lateralOutput);
        const emotionalTruth = extractEmotionalTruth(lateralOutput);
        return {
            mainInsight,
            lateralThinkingBreakdown: lateralOutput,
            constraints,
            opportunities,
            metaphoricFraming,
            emotionalTruth,
            creativeMethod: 'Provocation + Analogies + Random Stimulus + Opposite Thinking + Constraint Reversal'
        };
    }
    catch (e) {
        console.error('Error in generateInsight:', e);
        throw e;
    }
}
function parseBrief(brief) {
    // Simple extraction; in production, use NLP
    return {
        domain: extractField(brief, 'product|category') || 'innovation',
        problem: extractField(brief, 'problem|challenge|need') || brief.substring(0, 100),
        target: extractField(brief, 'target|audience|user|people') || 'end user',
        emotionalContext: extractField(brief, 'feel|emotion|tension|paradox') || 'balance'
    };
}
function extractField(text, keywords) {
    const regex = new RegExp(`${keywords}[:\\s]+([^.]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : undefined;
}
function extractMainInsight(output) {
    // Synthesize the main insight from all techniques
    const lines = output.synthesizedInsight.split('\n').filter((l) => l.trim());
    const breakthrough = output.creativeBreakthrough.split('\n').filter((l) => l.trim());
    return breakthrough[1] || output.synthesizedInsight;
}
function extractConstraints(context) {
    // Identify reversible constraints
    const constraints = [];
    for (const [problem, _] of Object.entries(lateral_thinking_agent_1.constraintReversals)) {
        if (context.problem.toLowerCase().includes(problem)) {
            constraints.push(problem);
        }
    }
    return constraints.length > 0 ? constraints : ['default constraint'];
}
function extractOpportunities(output) {
    // Gather opportunities from all techniques
    const opportunities = [
        output.provocation.opportunity,
        output.analogies?.[0]?.metaphor || 'ritual transformation',
        output.randomStimulus?.unexpectedAngle || 'unique perspective',
        output.oppositeThinking?.desirableMiddle?.split('\n')[0] || 'balanced approach'
    ];
    return opportunities.filter((o) => o && o.length > 0);
}
function extractMetaphor(output) {
    // Use the strongest metaphor from analogies and random stimulus
    const strongestAnalogy = output.analogies?.[0]?.metaphor;
    const randomMetaphor = output.randomStimulus?.visualMetaphor;
    return strongestAnalogy || randomMetaphor || 'transformation';
}
function extractEmotionalTruth(output) {
    // Extract emotional truth from the paradox
    const paradoxText = output.oppositeThinking?.paradox || '';
    const lines = paradoxText.split('\n').filter((l) => l.trim());
    return lines[1] || 'Emotional truth emerging from paradox';
}
