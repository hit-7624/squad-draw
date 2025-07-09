import express from 'express';
import cookieParser from 'cookie-parser';
import { API_SERVER_PORT, ORIGIN_URL } from '@repo/config';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Configure dotenv to load .env file from the root of api-server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.use(cors({
  origin: ORIGIN_URL,
  credentials: true,
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

app.use(errorHandler);

const port = Number(API_SERVER_PORT);
app.listen(port, () => {
  console.log(`API Server is running on port ${port}`);
});