// server/models/Version.js
const mongoose = require("mongoose");

const VersionSchema = new mongoose.Schema(
  {
    docId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
    title: { type: String },
    content: { type: String },
    summary: { type: String },
    tags: [{ type: String }],
    editedAt: { type: Date, default: Date.now },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Version", VersionSchema);