import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { generateInsight } from './modules/insight-generator'
import { mapConcept } from './modules/concept-mapper'
import { writeScript } from './modules/script-writer'
import { getLateralThinkingSystemPrompt } from './modules/lateral-thinking-agent'
import * as vertexProvider from './providers/googleVertexProvider'
import * as openaiProvider from './providers/openaiProvider'

const app = express()
dotenv.config()
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'TextFX Backend alive', timestamp: new Date().toISOString() })
})

// System prompt for AI providers
app.get('/api/system-prompt', (_req: Request, res: Response) => {
  res.json({ systemPrompt: getLateralThinkingSystemPrompt() })
})

// Generate Insight using 5 lateral thinking techniques
app.post('/api/insight', async (req: Request, res: Response) => {
  try {
    const { brief, archetype, brandVoice, language } = req.body || {}
    if (!brief) {
      return res.status(400).json({ error: 'Brief is required' })
    }
    const output = await generateInsight(brief, archetype, brandVoice, language)
    res.json(output)
  } catch (error) {
    res.status(500).json({ error: (error as any).message })
  }
})

// Map Insight to Concept using cognitive shifts and metaphor strategy
app.post('/api/concept', async (req: Request, res: Response) => {
  try {
    const { insight, archetype, brandVoice, language } = req.body || {}
    if (!insight) {
      return res.status(400).json({ error: 'Insight is required' })
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
    }

    const output = await mapConcept(insight, context)
    res.json(output)
  } catch (error) {
    res.status(500).json({ error: (error as any).message })
  }
})

// Write Script using 3-beat emotional structure
app.post('/api/script', async (req: Request, res: Response) => {
  try {
    const { concept, archetype, brandVoice, language } = req.body || {}
    if (!concept) {
      return res.status(400).json({ error: 'Concept is required' })
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
    }

    const output = await writeScript(concept, context)
    res.json(output)
  } catch (error) {
    res.status(500).json({ error: (error as any).message })
  }
})

// Full pipeline: Brief → Insight → Concept → Script
app.post('/api/full-pipeline', async (req: Request, res: Response) => {
  try {
    const { brief, archetype, brandVoice, language } = req.body || {}
    if (!brief) {
      return res.status(400).json({ error: 'Brief is required' })
    }

    console.log('🚀 TextFX Full Pipeline Started')
    console.log(`Brief: ${brief.substring(0, 100)}...`)
    console.log(`Archetype: ${archetype || 'Default'}`)
    console.log(`Language: ${language || 'en'}`)

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
    }

    // @ts-ignore
    const insight = await generateInsight(brief, archetype, brandVoice, language)
    console.log('✓ Insight generated')

    const concept = await mapConcept(insight, context)
    console.log('✓ Concept mapped')

    const script = await writeScript(concept, context)
    console.log('✓ Script written')

    res.json({
      brief,
      insight,
      concept,
      script,
      pipelineStatus: 'complete'
    })
  } catch (error) {
    res.status(500).json({ error: (error as any).message })
  }
})

// AI Provider Status & Setup
app.get('/api/providers/status', (_req: Request, res: Response) => {
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
  }
  res.json(status)
})

const port = process.env.PORT || 4002
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
  `)
})
