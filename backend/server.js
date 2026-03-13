const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const killPort = require("kill-port");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",       require("./routes/auth.routes"));
app.use("/api/sessions",   require("./routes/session.routes"));
app.use("/api/expression", require("./routes/expression.routes"));
app.use("/api/speech",     require("./routes/speech.routes"));
app.use("/api/interview",  require("./routes/interview.routes"));

app.get("/", (req, res) => {
  res.json({ message: "Facial Expression & Speech Correction API is running." });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
});

const BASE_PORT = process.env.PORT || 5001;

const startServer = async (port, maxAttempts = 3, attempt = 1) => {
  try {
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API available at http://localhost:${port}`);
    });

    process.on("SIGINT", () => {
      console.log("Shutting down gracefully...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
      setTimeout(() => {
        console.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    });
  } catch (err) {
    if (attempt < maxAttempts) {
      const nextPort = port + 1;
      console.log(`Port ${port} is in use, trying port ${nextPort}...`);
      await startServer(nextPort, maxAttempts, attempt + 1);
    } else {
      console.error(`Could not find available port after ${maxAttempts} attempts`);
      process.exit(1);
    }
  }
};

killPort(BASE_PORT)
  .then(() => {
    startServer(BASE_PORT);
  })
  .catch(() => {
    startServer(BASE_PORT);
  });