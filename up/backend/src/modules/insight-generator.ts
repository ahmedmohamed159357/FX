/**
 * Insight Generator v4 — Full Live Intelligence Pipeline
 *
 * Flow:
 *   parseBriefWithAI  → AI extracts domain/problem/target from any language
 *   getTrends         → Seasonal + Domain + Live News (SerpApi if key set)
 *   synthesizeLateralThinking → 5 techniques + Agent Debate (with live event) + Visual
 */

import {
  synthesizeLateralThinking,
  LateralThinkingContext,
  LateralThinkingOutput,
  constraintReversals,
} from './lateral-thinking-agent'
import { retrieveKnowledge, getKnowledgeInjectPrompt } from './knowledge-base'
import { getTrends } from './trend-service'
import * as openaiProvider  from '../providers/openaiProvider'
import * as vertexProvider  from '../providers/googleVertexProvider'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface ParsedBrief {
  domain:           string
  problem:          string
  target:           string
  emotionalContext: string
}

export interface InsightOutput {
  mainInsight:               string
  lateralThinkingBreakdown:  LateralThinkingOutput
  constraints:               string[]
  opportunities:             string[]
  metaphoricFraming:         string
  emotionalTruth:            string
  creativeMethod:            string
  trendContext?: {
    primaryTrend:       string
    heat:               number
    culturalMoment:     string
    liveHeadline?:      string    // ← shown in UI if live data available
    liveSource?:        string
    source:             string
  }
}

// ─────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────

function safeParseJson(text: string): any {
  try {
    const m = text.match(/\{[\s\S]*\}/)
    return m ? JSON.parse(m[0]) : JSON.parse(text)
  } catch { return null }
}

// ─────────────────────────────────────────────
// AI-POWERED parseBrief  (Arabic + English + mixed)
// ─────────────────────────────────────────────

async function parseBriefWithAI(
  brief: string, provider: any, providerConfig: any
): Promise<ParsedBrief> {

  try {
    const res = await provider.generateCreativeText(
      `Analyze this creative brief and extract structured data.
Brief:
"""
${brief}
"""
Return ONLY this JSON:
{
  "domain": "short product category or industry (e.g. skincare, fintech, food delivery)",
  "problem": "core human tension or challenge being addressed",
  "target": "target audience",
  "emotionalContext": "dominant emotion or psychological state"
}`,
      `You are a strategic brief analyst. Extract structured data from creative briefs in any language. Return valid JSON only — no explanation, no markdown.`,
      providerConfig
    )

    const p = safeParseJson(res.text)
    if (p?.domain && p?.problem) {
      return {
        domain:           p.domain           || 'innovation',
        problem:          p.problem          || brief.slice(0, 120),
        target:           p.target           || 'general audience',
        emotionalContext: p.emotionalContext || 'tension',
      }
    }
  } catch (err) {
    console.warn('[parseBrief] AI failed, fallback:', (err as any).message)
  }

  return {
    domain:           'innovation',
    problem:          brief.slice(0, 120),
    target:           'general audience',
    emotionalContext: 'tension',
  }
}

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────

export async function generateInsight(
  brief:      string,
  archetype?: string,
  brandVoice?: LateralThinkingContext['brandVoice'],
  language:   'en' | 'ar' = 'ar',
  region:     string       = process.env.TRENDS_REGION || 'EG'
): Promise<InsightOutput> {

  // ── 1. Resolve Provider ──
  let provider:       any  = null
  let providerConfig: any  = null
  let useRealAI             = false

  if (process.env.OPENAI_API_KEY) {
    provider       = openaiProvider
    providerConfig = openaiProvider.initializeOpenAI()
    useRealAI      = true
  } else if (process.env.GOOGLE_CLOUD_PROJECT || process.env.VERTEX_PROJECT_ID) {
    provider       = vertexProvider
    providerConfig = vertexProvider.initializeVertexAI()
    useRealAI      = true
  }

  // ── 2. Parse Brief (AI or fallback) ──
  const parsedBrief = useRealAI
    ? await parseBriefWithAI(brief, provider, providerConfig)
    : { domain: 'innovation', problem: brief.slice(0, 120), target: 'general audience', emotionalContext: 'tension' }

  // ── 3. Fetch Trends + RAG in parallel ──
  const [trendBundle, knowledgeSnippets] = await Promise.all([
    getTrends({ domain: parsedBrief.domain, region, language }),
    retrieveKnowledge(`${parsedBrief.problem} ${parsedBrief.domain}`),
  ])

  const knowledgePrompt = getKnowledgeInjectPrompt(knowledgeSnippets)

  console.log(`[Insight] domain="${parsedBrief.domain}" | trend="${trendBundle.primary.keyword}" | live=${!!trendBundle.liveContext}`)

  // ── 4. Build Context ──
  const context: LateralThinkingContext = {
    domain:           parsedBrief.domain,
    problem:          parsedBrief.problem,
    target:           parsedBrief.target,
    emotionalContext: parsedBrief.emotionalContext,
    knowledgePrompt,
    archetype,
    brandVoice,
    language,
    useRealAI,
    provider,
    providerConfig,
    currentTrends:    trendBundle,
  }

  // ── 5. Run Full Pipeline ──
  const lateralOutput = await synthesizeLateralThinking(context)

  // ── 6. Compose Output ──
  const liveCtx = trendBundle.liveContext

  return {
    mainInsight:              extractMainInsight(lateralOutput),
    lateralThinkingBreakdown: lateralOutput,
    constraints:              extractConstraints(parsedBrief),
    opportunities:            extractOpportunities(lateralOutput),
    metaphoricFraming:        extractMetaphor(lateralOutput),
    emotionalTruth:           extractEmotionalTruth(lateralOutput),
    creativeMethod:           [
      'Provocation', 'Analogies', 'Random Stimulus',
      'Opposite Thinking', 'Constraint Reversal',
      'Agent Debate (3 personas)',
      'Trend Injection (Seasonal + Domain)',
      trendBundle.source === 'serpapi-news'   ? '✦ Live News (SerpApi)' : null,
      trendBundle.source === 'serpapi-trends' ? '✦ Live Trends (SerpApi)' : null,
    ].filter(Boolean).join(' + '),
    trendContext: {
      primaryTrend:   trendBundle.primary.keyword,
      heat:           trendBundle.primary.heat,
      culturalMoment: trendBundle.culturalMoment,
      liveHeadline:   liveCtx?.topHeadline,
      liveSource:     liveCtx?.source,
      source:         trendBundle.source,
    },
  }
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function extractMainInsight(o: LateralThinkingOutput): string {
  const lines = o.creativeBreakthrough.split('\n').filter(l => l.trim())
  return lines[1] || o.synthesizedInsight
}

function extractConstraints(b: ParsedBrief): string[] {
  const combined = `${b.problem} ${b.emotionalContext}`.toLowerCase()
  const found    = Object.keys(constraintReversals).filter(k => combined.includes(k.toLowerCase()))
  return found.length ? found : ['default constraint']
}

function extractOpportunities(o: LateralThinkingOutput): string[] {
  return [
    o.provocation.opportunity,
    o.analogies?.[0]?.metaphor        || 'ritual transformation',
    o.randomStimulus?.unexpectedAngle  || 'unique perspective',
    o.oppositeThinking?.desirableMiddle?.split('\n')[0] || 'balanced approach',
  ].filter(Boolean)
}

function extractMetaphor(o: LateralThinkingOutput): string {
  return o.analogies?.[0]?.metaphor || o.randomStimulus?.visualMetaphor || 'transformation'
}

function extractEmotionalTruth(o: LateralThinkingOutput): string {
  const lines = (o.oppositeThinking?.paradox || '').split('\n').filter(l => l.trim())
  return lines[1] || 'Emotional truth emerging from paradox'
}
