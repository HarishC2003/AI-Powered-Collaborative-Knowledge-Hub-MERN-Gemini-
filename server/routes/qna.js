// server/routes/qna.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Document = require("../models/Document");
const { answerFromDocs } = require("../services/aiService"); // ✅ import our helper

// POST /api/qna
router.post("/", auth, async (req, res) => {
  try {
    const { question } = req.body;

    // Validate input
    if (!question || question.trim() === "") {
      return res.status(400).json({ answer: "⚠️ A question is required." });
    }

    // Fetch some documents for context
    const docs = await Document.find().lean().limit(10); // limit context for prompt safety
    if (!docs || docs.length === 0) {
      return res.json({ answer: "⚠️ No documents available to answer from." });
    }

    // Call AI service to get an answer
    const answer = await answerFromDocs(question, docs);

    // Always return something safe
    return res.json({
      answer: answer || "⚠️ Could not generate an answer. Please try again later.",
    });
  } catch (err) {
    console.error("❌ Error in /api/qna:", err);
    return res.status(500).json({
      answer: "⚠️ Internal server error while answering your question.",
    });
  }
});

module.exports = router;