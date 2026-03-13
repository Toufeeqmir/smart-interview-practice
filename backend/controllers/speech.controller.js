const axios = require("axios");
const FormData = require("form-data");
const Transcript = require("../models/Transcript");
const Session = require("../models/Session");

// @desc    Correct spoken text using Gemini API
// @route   POST /api/speech/correct-text
// @access  Private
const correctText = async (req, res) => {
  try {
    const { originalText, sessionId, expressionAtTime } = req.body;

    if (!originalText || originalText.trim() === "") {
      return res.status(400).json({ success: false, message: "No text provided." });
    }

    // Call Gemini API for grammar correction
    const geminiPrompt = `You are a grammar and language correction assistant.
The user spoke the following sentence. Please:
1. Correct any grammatical, spelling, or structural errors.
2. Improve sentence clarity while preserving the original meaning.
3. Return a JSON object with these fields:
   - correctedText: the improved sentence (string)
   - corrections: an array of objects with { original, corrected, type } where type is one of: grammar, spelling, punctuation, clarity, structure

Original sentence: "${originalText}"

Respond with valid JSON only, no extra text.`;

    let correctedText = originalText;
    let corrections = [];

    try {
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: geminiPrompt }] }],
        },
        { timeout: 10000 }
      );

      const rawText =
        geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      // Strip markdown code fences if present
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      correctedText = parsed.correctedText || originalText;
      corrections = parsed.corrections || [];
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError.message);
      // Fallback: return original text without correction
      correctedText = originalText;
    }

    // Find session and save transcript
    let session = null;
    if (sessionId) {
      session = await Session.findOne({ sessionId, user: req.user._id });
    }

    const transcript = await Transcript.create({
      user: req.user._id,
      session: session ? session._id : null,
      originalText,
      correctedText,
      corrections,
      expressionAtTime: expressionAtTime || "neutral",
    });

    // Increment correction count in session
    if (session && session.status === "active" && corrections.length > 0) {
      session.totalCorrections += corrections.length;
      await session.save();
    }

    res.status(200).json({
      success: true,
      originalText,
      correctedText,
      corrections,
      transcriptId: transcript._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Convert audio to text using the Python AI service (Whisper), then correct it
// @route   POST /api/speech/transcribe
// @access  Private
const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file provided." });
    }

    // Forward audio to Python AI service for speech-to-text
    const formData = new FormData();
    formData.append("audio", req.file.buffer, {
      filename: "audio.webm",
      contentType: req.file.mimetype,
    });

    let transcribedText;
    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/transcribe`,
        formData,
        { headers: formData.getHeaders(), timeout: 20000 }
      );
      transcribedText = aiResponse.data.text;
    } catch (aiError) {
      return res.status(502).json({
        success: false,
        message: "AI transcription service unavailable.",
        error: aiError.message,
      });
    }

    // Re-use the text correction logic by making an internal request-like call
    req.body.originalText = transcribedText;
    return correctText(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all transcripts for a session
// @route   GET /api/speech/transcripts/:sessionId
// @access  Private
const getSessionTranscripts = async (req, res) => {
  try {
    const session = await Session.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    const transcripts = await Transcript.find({ session: session._id }).sort({ timestamp: 1 });

    res.status(200).json({ success: true, count: transcripts.length, transcripts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { correctText, transcribeAudio, getSessionTranscripts };
