const { v4: uuidv4 } = require("uuid");
const Session = require("../models/Session");
const Transcript = require("../models/Transcript");
const User = require("../models/User");

// @desc    Start a new session
// @route   POST /api/sessions/start
// @access  Private
const startSession = async (req, res) => {
  try {
    const session = await Session.create({
      user: req.user._id,
      sessionId: uuidv4(),
      startTime: new Date(),
      status: "active",
    });

    res.status(201).json({ success: true, message: "Session started.", session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    End a session and compute summary
// @route   PUT /api/sessions/:sessionId/end
// @access  Private
const endSession = async (req, res) => {
  try {
    const session = await Session.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    if (session.status === "completed") {
      return res.status(400).json({ success: false, message: "Session already ended." });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime - session.startTime) / 1000); // seconds

    // Calculate dominant expression from the log
    const summary = session.expressionSummary;
    const dominant = Object.keys(summary).reduce((a, b) => (summary[a] > summary[b] ? a : b));

    session.endTime = endTime;
    session.duration = duration;
    session.dominantExpression = dominant;
    session.status = "completed";
    await session.save();

    // Increment user's total sessions
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalSessions: 1 } });

    res.status(200).json({ success: true, message: "Session ended.", session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all sessions for logged-in user
// @route   GET /api/sessions
// @access  Private
const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single session with its transcripts
// @route   GET /api/sessions/:sessionId
// @access  Private
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    const transcripts = await Transcript.find({ session: session._id }).sort({ timestamp: 1 });

    res.status(200).json({ success: true, session, transcripts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get analytics report for the user (all sessions)
// @route   GET /api/sessions/report
// @access  Private
const getUserReport = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id, status: "completed" });

    if (sessions.length === 0) {
      return res.status(200).json({ success: true, message: "No completed sessions yet.", report: {} });
    }

    // Aggregate expression totals across all sessions
    const totalExpressions = {
      happy: 0, sad: 0, angry: 0, neutral: 0,
      surprised: 0, fearful: 0, disgusted: 0,
    };

    let totalDuration = 0;
    let totalCorrections = 0;

    sessions.forEach((s) => {
      totalDuration += s.duration;
      totalCorrections += s.totalCorrections;
      Object.keys(totalExpressions).forEach((key) => {
        totalExpressions[key] += s.expressionSummary[key] || 0;
      });
    });

    const totalDetections = Object.values(totalExpressions).reduce((a, b) => a + b, 0);
    const expressionPercentages = {};
    Object.keys(totalExpressions).forEach((key) => {
      expressionPercentages[key] = totalDetections > 0
        ? ((totalExpressions[key] / totalDetections) * 100).toFixed(1)
        : "0.0";
    });

    res.status(200).json({
      success: true,
      report: {
        totalSessions: sessions.length,
        totalDurationSeconds: totalDuration,
        totalSpeechCorrections: totalCorrections,
        expressionTotals: totalExpressions,
        expressionPercentages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startSession, endSession, getUserSessions, getSessionById, getUserReport };
