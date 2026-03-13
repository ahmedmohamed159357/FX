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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const insight_generator_1 = require("./modules/insight-generator");
const concept_mapper_1 = require("./modules/concept-mapper");
const script_writer_1 = require("./modules/script-writer");
const lateral_thinking_agent_1 = require("./modules/lateral-thinking-agent");
const vertexProvider = __importStar(require("./providers/googleVertexProvider"));
const openaiProvider = __importStar(require("./providers/openaiProvider"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'TextFX Backend alive', timestamp: new Date().toISOString() });
});
// System prompt for AI providers
app.get('/api/system-prompt', (_req, res) => {
    res.json({ systemPrompt: (0, lateral_thinking_agent_1.getLateralThinkingSystemPrompt)() });
});
// Generate Insight using 5 lateral thinking techniques
app.post('/api/insight', async (req, res) => {
    try {
        const { brief, archetype, brandVoice, language } = req.body || {};
        if (!brief) {
            return res.status(400).json({ error: 'Brief is required' });
        }
        const output = await (0, insight_generator_1.generateInsight)(brief, archetype, brandVoice, language);
        res.json(output);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Map Insight to Concept using cognitive shifts and metaphor strategy
app.post('/api/concept', async (req, res) => {
    try {
        const { insight, archetype, brandVoice, language } = req.body || {};
        if (!insight) {
            return res.status(400).json({ error: 'Insight is required' });
        }
        // Determine Provider (same logic as insight)
        const context = {
            domain: 'innovation',
            problem: insight.mainInsight || 'challenge',
            target: 'audience',
            useRealAI: !!(process.env.OPENAI_API_KEY || process.env.GOOGLE_CLOUD_PROJECT),
            provider: process.env.OPENAI_API_KEY ? openaiProvider : process.env.GOOGLE_CLOUD_PROJECT ? vertexProvider : null,
            providerConfig: process.env.OPENAI_API_KEY ? openaiProvider.initializeOpenAI() : process.env.GOOGLE_CLOUD_PROJECT ? vertexProvider.initializeVertexAI() : null,
            archetype,
            brandVoice,
            language
        };
        const output = await (0, concept_mapper_1.mapConcept)(insight, context);
        res.json(output);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Write Script using 3-beat emotional structure
app.post('/api/script', async (req, res) => {
    try {
        const { concept, archetype, brandVoice, language } = req.body || {};
        if (!concept) {
            return res.status(400).json({ error: 'Concept is required' });
        }
        const context = {
            domain: 'innovation',
            problem: concept.coreIdea || 'strategy',
            target: 'audience',
            useRealAI: !!(process.env.OPENAI_API_KEY || process.env.GOOGLE_CLOUD_PROJECT),
            provider: process.env.OPENAI_API_KEY ? openaiProvider : process.env.GOOGLE_CLOUD_PROJECT ? vertexProvider : null,
            providerConfig: process.env.OPENAI_API_KEY ? openaiProvider.initializeOpenAI() : process.env.GOOGLE_CLOUD_PROJECT ? vertexProvider.initializeVertexAI() : null,
            archetype,
            brandVoice,
            language
        };
        const output = await (0, script_writer_1.writeScript)(concept, context);
        res.json(output);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Full pipeline: Brief → Insight → Concept → Script
app.post('/api/full-pipeline', async (req, res) => {
    try {
        const { brief, archetype, brandVoice, language } = req.body || {};
        if (!brief) {
            return res.status(400).json({ error: 'Brief is required' });
        }
        console.log('🚀 TextFX Full Pipeline Started');
        console.log(`Brief: ${brief.substring(0, 100)}...`);
        console.log(`Archetype: ${archetype || 'Default'}`);
        console.log(`Language: ${language || 'en'}`);
        const context = {
            domain: 'innovation',
            problem: brief,
            target: 'audience',
            useRealAI: !!(process.env.OPENAI_API_KEY || process.env.GOOGLE_CLOUD_PROJECT),
            provider: process.env.OPENAI_API_KEY ? openaiProvider : process.env.GOOGLE_CLOUD_PROJECT ? vertexProvider : null,
            providerConfig: process.env.OPENAI_API_KEY ? openaiProvider.initializeOpenAI() : process.env.GOOGLE_CLOUD_PROJECT ? vertexProvider.initializeVertexAI() : null,
            archetype,
            brandVoice,
            language
        };
        // @ts-ignore
        const insight = await (0, insight_generator_1.generateInsight)(brief, archetype, brandVoice, language);
        console.log('✓ Insight generated');
        const concept = await (0, concept_mapper_1.mapConcept)(insight, context);
        console.log('✓ Concept mapped');
        const script = await (0, script_writer_1.writeScript)(concept, context);
        console.log('✓ Script written');
        res.json({
            brief,
            insight,
            concept,
            script,
            pipelineStatus: 'complete'
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// AI Provider Status & Setup
app.get('/api/providers/status', (_req, res) => {
    const status = {
        vertexAI: {
            configured: !!process.env.GOOGLE_CLOUD_PROJECT || !!process.env.VERTEX_PROJECT_ID,
            projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.VERTEX_PROJECT_ID || 'not-set',
            model: process.env.VERTEX_MODEL || 'gemini-pro',
            setupGuide: vertexProvider.getVertexAISetupGuide()
        },
        openai: {
            configured: !!process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL || 'gpt-4',
            setupGuide: openaiProvider.getOpenAISetupGuide()
        },
        currentMode: process.env.OPENAI_API_KEY
            ? 'OpenAI'
            : process.env.GOOGLE_CLOUD_PROJECT
                ? 'Vertex AI'
                : 'Mock (development)'
    };
    res.json(status);
});
const port = parseInt(process.env.PORT || '4002', 10);
app.listen(port, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║         🎬 TextFX Backend — Lateral Thinking Agent      ║
╠══════════════════════════════════════════════════════════╣
║ Listening on http://localhost:${port}                      ║
║                                                          ║
║ Endpoints:                                              ║
║   POST /api/insight      → Generate lateral insights    ║
║   POST /api/concept      → Map concept from insight     ║
║   POST /api/script       → Write 3-beat script          ║
║   POST /api/full-pipeline → Brief → Insight → Script    ║
║   GET  /api/system-prompt → AI system prompt            ║
║   GET  /api/providers/status → Check AI provider setup  ║
║   GET  /health           → Server health check          ║
║                                                          ║
║ Techniques:                                             ║
║   ✓ Provocation (PO)                                    ║
║   ✓ Analogies & Connections                            ║
║   ✓ Random Stimulus                                     ║
║   ✓ Opposite Thinking                                   ║
║   ✓ Constraint Reversal                                 ║
║                                                          ║
║ Providers:                                              ║
║   ✓ Mock Mode (Development)                             ║
║   → Google Vertex AI (with credentials)                 ║
║   → OpenAI (with API key)                               ║
╚══════════════════════════════════════════════════════════╝
  `);
});
