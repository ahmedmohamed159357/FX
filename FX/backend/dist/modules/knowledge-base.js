"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveKnowledge = retrieveKnowledge;
exports.getKnowledgeInjectPrompt = getKnowledgeInjectPrompt;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const LIBRARY_PATH = path.join(__dirname, '../../../docs/library');
// Ensure library exists
if (!fs.existsSync(LIBRARY_PATH)) {
    fs.mkdirSync(LIBRARY_PATH, { recursive: true });
}
/**
 * Retrieve relevant knowledge from the user's library
 */
async function retrieveKnowledge(query, limit = 3) {
    try {
        const files = fs.readdirSync(LIBRARY_PATH).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
        if (files.length === 0) {
            return [];
        }
        const snippets = [];
        for (const file of files) {
            const content = fs.readFileSync(path.join(LIBRARY_PATH, file), 'utf-8');
            const relevance = calculateRelevance(query, content);
            if (relevance > 0) {
                snippets.push({
                    source: file,
                    content: truncateContent(content, 500), // simple chunking
                    relevance
                });
            }
        }
        return snippets.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
    }
    catch (error) {
        console.warn('Knowledge retrieval failed:', error);
        return [];
    }
}
/**
 * Simple relevance scoring (Keyword Match)
 * In production, this would use Vector Embeddings (OpenAI Embeddings)
 */
function calculateRelevance(query, content) {
    const queryTerms = query.toLowerCase().split(' ').filter(w => w.length > 3);
    const contentLower = content.toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
        const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
        score += matches;
    }
    return score;
}
function truncateContent(content, length) {
    if (content.length <= length)
        return content;
    return content.substring(0, length) + '...';
}
function getKnowledgeInjectPrompt(snippets) {
    if (snippets.length === 0)
        return '';
    return `
### BRAND KNOWLEDGE & STYLE GUIDE
(Reference these external materials for tone and strategy)

${snippets.map(s => `SOURCE: ${s.source}\n---\n${s.content}\n---`).join('\n\n')}

INSTRUCTION: Align your creative output with the tone and principles found explicitly in the text above.
`;
}
