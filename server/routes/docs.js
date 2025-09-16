const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Document = require("../models/Document");
const Version = require("../models/Version");
const ai = require("../services/aiService");
const Activity = require("../models/Activity");

// Utility: check if user owns doc or is admin
function canModifyDoc(user, doc) {
  return user.role === "admin" || doc.createdBy.toString() === user.id;
}

// ---- CREATE DOCUMENT ----
router.post("/", auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // Generate AI fields with safe fallback
    const summary = await ai.summarizeDoc(content);
    const tags = await ai.generateTags(content);

    const doc = new Document({
      title,
      content,
      summary: summary || "No summary available",
      tags: Array.isArray(tags) ? tags : [],
      createdBy: req.user.id,
      versions: []
    });

    await doc.save();
    const populated = await doc.populate("createdBy", "name email role");

    // Log activity
    await Activity.create({ docId: doc._id, action: "created", by: req.user.id });

    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Create doc error:", err);
    res.status(500).json({ error: "Server error creating document" });
  }
});

// ---- GET ALL DOCUMENTS ----
router.get("/", auth, async (req, res) => {
  try {
    const docs = await Document.find()
      .populate("createdBy", "name email role")
      .sort({ updatedAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error("❌ Fetch docs error:", err);
    res.status(500).json({ error: "Server error fetching documents" });
  }
});

// ---- GET SINGLE DOCUMENT ----
router.get("/:id", auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  } catch (err) {
    console.error("❌ Fetch single doc error:", err);
    res.status(500).json({ error: "Server error fetching document" });
  }
});

// ---- UPDATE DOCUMENT ----
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const doc = await Document.findById(req.params.id);

    if (!doc) return res.status(404).json({ error: "Document not found" });
    if (!canModifyDoc(req.user, doc)) {
      return res.status(403).json({ error: "Not authorized to edit this document" });
    }

    // Save version BEFORE updating
    const version = new Version({
      docId: doc._id,
      title: doc.title,
      content: doc.content,
      summary: doc.summary,
      tags: doc.tags,
      editedAt: new Date(),
      editedBy: req.user.id,
    });
    await version.save();

    if (!doc.versions) doc.versions = [];
    doc.versions.push(version._id);

    // Apply new changes
    if (title) doc.title = title;
    if (content) doc.content = content;
    doc.updatedAt = Date.now();

    await doc.save();

    // Log activity
    await Activity.create({ docId: doc._id, action: "edited", by: req.user.id });

    const populated = await doc.populate("createdBy", "name email role");
    res.json(populated);
  } catch (err) {
    console.error("❌ Update doc error:", err);
    res.status(500).json({ error: "Server error updating document" });
  }
});

// ---- DELETE DOCUMENT ----
router.delete("/:id", auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (!canModifyDoc(req.user, doc)) {
      return res.status(403).json({ error: "Not authorized to delete this document" });
    }

    await doc.deleteOne();

    // Log activity
    await Activity.create({ docId: doc._id, action: "deleted", by: req.user.id });

    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("❌ Delete doc error:", err);
    res.status(500).json({ error: "Server error deleting document" });
  }
});

// ---- MANUAL: Summarize ----
router.post("/:id/summarize", auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (!canModifyDoc(req.user, doc)) {
      return res.status(403).json({ error: "Not authorized to summarize this document" });
    }

    const summary = await ai.summarizeDoc(doc.content);
    doc.summary = summary || doc.summary || "No summary available";
    await doc.save();

    await Activity.create({ docId: doc._id, action: "summarized", by: req.user.id });

    res.json({ summary: doc.summary });
  } catch (err) {
    console.error("❌ Summarize error:", err);
    res.json({ summary: "No summary available" });
  }
});

// ---- MANUAL: Generate Tags ----
router.post("/:id/tags", auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (!canModifyDoc(req.user, doc)) {
      return res.status(403).json({ error: "Not authorized to tag this document" });
    }

    const tags = await ai.generateTags(doc.content);
    doc.tags = Array.isArray(tags) ? tags : [];
    await doc.save();

    await Activity.create({ docId: doc._id, action: "retagged", by: req.user.id });

    res.json({ tags: doc.tags });
  } catch (err) {
    console.error("❌ Tag generation error:", err);
    res.json({ tags: [] });
  }
});

module.exports = router;