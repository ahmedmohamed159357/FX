/**
 * Autonomous Orchestrator
 *
 * Governance Loop:
 *
 *   ┌─────────────────────────────────────────────────────┐
 *   │  createStrategicContext(request)                    │
 *   │         │                                           │
 *   │         ▼                                           │
 *   │  [TrendService] → withTrends(ctx)                   │
 *   │         │                                           │
 *   │   ┌─────▼────────────────────────────────────┐     │
 *   │   │  ITERATION LOOP  (max: ctx.maxRetries)    │     │
 *   │   │                                           │     │
 *   │   │  [LateralAgent] → withInsight(ctx)        │     │
 *   │   │         │                                 │     │
 *   │   │  [Auditor]     → withAudit(ctx)           │     │
 *   │   │         │                                 │     │
 *   │   │  score ≥ 0.7? ──YES──► APPROVE & RETURN  │     │
 *   │   │         │                                 │     │
 *   │   │         NO                                │     │
 *   │   │         │                                 │     │
 *   │   │  max retries? ──YES──► ESCALATE & RETURN  │     │
 *   │   │         │                                 │     │
 *   │   │         NO → inject reworkDirective       │     │
 *   │   │              withNextIteration(ctx) ──────┘     │
 *   │   └───────────────────────────────────────────┘     │
 *   │                                                     │
 *   │  return serializeContext(finalCtx)                  │
 *   └─────────────────────────────────────────────────────┘
 *
 * Immutable pattern:
 *   Every agent receives ctx and returns { ...ctx, newLayer }
 *   ctx.trace grows with every agent call — full history preserved
 */

import {
  StrategicContext,
  createStrategicContext,
  withTrends,
  withInsight,
  withAudit,
  withTrace,
  withNextIteration,
  serializeContext,
} from './strategic-context'

import { getTrends }              from './trend-service'
import { synthesizeLateralThinking, LateralThinkingContext } from './lateral-thinking-agent'
import { auditStrategicContext, formatAuditSummary }         from './strategic-auditor'
import * as openaiProvider  from '../providers/openaiProvider'
import * as vertexProvider  from '../providers/googleVertexProvider'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface OrchestratorRequest {
  brief:       string
  archetype?:  string
  language?:   'en' | 'ar'
  region?:     string
  brandVoice?: {
    formalLevel:   number
    metaphorLevel: number
    intensity:     number
  }
  maxRetries?: number   // override default (2)
  threshold?:  number   // override default (0.7)
}

export interface OrchestratorResult {
  // Final creative output
  finalMasterpiece: ReturnType<typeof serializeContext>['finalMasterpiece']
  visualPrompt:     ReturnType<typeof serializeContext>['visualPrompt']
  insight:          ReturnType<typeof serializeContext>['insight']

  // Governance data
  audit:         ReturnType<typeof serializeContext>['audit']
  iterationsRun: number
  verdict:       'approved' | 'escalate'
  auditSummary:  string

  // Full context for debugging / transparency
  context:  ReturnType<typeof serializeContext>
  tookMs:   number
}

// ─────────────────────────────────────────────
// PROVIDER RESOLVER  (singleton-safe)
// ─────────────────────────────────────────────

function resolveProvider() {
  if (process.env.OPENAI_API_KEY) {
    return {
      provider:       openaiProvider,
      providerConfig: openaiProvider.initializeOpenAI(),
      useRealAI:      true,
    }
  }
  if (process.env.GOOGLE_CLOUD_PROJECT || process.env.VERTEX_PROJECT_ID) {
    return {
      provider:       vertexProvider,
      providerConfig: vertexProvider.initializeVertexAI(),
      useRealAI:      true,
    }
  }
  return { provider: null, providerConfig: null, useRealAI: false }
}

// ─────────────────────────────────────────────
// LATERAL CONTEXT BUILDER
// Translates StrategicContext → LateralThinkingContext
// Injects the rework directive when iterating
// ─────────────────────────────────────────────

function buildLateralContext(
  ctx: StrategicContext,
  reworkDirective?: string
): LateralThinkingContext {

  // When reworking: prepend the directive to the knowledgePrompt
  // so all 5 techniques + debate are aware of what to fix
  const reworkBlock = reworkDirective
    ? `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔄 REWORK DIRECTIVE (Iteration ${ctx.iteration})\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${reworkDirective}\n` +
      `الهدف: أنتج نسخة أقوى تعالج هذا الضعف تحديداً.\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    : ''

  return {
    domain:           extractDomain(ctx.brief),
    problem:          ctx.brief,
    target:           ctx.archetype,
    emotionalContext: 'strategic',
    language:         ctx.language,
    useRealAI:        ctx.useRealAI,
    provider:         ctx.provider,
    providerConfig:   ctx.providerConfig,
    archetype:        ctx.archetype,
    brandVoice:       ctx.brandVoice,
    currentTrends:    ctx.trends,
    knowledgePrompt:  reworkBlock,
  }
}

/** Simple domain extractor — avoids re-calling parseBrief in the loop */
function extractDomain(brief: string): string {
  const domainHints: [RegExp, string][] = [
    [/عقار|شقة|property|real estate/i, 'real estate'],
    [/سيارة|عربية|car|auto/i,         'automotive'],
    [/بشرة|كريم|skincare|beauty/i,     'skincare'],
    [/بنك|فلوس|bank|finance/i,         'finance'],
    [/أكل|مطعم|food|restaurant/i,      'food'],
    [/مشروب|beverage|drink/i,          'beverage'],
    [/تطبيق|app|tech|digital/i,        'tech'],
    [/رياضة|gym|fitness/i,             'fitness'],
  ]
  for (const [re, domain] of domainHints) {
    if (re.test(brief)) return domain
  }
  return 'innovation'
}

// ─────────────────────────────────────────────
// ORCHESTRATOR CORE
// ─────────────────────────────────────────────

export async function runOrchestrator(
  request: OrchestratorRequest
): Promise<OrchestratorResult> {

  const startMs = Date.now()
  const { provider, providerConfig, useRealAI } = resolveProvider()

  // ── 1. Initialise context ──────────────────
  let ctx: StrategicContext = createStrategicContext({
    brief:         request.brief,
    archetype:     request.archetype  || 'The Sage',
    language:      request.language   || 'ar',
    region:        request.region     || process.env.TRENDS_REGION || 'EG',
    brandVoice:    request.brandVoice,
    provider,
    providerConfig,
    useRealAI,
    maxRetries:    request.maxRetries ?? 2,
    threshold:     request.threshold  ?? 0.7,
  })

  console.log(`\n╔══ Orchestrator START ══════════════════════`)
  console.log(`║  Brief:      ${request.brief.slice(0, 60)}...`)
  console.log(`║  Archetype:  ${ctx.archetype} | Lang: ${ctx.language}`)
  console.log(`║  Threshold:  ${ctx.threshold} | MaxRetries: ${ctx.maxRetries}`)
  console.log(`╚═══════════════════════════════════════════\n`)

  // ── 2. Resolve trends (once, outside the loop) ──
  const trendStart = Date.now()
  const trends = await getTrends({
    domain:   extractDomain(request.brief),
    region:   ctx.region,
    language: ctx.language,
  })
  ctx = withTrends(ctx, trends)
  console.log(`[Orchestrator] Trends resolved in ${Date.now() - trendStart}ms | ${trends.primary.keyword} | live=${!!trends.liveContext}`)

  // ── 3. Governance Loop ─────────────────────
  let reworkDirective: string | undefined
  let finalAudit: ReturnType<typeof serializeContext>['audit'] = null

  for (let i = 0; i < ctx.maxRetries; i++) {

    const iterStart = Date.now()
    console.log(`\n── Iteration ${i + 1}/${ctx.maxRetries} ─────────────────────────`)

    // ── 3a. Build lateral context (inject rework if available) ──
    const lateralCtx = buildLateralContext(ctx, reworkDirective)

    // ── 3b. Run LateralAgent ──────────────────
    ctx = withTrace(ctx, { agent: 'LateralAgent', action: 'start', meta: { iteration: i, hasRework: !!reworkDirective } })
    const insight = await synthesizeLateralThinking(lateralCtx)
    ctx = withInsight(ctx, insight)
    console.log(`  ✓ LateralAgent done | headline: "${insight.agentDebate?.finalMasterpiece?.headline?.slice(0, 50)}"`)

    // ── 3c. Audit ─────────────────────────────
    const audit = await auditStrategicContext(ctx)
    ctx = withAudit(ctx, audit)
    finalAudit = audit

    console.log(`  ${formatAuditSummary(audit, ctx.language)}`)

    // ── 3d. Decision ──────────────────────────
    if (audit.alignmentScore >= ctx.threshold) {
      ctx = withTrace(ctx, {
        agent:  'Orchestrator',
        action: 'approve',
        durationMs: Date.now() - iterStart,
        meta:   { score: audit.alignmentScore, iteration: i },
      })
      console.log(`\n╔══ APPROVED ═══════════════════════════════`)
      console.log(`║  Score: ${(audit.alignmentScore * 100).toFixed(1)}% ≥ ${ctx.threshold * 100}% threshold`)
      console.log(`║  Iterations: ${i + 1} | Total: ${Date.now() - startMs}ms`)
      console.log(`╚═══════════════════════════════════════════\n`)
      break
    }

    if (i >= ctx.maxRetries - 1) {
      ctx = withTrace(ctx, {
        agent:  'Orchestrator',
        action: 'escalate',
        durationMs: Date.now() - iterStart,
        meta:   { score: audit.alignmentScore, reason: 'max retries reached' },
      })
      console.log(`\n╔══ ESCALATED ══════════════════════════════`)
      console.log(`║  Score: ${(audit.alignmentScore * 100).toFixed(1)}% — max retries exhausted`)
      console.log(`║  Best result returned as-is`)
      console.log(`╚═══════════════════════════════════════════\n`)
      break
    }

    // ── 3e. Prepare rework ────────────────────
    reworkDirective = audit.reworkDirective
    ctx = withTrace(ctx, {
      agent:  'Orchestrator',
      action: 'rework',
      durationMs: Date.now() - iterStart,
      meta:   { score: audit.alignmentScore, directive: reworkDirective?.slice(0, 80) },
    })
    ctx = withNextIteration(ctx)

    console.log(`  ↺ Rework triggered | Directive: "${reworkDirective?.slice(0, 80)}"`)
  }

  // ── 4. Compose result ─────────────────────
  const serialized = serializeContext(ctx)

  return {
    finalMasterpiece:  serialized.finalMasterpiece,
    visualPrompt:      serialized.visualPrompt,
    insight:           serialized.insight,
    audit:             serialized.audit,
    iterationsRun:     ctx.iteration + 1,
    verdict:           (finalAudit?.verdict === 'approved' ? 'approved' : 'escalate') as 'approved' | 'escalate',
    auditSummary:      finalAudit ? formatAuditSummary(finalAudit, ctx.language) : '',
    context:           serialized,
    tookMs:            Date.now() - startMs,
  }
}
