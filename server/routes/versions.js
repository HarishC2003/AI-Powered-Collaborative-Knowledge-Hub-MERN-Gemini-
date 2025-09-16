const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Version = require("../models/Version");

// GET version history for a given document
router.get("/:docId", auth, async (req, res) => {
  try {
    const versions = await Version.find({ docId: req.params.docId })
      .populate("editedBy", "name email")
      .sort({ editedAt: -1 });

    res.json(versions);
  } catch (err) {
    console.error("❌ Error fetching versions:", err);
    res.status(500).json({ error: "Server error fetching document history" });
  }
});

module.exports = router;