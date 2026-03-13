const express = require("express");
const router = express.Router();
const {
  startSession,
  endSession,
  getUserSessions,
  getSessionById,
  getUserReport,
} = require("../controllers/session.controller");
const { protect } = require("../middleware/auth.middleware");

// All session routes are protected
router.use(protect);

// POST /api/sessions/start
router.post("/start", startSession);

// GET /api/sessions/report  (must come before /:sessionId to avoid conflict)
router.get("/report", getUserReport);

// GET /api/sessions
router.get("/", getUserSessions);

// GET /api/sessions/:sessionId
router.get("/:sessionId", getSessionById);

// PUT /api/sessions/:sessionId/end
router.put("/:sessionId/end", endSession);

module.exports = router;
