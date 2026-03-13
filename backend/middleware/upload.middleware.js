const multer = require("multer");
const path = require("path");

// Use memory storage so files can be forwarded to Python AI service
const storage = multer.memoryStorage();

// File filter: allow images and audio
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp/;
  const allowedAudioTypes = /mp3|wav|ogg|webm|m4a/;

  const extname = path.extname(file.originalname).toLowerCase().replace(".", "");

  if (file.fieldname === "image" && allowedImageTypes.test(extname)) {
    return cb(null, true);
  }
  if (file.fieldname === "audio" && allowedAudioTypes.test(extname)) {
    return cb(null, true);
  }

  cb(new Error(`Unsupported file type: ${file.mimetype}`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

module.exports = upload;
