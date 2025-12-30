import { Event, EventLog } from '@voice-ai-tester/shared';

/**
 * Event logger for capturing timestamped events during a session
 */
export class EventLogger {
  private events: Event[] = [];
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  log(event: Omit<Event, 'sessionId'>): void {
    this.events.push({
      ...event,
      sessionId: this.sessionId,
    } as Event);
  }

  getEvents(): Event[] {
    return [...this.events];
  }

  getEventLog(): EventLog {
    return {
      sessionId: this.sessionId,
      events: this.getEvents(),
    };
  }

  clear(): void {
    this.events = [];
  }
}
