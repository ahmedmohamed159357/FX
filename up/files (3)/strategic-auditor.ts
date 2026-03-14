/**
 * Strategic Auditor
 *
 * Responsibility:
 *   Receive the StrategicContext (with insight populated),
 *   compare the finalMasterpiece against the original brief,
 *   the lateral thinking insights, and the trend context.
 *   Return an AuditReport with an alignmentScore (0–1).
 *
 * Scoring Model:
 *   briefCoverage      × 0.35   (most critical — did we answer the actual brief?)
 *   insightFidelity    × 0.25   (are the lateral insights reflected?)
 *   trendRelevance     × 0.20   (cultural/live moment woven in?)
 *   creativeSharpness  × 0.10   (headline/tagline not generic?)
 *   audienceMatch      × 0.10   (speaks to the stated target?)
 *
 * Loop integration:
 *   alignmentScore < threshold (0.7) → Orchestrator triggers rework
 *   reworkDirective tells LateralAgent exactly what to fix
 */

import type { StrategicContext, AuditReport, AuditDimension } from './strategic-context'

// ─────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────

function safeParseJson(text: string): any {
  try {
    const m = text.match(/\{[\s\S]*\}/)
    return m ? JSON.parse(m[0]) : JSON.parse(text)
  } catch { return null }
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, n))
}

function weightedScore(
  dims: AuditReport['dimensions']
): number {
  return clamp(
    dims.briefCoverage.score      * 0.35 +
    dims.insightFidelity.score    * 0.25 +
    dims.trendRelevance.score     * 0.20 +
    dims.creativeSharpness.score  * 0.10 +
    dims.audienceMatch.score      * 0.10
  )
}

// ─────────────────────────────────────────────
// AI AUDITOR
// Single call — model evaluates all 5 dimensions in one pass
// ─────────────────────────────────────────────

const AUDITOR_SYSTEM = `أنت المراجع الاستراتيجي (Strategic Auditor) في وكالة إبداعية نخبوية.
مهمتك: تقييم مدى توافق الـ Masterpiece الإبداعي مع الـ Brief الأصلي والـ Insights والـ Trends.
أنت صارم، دقيق، وموضوعي. درجاتك مبنية على أدلة من النص — ليس على الرأي.
أعد JSON فقط — بدون أي نص خارج الـ JSON.`

async function runAIAudit(ctx: StrategicContext, iteration: number): Promise<AuditReport | null> {
  if (!ctx.useRealAI || !ctx.provider || !ctx.insight) return null

  const mp      = ctx.insight.agentDebate?.finalMasterpiece
  const debate  = ctx.insight.agentDebate
  const trend   = ctx.trends

  if (!mp) return null

  const prompt = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 BRIEF ORIGINAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ctx.brief}

Target: ${ctx.archetype} | Language: ${ctx.language}
${ctx.brandVoice ? `Brand Voice: formal=${ctx.brandVoice.formalLevel} metaphor=${ctx.brandVoice.metaphorLevel} intensity=${ctx.brandVoice.intensity}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 LATERAL INSIGHTS GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Provocation Insight] ${ctx.insight.provocation?.creativeInsight || '—'}
[Core Metaphor] ${ctx.insight.analogies?.[0]?.metaphor || '—'}
[Paradox] ${ctx.insight.oppositeThinking?.paradox || '—'}
[Random Stimulus Angle] ${ctx.insight.randomStimulus?.unexpectedAngle || '—'}
[Synthesized Insight] ${ctx.insight.synthesizedInsight?.slice(0, 200) || '—'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 TREND CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${trend ? `Primary trend: "${trend.primary.keyword}" | Charge: ${trend.primary.emotionalCharge}` : 'No trend data'}
${trend?.liveContext ? `Live headline: "${trend.liveContext.topHeadline}"` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 MASTERPIECE TO AUDIT  (Iteration ${iteration})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Headline:       ${mp.headline}
Tagline:        ${mp.tagline}
Core Idea:      ${mp.coreIdea}
Emotional Truth: ${mp.emotionalTruth}
Creative Device: ${mp.creativeDevice}
Visual Notes:   ${mp.visualNotes}

Debate Summary: ${debate?.debateSummary || '—'}
Trend Connection: ${debate?.trendConnection || '—'}
Live Event Used: ${debate?.liveEventUsed || '—'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDIT TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Evaluate each dimension on a scale of 0.0 to 1.0.
Be strict: 0.9+ = exceptional, 0.7–0.89 = solid, 0.5–0.69 = needs work, below 0.5 = fail.

Return ONLY this JSON:
{
  "dimensions": {
    "briefCoverage": {
      "score": 0.0,
      "rationale": "...",
      "flags": ["..."]
    },
    "insightFidelity": {
      "score": 0.0,
      "rationale": "...",
      "flags": ["..."]
    },
    "trendRelevance": {
      "score": 0.0,
      "rationale": "...",
      "flags": ["..."]
    },
    "creativeSharpness": {
      "score": 0.0,
      "rationale": "...",
      "flags": ["..."]
    },
    "audienceMatch": {
      "score": 0.0,
      "rationale": "...",
      "flags": ["..."]
    }
  },
  "strengths": ["up to 3 things to preserve"],
  "gaps": ["specific issues to fix — be concrete"],
  "reworkDirective": "one precise instruction for the next iteration (what to change and why)"
}`

  try {
    const res    = await ctx.provider.generateCreativeText(prompt, AUDITOR_SYSTEM, ctx.providerConfig)
    const parsed = safeParseJson(res.text)

    if (parsed?.dimensions?.briefCoverage) {
      const dims = parsed.dimensions as AuditReport['dimensions']
      const score = weightedScore(dims)
      const verdict: AuditReport['verdict'] =
        score >= ctx.threshold    ? 'approved' :
        ctx.iteration >= ctx.maxRetries - 1 ? 'escalate' :
        'rework'

      return {
        alignmentScore:  score,
        dimensions:      dims,
        verdict,
        reworkDirective: parsed.reworkDirective || 'Improve alignment between brief and creative output.',
        strengths:       parsed.strengths || [],
        gaps:            parsed.gaps || [],
        iteration,
        auditedAt:       new Date().toISOString(),
        auditorMode:     'ai',
      }
    }
  } catch (err) {
    console.warn('[Auditor] AI audit failed:', (err as any).message)
  }

  return null
}

// ─────────────────────────────────────────────
// MOCK AUDITOR  — heuristic scoring (no API call)
// Fast, deterministic, always works.
// Used as fallback when AI is unavailable.
// ─────────────────────────────────────────────

function runMockAudit(ctx: StrategicContext, iteration: number): AuditReport {
  const mp     = ctx.insight?.agentDebate?.finalMasterpiece
  const debate = ctx.insight?.agentDebate
  const trend  = ctx.trends
  const brief  = ctx.brief.toLowerCase()

  // ── Brief Coverage ────────────────────────
  // Check: does the masterpiece reference domain words from the brief?
  const briefWords    = brief.split(/\s+/).filter(w => w.length > 4)
  const masterpieceText = [
    mp?.headline, mp?.tagline, mp?.coreIdea, mp?.emotionalTruth
  ].join(' ').toLowerCase()

  const matchedWords  = briefWords.filter(w => masterpieceText.includes(w)).length
  const coverageScore = clamp(0.5 + (matchedWords / Math.max(briefWords.length, 1)) * 0.5)
  const coverageFlags: string[] = coverageScore < 0.6
    ? ['Masterpiece language is too generic — does not reflect brief specifics']
    : []

  // ── Insight Fidelity ──────────────────────
  // Check: are lateral thinking terms in the coreIdea/emotionalTruth?
  const metaphor  = ctx.insight?.analogies?.[0]?.metaphor || ''
  const paradox   = ctx.insight?.oppositeThinking?.paradox || ''
  const hasMeta   = metaphor && masterpieceText.includes(metaphor.toLowerCase().slice(0, 8))
  const hasParadox = paradox  && masterpieceText.includes(paradox.toLowerCase().slice(0, 10))
  const insightScore = clamp(0.45 + (hasMeta ? 0.3 : 0) + (hasParadox ? 0.25 : 0))
  const insightFlags: string[] = insightScore < 0.6
    ? ['Core metaphor or paradox not reflected in the Masterpiece']
    : []

  // ── Trend Relevance ───────────────────────
  const trendKeyword   = (trend?.primary.keyword || '').toLowerCase()
  const trendConnection = debate?.trendConnection || ''
  const hasTrend = trendKeyword && (masterpieceText.includes(trendKeyword) || trendConnection.length > 20)
  const liveUsed = !!debate?.liveEventUsed
  const trendScore = clamp(0.4 + (hasTrend ? 0.35 : 0) + (liveUsed ? 0.25 : 0))
  const trendFlags: string[] = trendScore < 0.6
    ? ['Trend context not visible in the final creative output']
    : []

  // ── Creative Sharpness ────────────────────
  // Penalise generic phrases
  const genericPhrases = [
    'مش مجرد', 'not just', 'اختيار', 'choice', 'transformation',
    'this is the moment', 'human moment', 'ده قرار'
  ]
  const genericCount = genericPhrases.filter(p =>
    masterpieceText.includes(p.toLowerCase())
  ).length
  const sharpnessScore = clamp(0.85 - genericCount * 0.08 + (iteration > 0 ? 0.05 : 0))
  const sharpnessFlags: string[] = sharpnessScore < 0.65
    ? ['Headline/tagline contains generic creative phrases — needs a sharper angle']
    : []

  // ── Audience Match ────────────────────────
  // Simple check: archetype keywords present in tone/device?
  const archetypeWords: Record<string, string[]> = {
    'The Outlaw':   ['تمرد','كسر','مختلف','rebel','break','disrupt'],
    'The Hero':     ['شجاعة','إنجاز','hero','courage','victory'],
    'The Sage':     ['حكمة','تحليل','wisdom','insight','clarity'],
    'The Lover':    ['حب','قرب','love','intimate','warmth'],
    'The Ruler':    ['سيطرة','قوة','authority','power','luxury'],
    'The Creator':  ['إبداع','ابتكار','create','invent','original'],
    'The Everyman': ['ناس','بسيط','everyday','people','authentic'],
  }
  const arcWords   = archetypeWords[ctx.archetype] || []
  const arcMatches = arcWords.filter(w => masterpieceText.includes(w)).length
  const audienceScore = clamp(0.5 + (arcMatches / Math.max(arcWords.length, 1)) * 0.5)
  const audienceFlags: string[] = audienceScore < 0.55
    ? [`Tone doesn't match "${ctx.archetype}" archetype persona`]
    : []

  const dims: AuditReport['dimensions'] = {
    briefCoverage:    { score: coverageScore,  rationale: `${matchedWords} brief terms reflected`, flags: coverageFlags },
    insightFidelity:  { score: insightScore,   rationale: `Metaphor present: ${hasMeta}, Paradox: ${hasParadox}`, flags: insightFlags },
    trendRelevance:   { score: trendScore,     rationale: `Trend visible: ${hasTrend}, Live event: ${liveUsed}`, flags: trendFlags },
    creativeSharpness: { score: sharpnessScore, rationale: `${genericCount} generic phrases detected`, flags: sharpnessFlags },
    audienceMatch:    { score: audienceScore,  rationale: `${arcMatches}/${arcWords.length} archetype signals`, flags: audienceFlags },
  }

  const alignmentScore = weightedScore(dims)

  // Rework directive — target the weakest dimension
  const ranked = Object.entries(dims).sort(([, a], [, b]) => a.score - b.score)
  const weakest = ranked[0]
  const reworkMap: Record<string, string> = {
    briefCoverage:    `اربط الـ Headline والـ Tagline بـ "${ctx.brief.slice(0, 40)}" بشكل أوضح — الـ Masterpiece الحالي عام جداً`,
    insightFidelity:  `أدمج الاستعارة "${metaphor.slice(0, 30)}" أو التناقض "${paradox.slice(0, 30)}" بشكل مباشر في الـ Headline`,
    trendRelevance:   `اجعل التريند "${trend?.primary.keyword || '—'}" جزءاً من الـ Core Idea — مش مجرد حقل trendConnection`,
    creativeSharpness:`استبدل العبارات العامة بزاوية حادة ومحددة — تجنب: "اختيار / transformation / human moment"`,
    audienceMatch:    `عدّل النبرة لتتوافق مع شخصية "${ctx.archetype}" — أضف مؤشرات لغوية مناسبة`,
  }

  const reworkDirective = reworkMap[weakest[0]] || 'أعد تطوير الـ Masterpiece مع التركيز على الأضعف'

  const verdict: AuditReport['verdict'] =
    alignmentScore >= ctx.threshold               ? 'approved' :
    iteration >= ctx.maxRetries - 1              ? 'escalate' :
    'rework'

  // Collect all flags and strengths
  const allFlags = Object.values(dims).flatMap(d => d.flags)
  const strengths = [
    debate?.trendConnection ? `تضمين تريند "${trend?.primary.keyword}"` : null,
    hasMeta ? `الاستعارة "${metaphor.slice(0, 25)}" حاضرة` : null,
    debate?.liveEventUsed ? 'الخبر الحقيقي موظّف' : null,
    alignmentScore > 0.6 ? 'البنية الأساسية سليمة' : null,
  ].filter(Boolean) as string[]

  return {
    alignmentScore,
    dimensions: dims,
    verdict,
    reworkDirective,
    strengths,
    gaps: allFlags,
    iteration,
    auditedAt:   new Date().toISOString(),
    auditorMode: 'mock',
  }
}

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────

export async function auditStrategicContext(
  ctx: StrategicContext
): Promise<AuditReport> {

  if (!ctx.insight?.agentDebate?.finalMasterpiece) {
    // No masterpiece to audit — return a pass-through
    return {
      alignmentScore:  0,
      dimensions: {
        briefCoverage:    { score: 0, rationale: 'No masterpiece generated', flags: ['Missing output'] },
        insightFidelity:  { score: 0, rationale: 'No masterpiece generated', flags: [] },
        trendRelevance:   { score: 0, rationale: 'No masterpiece generated', flags: [] },
        creativeSharpness: { score: 0, rationale: 'No masterpiece generated', flags: [] },
        audienceMatch:    { score: 0, rationale: 'No masterpiece generated', flags: [] },
      },
      verdict:         'rework',
      reworkDirective: 'Pipeline did not produce a finalMasterpiece — retry from scratch',
      strengths:       [],
      gaps:            ['No output to evaluate'],
      iteration:       ctx.iteration,
      auditedAt:       new Date().toISOString(),
      auditorMode:     'mock',
    }
  }

  // Try AI audit first — fall back to mock
  const aiResult = await runAIAudit(ctx, ctx.iteration)
  const report   = aiResult ?? runMockAudit(ctx, ctx.iteration)

  console.log(
    `[Auditor] iter=${ctx.iteration} | score=${report.alignmentScore.toFixed(2)} | ` +
    `verdict=${report.verdict} | mode=${report.auditorMode}`
  )

  return report
}

// ─────────────────────────────────────────────
// FORMAT HELPERS  — for logging / UI
// ─────────────────────────────────────────────

export function formatAuditSummary(audit: AuditReport, language: 'en' | 'ar' = 'ar'): string {
  const pct   = Math.round(audit.alignmentScore * 100)
  const emoji = pct >= 70 ? '✅' : pct >= 50 ? '⚠️' : '❌'

  if (language === 'ar') {
    return [
      `${emoji} نتيجة المراجعة: ${pct}% (${audit.verdict === 'approved' ? 'مُعتمد' : audit.verdict === 'rework' ? 'يحتاج تطوير' : 'يحتاج تصعيد'})`,
      `📊 التغطية: ${Math.round(audit.dimensions.briefCoverage.score * 100)}% | الإبداع: ${Math.round(audit.dimensions.insightFidelity.score * 100)}% | التريند: ${Math.round(audit.dimensions.trendRelevance.score * 100)}%`,
      audit.verdict !== 'approved' ? `🎯 التوجيه: ${audit.reworkDirective}` : '',
    ].filter(Boolean).join('\n')
  }

  return [
    `${emoji} Audit Score: ${pct}% (${audit.verdict})`,
    `📊 Brief: ${Math.round(audit.dimensions.briefCoverage.score * 100)}% | Insight: ${Math.round(audit.dimensions.insightFidelity.score * 100)}% | Trend: ${Math.round(audit.dimensions.trendRelevance.score * 100)}%`,
    audit.verdict !== 'approved' ? `🎯 Directive: ${audit.reworkDirective}` : '',
  ].filter(Boolean).join('\n')
}
