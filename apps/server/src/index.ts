import express from 'express';
import { createServer } from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { WebSocketHandler } from './websocket/handler';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const STATIC_DIR = path.join(__dirname, '../../web/out');

const app = express();
const server = createServer(app);

// Initialize WebSocket handler
const wsHandler = new WebSocketHandler(server);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeSessions: wsHandler.getActiveSessionCount(),
  });
});

// Serve static files from Next.js build
if (NODE_ENV === 'production') {
  app.use(express.static(STATIC_DIR));

  // Catch-all handler for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(STATIC_DIR, 'index.html'));
  });
} else {
  // Development mode - show helpful message
  app.get('*', (req, res) => {
    res.json({
      message:
        'Server is running in development mode. Build the frontend first with `pnpm build` or run `pnpm dev` from the root.',
      websocket: 'ws://localhost:' + PORT,
    });
  });
}

// Graceful shutdown
const shutdown = async () => {
  try {
    await wsHandler.close();
    server.close(() => {
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      process.exit(1);
    }, 10000);
  } catch (error) {
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Voice AI Testing Tool - Server Running                   ║
╠═══════════════════════════════════════════════════════════╣
║  Environment: ${NODE_ENV.padEnd(44)}║
║  Port:        ${PORT.toString().padEnd(44)}║
║  HTTP:        http://localhost:${PORT.toString().padEnd(33)}║
║  WebSocket:   ws://localhost:${PORT.toString().padEnd(35)}║
╚═══════════════════════════════════════════════════════════╝
  `);
});
