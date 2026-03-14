/**
 * StrategicContext — Unified Immutable Context
 *
 * This is the single source of truth that flows through every agent.
 * Pattern: each agent receives ctx, returns { ...ctx, newLayer }
 * Never mutate ctx directly — always spread and extend.
 *
 * Traceability is built in: every agent appends to ctx.trace
 * and every loop iteration is stamped in ctx.iteration.
 */

import type { TrendBundle }          from './trend-service'
import type { LateralThinkingOutput } from './lateral-thinking-agent'

// ─────────────────────────────────────────────
// TRACE  — immutable execution log
// ─────────────────────────────────────────────

export interface TraceEntry {
  agent:     string                        // e.g. "LateralAgent", "Auditor", "Orchestrator"
  action:    string                        // e.g. "synthesize", "audit", "rework"
  timestamp: string                        // ISO string
  durationMs?: number
  meta?:     Record<string, unknown>       // arbitrary agent-specific data
}

// ─────────────────────────────────────────────
// AUDIT REPORT  — output of StrategicAuditor
// ─────────────────────────────────────────────

export interface AuditDimension {
  score:    number     // 0.0 – 1.0
  rationale: string    // why this score
  flags:    string[]   // specific issues found
}

export interface AuditReport {
  // Composite score — drives the loop controller
  alignmentScore:  number   // 0.0 – 1.0 (weighted average of dimensions)

  // Dimensional breakdown
  dimensions: {
    briefCoverage:    AuditDimension   // does the masterpiece address the original brief?
    insightFidelity:  AuditDimension   // are lateral insights reflected?
    trendRelevance:   AuditDimension   // is the cultural moment woven in?
    creativeSharpness: AuditDimension  // headline/tagline quality vs generic output?
    audienceMatch:    AuditDimension   // does it speak to the target?
  }

  // Actionable output
  verdict:         'approved' | 'rework' | 'escalate'
  reworkDirective: string   // specific instruction for the next iteration
  strengths:       string[] // what to preserve in the rework
  gaps:            string[] // what to fix

  // Meta
  iteration:  number
  auditedAt:  string
  auditorMode: 'ai' | 'mock'
}

// ─────────────────────────────────────────────
// STRATEGIC CONTEXT  — the single immutable object
// ─────────────────────────────────────────────

export interface StrategicContext {
  // ── Input ──────────────────────────────────
  readonly brief:      string
  readonly archetype:  string
  readonly language:   'en' | 'ar'
  readonly region:     string
  readonly brandVoice?: {
    formalLevel:   number
    metaphorLevel: number
    intensity:     number
  }

  // ── Provider (resolved once, reused) ──────
  readonly provider:       any
  readonly providerConfig: any
  readonly useRealAI:      boolean

  // ── Intelligence Layers ───────────────────
  // Each layer is optional — gets populated as pipeline progresses
  readonly trends?:  TrendBundle
  readonly insight?: LateralThinkingOutput
  readonly audit?:   AuditReport

  // ── Orchestration State ───────────────────
  readonly iteration:  number     // 0-based: 0 = first run, 1 = first rework, 2 = final
  readonly maxRetries: number     // default: 2
  readonly threshold:  number     // default: 0.7

  // ── Immutable Trace ───────────────────────
  readonly trace: TraceEntry[]
}

// ─────────────────────────────────────────────
// FACTORY  — creates the initial context
// ─────────────────────────────────────────────

export function createStrategicContext(
  params: {
    brief:       string
    archetype?:  string
    language?:   'en' | 'ar'
    region?:     string
    brandVoice?: StrategicContext['brandVoice']
    provider:    any
    providerConfig: any
    useRealAI:   boolean
    maxRetries?: number
    threshold?:  number
  }
): StrategicContext {
  return {
    brief:         params.brief,
    archetype:     params.archetype  || 'The Sage',
    language:      params.language   || 'ar',
    region:        params.region     || process.env.TRENDS_REGION || 'EG',
    brandVoice:    params.brandVoice,
    provider:      params.provider,
    providerConfig: params.providerConfig,
    useRealAI:     params.useRealAI,
    iteration:     0,
    maxRetries:    params.maxRetries ?? 2,
    threshold:     params.threshold  ?? 0.7,
    trace: [{
      agent:     'Orchestrator',
      action:    'init',
      timestamp: new Date().toISOString(),
      meta:      { brief: params.brief.slice(0, 60), archetype: params.archetype },
    }],
  }
}

// ─────────────────────────────────────────────
// HELPERS  — pure context transformers
// ─────────────────────────────────────────────

/** Append a trace entry — returns a new context */
export function withTrace(
  ctx: StrategicContext,
  entry: Omit<TraceEntry, 'timestamp'>
): StrategicContext {
  return {
    ...ctx,
    trace: [
      ...ctx.trace,
      { ...entry, timestamp: new Date().toISOString() },
    ],
  }
}

/** Bump the iteration counter */
export function withNextIteration(ctx: StrategicContext): StrategicContext {
  return { ...ctx, iteration: ctx.iteration + 1 }
}

/** Attach trends layer */
export function withTrends(ctx: StrategicContext, trends: TrendBundle): StrategicContext {
  return withTrace({ ...ctx, trends }, {
    agent:  'TrendService',
    action: 'trends-resolved',
    meta:   { trend: trends.primary.keyword, source: trends.source, live: !!trends.liveContext },
  })
}

/** Attach insight layer */
export function withInsight(ctx: StrategicContext, insight: LateralThinkingOutput): StrategicContext {
  return withTrace({ ...ctx, insight }, {
    agent:  'LateralAgent',
    action: 'insight-generated',
    meta:   {
      iteration:  ctx.iteration,
      hasDebate:  !!insight.agentDebate,
      headline:   insight.agentDebate?.finalMasterpiece?.headline?.slice(0, 50),
    },
  })
}

/** Attach audit layer */
export function withAudit(ctx: StrategicContext, audit: AuditReport): StrategicContext {
  return withTrace({ ...ctx, audit }, {
    agent:  'Auditor',
    action: 'audit-complete',
    meta:   {
      iteration:      audit.iteration,
      alignmentScore: audit.alignmentScore,
      verdict:        audit.verdict,
    },
  })
}

/** Serialise the full context for API responses */
export function serializeContext(ctx: StrategicContext) {
  return {
    brief:     ctx.brief,
    archetype: ctx.archetype,
    language:  ctx.language,
    region:    ctx.region,
    iteration: ctx.iteration,
    trends:    ctx.trends
      ? { primary: ctx.trends.primary.keyword, source: ctx.trends.source, live: !!ctx.trends.liveContext }
      : null,
    insight:   ctx.insight  ?? null,
    audit:     ctx.audit    ?? null,
    trace:     ctx.trace,
    finalMasterpiece: ctx.insight?.agentDebate?.finalMasterpiece ?? null,
    visualPrompt:     ctx.insight?.visualPrompt ?? null,
  }
}
