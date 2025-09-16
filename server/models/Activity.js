// server/models/Activity.js
const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    docId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
    action: { type: String, enum: ["created", "edited"], required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true } // gives createdAt (time of event)
);

module.exports = mongoose.model("Activity", ActivitySchema);