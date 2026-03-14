/**
 * TextFX v5 — Production Backend
 * Hardened: structured logging, dynamic CORS, graceful shutdown, health/version/ping endpoints
 */
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { generateInsight } from './modules/insight-generator'
import { mapConcept }      from './modules/concept-mapper'
import { writeScript }     from './modules/script-writer'
import { getLateralThinkingSystemPrompt } from './modules/lateral-thinking-agent'
import * as vertexProvider from './providers/googleVertexProvider'
import * as openaiProvider  from './providers/openaiProvider'

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────────────────────
dotenv.config()

const NODE_ENV = process.env.NODE_ENV || 'development'
const isProd   = NODE_ENV === 'production'

// ─────────────────────────────────────────────────────────────────────────────
// Structured Logger
// ─────────────────────────────────────────────────────────────────────────────
function log(level: 'info' | 'warn' | 'error', msg: string, meta: Record<string, unknown> = {}) {
  console[level](JSON.stringify({ level, ts: new Date().toISOString(), msg, ...meta }))
}

// ─────────────────────────────────────────────────────────────────────────────
// CORS — Dynamic, production-safe
// ─────────────────────────────────────────────────────────────────────────────
const rawOrigins = process.env.ALLOWED_ORIGINS || ''
const allowedOrigins: string[] = rawOrigins
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

if (isProd && allowedOrigins.length === 0) {
  log('error', 'ALLOWED_ORIGINS is not set in production — refusing to start with open CORS.')
  process.exit(1)
}

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins.length === 0
    ? true // dev: allow all
    : (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
        log('warn', 'Blocked by CORS', { origin })
        cb(new Error(`Origin ${origin} not allowed`))
      },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
const app = express()
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json({ limit: '1mb' }))

// ─────────────────────────────────────────────────────────────────────────────
// Request logger middleware
// ─────────────────────────────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  res.on('finish', () => {
    log('info', 'request', {
      method:   req.method,
      path:     req.path,
      status:   res.statusCode,
      duration: `${Date.now() - start}ms`,
      ip:       req.ip,
    })
  })
  next()
})

// ─────────────────────────────────────────────────────────────────────────────
// Provider factory (shared)
// ─────────────────────────────────────────────────────────────────────────────
function buildProviderContext(extra: Record<string, unknown> = {}) {
  const hasOpenAI  = !!process.env.OPENAI_API_KEY
  const hasVertex  = !!process.env.GOOGLE_CLOUD_PROJECT
  return {
    useRealAI:      hasOpenAI || hasVertex,
    provider:       hasOpenAI ? openaiProvider : hasVertex ? vertexProvider : null,
    providerConfig: hasOpenAI ? openaiProvider.initializeOpenAI() : hasVertex ? vertexProvider.initializeVertexAI() : null,
    ...extra,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH, VERSION, PING
// ─────────────────────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/version', (_req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { version } = require('../../package.json') as { version: string }
  res.json({ version, env: NODE_ENV })
})

app.get('/api/ping', async (_req: Request, res: Response) => {
  const controller = new AbortController()
  const timeout    = setTimeout(() => controller.abort(), 10_000)
  try {
    const downstream = await fetch('https://api.openai.com', { signal: controller.signal })
    clearTimeout(timeout)
    res.json({ ok: true, downstream: { status: downstream.status, url: 'https://api.openai.com' } })
  } catch (err: unknown) {
    clearTimeout(timeout)
    const msg = err instanceof Error ? err.message : String(err)
    res.status(503).json({ ok: false, error: msg })
  }
})

app.get('/api/system-prompt', (_req: Request, res: Response) => {
  res.json({ systemPrompt: getLateralThinkingSystemPrompt() })
})

app.get('/api/providers/status', (_req: Request, res: Response) => {
  res.json({
    vertexAI: {
      configured: !!process.env.GOOGLE_CLOUD_PROJECT,
      projectId:  process.env.GOOGLE_CLOUD_PROJECT || 'not-set',
      model:      process.env.VERTEX_MODEL || 'gemini-pro',
    },
    openai: {
      configured: !!process.env.OPENAI_API_KEY,
      model:      process.env.OPENAI_MODEL || 'gpt-4',
    },
    currentMode: process.env.OPENAI_API_KEY ? 'OpenAI' : process.env.GOOGLE_CLOUD_PROJECT ? 'VertexAI' : 'Mock',
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/insight', async (req: Request, res: Response) => {
  const { brief, archetype, brandVoice, language } = req.body || {}
  if (!brief) return void res.status(400).json({ error: 'brief is required' })
  try {
    const output = await generateInsight(brief, archetype, brandVoice, language)
    res.json(output)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    log('error', 'insight failed', { msg })
    res.status(500).json({ error: msg })
  }
})

app.post('/api/concept', async (req: Request, res: Response) => {
  const { insight, archetype, brandVoice, language } = req.body || {}
  if (!insight) return void res.status(400).json({ error: 'insight is required' })
  try {
    const ctx = buildProviderContext({
      domain: 'innovation', problem: insight.mainInsight || 'challenge', target: 'audience',
      archetype, brandVoice, language,
    })
    const output = await mapConcept(insight, ctx)
    res.json(output)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    log('error', 'concept failed', { msg })
    res.status(500).json({ error: msg })
  }
})

app.post('/api/script', async (req: Request, res: Response) => {
  const { concept, archetype, brandVoice, language } = req.body || {}
  if (!concept) return void res.status(400).json({ error: 'concept is required' })
  try {
    const ctx = buildProviderContext({
      domain: 'innovation', problem: concept.coreIdea || 'strategy', target: 'audience',
      archetype, brandVoice, language,
    })
    const output = await writeScript(concept, ctx)
    res.json(output)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    log('error', 'script failed', { msg })
    res.status(500).json({ error: msg })
  }
})

app.post('/api/full-pipeline', async (req: Request, res: Response) => {
  const { brief, archetype, brandVoice, language } = req.body || {}
  if (!brief) return void res.status(400).json({ error: 'brief is required' })
  try {
    const ctx = buildProviderContext({
      domain: 'innovation', problem: brief, target: 'audience',
      archetype, brandVoice, language,
    })
    const insight = await generateInsight(brief, archetype, brandVoice, language)
    const concept = await mapConcept(insight, ctx)
    const script  = await writeScript(concept, ctx)
    res.json({ brief, insight, concept, script, pipelineStatus: 'complete' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    log('error', 'full-pipeline failed', { msg })
    res.status(500).json({ error: msg })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  log('error', 'unhandled', { msg: err.message, stack: err.stack })
  res.status(500).json({ error: 'Internal server error' })
})

// ─────────────────────────────────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────────────────────────────────
const port = parseInt(process.env.PORT || '4002', 10)

const server = app.listen(port, '0.0.0.0', () => {
  log('info', 'server started', { port, env: NODE_ENV, cors: allowedOrigins.length || 'open-dev' })
})

// Graceful shutdown
const shutdown = (signal: string) => {
  log('info', `${signal} received — graceful shutdown`)
  server.close(() => { log('info', 'server closed'); process.exit(0) })
  setTimeout(() => process.exit(1), 10_000)
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
