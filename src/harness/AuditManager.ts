import { Tool, LogEntry } from './types';

interface AuditRecord {
  id: string;
  timestamp: string;
  type: 'tool_execution' | 'config_change' | 'safety_event' | 'context_change';
  data: Record<string, any>;
}

export class AuditManager {
  private auditTrail: AuditRecord[] = [];
  private maxRecords: number = 10000;
  private eventLog: LogEntry[] = [];

  logToolExecution(tool: Tool, params: any, result: any): void {
    const record: AuditRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'tool_execution',
      data: {
        toolId: tool.id,
        toolName: tool.name,
        params: this.sanitizeData(params),
        hasResult: result !== undefined,
        resultType: typeof result
      }
    };

    this.addRecord(record);
  }

  logConfigChange(path: string, oldContent: string, newContent: string): void {
    const record: AuditRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'config_change',
      data: {
        path,
        changedAt: new Date().toISOString()
      }
    };

    this.addRecord(record);
  }

  logSafetyEvent(tool: Tool, check: string, blocked: boolean): void {
    const record: AuditRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'safety_event',
      data: {
        toolId: tool.id,
        toolName: tool.name,
        checkName: check,
        blocked
      }
    };

    this.addRecord(record);
  }

  logContextChange(action: string, details: Record<string, any>): void {
    const record: AuditRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'context_change',
      data: {
        action,
        ...details
      }
    };

    this.addRecord(record);
  }

  logEvent(entry: LogEntry): void {
    this.eventLog.push(entry);
    if (this.eventLog.length > this.maxRecords) {
      this.eventLog = this.eventLog.slice(-this.maxRecords);
    }
  }

  private addRecord(record: AuditRecord): void {
    this.auditTrail.push(record);
    if (this.auditTrail.length > this.maxRecords) {
      this.auditTrail = this.auditTrail.slice(-this.maxRecords);
    }
  }

  getAuditTrail(startTime?: string, endTime?: string): AuditRecord[] {
    let trail = [...this.auditTrail];
    
    if (startTime) {
      trail = trail.filter(r => r.timestamp >= startTime);
    }
    if (endTime) {
      trail = trail.filter(r => r.timestamp <= endTime);
    }

    return trail;
  }

  getEvents(): LogEntry[] {
    return [...this.eventLog];
  }

  clearAuditTrail(): void {
    this.auditTrail = [];
  }

  clearEvents(): void {
    this.eventLog = [];
  }

  private sanitizeData(data: any): any {
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      const sensitiveKeys = ['password', 'secret', 'key', 'token', 'auth'];
      
      for (const key of sensitiveKeys) {
        if (sanitized[key]) {
          sanitized[key] = '[REDACTED]';
        }
      }
      
      return sanitized;
    }
    return data;
  }
}
