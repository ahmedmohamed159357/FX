import { LateralThinkingContext, getLateralThinkingSystemPrompt } from './lateral-thinking-agent'
import { generateVisualPrompt, formatForMidjourney, VisualPrompt, ConceptInput } from './visual-prompt-generator'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ScriptOutput {
  script: string
  beats: string[]
  cameraLanguage: string
  narrativeStrategy: string
  emotionalTurning: string
  lateralThinkingTechniques: string[]
  // ── NEW ──
  visualPrompt: VisualPrompt
  midjourneyReady: string   // one-line copy-paste string for Midjourney
}

// ─────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────

function safeParseJson(text: string): any {
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    return JSON.parse(text)
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────

export async function writeScript(
  concept: any,
  context?: LateralThinkingContext
): Promise<ScriptOutput> {

  const conceptTitle: string = concept?.title || 'Creative Concept'
  const tagline: string      = concept?.tagline || 'The moment counts'
  const coreIdea: string     = concept?.coreIdea || 'Core strategy'

  const conceptInput: ConceptInput = {
    title: conceptTitle,
    tagline,
    coreIdea,
    visualNotes: concept?.visualNotes,
    emotionalArc: concept?.emotionalArc,
    targetParadox: concept?.targetParadox
  }

  // ── Run script writing + visual prompt in parallel ──
  const [scriptResult, visualPrompt] = await Promise.all([
    generateScriptContent(conceptInput, context),
    generateVisualPrompt(conceptInput, context)
  ])

  return {
    ...scriptResult,
    visualPrompt,
    midjourneyReady: formatForMidjourney(visualPrompt)
  }
}

// ─────────────────────────────────────────────
// SCRIPT GENERATION
// ─────────────────────────────────────────────

async function generateScriptContent(
  concept: ConceptInput,
  context?: LateralThinkingContext
): Promise<Omit<ScriptOutput, 'visualPrompt' | 'midjourneyReady'>> {

  if (context?.useRealAI && context.provider) {

    const prompt = `Concept: ${concept.title}
Tagline: ${concept.tagline}
Core Idea: ${concept.coreIdea}
Visual Notes: ${concept.visualNotes || ''}
Emotional Arc: ${concept.emotionalArc || ''}

Task: Write a 30-second emotional screenplay.
Structure:
  - Beat 1 (Recognition): The audience sees themselves
  - Beat 2 (Surrender): The emotional pivot point
  - Beat 3 (Arrival): Resolution with brand truth

Return JSON:
{
  "script": "full formatted screenplay...",
  "beats": ["beat 1 description", "beat 2 description", "beat 3 description"],
  "cameraLanguage": "...",
  "narrativeStrategy": "...",
  "emotionalTurning": "..."
}`

    try {
      const response = await context.provider.generateCreativeText(
        prompt,
        getLateralThinkingSystemPrompt(context) +
          '\n\nSpecific Task: Write a cinematic 30-second script. Focus on emotion, pacing, and visual storytelling. No clichés.',
        context.providerConfig
      )

      const parsed = safeParseJson(response.text)

      if (parsed?.script) {
        return {
          ...parsed,
          lateralThinkingTechniques: ['3-Beat emotional arc', 'Narrative subversion']
        }
      }
    } catch (err) {
      console.warn('[writeScript] AI generation failed, using fallback:', err)
    }
  }

  // ── Fallback Template ──
  return buildFallbackScript(concept)
}

// ─────────────────────────────────────────────
// FALLBACK SCRIPT TEMPLATE
// ─────────────────────────────────────────────

function buildFallbackScript(
  concept: ConceptInput
): Omit<ScriptOutput, 'visualPrompt' | 'midjourneyReady'> {

  const title = concept.title.toUpperCase()

  return {
    script: `SCENE 1: THE DISCOVERY

We open on a world of noise. Tension. The pace is unbearable.

Then, we see it. ${concept.title}. A silent anchor in the chaos.

BEAT 1: RECOGNITION
The protagonist stops. Camera lingers on the detail others miss.

BEAT 2: THE SHIFT
A deep breath. A decision made in silence.
Visual tone shifts: cold steel → warm gold.

BEAT 3: ARRIVAL
Final frame: Absolute clarity.

NARRATOR (V.O.)
${concept.tagline}

LOGO: ${title}`,

    beats: [
      'The world stops for a second.',
      'A choice is made between the loud and the true.',
      'Clarity settles in like light through fog.'
    ],
    cameraLanguage: 'Cinematic wide shots transitioning to intimate textural macros.',
    narrativeStrategy: 'Visual silence as a premium differentiator.',
    emotionalTurning: 'Chaos → Connection → Clarity',
    lateralThinkingTechniques: ['Template Scripting']
  }
}
