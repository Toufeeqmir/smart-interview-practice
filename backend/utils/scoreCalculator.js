const FILLER_WORDS = [
  "umm", "um", "uh", "like", "you know", "basically",
  "literally", "actually", "so", "right", "okay", "hmm"
];

const detectFillerWords = (text) => {
  if (!text) return { fillerWords: [], fillerWordCount: 0 };

  const lower = text.toLowerCase();
  const found = [];

  FILLER_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches) {
      matches.forEach(() => found.push(word));
    }
  });

  return {
    fillerWords: [...new Set(found)],
    fillerWordCount: found.length,
  };
};

const calculateWordsPerMinute = (text, durationSeconds) => {
  if (!text || durationSeconds === 0) return 0;

  const wordCount = text.trim().split(/\s+/).length;
  const minutes = durationSeconds / 60;
  return Math.round(wordCount / minutes);
};

const calculateGrammarScore = (corrections, totalWords) => {
  if (!totalWords || totalWords === 0) return 100;

  const errorRate = corrections / totalWords;
  const score = Math.max(0, 100 - errorRate * 100);
  return Math.round(score);
};

const calculateFillerScore = (fillerWordCount, totalWords) => {
  if (!totalWords || totalWords === 0) return 100;

  const fillerRate = fillerWordCount / totalWords;
  const score = Math.max(0, 100 - fillerRate * 200);
  return Math.round(score);
};

const calculateConfidenceScore = (emotionSummary) => {
  const total = Object.values(emotionSummary).reduce((a, b) => a + b, 0);
  if (total === 0) return 50;

  const positive = (emotionSummary.happy || 0) + (emotionSummary.neutral || 0);
  const score = Math.round((positive / total) * 100);
  return Math.min(100, Math.max(0, score));
};

const calculateSpeechScore = (wordsPerMinute) => {
  if (wordsPerMinute === 0) return 50;
  if (wordsPerMinute >= 120 && wordsPerMinute <= 150) return 100;
  if (wordsPerMinute < 120) {
    return Math.max(0, Math.round(100 - (120 - wordsPerMinute) * 1.5));
  }
  return Math.max(0, Math.round(100 - (wordsPerMinute - 150) * 1.5));
};

const calculateOverallScore = (confidenceScore, grammarScore, speechScore, fillerScore) => {
  return Math.round(
    confidenceScore * 0.30 +
    grammarScore    * 0.25 +
    speechScore     * 0.25 +
    fillerScore     * 0.20
  );
};

const generateFeedback = (overallScore, wordsPerMinute, fillerWordCount, grammarScore) => {
  const feedback = [];

  if (overallScore >= 80) {
    feedback.push("Excellent performance! You showed great confidence and clarity.");
  } else if (overallScore >= 60) {
    feedback.push("Good performance! A few areas need improvement.");
  } else {
    feedback.push("Keep practicing! You will improve with more sessions.");
  }

  if (wordsPerMinute > 150) {
    feedback.push("You were speaking too fast. Try to slow down to 120-150 words per minute.");
  } else if (wordsPerMinute < 100 && wordsPerMinute > 0) {
    feedback.push("You were speaking too slowly. Try to maintain a steady pace.");
  }

  if (fillerWordCount > 5) {
    feedback.push(`You used ${fillerWordCount} filler words. Try to reduce words like umm, like, you know.`);
  }

  if (grammarScore < 70) {
    feedback.push("Work on your grammar and sentence structure.");
  }

  return feedback.join(" ");
};

const getDominantEmotion = (emotionSummary) => {
  return Object.keys(emotionSummary).reduce((a, b) =>
    emotionSummary[a] > emotionSummary[b] ? a : b
  );
};

module.exports = {
  detectFillerWords,
  calculateWordsPerMinute,
  calculateGrammarScore,
  calculateFillerScore,
  calculateConfidenceScore,
  calculateSpeechScore,
  calculateOverallScore,
  generateFeedback,
  getDominantEmotion,
};