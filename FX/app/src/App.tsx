import React, { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'

interface InsightData {
  mainInsight: string
  lateralThinkingBreakdown: {
    provocation: {
      provocation: string
      reversal: string
      opportunity: string
    }
    analogies: {
      sourceField: string
      metaphor: string
    }[]
    randomStimulus: {
      randomWord: string
      unexpectedAngle: string
      visualMetaphor: string
    }
    oppositeThinking: {
      desirableMiddle: string
      paradox: string
    }
  }
  constraints: string[]
  opportunities: string[]
  metaphoricFraming: string
  emotionalTruth: string
  creativeMethod: string
}

interface ConceptData {
  title: string
  tagline: string
  coreIdea: string
  visualNotes: string
  creativeDevice: string
  emotionalArc: string
  targetParadox: string
}

interface ScriptData {
  script: string
  beats: string[]
  cameraLanguage: string
  narrativeStrategy: string
  emotionalTurning: string
}

type Iteration = {
  timestamp: number
  brief: string
  archetype: string
  brandVoice: { formalLevel: number; metaphorLevel: number; intensity: number }
  language: 'en' | 'ar'
  insight: InsightData | null
  concept: ConceptData | null
  script: ScriptData | null
}

const TRANSLATIONS = {
  en: {
    title: "TEXTFX",
    tagline: "The Elite Creative Director for Lateral Thinking & Copywriting",
    light: "Light",
    dark: "Dark",
    savedIterations: "Archive",
    latest: "Latest",
    comparing: "Comparing:",
    clear: "Clear",
    brandPersonality: "Brand Soul & Archetype",
    tone: "Tone Scale",
    languageStyle: "Metaphorical Scale",
    intensity: "Intensity",
    briefTitle: "The Brief (Creative Input)",
    briefPlaceholder: "Establish the product, the human tension, and the goal of this manifestation...",
    generateBtn: "Ignite Insight",
    thinking: "Deep Processing...",
    writing: "Manifesting Copy...",
    insightTitle: "Strategic Insight",
    method: "Method",
    convertBtn: "Evolve to Concept",
    conceptTitle: "Creative Conception",
    creativeDevice: "Strategic Device",
    emotionalArc: "The Arc",
    visualNotes: "Atmospheric Notes",
    targetParadox: "Paradox Locked",
    writeScriptBtn: "Manifest Script",
    scriptTitle: "Cinematic Manifestation",
    emotionalBeats: "Emotional Beats",
    cameraLanguage: "Visual Aesthetics",
    narrativeStrategy: "Narrative Logic",
    copyScript: "Copy Script",
    exportPdf: "Export Masterpiece",
    formal: "Formal",
    casual: "Casual",
    balanced: "Balanced",
    metaphorical: "Metaphorical",
    literal: "Literal",
    mixed: "Mixed",
    high: "High",
    subtle: "Subtle",
    standard: "Standard",
    ConstraintReversal: { title: "Constraint Reversal", desc: "Invert limitations into assets." },
    MetaphorMining: { title: "Metaphor Mining", desc: "Extract symbols to reframe reality." },
    TensionMapping: { title: "Tension Mapping", desc: "Expose the conflict that fuels desire." },
    RandomStimulus: { title: "Random Stimulus", desc: "Bridge disconnected worlds." },
    OppositeThinking: { title: "Opposite Thinking", desc: "Discover truth in the extremes." },
    reversals: "Logic Inversions",
    metaphors: "Symbolic Links",
    tensions: "Conflict Paths",
  },
  ar: {
    title: "TEXTFX",
    tagline: "المحرك الإبداعي النخبوي للتفكير الجانبي وصناعة المحتوى",
    light: "نهاري",
    dark: "ليلي",
    savedIterations: "الأرشيف الإبداعي",
    latest: "الأحدث",
    comparing: "مقارنة:",
    clear: "مسح",
    brandPersonality: "روح العلامة والشخصية",
    tone: "مقياس النبرة",
    languageStyle: "مقياس المجاز",
    intensity: "الحدة",
    briefTitle: "الملخص الإبداعي (المدخلات)",
    briefPlaceholder: "حدد المنتج، التوتر الإنساني، والهدف من هذا التجلي الإبداعي...",
    generateBtn: "إشعال البصيرة",
    thinking: "جاري المعالجة العميقة...",
    writing: "جاري تجلي النص...",
    insightTitle: "البصيرة الاستراتيجية",
    method: "المنهجية",
    convertBtn: "تطوير إلى مفهوم",
    conceptTitle: "التصور الإبداعي",
    creativeDevice: "الأداة الاستراتيجية",
    emotionalArc: "المسار العاطفي",
    visualNotes: "ملاحظات الأجواء",
    targetParadox: "المفارقة المركزية",
    writeScriptBtn: "تحويل لسيناريو",
    scriptTitle: "التجلي السينمائي",
    emotionalBeats: "النبضات العاطفية",
    cameraLanguage: "الجماليات البصرية",
    narrativeStrategy: "المنطق السردي",
    copyScript: "نسخ النص",
    exportPdf: "تصدير العمل",
    formal: "رسمي",
    casual: "عفوي",
    balanced: "متوازن",
    metaphorical: "مجازي",
    literal: "حرفي",
    mixed: "مختلط",
    high: "مرتفع",
    subtle: "هادئ",
    standard: "قياسي",
    ConstraintReversal: { title: "عكس القيود", desc: "تحويل العوائق إلى أصول إبداعية." },
    MetaphorMining: { title: "تعدين المجاز", desc: "استخراج الرموز لإعادة تعريف الواقع." },
    TensionMapping: { title: "خريطة التوتر", desc: "كشف الصراع الذي يغذي الرغبة." },
    RandomStimulus: { title: "المحفز العشوائي", desc: "جسور بين عوالم غير مترابطة." },
    OppositeThinking: { title: "التفكير العكسي", desc: "اكتشاف الحقيقة في الأطراف." },
    reversals: "انقلابات المنطق",
    metaphors: "الروابط الرمزية",
    tensions: "مسارات الصراع",
  }
}

export default function App() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4002"
  const [brief, setBrief] = useState('')
  const [insight, setInsight] = useState<InsightData | null>(null)
  const [concept, setConcept] = useState<ConceptData | null>(null)
  const [script, setScript] = useState<ScriptData | null>(null)
  const [loading, setLoading] = useState(false)
  const [iterations, setIterations] = useState<Iteration[]>([])
  const [dark, setDark] = useState(true)

  const [language, setLanguage] = useState<'en' | 'ar'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('textfx_language') as 'en' | 'ar') || 'en'
    }
    return 'en'
  })

  const t = TRANSLATIONS[language]
  const isRtl = language === 'ar'

  const [archetype, setArchetype] = useState('The Sage')
  const [formalLevel, setFormalLevel] = useState(5)
  const [metaphorLevel, setMetaphorLevel] = useState(5)
  const [intensity, setIntensity] = useState(5)

  const archetypes = [
    { name: 'The Outlaw', nameAr: 'المتمرد', icon: '💀', desc: 'Rebellious, wild, rule-breaking', descAr: 'متمرد، جامح، يكسر القواعد' },
    { name: 'The Magician', nameAr: 'الساحر', icon: '✨', desc: 'Visionary, transformative', descAr: 'رؤيوي، تحويلي' },
    { name: 'The Hero', nameAr: 'البطل', icon: '🛡️', desc: 'Courageous, masterful', descAr: 'شجاع، متمكن' },
    { name: 'The Lover', nameAr: 'المحب', icon: '❤️', desc: 'Intimate, passionate', descAr: 'حميمي، شغوف' },
    { name: 'The Jester', nameAr: 'المهرج', icon: '🤡', desc: 'Playful, disruptive', descAr: 'مرح، متمرد' },
    { name: 'The Everyman', nameAr: 'الإنسان العادي', icon: '🤝', desc: 'Reliable, connected', descAr: 'موثوق، مرتبط بالناس' },
    { name: 'The Caregiver', nameAr: 'الراعي', icon: '🤲', desc: 'Nurturing, protective', descAr: 'حاضن، حامي' },
    { name: 'The Ruler', nameAr: 'الحاكم', icon: '👑', desc: 'Authoritative, stable', descAr: 'سلطوي، مستقر' },
    { name: 'The Creator', nameAr: 'المبدع', icon: '🎨', desc: 'Innovative, original', descAr: 'مبتكر، أصيل' },
    { name: 'The Innocent', nameAr: 'البريء', icon: '☀️', desc: 'Optimistic, pure', descAr: 'متفائل، نقي' },
    { name: 'The Sage', nameAr: 'الحكيم', icon: '🧠', desc: 'Wise, analytical', descAr: 'حكيم، تحليلي' },
    { name: 'The Explorer', nameAr: 'المستكشف', icon: '🧭', desc: 'Adventurous, free', descAr: 'مغامر، حر' }
  ]

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    localStorage.setItem('textfx_language', language)
  }, [language, isRtl])

  useEffect(() => {
    const saved = localStorage.getItem('textfx_iterations')
    if (saved) {
      try { setIterations(JSON.parse(saved)) } catch { }
    }
  }, [])

  const generateInsight = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, archetype, language, brandVoice: { formalLevel, metaphorLevel, intensity } })
      })
      setInsight(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const convertConcept = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/concept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insight, archetype, language, brandVoice: { formalLevel, metaphorLevel, intensity } })
      })
      setConcept(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const writeScript = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, archetype, language, brandVoice: { formalLevel, metaphorLevel, intensity } })
      })
      const data = await res.json()
      setScript(data)
      const newIter = { timestamp: Date.now(), brief, archetype, language, brandVoice: { formalLevel, metaphorLevel, intensity }, insight, concept, script: data }
      const updated = [newIter, ...iterations].slice(0, 10)
      setIterations(updated)
      localStorage.setItem('textfx_iterations', JSON.stringify(updated))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleExport = () => {
    const doc = new jsPDF()
    doc.text(`TextFX Export - ${new Date().toLocaleDateString()}`, 10, 10)
    doc.text(brief, 10, 20)
    if (script) doc.text(script.script, 10, 40)
    doc.save('textfx-masterpiece.pdf')
  }

  return (
    <div className={`container ${isRtl ? 'rtl' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="header">
        <h1>{t.title}</h1>
        <p className="tagline">{t.tagline}</p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40 }}>
          <button className="btn btn-secondary" onClick={() => setLanguage(l => l === 'en' ? 'ar' : 'en')}>
            {language === 'en' ? '🇺🇸 ENGLISH' : '🇸🇦 العربية'}
          </button>
          <button className="btn btn-secondary" onClick={() => setDark(!dark)}>
            {dark ? 'NEBULA DARK' : 'NEBULA LIGHT'}
          </button>
        </div>
      </header>

      <div className="stage-container">
        {/* STAGE 1: IDENTITY */}
        <section>
          <div className="stage-header">
            <span className="stage-number">01</span>
            <h2 className="stage-title">{t.brandPersonality}</h2>
          </div>
          <div className="pane">
            <div className="archetype-grid">
              {archetypes.map(a => (
                <div key={a.name} className={`archetype-card ${archetype === a.name ? 'active' : ''}`} onClick={() => setArchetype(a.name)}>
                  <span className="icon">{a.icon}</span>
                  <span className="name">{isRtl ? a.nameAr : a.name}</span>
                  <span className="desc">{isRtl ? a.descAr : a.desc}</span>
                </div>
              ))}
            </div>

            <div className="voice-controls" style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 40 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
                <div className="control">
                  <label>{t.tone}: <span style={{ color: 'var(--primary)' }}>{formalLevel > 7 ? t.formal : formalLevel < 3 ? t.casual : t.balanced}</span></label>
                  <input type="range" min="0" max="10" value={formalLevel} onChange={e => setFormalLevel(parseInt(e.target.value))} />
                </div>
                <div className="control">
                  <label>{t.languageStyle}: <span style={{ color: 'var(--primary)' }}>{metaphorLevel > 7 ? t.metaphorical : metaphorLevel < 3 ? t.literal : t.mixed}</span></label>
                  <input type="range" min="0" max="10" value={metaphorLevel} onChange={e => setMetaphorLevel(parseInt(e.target.value))} />
                </div>
                <div className="control">
                  <label>{t.intensity}: <span style={{ color: 'var(--primary)' }}>{intensity > 7 ? t.high : intensity < 3 ? t.subtle : t.standard}</span></label>
                  <input type="range" min="0" max="10" value={intensity} onChange={e => setIntensity(parseInt(e.target.value))} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STAGE 2: DRAFTING */}
        <section>
          <div className="stage-header">
            <span className="stage-number">02</span>
            <h2 className="stage-title">{t.briefTitle}</h2>
          </div>
          <div className="pane">
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={t.briefPlaceholder}
              className="input"
              dir="auto"
              style={{ marginBottom: 32 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={generateInsight} disabled={!brief || loading} className="btn btn-primary" style={{ minWidth: 240 }}>
                {loading ? t.thinking : t.generateBtn}
              </button>
            </div>
          </div>
        </section>

        {/* STAGE 3: STRATEGY */}
        {insight && (
          <section>
            <div className="stage-header">
              <span className="stage-number">03</span>
              <h2 className="stage-title">{t.insightTitle}</h2>
            </div>
            <div className="pane">
              <div className="insight-core">{insight.mainInsight}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                <div className="technique">
                  <h3>{t.reversals}</h3>
                  <ul><li>{insight.lateralThinkingBreakdown?.provocation?.reversal}</li></ul>
                </div>
                <div className="technique">
                  <h3>{t.metaphors}</h3>
                  <ul>{insight.lateralThinkingBreakdown?.analogies?.map((a, i) => (
                    <li key={i}>{a.metaphor}</li>
                  ))}</ul>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40 }}>
                <button onClick={convertConcept} disabled={loading} className="btn btn-primary" style={{ minWidth: 240, background: 'var(--secondary)' }}>
                  {loading ? t.thinking : t.convertBtn}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STAGE 4: CONCEPTION */}
        {concept && (
          <section>
            <div className="stage-header">
              <span className="stage-number">04</span>
              <h2 className="stage-title">{t.conceptTitle}</h2>
            </div>
            <div className="pane">
              <h3 style={{ fontSize: '2.5rem', margin: '0 0 8px 0', fontFamily: 'Outfit' }}>{concept.title}</h3>
              <p className="tagline" style={{ fontSize: '1.4rem', color: 'var(--secondary)', marginBottom: 40 }}>"{concept.tagline}"</p>
              <div style={{ padding: 32, background: 'rgba(2,6,23,0.4)', borderRadius: 16, marginBottom: 40, border: '1px solid var(--border)' }}>
                <p style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{concept.coreIdea}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                <div className="technique">
                  <h3>{t.creativeDevice}</h3>
                  <p style={{ fontSize: '1.1rem' }}>{concept.creativeDevice}</p>
                </div>
                <div className="technique">
                  <h3>{t.emotionalArc}</h3>
                  <p style={{ fontSize: '1.1rem' }}>{concept.emotionalArc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40 }}>
                <button onClick={writeScript} disabled={loading} className="btn btn-primary" style={{ minWidth: 240, background: 'var(--accent)', color: '#fff' }}>
                  {loading ? t.writing : t.writeScriptBtn}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STAGE 5: SCRIPT */}
        {script && (
          <section>
            <div className="stage-header">
              <span className="stage-number">05</span>
              <h2 className="stage-title">{t.scriptTitle}</h2>
            </div>
            <div className="pane">
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 60 }}>
                <pre className="script-text" dir="auto">{script.script}</pre>
                <div>
                  <div className="technique">
                    <h3>{t.emotionalBeats}</h3>
                    <ul style={{ padding: 0 }}>{script.beats.map((b, i) => <li key={i}>{b}</li>)}</ul>
                  </div>
                  <div className="technique" style={{ marginTop: 40 }}>
                    <h3>{t.cameraLanguage}</h3>
                    <p style={{ fontSize: '1.1rem' }}>{script.cameraLanguage}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 60 }}>
                    <button onClick={() => navigator.clipboard.writeText(script.script)} className="btn btn-secondary">{t.copyScript}</button>
                    <button onClick={handleExport} className="btn btn-secondary">{t.exportPdf}</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ARCHIVE */}
        {iterations.length > 0 && (
          <section style={{ marginTop: 120, borderTop: '1px solid var(--border)', paddingTop: 80 }}>
            <h2 className="stage-title" style={{ marginBottom: 32 }}>{t.savedIterations}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {iterations.map((iter) => (
                <button key={iter.timestamp} className="btn btn-secondary" onClick={() => { setBrief(iter.brief); setInsight(iter.insight); setConcept(iter.concept); setScript(iter.script); }} style={{ textAlign: 'left', padding: '16px 24px', borderRadius: 16 }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(iter.timestamp).toLocaleTimeString()}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{iter.brief.slice(0, 30)}...</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
