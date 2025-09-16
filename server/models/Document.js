// server/models/Document.js
const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },

    // AI generated / optionally user editable
    summary: { type: String },
    tags: [{ type: String }],

    // Who created this document
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Embedding vector for semantic search (Gemini/other LLMs)
    embedding: [{ type: Number }],

    // Optional: Track versions (each edit creates new Version doc)
    versions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Version" }]
  },
  { timestamps: true } // ✅ auto adds createdAt & updatedAt
);

// ✅ Text index to support keyword search
DocumentSchema.index({ title: "text", content: "text", summary: "text", tags: "text" });

module.exports = mongoose.model("Document", DocumentSchema);