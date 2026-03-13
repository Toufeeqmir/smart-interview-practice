const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const InterviewSession = require("../models/InterviewSession");
const Question = require("../models/Question");
const {
  detectFillerWords,
  calculateWordsPerMinute,
  calculateGrammarScore,
  calculateFillerScore,
  calculateConfidenceScore,
  calculateSpeechScore,
  calculateOverallScore,
  generateFeedback,
  getDominantEmotion,
} = require("../utils/scoreCalculator");

const DEFAULT_QUESTIONS = [
  { question: "Tell me about yourself.",                                          category: "general",      difficulty: "easy"   },
  { question: "What are your greatest strengths?",                                category: "general",      difficulty: "easy"   },
  { question: "What is your biggest weakness?",                                   category: "general",      difficulty: "easy"   },
  { question: "Why do you want this job?",                                        category: "behavioral",   difficulty: "medium" },
  { question: "Where do you see yourself in 5 years?",                           category: "general",      difficulty: "medium" },
  { question: "Tell me about a time you faced a challenge and how you solved it.", category: "behavioral",  difficulty: "medium" },
  { question: "How do you handle pressure and stressful situations?",             category: "behavioral",   difficulty: "medium" },
  { question: "Why should we hire you?",                                          category: "general",      difficulty: "hard"   },
  { question: "Describe a time you showed leadership.",                           category: "behavioral",   difficulty: "hard"   },
  { question: "What motivates you to do your best work?",                         category: "situational",  difficulty: "medium" },
];

// @desc    Get random interview questions
// @route   GET /api/interview/questions
// @access  Private
const getQuestions = async (req, res) => {
  try {
    const { category, difficulty, limit = 5 } = req.query;

    let questions = await Question.find();

    if (questions.length === 0) {
      await Question.insertMany(DEFAULT_QUESTIONS);
      questions = await Question.find();
    }

    if (category) {
      questions = questions.filter((q) => q.category === category);
    }

    if (difficulty) {
      questions = questions.filter((q) => q.difficulty === difficulty);
    }

    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, parseInt(limit));

    res.status(200).json({ success: true, count: selected.length, questions: selected });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start a new interview session
// @route   POST /api/interview/start
// @access  Private
const startInterview = async (req, res) => {
  try {
    const session = await InterviewSession.create({
      user:      req.user._id,
      sessionId: uuidv4(),
      startTime: new Date(),
      status:    "active",
    });

    res.status(201).json({ success: true, message: "Interview session started.", session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit answer for one question
// @route   POST /api/interview/answer
// @access  Private
const submitAnswer = async (req, res) => {
  try {
    const {
      sessionId,
      question,
      category,
      originalAnswer,
      emotionLog,
      emotionSummary,
      duration,
    } = req.body;

    if (!sessionId || !question || !originalAnswer) {
      return res.status(400).json({
        success: false,
        message: "sessionId, question and originalAnswer are required.",
      });
    }

    const session = await InterviewSession.findOne({
      sessionId,
      user:   req.user._id,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Active interview session not found." });
    }

    // Grammar correction using Gemini
    let correctedAnswer = originalAnswer;
    let corrections     = [];

    try {
      const geminiPrompt = `You are a grammar and language correction assistant.
The user spoke the following sentence during an interview. Please:
1. Correct any grammatical, spelling, or structural errors.
2. Improve sentence clarity while preserving the original meaning.
3. Return a JSON object with these fields:
   - correctedText: the improved sentence (string)
   - corrections: an array of objects with { original, corrected, type }

Original sentence: "${originalAnswer}"

Respond with valid JSON only, no extra text.`;

      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: geminiPrompt }] }] },
        { timeout: 10000 }
      );

      const rawText  = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const parsed    = JSON.parse(cleanJson);
      correctedAnswer = parsed.correctedText || originalAnswer;
      corrections     = parsed.corrections   || [];
    } catch (geminiError) {
      console.error("Gemini error:", geminiError.message);
    }

    // Calculate all scores
    const totalWords                      = originalAnswer.trim().split(/\s+/).length;
    const { fillerWords, fillerWordCount } = detectFillerWords(originalAnswer);
    const wordsPerMinute                  = calculateWordsPerMinute(originalAnswer, duration || 60);
    const grammarScore                    = calculateGrammarScore(corrections.length, totalWords);
    const fillerScore                     = calculateFillerScore(fillerWordCount, totalWords);
    const summary                         = emotionSummary || { happy: 0, neutral: 0, angry: 0, fear: 0, sad: 0, disgust: 0, surprise: 0 };
    const confidenceScore                 = calculateConfidenceScore(summary);
    const speechScore                     = calculateSpeechScore(wordsPerMinute);
    const overallScore                    = calculateOverallScore(confidenceScore, grammarScore, speechScore, fillerScore);
    const dominantEmotion                 = getDominantEmotion(summary);
    const feedback                        = generateFeedback(overallScore, wordsPerMinute, fillerWordCount, grammarScore);

    session.answers.push({
      question,
      category:        category || "general",
      originalAnswer,
      correctedAnswer,
      fillerWords,
      fillerWordCount,
      wordsPerMinute,
      dominantEmotion,
      emotionLog:      emotionLog     || [],
      emotionSummary:  summary,
      confidenceScore,
      grammarScore,
      speechScore,
      fillerScore,
      overallScore,
      duration:        duration || 0,
      feedback,
    });

    await session.save();

    res.status(200).json({
      success: true,
      result: {
        correctedAnswer,
        corrections,
        fillerWords,
        fillerWordCount,
        wordsPerMinute,
        dominantEmotion,
        confidenceScore,
        grammarScore,
        speechScore,
        fillerScore,
        overallScore,
        feedback,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    End interview session and get final result
// @route   PUT /api/interview/:sessionId/end
// @access  Private
const endInterview = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      sessionId: req.params.sessionId,
      user:      req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Interview session not found." });
    }

    if (session.answers.length === 0) {
      return res.status(400).json({ success: false, message: "No answers submitted yet." });
    }

    const totalScore = Math.round(
      session.answers.reduce((sum, a) => sum + a.overallScore, 0) / session.answers.length
    );

    const totalDuration = session.answers.reduce((sum, a) => sum + a.duration, 0);

    const avgWPM = Math.round(
      session.answers.reduce((sum, a) => sum + a.wordsPerMinute, 0) / session.answers.length
    );

    const totalFillers = session.answers.reduce((sum, a) => sum + a.fillerWordCount, 0);

    const avgGrammar = Math.round(
      session.answers.reduce((sum, a) => sum + a.grammarScore, 0) / session.answers.length
    );

    const overallFeedback = generateFeedback(totalScore, avgWPM, totalFillers, avgGrammar);

    session.totalScore      = totalScore;
    session.totalDuration   = totalDuration;
    session.overallFeedback = overallFeedback;
    session.status          = "completed";
    session.endTime         = new Date();

    await session.save();

    res.status(200).json({
      success: true,
      result: {
        sessionId:      session.sessionId,
        totalScore,
        totalDuration,
        overallFeedback,
        totalQuestions: session.answers.length,
        answers:        session.answers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single interview result
// @route   GET /api/interview/:sessionId
// @access  Private
const getInterviewResult = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      sessionId: req.params.sessionId,
      user:      req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Interview session not found." });
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all interview sessions for user
// @route   GET /api/interview/history
// @access  Private
const getInterviewHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      user:   req.user._id,
      status: "completed",
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuestions,
  startInterview,
  submitAnswer,
  endInterview,
  getInterviewResult,
  getInterviewHistory,
};