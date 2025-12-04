import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import setupGameRoutes from './routes/gameRoutes';
import { setupSocketHandlers } from './socket/socketHandlers';

dotenv.config();

const app = express();
const server = createServer(app);

const WHITELIST = new Set([
  "https://clue-craft-xpoe.vercel.app",
  "https://clue-craft-zold.vercel.app",
  "http://localhost:3000"
]);

// Express-level dynamic CORS to ensure the response header exactly matches the incoming Origin
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  if (origin && WHITELIST.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  // Preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// Socket.IO setup
const io = new Server(server, {
  // keep origin list — socket.io will still send correct CORS response for handshake
  cors: {
    origin: [
      "https://clue-craft-xpoe.vercel.app",
      "https://clue-craft-zold.vercel.app",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  // optional: tune timeouts for debugging
  pingTimeout: 20000,
  pingInterval: 10000
});

setupSocketHandlers(io);

// Routes (pass io instance for broadcasting)
app.use('/api', setupGameRoutes(io));

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 clue-craft server running on port ${PORT}`);
});
