import { Message, Tool, SafetyCheck, LogEntry, ContextStats, Plan } from './types';
import { ContextManager } from './ContextManager';
import { ConfigManager } from './ConfigManager';
import { ToolManager } from './ToolManager';
import { SafetyManager } from './SafetyManager';
import { AuditManager } from './AuditManager';
import { PromptCache } from './PromptCache';
import { ModelSelector } from './ModelSelector';
import { PlanManager } from './PlanManager';

export class Harness {
  private contextManager: ContextManager;
  private configManager: ConfigManager;
  private toolManager: ToolManager;
  private safetyManager: SafetyManager;
  private auditManager: AuditManager;
  private promptCache: PromptCache;
  private modelSelector: ModelSelector;
  private planManager: PlanManager;
  private logs: LogEntry[] = [];
  private maxLogEntries: number = 1000;

  constructor() {
    this.contextManager = new ContextManager();
    this.configManager = new ConfigManager();
    this.toolManager = new ToolManager();
    this.safetyManager = new SafetyManager();
    this.auditManager = new AuditManager();
    this.promptCache = new PromptCache();
    this.modelSelector = new ModelSelector();
    this.planManager = new PlanManager();

    this.registerDefaultTools();
    this.log('info', 'harness', 'Harness initialized', {});
  }

  private registerDefaultTools(): void {
    // 注册视频分析工具
    this.toolManager.registerTool({
      id: 'video_analyzer',
      name: '视频分析工具',
      description: '分析B站视频信息，获取视频详情、UP主信息和统计数据',
      type: 'video',
      category: 'video',
      permissions: ['*'],
      execute: async (params: any): Promise<any> => {
        const { bvid } = params;
        if (!bvid) {
          throw new Error('视频BV号不能为空');
        }

        // 模拟获取视频信息（实际项目中应调用B站API）
        return {
          bvid,
          aid: 123456789,
          title: '示例视频标题',
          description: '这是一个示例视频描述，包含视频的详细信息。',
          owner: {
            mid: 123456,
            name: '示例UP主'
          },
          stat: {
            view: 100000,
            danmaku: 1000,
            reply: 500,
            favorite: 2000,
            coin: 1500,
            share: 800,
            like: 3000
          },
          duration: 300,
          pic: 'https://example.com/cover.jpg',
          pubdate: Math.floor(Date.now() / 1000) - 86400
        };
      }
    });

    // 注册视频学习工具
    this.toolManager.registerTool({
      id: 'video_learning',
      name: '视频学习工具',
      description: '基于视频内容生成学习笔记和知识点总结',
      type: 'video',
      category: 'video',
      permissions: ['*'],
      execute: async (params: any): Promise<any> => {
        const { bvid, content } = params;
        if (!bvid) {
          throw new Error('视频BV号不能为空');
        }

        // 模拟生成学习笔记
        return {
          bvid,
          learningNotes: [
            '**核心知识点1**：视频中讲解的主要概念和原理',
            '**核心知识点2**：视频中展示的技术或方法',
            '**核心知识点3**：视频中提到的重要案例或实例',
            '**学习建议**：如何将视频内容应用到实际项目中',
            '**相关资源**：视频中推荐的相关学习资料'
          ],
          summary: '这是基于视频内容生成的学习总结，包含了视频的主要内容和关键信息。'
        };
      }
    });
  }

  // 核心方法
  addMessage(message: Message): void {
    this.contextManager.addMessage(message);
    this.log('info', 'context', `Message added: ${message.type}`, { 
      messageId: message.id 
    });
  }

  getContext(): Message[] {
    return this.contextManager.getContext();
  }

  getContextStats(): ContextStats {
    return this.contextManager.getStats();
  }

  async executeTool(tool: Tool, params: any): Promise<any> {
    const startTime = Date.now();
    this.log('info', 'tool', `Executing tool: ${tool.name}`, { 
      toolId: tool.id 
    });

    try {
      // 安全检查
      const isSafe = this.safetyManager.checkToolExecution(tool, params);
      if (!isSafe) {
        const error = `Tool execution blocked by safety check: ${tool.name}`;
        this.log('error', 'safety', error, { toolId: tool.id });
        throw new Error(error);
      }

      // 执行工具
      const result = await tool.execute(params);
      const duration = Date.now() - startTime;

      // 审计
      this.auditManager.logToolExecution(tool, params, result);
      this.log('success', 'tool', `Tool executed successfully: ${tool.name}`, { 
        toolId: tool.id,
        duration: `${duration}ms`
      });

      return result;
    } catch (error) {
      this.log('error', 'tool', `Tool execution failed: ${tool.name}`, { 
        toolId: tool.id,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  // 工具管理
  registerTool(tool: Tool): void {
    this.toolManager.registerTool(tool);
    this.log('info', 'tool', `Tool registered: ${tool.name}`, { toolId: tool.id });
  }

  getTool(name: string): Tool | undefined {
    return this.toolManager.getTool(name);
  }

  // 配置管理
  loadConfig(path: string): void {
    this.configManager.loadConfig(path);
    this.log('info', 'harness', `Config loaded: ${path}`, { path });
  }

  updateConfig(path: string, content: string): void {
    this.configManager.updateConfig(path, content);
    this.log('info', 'harness', `Config updated: ${path}`, { path });
  }

  // 安全管理
  addSafetyCheck(check: SafetyCheck): void {
    this.safetyManager.addSafetyCheck(check);
    this.log('info', 'safety', `Safety check added: ${check.name}`, { 
      checkId: check.id 
    });
  }

  // 日志管理
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    this.log('info', 'harness', 'Logs cleared', {});
  }

  // Prompt Cache
  getCachedPrompt(key: string): string | undefined {
    return this.promptCache.get(key);
  }

  setCachedPrompt(key: string, value: string): void {
    this.promptCache.set(key, value);
  }

  // 模型选择
  selectModel(taskComplexity: 'low' | 'medium' | 'high'): string {
    return this.modelSelector.selectModel(taskComplexity);
  }

  // 内部方法
  private log(
    level: LogEntry['level'], 
    category: LogEntry['category'], 
    message: string, 
    details?: Record<string, any>
  ): void {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details
    };

    this.logs.push(entry);
    
    // 限制日志数量
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }

    // 同时添加到审计日志
    this.auditManager.logEvent(entry);
  }

  // 工具执行池管理
  private toolExecutionPool = {
    maxConcurrent: 3,
    running: 0,
    queue: [] as Array<() => Promise<any>>,

    async execute<T>(fn: () => Promise<T>): Promise<T> {
      if (this.running < this.maxConcurrent) {
        this.running++;
        try {
          return await fn();
        } finally {
          this.running--;
          this.processQueue();
        }
      } else {
        return new Promise<T>((resolve, reject) => {
          this.queue.push(async () => {
            try {
              resolve(await fn());
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    },

    processQueue() {
      if (this.running < this.maxConcurrent && this.queue.length > 0) {
        const task = this.queue.shift();
        if (task) {
          this.execute(task);
        }
      }
    }
  };

  // 带超时的工具执行
  async executeToolWithTimeout(tool: Tool, params: any, timeout: number = 30000): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      return await Promise.race([
        this.toolExecutionPool.execute(() => this.executeTool(tool, params)),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error(`Tool execution timed out after ${timeout}ms`));
          });
        })
      ]);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // 计划管理
  createPlan(title: string, description: string, steps: Omit<Plan['steps'][0], 'id' | 'status'>[]): Plan {
    const plan = this.planManager.createPlan(title, description, steps);
    this.log('info', 'harness', `Plan created: ${title}`, { planId: plan.id });
    return plan;
  }

  getPlan(id: string): Plan | undefined {
    return this.planManager.getPlan(id);
  }

  getAllPlans(): Plan[] {
    return this.planManager.getAllPlans();
  }

  async executePlan(planId: string): Promise<Plan> {
    this.log('info', 'harness', `Executing plan: ${planId}`, {});
    
    try {
      const plan = await this.planManager.executePlan(planId, async (tool, params) => {
        // 从toolManager获取工具实例
        const toolInstance = this.toolManager.getTool(tool.id);
        if (!toolInstance) {
          throw new Error(`Tool not found: ${tool.id}`);
        }
        // 使用带超时的工具执行
        return this.executeToolWithTimeout(toolInstance, params);
      });
      
      this.log('success', 'harness', `Plan executed: ${planId}`, { 
        planStatus: plan.status 
      });
      return plan;
    } catch (error) {
      this.log('error', 'harness', `Plan execution failed: ${planId}`, { 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  // 智能规划生成
  generatePlan(task: string): Plan {
    const tools = this.toolManager.getAllTools();
    const plan = this.planManager.generatePlan(task, tools);
    this.log('info', 'harness', `Plan generated for task: ${task}`, { 
      planId: plan.id 
    });
    return plan;
  }

  // 获取所有管理器的实例（用于集成）
  getContextManager(): ContextManager {
    return this.contextManager;
  }

  getConfigManager(): ConfigManager {
    return this.configManager;
  }

  getToolManager(): ToolManager {
    return this.toolManager;
  }

  getSafetyManager(): SafetyManager {
    return this.safetyManager;
  }

  getPlanManager(): PlanManager {
    return this.planManager;
  }
}

// 单例实例
let harnessInstance: Harness | null = null;

export function getHarness(): Harness {
  if (!harnessInstance) {
    harnessInstance = new Harness();
  }
  return harnessInstance;
}

export function resetHarness(): void {
  harnessInstance = null;
}
