const express = require("express");
const router = express.Router();
const { correctText, transcribeAudio, getSessionTranscripts } = require("../controllers/speech.controller");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// All speech routes are protected
router.use(protect);

// POST /api/speech/start - initialize speech recognition for session
router.post("/start", (req, res) => {
  // This is a placeholder for speech recognition initialization
  // In a real implementation, this might set up WebSocket connections or initialize speech services
  res.status(200).json({ success: true, message: "Speech recognition initialized" });
});

// POST /api/speech/correct-text  - correct raw text input
router.post("/correct-text", correctText);

// POST /api/speech/transcribe  - upload audio → transcribe → correct
router.post("/transcribe", upload.single("audio"), transcribeAudio);

// GET /api/speech/transcripts/:sessionId
router.get("/transcripts/:sessionId", getSessionTranscripts);

module.exports = router;
