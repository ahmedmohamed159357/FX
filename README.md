[TextFX Backend — Governance Loop v5]

## نظرة عامة

TextFX هو نظام SaaS لإنتاج الأفكار الإبداعية باستخدام الذكاء الاصطناعي، مبني على حلقة حوكمة متقدمة (Governance Loop) تضمن جودة النتائج عبر التدقيق الاستراتيجي والتكرار الذكي. النظام يدعم مزودي الذكاء الاصطناعي (OpenAI، Google Vertex AI) ويعمل كخدمة REST API.

---

## المميزات الرئيسية
- توليد رؤى إبداعية باستخدام 5 تقنيات تفكير جانبي
- تحويل الرؤى إلى مفاهيم استراتيجية
- كتابة نصوص سينمائية بهيكل عاطفي ثلاثي
- حلقة حوكمة تضمن جودة الإخراج عبر التدقيق والتكرار
- دعم مزودات AI متعددة (OpenAI، Vertex AI)
- وضع Mock للتطوير بدون API
- REST API متكامل (Express)

---

## بنية النظام

```
index.ts
 ├─ insight-generator.ts
 │   └─ lateral-thinking-agent.ts
 │   └─ knowledge-base.ts
 │   └─ providers/*
 ├─ concept-mapper.ts
 │   └─ lateral-thinking-agent.ts
 ├─ script-writer.ts
 │   └─ lateral-thinking-agent.ts
 ├─ providers/openaiProvider.ts
 └─ providers/googleVertexProvider.ts
(up/backend/src/modules/autonomous-orchestrator.ts)
 ├─ strategic-context.ts
 ├─ trend-service.ts
 ├─ lateral-thinking-agent.ts
 └─ strategic-auditor.ts
```

---

## نقاط الدخول
- **backend/src/index.ts**: نقطة الدخول الرئيسية، تهيئة Express وتسجيل المسارات.
- **up/backend/src/modules/autonomous-orchestrator.ts**: حلقة الحوكمة (Governance Loop) وتدفق التدقيق.

---

## المسارات (Endpoints)
- `POST /api/insight` : توليد رؤى جانبية
- `POST /api/concept` : تحويل الرؤية إلى مفهوم
- `POST /api/script` : كتابة نص سينمائي
- `POST /api/full-pipeline` : تدفق كامل (Brief → Insight → Concept → Script)
- `GET /api/system-prompt` : جلب prompt النظام
- `GET /api/providers/status` : حالة مزودات الذكاء الاصطناعي
- `GET /health` : فحص الصحة

---

## خطوات التشغيل

### 1. تثبيت الاعتمادات
```sh
npm install express cors openai @google-cloud/vertexai
npm install --save-dev ts-node-dev typescript
```

### 2. إعداد متغيرات البيئة
- `OPENAI_API_KEY` (اختياري)
- `GOOGLE_CLOUD_PROJECT` أو `VERTEX_PROJECT_ID` (اختياري)
- `PORT` (اختياري، الافتراضي 4002)

### 3. البناء والتشغيل
```sh
npm run build
npm start
```

---

## مثال اختبار (cURL)
```sh
curl -X POST http://localhost:4002/api/full-pipeline \
	-H "Content-Type: application/json" \
	-d '{"brief":"Increase hydration for office workers","archetype":"The Sage","language":"en"}'
```

---

## هيكل الاستجابة
```json
{
	"brief": "...",
	"insight": {...},
	"concept": {...},
	"script": {...},
	"pipelineStatus": "complete"
}
```

---

## تحديثات وتطويرات أخيرة
- إضافة حلقة الحوكمة (Governance Loop) مع تدقيق استراتيجي وتكرار تلقائي
- دعم مزودات AI متعددة وتبديل ديناميكي
- تحسين التحقق من صحة المدخلات في المسارات
- توحيد إدارة الأخطاء وتسجيلها
- فصل طبقة المزودات لتسهيل التبديل
- دعم وضع Mock للتطوير
- تحديثات في بنية الملفات لتسهيل الصيانة

---

## تقييم الإنتاجية
- الهندسة المعمارية: 8/10
- الاعتمادية: 8/10
- القابلية للتوسع: 7/10
- القابلية للصيانة: 7/10
- الأمان: 6/10

---

## أولويات إعادة الهيكلة
1. تحقق صارم من المدخلات
2. توحيد إدارة الأخطاء
3. إضافة اختبارات تلقائية
4. حماية متغيرات البيئة
5. تجريد طبقة المزودات

---

## حقوق الملكية الفكرية
جميع الحقوق محفوظة © TextFX 2026