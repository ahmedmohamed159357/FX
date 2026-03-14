import express, { Request, Response } from 'express'
import cors                            from 'cors'
import { runOrchestrator }             from './modules/autonomous-orchestrator'
import { generateInsight }             from './modules/insight-generator'
import { mapConcept }                  from './modules/concept-mapper'
import { writeScript }                 from './modules/script-writer'
import { getLateralThinkingSystemPrompt } from './modules/lateral-thinking-agent'
import { getTrends }                   from './modules/trend-service'
import * as openaiProvider             from './providers/openaiProvider'
import * as vertexProvider             from './providers/googleVertexProvider'

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

function resolveProvider() {
  if (process.env.OPENAI_API_KEY) {
    return { provider: openaiProvider, providerConfig: openaiProvider.initializeOpenAI(), useRealAI: true, name: 'openai' as const }
  }
  if (process.env.GOOGLE_CLOUD_PROJECT || process.env.VERTEX_PROJECT_ID) {
    return { provider: vertexProvider, providerConfig: vertexProvider.initializeVertexAI(), useRealAI: true, name: 'vertex' as const }
  }
  return { provider: null, providerConfig: null, useRealAI: false, name: 'mock' as const }
}

// ─── HEALTH ──────────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  const { name } = resolveProvider()
  res.json({
    status: 'ok', version: '5.0', timestamp: new Date().toISOString(),
    aiProvider: name,
    trendService: { live: !!process.env.SERPAPI_KEY, region: process.env.TRENDS_REGION || 'EG', mode: process.env.SERPAPI_KEY ? 'live-serpapi' : 'mock-intelligent' },
    framework: { orchestrator: true, auditor: true, loopControl: true, maxRetries: parseInt(process.env.MAX_RETRIES || '2', 10), threshold: parseFloat(process.env.AUDIT_THRESHOLD || '0.7') },
  })
})

// ─── ★ PRIMARY: /api/orchestrate ─────────────────────────────────────────────
app.post('/api/orchestrate', async (req: Request, res: Response) => {
  const t0 = Date.now()
  try {
    const { brief, archetype, language, region, brandVoice, maxRetries, threshold } = req.body || {}
    if (!brief) return res.status(400).json({ error: 'Brief is required' })

    console.log(`\n[/api/orchestrate] "${brief.slice(0, 60)}" | ${archetype || 'The Sage'} | ${language || 'ar'}`)

    const result = await runOrchestrator({
      brief,
      archetype,
      language:   language   || 'ar',
      region:     region     || process.env.TRENDS_REGION || 'EG',
      brandVoice,
      maxRetries: maxRetries ?? parseInt(process.env.MAX_RETRIES    || '2', 10),
      threshold:  threshold  ?? parseFloat(process.env.AUDIT_THRESHOLD || '0.7'),
    })

    res.json({
      finalMasterpiece: result.finalMasterpiece,
      visualPrompt:     result.visualPrompt,
      insight:          result.insight,
      governance: {
        verdict:        result.verdict,
        iterationsRun:  result.iterationsRun,
        alignmentScore: result.audit?.alignmentScore,
        auditSummary:   result.auditSummary,
        audit:          result.audit,
      },
      trace:  result.context.trace,
      tookMs: Date.now() - t0,
      brief,
    })
  } catch (err: any) {
    console.error('[/api/orchestrate]', err.message)
    res.status(500).json({ error: err.message, tookMs: Date.now() - t0 })
  }
})

// ─── /api/trends ─────────────────────────────────────────────────────────────
app.get('/api/trends', async (req: Request, res: Response) => {
  try {
    const domain   = (req.query.domain   as string) || 'marketing'
    const region   = (req.query.region   as string) || process.env.TRENDS_REGION || 'EG'
    const language = ((req.query.language as string) || 'ar') as 'en' | 'ar'
    const bundle   = await getTrends({ domain, region, language })
    res.json({
      primary: bundle.primary, supporting: bundle.supporting.map(t => ({ keyword: t.keyword, heat: t.heat, type: t.type })),
      culturalMoment: bundle.culturalMoment, creativeOpportunity: bundle.creativeOpportunity,
      liveContext: bundle.liveContext ?? null, fetchedAt: bundle.fetchedAt, source: bundle.source,
    })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

// ─── /api/system-prompt ──────────────────────────────────────────────────────
app.get('/api/system-prompt', (_req: Request, res: Response) => {
  res.json({ systemPrompt: getLateralThinkingSystemPrompt() })
})

// ─── LEGACY /api/insight ─────────────────────────────────────────────────────
app.post('/api/insight', async (req: Request, res: Response) => {
  try {
    const { brief, archetype, brandVoice, language, region } = req.body || {}
    if (!brief) return res.status(400).json({ error: 'Brief is required' })
    res.json(await generateInsight(brief, archetype, brandVoice, language || 'ar', region || process.env.TRENDS_REGION || 'EG'))
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

// ─── LEGACY /api/concept ─────────────────────────────────────────────────────
app.post('/api/concept', async (req: Request, res: Response) => {
  try {
    const { insight, archetype, brandVoice, language } = req.body || {}
    if (!insight) return res.status(400).json({ error: 'Insight is required' })
    const { provider, providerConfig, useRealAI } = resolveProvider()
    res.json(await mapConcept(insight, { domain: 'innovation', problem: insight.mainInsight || 'challenge', target: 'audience', useRealAI, provider, providerConfig, archetype, brandVoice, language }))
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

// ─── LEGACY /api/script ──────────────────────────────────────────────────────
app.post('/api/script', async (req: Request, res: Response) => {
  try {
    const { concept, archetype, brandVoice, language } = req.body || {}
    if (!concept) return res.status(400).json({ error: 'Concept is required' })
    const { provider, providerConfig, useRealAI } = resolveProvider()
    res.json(await writeScript(concept, { domain: 'innovation', problem: concept.coreIdea || 'strategy', target: 'audience', useRealAI, provider, providerConfig, archetype, brandVoice, language }))
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

// ─── /api/providers/status ───────────────────────────────────────────────────
app.get('/api/providers/status', (_req: Request, res: Response) => {
  const { name } = resolveProvider()
  res.json({
    activeProvider: name,
    openai:  { configured: !!process.env.OPENAI_API_KEY,         model: process.env.OPENAI_MODEL  || 'gpt-4' },
    vertex:  { configured: !!(process.env.GOOGLE_CLOUD_PROJECT),  model: process.env.VERTEX_MODEL  || 'gemini-pro' },
    serpapi: { configured: !!process.env.SERPAPI_KEY, region: process.env.TRENDS_REGION || 'EG', mode: process.env.SERPAPI_KEY ? 'LIVE' : 'Mock' },
    orchestrator: { maxRetries: process.env.MAX_RETRIES || '2', threshold: process.env.AUDIT_THRESHOLD || '0.7', auditorFallback: 'mock-heuristic (always active)' },
  })
})

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4002
app.listen(PORT, () => {
  const { name } = resolveProvider()
  console.log(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551       \uD83C\uDF9C  TextFX v5 \u2014 Multi-Agent Governance Framework          \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551  http://localhost:${PORT}                                          \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551  \u2605 POST /api/orchestrate     Full governance loop               \u2551
\u2551    GET  /api/trends           Cultural context                  \u2551
\u2551    POST /api/insight          Single-pass (legacy)              \u2551
\u2551    POST /api/concept          Concept mapping (legacy)          \u2551
\u2551    POST /api/script           Script + visual (legacy)          \u2551
\u2551    GET  /api/providers/status                                   \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551  AI: ${name} | Auditor: AI + Mock fallback (always works)       \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
  `)
})
