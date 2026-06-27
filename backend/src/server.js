import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; 
import authRoutes from './routes/authRoutes.js'; 
import eventRoutes from './routes/eventRoutes.js';
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'SplitSync ESM Server is up and running!' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes); // ◄ Mount Event Routes here
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`⚙️  Server running smoothly on port ${PORT}`);
});