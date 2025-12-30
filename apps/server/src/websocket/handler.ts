import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import { SessionManager } from '../session/manager';

/**
 * WebSocket handler for managing voice AI sessions
 */
export class WebSocketHandler {
  private wss: WebSocketServer;
  private sessionManager: SessionManager;

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server });
    this.sessionManager = new SessionManager();
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      // Create a new session for this connection
      const session = this.sessionManager.createSession(ws);
    });

    this.wss.on('error', (error) => {
      // Silently handle errors
    });
  }

  async close(): Promise<void> {
    await this.sessionManager.cleanupAll();

    return new Promise((resolve, reject) => {
      this.wss.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getActiveSessionCount(): number {
    return this.sessionManager.getActiveSessionCount();
  }
}
