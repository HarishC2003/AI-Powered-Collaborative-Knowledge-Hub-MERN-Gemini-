// services/aiService.js
const Document = require("../models/Document");
const fetch = require("node-fetch"); // Node <18; else use global fetch

// Load Gemini API config
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

console.log("🚀 Using Gemini model:", MODEL);

/**
 * Call Gemini API
 * @param {string} prompt - text prompt
 * @param {string} purpose - summarization/tag/search/QnA
 * @returns {string|null} - response text
 */
async function callGemini(prompt, purpose = "general") {
  if (!GEMINI_API_KEY) {
    console.warn("⚠️ No Gemini API key in .env — using local fallback.");
    return null;
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      });

      const data = await res.json();

      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim();
      }

      const errorMsg = data.error?.message || JSON.stringify(data);
      console.warn(`⚠️ Gemini ${purpose} error (attempt ${attempt}):`, errorMsg);

      if (/quota|billing|limit/i.test(errorMsg)) break; // break on quota
    } catch (err) {
      console.error(`❌ Gemini fetch failed [${purpose}, attempt ${attempt}]:`, err.message);
    }

    await new Promise((r) => setTimeout(r, 2 ** (attempt - 1) * 1000)); // exponential backoff
  }

  return null;
}

/** Local fallback summarization */
function localSummarize(text) {
  const sentences = text.split(/[.?!]\s/).filter(Boolean);
  if (sentences.length > 0) return sentences.slice(0, 3).join(". ") + ".";
  return text.length > 200 ? text.slice(0, 200) + "..." : text;
}

/** Local fallback tag generation */
function localTags(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4);
  const freq = {};
  words.forEach((w) => (freq[w] = (freq[w] || 0) + 1));
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([word]) => word);
}

/** Summarize document content */
async function summarizeDoc(content) {
  const prompt = `Summarize this text clearly in 3–4 sentences:\n\n${content}`;
  const summary = await callGemini(prompt, "summarization");
  return summary || localSummarize(content);
}

/** Generate tags from content */
async function generateTags(content) {
  const prompt = `Extract 5–7 relevant keywords/tags (comma-separated). Keep tags short (1–2 words):\n\n${content}`;
  const tagsText = await callGemini(prompt, "tag generation");

  if (tagsText) {
    return tagsText.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 7);
  }
  return localTags(content);
}

/** Semantic search */
async function semanticSearch(query) {
  try {
    const docs = await Document.find().lean();
    if (!docs || docs.length === 0) return [];

    const prompt = `Return the most relevant documents for this query: "${query}".
Docs:
${docs
  .map((d, i) => `(${i + 1}) Title: ${d.title}\nContent: ${d.content.slice(0, 200)}`)
  .join("\n\n")}
Respond strictly as JSON array: [{"title":"...","snippet":"..."}]`;

    const responseText = await callGemini(prompt, "semantic search");

    if (responseText) {
      try {
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.warn("⚠️ Gemini semantic search did not return JSON — fallback to keyword search");
      }
    }

    // Fallback: naive keyword search
    const lowerQ = query.toLowerCase();
    return docs
      .filter((d) => (d.title + d.content).toLowerCase().includes(lowerQ))
      .slice(0, 5)
      .map((d) => ({
        title: d.title,
        snippet: d.content.slice(0, 200) + "...",
      }));
  } catch (err) {
    console.error("❌ semanticSearch error:", err);
    return [];
  }
}

/** Answer a question from documents */
async function answerFromDocs(question, docs) {
  try {
    if (!docs || docs.length === 0) return "⚠️ No documents available for answering.";

    const context = docs
      .map(
        (d, i) =>
          `(${i + 1}) Title: ${d.title}\nSummary: ${d.summary || d.content.slice(0, 200)}`
      )
      .join("\n\n");

    const prompt = `You are a helpful knowledge assistant. Use ONLY the following docs as context.
If answer is not found in docs, reply: "I don’t know based on stored docs."

Docs:
${context}

Question: ${question}

Answer in 3–5 sentences:`;

    const answer = await callGemini(prompt, "QnA");
    if (answer) return answer;

    // Fallback: simple keyword search
    const q = question.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
    const match = docs.find(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.summary && d.summary.toLowerCase().includes(q)) ||
        (d.content && d.content.toLowerCase().includes(q))
    );

    if (match) {
      return `📄 Based on "${match.title}":\n${match.summary || match.content.slice(0, 200) + "..."}`;
    }

    return "⚠️ Could not find an answer in the documents.";
  } catch (err) {
    console.error("❌ Q&A error:", err);
    return "⚠️ Error occurred during Q&A.";
  }
}

module.exports = {
  summarizeDoc,
  generateTags,
  semanticSearch,
  answerFromDocs,
  callGemini,
};
