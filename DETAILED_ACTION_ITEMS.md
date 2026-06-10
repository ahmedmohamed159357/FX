# 🛠️ **TextFX - Detailed Action Items & File Creation Guide**

**هذا الملف يحتوي على جميع الخطوات التنفيذية وأسماء الملفات المطلوب إنشاؤها**

---

## 📁 **الملفات المطلوب إنشاؤها فوراً**

### **المرحلة 1: Setup الأساسي (يوم 1)**

#### ✅ **1.1 إنشاء بنية المشروع**

```bash
# 1. إنشاء مجلد app
mkdir /workspaces/FX/app
cd /workspaces/FX/app

# 2. إنشاء بنية المجلدات
mkdir -p src/{components,services,hooks,store,types,pages,styles}
mkdir -p public

# 3. الملفات الأساسية
touch src/main.tsx
touch src/App.tsx
touch src/index.css
touch index.html
touch vite.config.ts
touch tsconfig.json
touch package.json
```

---

#### ✅ **1.2 ملف package.json للـ Frontend**

```json
{
  "name": "@textfx/app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

**الموقع:** `/workspaces/FX/app/package.json`

---

#### ✅ **1.3 ملف vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4002',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

**الموقع:** `/workspaces/FX/app/vite.config.ts`

---

#### ✅ **1.4 ملف tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**الموقع:** `/workspaces/FX/app/tsconfig.json`

---

#### ✅ **1.5 ملف .env.local للـ Frontend**

```bash
VITE_API_URL=http://localhost:4002
VITE_APP_TITLE=TextFX - AI Creative Director
VITE_LOG_LEVEL=debug
```

**الموقع:** `/workspaces/FX/app/.env.local`

---

### **المرحلة 2: Core Files - TypeScript Types (يوم 1-2)**

#### ✅ **2.1 TypeScript Types File**

**ملف:** `/workspaces/FX/app/src/types/index.ts`

```typescript
// ========== REQUEST TYPES ==========
export interface OrchestratorRequest {
  brief: string
  archetype?: string
  language?: 'ar' | 'en'
  region?: string
  brandVoice?: string
  maxRetries?: number
  threshold?: number
}

// ========== INSIGHT ==========
export interface Insight {
  mainInsight: string
  constraints: string[]
  opportunities: string[]
  emotionalTruth: string
  metaphor: string
}

// ========== CONCEPT ==========
export interface Concept {
  title: string
  tagline: string
  coreIdea: string
  visualNotes: string
  creativeDevice: string
  emotionalArc: string
  targetParadox: string
  lateralThinkingTechniques: string[]
}

// ========== SCRIPT ==========
export interface Script {
  script: string
  beats: string[]
  cameraLanguage: string
  narrativeStrategy: string
  emotionalTurning: string
  lateralThinkingTechniques: string[]
}

// ========== VISUAL PROMPT ==========
export interface VisualPrompt {
  midjourneyPrompt: string
  negativePrompt: string
  styleKeywords: string[]
  colorPalette: string[]
  mood: string
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5'
  version: string
  trendInfluence?: string
}

// ========== MASTERPIECE ==========
export interface Masterpiece {
  headlineBlock: string
  taglineBlock: string
  bodyBlock: string
  cameraLanguage: string
  narrativeStrategy: string
  emotionalArc: string
}

// ========== AUDIT ==========
export interface AuditDimension {
  score: number
  feedback: string
}

export interface AuditReport {
  score: number
  briefCoverage: AuditDimension
  insightFidelity: AuditDimension
  trendRelevance: AuditDimension
  creativeSharpness: AuditDimension
  audienceMatch: AuditDimension
  allDimensionsApproved: boolean
  reworkDirective?: string
}

// ========== TRACE ==========
export interface TraceEntry {
  iteration: number
  timestamp: string
  stage: string
  message: string
  detail?: any
}

// ========== GOVERNANCE ==========
export interface Governance {
  verdict: 'approved' | 'rework' | 'escalate'
  iterationsRun: number
  alignmentScore: number
  auditSummary: string
  audit: AuditReport
}

// ========== ORCHESTRATOR RESPONSE ==========
export interface OrchestratorResponse {
  finalMasterpiece: Masterpiece
  visualPrompt: VisualPrompt
  insight: Insight
  governance: Governance
  trace: TraceEntry[]
  tookMs: number
  brief: string
}

// ========== TRENDS ==========
export interface Trend {
  keyword: string
  heat: number
  type: string
}

export interface TrendsResponse {
  primary: Trend
  supporting: Trend[]
  culturalMoment: string
  creativeOpportunity: string
  liveContext: any
  fetchedAt: string
  source: string
}

// ========== UI STATE ==========
export interface OrchestrationState {
  // Input
  briefInput: string
  archetype: string
  language: 'ar' | 'en'
  region: string
  brandVoice?: string

  // Processing
  isLoading: boolean
  currentIteration: number
  maxRetries: number
  threshold: number

  // Results
  result: OrchestratorResponse | null

  // UI
  activeTab: 'input' | 'insight' | 'concept' | 'script' | 'visual' | 'audit'
  expandedSections: Set<string>

  // Errors
  error: string | null
  errorDetails?: any

  // History
  resultHistory: OrchestratorResponse[]
}

// ========== ACTION TYPES ==========
export interface OrchestrationActions {
  setBriefInput: (brief: string) => void
  setArchetype: (archetype: string) => void
  setLanguage: (language: 'ar' | 'en') => void
  setRegion: (region: string) => void
  setBrandVoice: (voice?: string) => void
  
  setIsLoading: (loading: boolean) => void
  setCurrentIteration: (iteration: number) => void
  
  setResult: (result: OrchestratorResponse) => void
  setError: (error: string | null, details?: any) => void
  
  setActiveTab: (tab: string) => void
  toggleSection: (section: string) => void
  
  addToHistory: (result: OrchestratorResponse) => void
  clearHistory: () => void
  clearAll: () => void
}
```

---

### **المرحلة 3: API Service Layer (يوم 2)**

#### ✅ **3.1 API Client Service**

**ملف:** `/workspaces/FX/app/src/services/api.ts`

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios'
import type { 
  OrchestratorRequest, 
  OrchestratorResponse, 
  TrendsResponse,
  HealthResponse 
} from '../types'

class APIClient {
  private client: AxiosInstance

  constructor(baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:4002') {
    this.client = axios.create({
      baseURL,
      timeout: 300000, // 5 minutes for long-running operations
      headers: {
        'Content-Type': 'application/json',
      }
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    )
  }

  private handleError(error: AxiosError) {
    if (error.response?.status === 400) {
      console.error('Bad Request:', error.response.data)
    } else if (error.response?.status === 500) {
      console.error('Server Error:', error.response.data)
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request Timeout')
    }
    return Promise.reject(error)
  }

  // ========== ORCHESTRATE ==========
  async orchestrate(request: OrchestratorRequest): Promise<OrchestratorResponse> {
    const response = await this.client.post<OrchestratorResponse>(
      '/api/orchestrate',
      request
    )
    return response.data
  }

  // ========== TRENDS ==========
  async getTrends(
    domain: string = 'marketing',
    region: string = 'EG',
    language: 'ar' | 'en' = 'ar'
  ): Promise<TrendsResponse> {
    const response = await this.client.get<TrendsResponse>('/api/trends', {
      params: { domain, region, language }
    })
    return response.data
  }

  // ========== HEALTH CHECK ==========
  async health() {
    const response = await this.client.get('/api/health')
    return response.data
  }

  // ========== LEGACY ENDPOINTS (for reference only) ==========
  async generateInsight(brief: string) {
    const response = await this.client.post('/api/insight', { brief })
    return response.data
  }

  async mapConcept(insight: any) {
    const response = await this.client.post('/api/concept', { insight })
    return response.data
  }

  async writeScript(concept: any) {
    const response = await this.client.post('/api/script', { concept })
    return response.data
  }

  async getProvidersStatus() {
    const response = await this.client.get('/api/providers/status')
    return response.data
  }
}

// Export singleton instance
export const apiClient = new APIClient()

// Export for testing with custom baseURL
export const createAPIClient = (baseURL: string) => new APIClient(baseURL)
```

---

### **المرحلة 4: State Management (يوم 2)**

#### ✅ **4.1 Zustand Store**

**ملف:** `/workspaces/FX/app/src/store/orchestrationStore.ts`

```typescript
import { create } from 'zustand'
import type {
  OrchestrationState,
  OrchestrationActions,
  OrchestratorResponse
} from '../types'

export const useOrchestrationStore = create<OrchestrationState & OrchestrationActions>(
  (set) => ({
    // ========== INITIAL STATE ==========
    briefInput: '',
    archetype: 'The Sage',
    language: 'ar',
    region: 'EG',
    brandVoice: undefined,

    isLoading: false,
    currentIteration: 0,
    maxRetries: 2,
    threshold: 0.7,

    result: null,

    activeTab: 'input',
    expandedSections: new Set(),

    error: null,
    errorDetails: undefined,

    resultHistory: [],

    // ========== ACTIONS ==========
    setBriefInput: (brief) => set({ briefInput: brief }),
    setArchetype: (archetype) => set({ archetype }),
    setLanguage: (language) => set({ language }),
    setRegion: (region) => set({ region }),
    setBrandVoice: (voice) => set({ brandVoice: voice }),

    setIsLoading: (loading) => set({ isLoading: loading }),
    setCurrentIteration: (iteration) => set({ currentIteration: iteration }),

    setResult: (result) => set({ result, error: null }),
    setError: (error, details) => set({ error, errorDetails: details }),

    setActiveTab: (tab) => set({ activeTab: tab as any }),
    toggleSection: (section) => set((state) => {
      const newSections = new Set(state.expandedSections)
      if (newSections.has(section)) {
        newSections.delete(section)
      } else {
        newSections.add(section)
      }
      return { expandedSections: newSections }
    }),

    addToHistory: (result) => set((state) => ({
      resultHistory: [result, ...state.resultHistory].slice(0, 10)
    })),

    clearHistory: () => set({ resultHistory: [] }),

    clearAll: () => set({
      briefInput: '',
      result: null,
      error: null,
      activeTab: 'input'
    })
  })
)
```

---

### **المرحلة 5: Custom Hooks (يوم 2-3)**

#### ✅ **5.1 useOrchestrator Hook**

**ملف:** `/workspaces/FX/app/src/hooks/useOrchestrator.ts`

```typescript
import { useCallback } from 'react'
import { apiClient } from '../services/api'
import { useOrchestrationStore } from '../store/orchestrationStore'
import type { OrchestratorRequest } from '../types'

export const useOrchestrator = () => {
  const {
    briefInput,
    archetype,
    language,
    region,
    brandVoice,
    setIsLoading,
    setResult,
    setError,
    setCurrentIteration,
    addToHistory
  } = useOrchestrationStore()

  const orchestrate = useCallback(async () => {
    if (!briefInput.trim()) {
      setError('Brief cannot be empty')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const request: OrchestratorRequest = {
        brief: briefInput,
        archetype,
        language,
        region,
        brandVoice
      }

      const response = await apiClient.orchestrate(request)
      
      setResult(response)
      addToHistory(response)
      setCurrentIteration(response.governance.iterationsRun)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred'
      setError(errorMessage, error)
    } finally {
      setIsLoading(false)
    }
  }, [briefInput, archetype, language, region, brandVoice])

  return { orchestrate }
}
```

---

#### ✅ **5.2 useTrends Hook**

**ملف:** `/workspaces/FX/app/src/hooks/useTrends.ts`

```typescript
import { useState, useEffect } from 'react'
import { apiClient } from '../services/api'
import type { TrendsResponse } from '../types'

export const useTrends = (domain: string, region: string, language: 'ar' | 'en' = 'ar') => {
  const [trends, setTrends] = useState<TrendsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true)
      try {
        const data = await apiClient.getTrends(domain, region, language)
        setTrends(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
  }, [domain, region, language])

  return { trends, loading, error }
}
```

---

### **المرحلة 6: Main Components (يوم 3-5)**

#### ✅ **6.1 App.tsx - Main Entry Point**

**ملف:** `/workspaces/FX/app/src/App.tsx`

```typescript
import { useState } from 'react'
import { useOrchestrationStore } from './store/orchestrationStore'
import BriefInput from './components/BriefInput'
import InsightViewer from './components/InsightViewer'
import ConceptDisplay from './components/ConceptDisplay'
import ScriptEditor from './components/ScriptEditor'
import VisualPromptPreview from './components/VisualPromptPreview'
import AuditTraceViewer from './components/AuditTraceViewer'
import AuditDimensions from './components/AuditDimensions'
import LoadingState from './components/LoadingState'
import ErrorHandler from './components/ErrorHandler'
import './App.css'

const TABS = [
  { id: 'input', label: 'Brief' },
  { id: 'insight', label: 'Insight' },
  { id: 'concept', label: 'Concept' },
  { id: 'script', label: 'Script' },
  { id: 'visual', label: 'Visual' },
  { id: 'audit', label: 'Audit Trail' }
]

export default function App() {
  const { activeTab, setActiveTab, result, isLoading, error } = useOrchestrationStore()

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>TextFX - AI Creative Director</h1>
        <p>Multi-Agent Governance Framework</p>
      </header>

      <main className="app-main">
        {error && <ErrorHandler error={error} />}

        <nav className="tab-navigation">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              disabled={isLoading}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="tab-content">
          {isLoading && <LoadingState />}

          {!isLoading && (
            <>
              {activeTab === 'input' && <BriefInput />}
              {activeTab === 'insight' && result && <InsightViewer insight={result.insight} />}
              {activeTab === 'concept' && result && <ConceptDisplay masterpiece={result.finalMasterpiece} />}
              {activeTab === 'script' && result && <ScriptEditor masterpiece={result.finalMasterpiece} />}
              {activeTab === 'visual' && result && <VisualPromptPreview prompt={result.visualPrompt} />}
              {activeTab === 'audit' && result && (
                <>
                  <AuditDimensions audit={result.governance.audit} />
                  <AuditTraceViewer trace={result.trace} />
                </>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>TextFX v5 - Built with React + Vite</p>
      </footer>
    </div>
  )
}
```

---

#### ✅ **6.2 BriefInput.tsx Component**

**ملف:** `/workspaces/FX/app/src/components/BriefInput.tsx`

```typescript
import { useState } from 'react'
import { useOrchestrationStore } from '../store/orchestrationStore'
import { useOrchestrator } from '../hooks/useOrchestrator'

const ARCHETYPES = [
  'The Sage', 'The Hero', 'The Lover', 'The Jester',
  'The Everyman', 'The Caregiver', 'The Ruler', 'The Creator'
]

const REGIONS = ['EG', 'SA', 'AE', 'KSA', 'US', 'UK', 'FR']

export default function BriefInput() {
  const {
    briefInput,
    setBriefInput,
    archetype,
    setArchetype,
    language,
    setLanguage,
    region,
    setRegion,
    brandVoice,
    setBrandVoice
  } = useOrchestrationStore()

  const { orchestrate } = useOrchestrator()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await orchestrate()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="brief-input-form">
      <div className="form-group">
        <label htmlFor="brief">Brief (Required)</label>
        <textarea
          id="brief"
          value={briefInput}
          onChange={(e) => setBriefInput(e.target.value)}
          placeholder="Enter your creative brief here..."
          rows={5}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="archetype">Archetype</label>
          <select value={archetype} onChange={(e) => setArchetype(e.target.value)}>
            {ARCHETYPES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="language">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value as any)}>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="region">Region</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="brandVoice">Brand Voice (Optional)</label>
        <input
          id="brandVoice"
          type="text"
          value={brandVoice || ''}
          onChange={(e) => setBrandVoice(e.target.value)}
          placeholder="e.g., professional, playful, luxury"
        />
      </div>

      <button type="submit" disabled={isSubmitting || !briefInput.trim()}>
        {isSubmitting ? 'Processing...' : 'Generate Creative'}
      </button>
    </form>
  )
}
```

---

#### ✅ **6.3 InsightViewer.tsx Component**

**ملف:** `/workspaces/FX/app/src/components/InsightViewer.tsx`

```typescript
import { Insight } from '../types'

interface Props {
  insight: Insight
}

export default function InsightViewer({ insight }: Props) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="insight-viewer">
      <h2>Insight Analysis</h2>

      <section className="insight-section">
        <h3>Main Insight</h3>
        <div className="insight-content">
          <p>{insight.mainInsight}</p>
          <button onClick={() => copyToClipboard(insight.mainInsight)}>
            Copy
          </button>
        </div>
      </section>

      <section className="insight-section">
        <h3>Emotional Truth</h3>
        <p>{insight.emotionalTruth}</p>
      </section>

      <section className="insight-section">
        <h3>Core Metaphor</h3>
        <p>{insight.metaphor}</p>
      </section>

      <section className="insight-section">
        <h3>Constraints</h3>
        <ul>
          {insight.constraints.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </section>

      <section className="insight-section">
        <h3>Opportunities</h3>
        <ul>
          {insight.opportunities.map((o, i) => <li key={i}>{o}</li>)}
        </ul>
      </section>
    </div>
  )
}
```

---

#### ✅ **6.4 LoadingState.tsx Component**

**ملف:** `/workspaces/FX/app/src/components/LoadingState.tsx`

```typescript
import { useOrchestrationStore } from '../store/orchestrationStore'

export default function LoadingState() {
  const { currentIteration, maxRetries } = useOrchestrationStore()

  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <h2>Processing Your Brief</h2>
      <p>Running Lateral Thinking Agent & Audit Loop...</p>

      <div className="progress-info">
        <p>Iteration: {currentIteration} / {maxRetries}</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(currentIteration / maxRetries) * 100}%` }}
          />
        </div>
      </div>

      <p className="loading-message">
        🤔 Analyzing context...  
        🎨 Generating concepts...  
        ✅ Auditing quality...
      </p>
    </div>
  )
}
```

---

#### ✅ **6.5 ErrorHandler.tsx Component**

**ملف:** `/workspaces/FX/app/src/components/ErrorHandler.tsx`

```typescript
import { useOrchestrationStore } from '../store/orchestrationStore'

interface Props {
  error: string
}

export default function ErrorHandler({ error }: Props) {
  const { setError } = useOrchestrationStore()

  return (
    <div className="error-handler">
      <div className="error-content">
        <h3>⚠️ Error</h3>
        <p>{error}</p>
        <button onClick={() => setError(null)}>
          Dismiss
        </button>
      </div>
    </div>
  )
}
```

---

#### ✅ **6.6 VisualPromptPreview.tsx Component**

**ملف:** `/workspaces/FX/app/src/components/VisualPromptPreview.tsx`

```typescript
import { VisualPrompt } from '../types'

interface Props {
  prompt: VisualPrompt
}

export default function VisualPromptPreview({ prompt }: Props) {
  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt.midjourneyPrompt)
  }

  return (
    <div className="visual-prompt-preview">
      <h2>Visual Prompt (Midjourney)</h2>

      <section className="prompt-section">
        <h3>Midjourney Prompt</h3>
        <div className="prompt-box">
          <p>{prompt.midjourneyPrompt}</p>
          <button onClick={copyPrompt}>Copy Prompt</button>
        </div>
      </section>

      <section className="prompt-section">
        <h3>Negative Prompt</h3>
        <p>{prompt.negativePrompt}</p>
      </section>

      <section className="prompt-section">
        <h3>Color Palette</h3>
        <div className="color-palette">
          {prompt.colorPalette.map((color, i) => (
            <div
              key={i}
              className="color-swatch"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </section>

      <section className="prompt-section">
        <h3>Style Keywords</h3>
        <div className="keywords">
          {prompt.styleKeywords.map((keyword, i) => (
            <span key={i} className="keyword-tag">{keyword}</span>
          ))}
        </div>
      </section>

      <section className="prompt-section">
        <h3>Settings</h3>
        <p><strong>Aspect Ratio:</strong> {prompt.aspectRatio}</p>
        <p><strong>Version:</strong> {prompt.version}</p>
        <p><strong>Mood:</strong> {prompt.mood}</p>
      </section>
    </div>
  )
}
```

---

#### ✅ **6.7 AuditDimensions.tsx Component**

**ملف:** `/workspaces/FX/app/src/components/AuditDimensions.tsx`

```typescript
import { AuditReport } from '../types'

interface Props {
  audit: AuditReport
}

const DIMENSION_WEIGHTS = {
  briefCoverage: 0.35,
  insightFidelity: 0.25,
  trendRelevance: 0.20,
  creativeSharpness: 0.10,
  audienceMatch: 0.10
}

export default function AuditDimensions({ audit }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'green'
    if (score >= 0.6) return 'yellow'
    return 'red'
  }

  return (
    <div className="audit-dimensions">
      <h2>Quality Audit</h2>

      <div className="overall-score">
        <h3>Overall Alignment Score</h3>
        <div className={`score-display ${getScoreColor(audit.score)}`}>
          {(audit.score * 100).toFixed(0)}%
        </div>
      </div>

      <div className="dimensions-grid">
        {Object.entries(audit).map(([key, value]) => {
          if (key === 'score' || key === 'allDimensionsApproved' || key === 'reworkDirective' || typeof value !== 'object') {
            return null
          }

          return (
            <div key={key} className="dimension-card">
              <h4>{key.replace(/([A-Z])/g, ' $1')}</h4>
              <div className={`dimension-score ${getScoreColor(value.score)}`}>
                {(value.score * 100).toFixed(0)}%
              </div>
              <p className="dimension-feedback">{value.feedback}</p>
            </div>
          )
        })}
      </div>

      <div className="audit-summary">
        <h3>Verdict</h3>
        <p>{audit.allDimensionsApproved ? '✅ APPROVED' : '⚠️ NEEDS REWORK'}</p>
        {audit.reworkDirective && (
          <div className="rework-directive">
            <h4>Rework Directive:</h4>
            <p>{audit.reworkDirective}</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

#### ✅ **6.8 AuditTraceViewer.tsx Component**

**ملف:** `/workspaces/FX/app/src/components/AuditTraceViewer.tsx`

```typescript
import { useState } from 'react'
import { TraceEntry } from '../types'

interface Props {
  trace: TraceEntry[]
}

export default function AuditTraceViewer({ trace }: Props) {
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set())

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedEntries(newExpanded)
  }

  return (
    <div className="audit-trace-viewer">
      <h2>Execution Trace</h2>

      <div className="trace-timeline">
        {trace.map((entry, index) => (
          <div key={index} className="trace-entry">
            <button
              className="trace-header"
              onClick={() => toggleExpand(index)}
            >
              <span className="iteration">#{entry.iteration}</span>
              <span className="stage">{entry.stage}</span>
              <span className="time">{new Date(entry.timestamp).toLocaleTimeString()}</span>
            </button>

            {expandedEntries.has(index) && (
              <div className="trace-details">
                <p className="message">{entry.message}</p>
                {entry.detail && (
                  <pre className="detail">
                    {JSON.stringify(entry.detail, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

#### ✅ **6.9 ConceptDisplay.tsx Component**

**ملف:** `/workspaces/FX/app/src/components/ConceptDisplay.tsx`

```typescript
import { Masterpiece } from '../types'

interface Props {
  masterpiece: Masterpiece
}

export default function ConceptDisplay({ masterpiece }: Props) {
  return (
    <div className="concept-display">
      <h2>Creative Concept</h2>

      <section className="headline-section">
        <h3>Headline</h3>
        <div className="headline-box">
          <h1>{masterpiece.headlineBlock}</h1>
        </div>
      </section>

      <section className="tagline-section">
        <h3>Tagline</h3>
        <p className="tagline">{masterpiece.taglineBlock}</p>
      </section>

      <section className="body-section">
        <h3>Body Copy</h3>
        <p>{masterpiece.bodyBlock}</p>
      </section>

      <section className="strategy-section">
        <h3>Narrative Strategy</h3>
        <p>{masterpiece.narrativeStrategy}</p>
      </section>

      <section className="visual-section">
        <h3>Camera Language</h3>
        <p>{masterpiece.cameraLanguage}</p>
      </section>

      <section className="emotional-section">
        <h3>Emotional Arc</h3>
        <p>{masterpiece.emotionalArc}</p>
      </section>
    </div>
  )
}
```

---

#### ✅ **6.10 ScriptEditor.tsx Component**

**ملف:** `/workspaces/FX/app/src/components/ScriptEditor.tsx`

```typescript
import { Masterpiece } from '../types'

interface Props {
  masterpiece: Masterpiece
}

export default function ScriptEditor({ masterpiece }: Props) {
  return (
    <div className="script-editor">
      <h2>30-Second Script</h2>

      <div className="script-content">
        <p className="script-text">{masterpiece.bodyBlock}</p>
      </div>

      <section className="narrative-strategy">
        <h3>Narrative Strategy</h3>
        <p>{masterpiece.narrativeStrategy}</p>
      </section>

      <section className="camera-language">
        <h3>Visual Direction (Camera Language)</h3>
        <p>{masterpiece.cameraLanguage}</p>
      </section>

      <section className="emotional-arc">
        <h3>Emotional Journey</h3>
        <p>{masterpiece.emotionalArc}</p>
      </section>
    </div>
  )
}
```

---

### **المرحلة 7: Styling (يوم 3-4)**

#### ✅ **7.1 Main CSS File**

**ملف:** `/workspaces/FX/app/src/App.css`

```css
:root {
  --primary: #1f2937;
  --secondary: #3b82f6;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --border: #e5e7eb;
  --text: #111827;
  --text-light: #6b7280;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #f9fafb;
  color: var(--text);
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background: var(--primary);
  color: white;
  padding: 2rem;
  text-align: center;
}

.app-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.app-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.tab-navigation {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--border);
}

.tab-button {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-light);
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-button.active {
  color: var(--secondary);
  border-bottom-color: var(--secondary);
}

.tab-button:hover:not(:disabled) {
  color: var(--secondary);
}

.tab-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Form Styles */
.brief-input-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.form-group textarea,
.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.brief-input-form button {
  background: var(--secondary);
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.brief-input-form button:hover:not(:disabled) {
  background: #2563eb;
}

.brief-input-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top: 4px solid var(--secondary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error Handler */
.error-handler {
  background: var(--error);
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

/* Insight Viewer */
.insight-viewer,
.concept-display,
.script-editor,
.visual-prompt-preview,
.audit-dimensions,
.audit-trace-viewer {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.insight-section,
.prompt-section,
.dimension-card {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.insight-section:last-child {
  border-bottom: none;
}

.insight-section h3 {
  margin-bottom: 0.75rem;
  color: var(--primary);
}

.insight-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

/* Footer */
.app-footer {
  background: var(--primary);
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .app-main {
    padding: 1rem;
  }

  .tab-navigation {
    overflow-x: auto;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
```

---

### **المرحلة 8: HTML Entry Point (يوم 1)**

#### ✅ **8.1 index.html**

**ملف:** `/workspaces/FX/app/index.html`

```html
<!doctype html>
<html lang="ar">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TextFX - AI Creative Director</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

#### ✅ **8.2 main.tsx - React Entry**

**ملف:** `/workspaces/FX/app/src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

### **المرحلة 9: Backend Configuration (يوم 1)**

#### ✅ **9.1 إنشاء ملف .env**

**ملف:** `/workspaces/FX/up/.env`

```bash
# ========== AI PROVIDERS ==========
# اختر واحد من التاليين:

# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.8
OPENAI_MAX_TOKENS=2000

# OR Google Vertex AI
GOOGLE_CLOUD_PROJECT=your-project-id
VERTEX_PROJECT_ID=your-project-id
VERTEX_LOCATION=us-central1
VERTEX_MODEL=gemini-pro

# ========== TRENDS SERVICE ==========
SERPAPI_KEY=your-serpapi-key-here
TRENDS_REGION=EG
NEWS_MAX_RESULTS=5
NEWS_LANGUAGE=ar

# ========== ORCHESTRATOR SETTINGS ==========
MAX_RETRIES=2
AUDIT_THRESHOLD=0.7

# ========== SERVER ==========
PORT=4002
NODE_ENV=development

# ========== FRONTEND ==========
FRONTEND_URL=http://localhost:5173
```

---

#### ✅ **9.2 تحديث CORS في Backend**

**تعديل:** `/workspaces/FX/up/backend/src/index.ts`

```typescript
// بدل:
app.use(cors())

// استخدم:
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

---

## 📋 **Checklist النهاي للتنفيذ**

### **أسبوع 1: Setup & API Layer**
- [ ] Create /workspaces/FX/app directory
- [ ] Create package.json, vite.config.ts, tsconfig.json
- [ ] Install dependencies (npm install)
- [ ] Create .env file with API keys
- [ ] Create TypeScript types (types/index.ts)
- [ ] Create API service (services/api.ts)
- [ ] Create Zustand store (store/orchestrationStore.ts)
- [ ] Create custom hooks (hooks/)
- [ ] Update CORS in Backend
- [ ] Test /api/health endpoint

### **أسبوع 2: Components**
- [ ] Create App.tsx main component
- [ ] Create BriefInput component
- [ ] Create InsightViewer component
- [ ] Create ConceptDisplay component
- [ ] Create ScriptEditor component
- [ ] Create VisualPromptPreview component
- [ ] Create LoadingState component
- [ ] Create ErrorHandler component
- [ ] Create AuditDimensions component
- [ ] Create AuditTraceViewer component

### **أسبوع 3: Styling & Testing**
- [ ] Add CSS styling (App.css)
- [ ] Test all components in browser
- [ ] Test API integration
- [ ] Test error handling
- [ ] Test loading states
- [ ] Responsive design check

### **أسبوع 4: Production**
- [ ] Docker setup
- [ ] Environment configs (dev/staging/prod)
- [ ] CI/CD pipeline
- [ ] Security review
- [ ] Performance optimization
- [ ] Documentation
- [ ] Final testing

---

**الجهد المتوقع: 120-140 ساعة عمل بفريق 2-3 مطورين**

**Timeline: 4 أسابيع**

**الحالة الحالية: 0% - الكل مفقود**

**الحالة المطلوبة: 100% - جاهز للإنتاج**
