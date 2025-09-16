const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Activity = require("../models/Activity");

router.get("/", auth, async (req, res) => {
  try {
    const feed = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("by", "name email")
      .populate("docId", "title");
    res.json(feed);
  } catch (err) {
    console.error("Activity fetch error:", err);
    res.status(500).json({ error: "Server error fetching activity feed" });
  }
});

module.exports = router;