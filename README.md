# Facial Expression & Speech Correction Application

This repository contains a **Node/Express backend**, a **Python AI microservice**, and a **React/Vite frontend**. The AI service performs facial expression detection using a Keras model and optional Whisper speech-to-text transcription.

## Running the Application Locally

### 1. Python AI microservice

1. Ensure Python 3.10+ is installed.
2. Create a virtual environment and install requirements:
   ```bash
   cd backend/ai_service
   python -m venv venv
   .\venv\Scripts\activate       # Windows
   pip install -r requirements.txt
   ```
3. Place your trained `facial_expression_model.h5` inside `backend/ai_service/` (or the service will return dummy values).
4. Launch the service:
   ```bash
   python app.py
   ```
   It listens on port `8000` by default.

You can also run the backend in development mode along with the AI service via npm script:
```bash
cd backend
npm install
npm run dev:all       # requires `concurrently` globally or as a project dependency
```

### 2. Node/Express backend

1. In `backend/.env` set the following variables:
   ```env
   PORT=3000          # or any free port
   AI_SERVICE_URL=http://localhost:8000   # point to your local Python service
   MONGO_URI=mongodb://localhost:27017/facial_speech_db
   JWT_SECRET=your_secret
   ```
2. Install dependencies and start:
   ```bash
   cd backend
   npm install
   npm run dev         # or `npm start` for production
   ```

### 3. React frontend

1. Update proxy in `frontend/vite.config.js` to match the backend port (defaults to 3000):
   ```js
   server: {
     proxy: {
       "/api": {
         target: "http://localhost:3000",
         changeOrigin: true,
       }
     }
   }
   ```
2. Install and launch:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The front-end `analyzeExpression` helper already sends camera frames to `/api/expression/analyze`. The backend forwards them to the AI service using `AI_SERVICE_URL`.

## Environment Details

- **Frontend**: React + Vite, camera capture, speech recognition.
- **Backend**: Express routes for sessions, speech, and expression analysis.
- **AI microservice**: Flask app exposing `/predict-expression` and `/transcribe` endpoints.

## Notes

- Ensure the Python service is running before starting a session, or the backend will respond with a 502 error.
- You may keep `AI_SERVICE_URL` pointed to a remote service (e.g. a HuggingFace space) if you prefer not to run it locally.

Happy coding! 🎯