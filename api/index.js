const express = require("express");
const cors = require("cors");

// Creating the Express app
const app = express();

// CORS configuration for Vercel
app.use(cors({
  origin: ['https://pawpals-mu.vercel.app', 'http://localhost:4200'],
  credentials: true
}));

// Simple test endpoint that doesn't require database
app.get("/test", (req, res) => {
  res.status(200).json({ 
    message: "API test endpoint is working",
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
      DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
      DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET'
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Export for Vercel
module.exports = app;
