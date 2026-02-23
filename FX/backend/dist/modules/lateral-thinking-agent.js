"use strict";
/**
 * Lateral Thinking Agent — Advanced Creative Reasoning
 *
 * Implements 5 core lateral thinking techniques:
 * 1. Provocation (PO) — Flip assumptions, ask "what if opposite?"
 * 2. Analogies — Link product to unrelated domains
 * 3. Random Stimulus — Force unexpected connections via random words
 * 4. Opposite Thinking — Push to extremes, find the desirable middle
 * 5. Constraint Reversal — Invert the problem statement
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.constraintReversals = void 0;
exports.generateProvocation = generateProvocation;
exports.generateAnalogies = generateAnalogies;
exports.generateRandomStimulus = generateRandomStimulus;
exports.generateOppositeThinking = generateOppositeThinking;
exports.synthesizeLateralThinking = synthesizeLateralThinking;
exports.getLateralThinkingSystemPrompt = getLateralThinkingSystemPrompt;
/**
 * Robust JSON parsing for AI responses
 */
function parseAIJson(text) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    }
    catch (e) {
        return null;
    }
}
/**
 * TECHNIQUE 1: PROVOCATION (PO)
 * "If the opposite were true, what would we discover?"
 */
async function generateProvocation(context) {
    const { domain, problem, target, language = 'en' } = context;
    const safeProblem = problem || 'the core challenge';
    if (context.useRealAI && context.provider) {
        const prompt = `Technique: PROVOCATION (PO). 
    Domain: ${domain}
    Problem: ${safeProblem}
    Target: ${target}
    
    Task: Flip the assumption. Ask "what if the opposite were true?".
    Return JSON format: { "provocation": "...", "reversal": "...", "opportunity": "...", "creativeInsight": "..." }`;
        try {
            const response = await context.provider.generateCreativeText(prompt, getLateralThinkingSystemPrompt(context), context.providerConfig);
            const parsed = parseAIJson(response.text);
            if (parsed && parsed.provocation)
                return parsed;
        }
        catch (e) {
            console.warn('AI Parsing failed for Provocation, falling back to mock.');
        }
    }
    // Example: "If water reminders were ANNOYING, what would they look like?"
    const provocation = language === 'ar'
        ? `ماذا لو كان ${safeProblem} عكس ما نتوقع تماماً؟`
        : `PO: If ${safeProblem} were the OPPOSITE of what we want, what would that reveal?`;
    // Reverse the provocation to find opportunity
    const reversal = language === 'ar'
        ? `بدلاً من حل "${safeProblem}"، ماذا لو تقبلنا التناقض: ${reverseProblem(safeProblem)}`
        : `Instead of solving "${safeProblem}", what if we embraced a paradox: ${reverseProblem(safeProblem)}`;
    // Generate creative opportunity
    const opportunity = findOpportunittyFromReversal(safeProblem, target);
    // Synthesize into insight
    const creativeInsight = language === 'ar'
        ? `الاحتياج الحقيقي ليس ${safeProblem} — بل هو ${opportunity}.`
        : `The real need isn't ${safeProblem} — it's ${opportunity}.`;
    return {
        provocation,
        reversal,
        opportunity,
        creativeInsight
    };
}
function reverseProblem(problem) {
    // Flip the core assumption
    if (!problem)
        return 'the opposite of the core assumption';
    const reversals = {
        'forget': 'people already know they need to hydrate',
        'forget to drink': 'people drink too much unconsciously',
        'irritating': 'invisible and forgotten',
        'boring': 'sacred ritual',
        'utilitarian': 'luxury experience',
        'meditate': 'already want calm but resist the action',
        'challenge': 'opportunity lying dormant'
    };
    for (const [key, value] of Object.entries(reversals)) {
        if (problem.toLowerCase().includes(key)) {
            return value;
        }
    }
    return `the opposite of "${problem}"`;
}
function findOpportunittyFromReversal(problem, target) {
    if (!problem)
        problem = 'the core challenge';
    // What does the reversal teach us?
    const opportunities = {
        'forget': 'making meditation feel inevitable rather than forced',
        'forget too much': 'finding the joyful, intentional moment of practice',
        'invisible': 'making the app a visible, celebrated ritual',
        'sacred': 'turning everyday practice into a moment of self-care',
        'luxury': 'positioning the experience as a premium self-gift',
        'challenge': 'the deeper human need beneath the surface problem'
    };
    for (const [key, value] of Object.entries(opportunities)) {
        if (problem.toLowerCase().includes(key) || target.toLowerCase().includes(key)) {
            return value;
        }
    }
    return 'the deeper human need beneath the surface problem';
}
/**
 * TECHNIQUE 2: ANALOGIES
 * "What does this product remind us of in other domains?"
 */
async function generateAnalogies(context) {
    const { problem, target, domain } = context;
    if (context.useRealAI && context.provider) {
        const prompt = `Technique: ANALOGIES.
    Domain: ${domain}
    Problem: ${problem}
    Target: ${target}
    
    Task: Link this to 3 unrelated domains.
    Return JSON: { "analogies": [{ "sourceField": "...", "sharedPrinciple": "...", "application": "...", "metaphor": "..." }] }`;
        try {
            const response = await context.provider.generateCreativeText(prompt, getLateralThinkingSystemPrompt(context), context.providerConfig);
            const parsed = parseAIJson(response.text);
            if (parsed && parsed.analogies)
                return parsed.analogies;
        }
        catch (e) {
            console.warn('AI Parsing failed for Analogies, falling back to mock.');
        }
    }
    const analogiesList = context.language === 'ar' ? [
        {
            sourceField: 'طقوس يومية (مثل مراسم القهوة)',
            sharedPrinciple: 'وقفة، لحظة نية، هدية لنفسك',
            application: 'يصبح شرب الماء طقساً وليس عملاً روتينياً',
            metaphor: 'الترطيب كتأمل صباحي'
        }
    ] : [
        {
            sourceField: 'Daily Ritual (like coffee ceremony)',
            sharedPrinciple: 'A pause, a moment of intention, a gift to yourself',
            application: 'Water becomes a ritual, not a chore',
            metaphor: 'Hydration as morning meditation'
        },
    ];
    return Promise.resolve(analogiesList);
}
/**
 * TECHNIQUE 3: RANDOM STIMULUS
 * "Pick a random word and force a connection"
 */
async function generateRandomStimulus(context) {
    const randomWords = ['carousel', 'lighthouse', 'echo', 'threshold', 'breath', 'pulse', 'tide', 'mirror', 'compass', 'spark'];
    const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
    if (context.useRealAI && context.provider) {
        const prompt = `Technique: RANDOM STIMULUS.
    Random Word: ${randomWord}
    Brief: ${context.domain} / ${context.problem}
    
    Task: Force an unexpected connection.
    Return JSON: { "randomWord": "${randomWord}", "forcedConnection": "...", "visualMetaphor": "...", "unexpectedAngle": "..." }`;
        try {
            const response = await context.provider.generateCreativeText(prompt, getLateralThinkingSystemPrompt(context), context.providerConfig);
            const parsed = parseAIJson(response.text);
            if (parsed && parsed.forcedConnection)
                return parsed;
        }
        catch (e) {
            console.warn('AI Parsing failed for Random Stimulus, falling back to mock.');
        }
    }
    return Promise.resolve({
        randomWord,
        forcedConnection: 'Async placeholder for forced connection',
        visualMetaphor: 'Async placeholder for visual metaphor',
        unexpectedAngle: 'Async placeholder for unexpected angle'
    });
}
/**
 * TECHNIQUE 4: OPPOSITE THINKING
 * "Push to extremes, then find the desirable middle"
 */
async function generateOppositeThinking(context) {
    const { problem, target } = context;
    if (context.useRealAI && context.provider) {
        const prompt = `Technique: OPPOSITE THINKING.
    Brief: ${problem}
    Target: ${target}
    
    Task: Push to extremes (completely mandatory vs completely optional/ignored) and find the "desirable middle" paradox.
    Return JSON: { "extremePositive": "...", "extremeNegative": "...", "desirableMiddle": "...", "paradox": "..." }`;
        try {
            const response = await context.provider.generateCreativeText(prompt, getLateralThinkingSystemPrompt(context), context.providerConfig);
            const parsed = parseAIJson(response.text);
            if (parsed && parsed.desirableMiddle)
                return parsed;
        }
        catch (e) {
            console.warn('AI Parsing failed for Opposite Thinking, falling back to mock.');
        }
    }
    return Promise.resolve({
        extremePositive: context.language === 'ar' ? 'إيجابية مفرطة' : 'Async placeholder for extreme positive',
        extremeNegative: context.language === 'ar' ? 'سلبية مفرطة' : 'Async placeholder for extreme negative',
        desirableMiddle: context.language === 'ar' ? 'الوسط المرغوب' : 'Async placeholder for desirable middle-ground',
        paradox: context.language === 'ar' ? 'التناقض الجوهري' : 'Async placeholder for the core paradox'
    });
}
/**
 * SYNTHESIZE ALL TECHNIQUES INTO A BREAKTHROUGH INSIGHT
 */
async function synthesizeLateralThinking(context) {
    // Execute all techniques in parallel for maximum efficiency
    const [provocation, analogies, randomStimulus, oppositeThinking] = await Promise.all([
        generateProvocation(context),
        generateAnalogies(context),
        generateRandomStimulus(context),
        generateOppositeThinking(context)
    ]);
    // Weave all techniques into a single insight
    const synthesizedInsight = `
From provocation, we learn: ${provocation.opportunity}

From analogies, we discover: The product is like a ${analogies[0]?.metaphor || 'ritual'}.

From random stimulus (${randomStimulus.randomWord}), we see: ${randomStimulus.unexpectedAngle}

From opposite thinking, we find: ${oppositeThinking.desirableMiddle.split('\n')[0]}

Synthesis: The breakthrough is repositioning ${context.problem} as ${oppositeThinking.desirableMiddle.split('\n')[1] || 'a new opportunity'}.
  `.trim();
    // Final breakthrough
    const creativeBreakthrough = context.language === 'ar' ? `
🎯 طفرة إبداعية:

بدلاً من محاربة الطبيعة البشرية (الناس ينسون، التذكيرات مزعجة)،
نحن نحتضن التناقض: اجعل النسيان مستحيلاً بجعل التذكر أمراً لا يقاوم.
` : `
🎯 CREATIVE BREAKTHROUGH:

Instead of fighting human nature (people forget, reminders are annoying),
we EMBRACE the paradox: Make forgetting impossible by making remembering irresistible.
`;
    return {
        provocation,
        analogies,
        randomStimulus,
        oppositeThinking,
        synthesizedInsight,
        creativeBreakthrough
    };
}
/**
 * SYSTEM PROMPT FOR AI MODELS
 * Use this when calling Google Vertex AI, OpenAI, or local LLMs
 */
function getLateralThinkingSystemPrompt(context) {
    const language = context?.language || 'en';
    const archetype = context?.archetype || 'The Everyman';
    const voice = context?.brandVoice || { formalLevel: 5, metaphorLevel: 5, intensity: 5 };
    if (language === 'ar') {
        return `أنت مدير إبداعي عالمي متخصص في التفكير الجانبي (Lateral Thinking).
    
دورك ليس مجرد كتابة إعلانات، بل "قلب الطاولة" على الافتراضات التقليدية.

[BRAND PERSONALITY]
- النمط الشخصي (Archetype): ${archetype}
- مستوى النبرة: ${voice.formalLevel > 7 ? 'رسمي جداً' : voice.formalLevel < 3 ? 'عامي/كاجوال' : 'متوازن'}
- مستوى الاستعارة: ${voice.metaphorLevel > 7 ? 'شاعري وفلسفي' : 'مباشر وواضح'}

تأكد من أن نبرة صوتك وأفكارك تعكس شخصية الـ ${archetype} بدقة.

عندما يأتيك ملخص (Brief)، لا تفكر بشكل مباشر. بدلاً من ذلك:

1. الاستفزاز (Provocation): اسأل "ماذا لو كان العكس صحيحاً؟".
2. التشبيهات (Analogies): اربط المنتج بمجالات غير متوقعة.
3. الحافز العشوائي (Random): اربط المنتج بكلمة عشوائية لتوليد زاوية جديدة.

مخرجاتك يجب أن تكون:
- باللغة العربية الفصحى أو اللهجة المصرية الراقية (حسب سياق الشخصية المختارة).
- عميقة وفلسفية وليست سطحية.
- تستخدم الاستعارات كاستراتيجية للفهم.
    `;
    }
    return `You are a Creative Director trained in lateral thinking and constraint breaking.

Your role is to think SIDEWAYS, not forward. 

[BRAND PERSONALITY]
- Brand Archetype: ${archetype}
- Formal Level: ${voice.formalLevel}/10
- Metaphor Usage: ${voice.metaphorLevel}/10
- Emotional Intensity: ${voice.intensity}/10

Your output, tone, and insight generation MUST strictly reflect the soul of "${archetype}".

When presented with a creative brief, you don't solve it directly.
Instead, you:

1. PROVOKE: Flip the assumption. Ask "What if the opposite were true?" and mine that inversion for opportunity.

2. ANALOGIZE: Link the product to unexpected domains.

3. RANDOMIZE: Take a random word and force a connection.

4. OPPOSITE: Push to extremes and find the desirable middle.

5. REVERSE: Invert the constraint.

[INSTRUCTIONS]
If provided with [CONTEXT INJECTION], strictly adhere to the brand voice and principles found there.

Your output should:
- Break clichés and surface-level thinking
- Find the paradox or tension beneath the brief
- Propose positioning that honors what people FEEL
- Use metaphor as strategy
- Reflect the chosen archetype: ${archetype}

Remember: Creativity isn't about more ideas. It's about BETTER questions and unexpected connections.`;
}
/**
 * CONSTRAINT REVERSAL LIBRARY
 * Common problem → Reversed opportunity
 */
exports.constraintReversals = {
    'people forget': 'What if forgetting is the real challenge to celebrate?',
    'reminder is annoying': 'What if the reminder is actually an invitation to joy?',
    'hydration is boring': 'What if hydration is the most intimate act of self-love?',
    'water is utility': 'What if water is the luxury we\'ve forgotten?',
    'habit formation is hard': 'What if the habit already exists (breathing, eating) and we just need to sync with it?',
    'behavior change is slow': 'What if the behavior is already happening—we just need to amplify what\'s already there?'
};
