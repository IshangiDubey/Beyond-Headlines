import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import { syncSeedToMongo } from './data/store.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/newsportal';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);

// System Health / Info
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'offline (using in-memory store)';
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Beyond Headlines API',
    database: dbStatus
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('News Portal MERN Backend API is running.');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start MongoDB & Server
const startServer = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log('MongoDB successfully connected.');
    await syncSeedToMongo();
  } catch (err) {
    console.warn(`MongoDB not reached (${err.message}). Defaulting to built-in in-memory news repository.`);
  }

  app.listen(PORT, () => {
    console.log(`Professional News Portal Server listening on http://localhost:${PORT}`);
  });
};

startServer();
