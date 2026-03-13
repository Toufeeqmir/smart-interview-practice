const axios = require("axios");
const FormData = require("form-data");
const Session = require("../models/Session");

const HF_MODEL_URL = process.env.AI_SERVICE_URL || "https://toufeeq04-emotion-backend.hf.space";

const EXPRESSION_LABELS = ["anger", "disgust", "fear", "happy", "neutral", "sad", "surprise"];

const analyzeExpression = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image frame provided.",
      });
    }

    let expression   = "neutral";
    let confidence   = 0;
    let faceDetected = false;

    try {
      const formData = new FormData();
      formData.append("file", req.file.buffer, {
        filename: "frame.jpg",
        contentType: "image/jpeg",
      });

      console.log("Sending image to HuggingFace...");
      console.log("HuggingFace URL:", `${HF_MODEL_URL}/predict`);
      console.log("Image size:", req.file.buffer.length, "bytes");

      const aiResponse = await axios.post(
        `${HF_MODEL_URL}/predict`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 15000,
        }
      );

      const data = aiResponse.data;
      console.log("HuggingFace response:", JSON.stringify(data));

      if (data.emotion) {
        expression   = data.emotion.toLowerCase().trim();
        confidence   = parseFloat(data.confidence) || 0;
        faceDetected = true;
      }

      if (!EXPRESSION_LABELS.includes(expression)) {
        expression = "neutral";
      }

    } catch (aiError) {
      console.error("HuggingFace error status  :", aiError.response?.status);
      console.error("HuggingFace error data    :", JSON.stringify(aiError.response?.data));
      console.error("HuggingFace error message :", aiError.message);
      console.error("HuggingFace error code    :", aiError.code);

      return res.status(200).json({
        success: true,
        expression: "neutral",
        confidence: 0,
        face_detected: false,
        warning: "Model temporarily unavailable.",
      });
    }

    if (sessionId && faceDetected) {
      const session = await Session.findOne({
        sessionId,
        user: req.user._id,
      });

      if (session && session.status === "active") {
        session.expressionLog.push({ expression, confidence });

        if (session.expressionSummary[expression] !== undefined) {
          session.expressionSummary[expression] += 1;
        }

        await session.save();
      }
    }

    res.status(200).json({
      success: true,
      expression,
      confidence,
      face_detected: faceDetected,
    });

  } catch (error) {
    console.error("Controller error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { analyzeExpression };