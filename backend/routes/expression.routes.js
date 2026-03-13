const express = require("express");
const router = express.Router();
const { analyzeExpression } = require("../controllers/expression.controller");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// POST /api/expression/analyze
// Accepts a single image frame (field name: "image")
router.post("/analyze", protect, upload.single("image"), analyzeExpression);

module.exports = router;
