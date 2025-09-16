const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(200).json({ results: [] });
    }

    const results = await aiService.semanticSearch(query);

    if (!Array.isArray(results)) {
      console.warn("semanticSearch did not return an array", results);
      return res.status(200).json({ results: [] });
    }

    return res.json({ results });
  } catch (err) {
    console.error("Error in semantic search:", err);
    return res.status(200).json({ results: [] });
  }
});

module.exports = router;
