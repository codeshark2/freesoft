import WebSocket from 'ws';
import { Session } from './session';

/**
 * Session manager that creates and tracks active sessions
 */
export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  createSession(ws: WebSocket): Session {
    const session = new Session(ws);

    session.on('ended', () => {
      this.sessions.delete(session.getId());
    });

    this.sessions.set(session.getId(), session);

    return session;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  async cleanupAll(): Promise<void> {
    const sessions = Array.from(this.sessions.values());
    await Promise.all(
      sessions.map((session) => {
        return new Promise<void>((resolve) => {
          session.once('ended', resolve);
          // Trigger cleanup by closing the underlying WebSocket
          (session as any).cleanup('error');
        });
      })
    );
    this.sessions.clear();
  }
}
