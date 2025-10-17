require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const path = require('path');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// --- CORS Setup for Multiple Origins (using cors middleware) ---
const allowedOrigins = [
  'http://localhost:3000', // Your frontend (ensure correct port)
  'http://localhost:3002', // Alternate port, if needed
  process.env.FRONTEND_URL, // From your .env
  'https://ai-cv-analyzer.netlify.app'
].filter(Boolean); // Remove undefined entries

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));

// --- Body Parsers ---
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Basic Health Check Route ---
app.get('/', (req, res) => {
  res.send('AI Resume Analyzer Backend is running!');
});

// --- API Routes ---
app.use('/api/upload', uploadRoutes); // Mount the upload routes under /api/upload

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
      status: err.status || 500
    }
  });
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.warn("WARNING: Supabase environment variables are not set. Supabase integration will fail.");
  }
});
