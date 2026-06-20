const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env
dotenv.config();

// Fire up the database connection
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows your routes to read JSON payloads (req.body)

// Basic Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ status: "success", message: "SplitSync API is up and running." });
});

// Start listening for client requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`⚙️  Server running in development mode on port ${PORT}`);
});