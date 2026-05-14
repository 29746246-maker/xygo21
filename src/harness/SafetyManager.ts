import { Tool, SafetyCheck } from './types';

export class SafetyManager {
  private safetyChecks: SafetyCheck[] = [];
  private blockedTools: Set<string> = new Set();

  constructor() {
    this.initializeDefaultChecks();
  }

  private initializeDefaultChecks(): void {
    const defaultChecks: SafetyCheck[] = [
      {
        id: 'file_write_restriction',
        name: 'File Write Restriction',
        description: 'Prevents writing to sensitive system files',
        check: (tool: Tool, params: any) => {
          if (tool.name.includes('write') || tool.name.includes('save')) {
            const restrictedPaths = ['/etc/', '/system/', '/root/'];
            const path = params.path || params.file || '';
            return !restrictedPaths.some(rp => path.includes(rp));
          }
          return true;
        },
        severity: 'block'
      },
      {
        id: 'command_execution_check',
        name: 'Command Execution Check',
        description: 'Validates command execution safety',
        check: (tool: Tool, params: any) => {
          if (tool.name.includes('command') || tool.name.includes('exec')) {
            const dangerousCommands = ['rm -rf', 'dd if=', 'mkfs', 'chmod 777'];
            const cmd = params.command || '';
            return !dangerousCommands.some(dc => cmd.includes(dc));
          }
          return true;
        },
        severity: 'error'
      },
      {
        id: 'parameter_validation',
        name: 'Parameter Validation',
        description: 'Ensures required parameters are present',
        check: (tool: Tool, params: any) => {
          return params !== null && params !== undefined;
        },
        severity: 'warn'
      }
    ];

    defaultChecks.forEach(check => this.addSafetyCheck(check));
  }

  addSafetyCheck(check: SafetyCheck): void {
    this.safetyChecks.push(check);
  }

  removeSafetyCheck(checkId: string): void {
    this.safetyChecks = this.safetyChecks.filter(check => check.id !== checkId);
  }

  checkToolExecution(tool: Tool, params: any): boolean {
    if (this.blockedTools.has(tool.id)) {
      return false;
    }

    for (const check of this.safetyChecks) {
      const result = check.check(tool, params);
      if (!result) {
        if (check.severity === 'block') {
          return false;
        }
      }
    }

    return true;
  }

  blockTool(toolId: string): void {
    this.blockedTools.add(toolId);
  }

  unblockTool(toolId: string): void {
    this.blockedTools.delete(toolId);
  }

  isToolBlocked(toolId: string): boolean {
    return this.blockedTools.has(toolId);
  }

  getSafetyChecks(): SafetyCheck[] {
    return [...this.safetyChecks];
  }

  getBlockedTools(): string[] {
    return Array.from(this.blockedTools);
  }
}
