import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import setupGameRoutes from './routes/gameRoutes';
import { setupSocketHandlers } from './socket/socketHandlers';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO setup
setupSocketHandlers(io);

// Routes (pass io instance for broadcasting)
app.use('/api', setupGameRoutes(io));

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 clue-craft server running on port ${PORT}`);
});