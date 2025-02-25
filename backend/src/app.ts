import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eduvision';
mongoose.connect(MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
});

app.use('/api/auth', authRoutes);

export default app;