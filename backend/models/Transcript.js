const mongoose = require("mongoose");

const TranscriptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    originalText: {
      type: String,
      required: true,
      trim: true,
    },
    correctedText: {
      type: String,
      trim: true,
    },
    corrections: [
      {
        original: String,
        corrected: String,
        type: {
          type: String,
          enum: ["grammar", "spelling", "punctuation", "clarity", "structure"],
        },
      },
    ],
    expressionAtTime: {
      type: String,
      default: "neutral",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transcript", TranscriptSchema);
