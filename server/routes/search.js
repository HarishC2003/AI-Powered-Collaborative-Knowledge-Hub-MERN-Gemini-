const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService"); // your semantic search logic

// Semantic search endpoint
router.get("/", async (req, res) => {
  try {
    const { q } = req.query; // search query

    if (!q || q.trim() === "") {
      return res.status(200).json({ results: [] });
    }

    // Call your AI service to do semantic search
    // Should return an array of objects: [{ title, snippet, id, ... }]
    const results = await aiService.semanticSearch(q);

    // Always return an array, even if empty
    res.status(200).json({ results: Array.isArray(results) ? results : [] });
  } catch (err) {
    console.error("Semantic search error:", err);
    res.status(200).json({ results: [] }); // never fail frontend
  }
});

module.exports = router;
