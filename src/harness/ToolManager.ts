import { Tool } from './types';

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
}

export class ToolManager {
  private tools: Map<string, Tool> = new Map();
  private categories: Map<string, ToolCategory> = new Map();
  private disabledTools: Set<string> = new Set();

  constructor() {
    this.initDefaultCategories();
  }

  private initDefaultCategories(): void {
    this.categories.set('core', {
      id: 'core',
      name: '核心工具',
      description: '系统核心工具集合'
    });
    this.categories.set('custom', {
      id: 'custom',
      name: '自定义工具',
      description: '用户自定义的工具'
    });
    this.categories.set('mcp', {
      id: 'mcp',
      name: 'MCP工具',
      description: 'Model Context Protocol 工具'
    });
    this.categories.set('video', {
      id: 'video',
      name: '视频工具',
      description: '视频分析和处理工具'
    });
  }

  registerTool(tool: Tool): void {
    this.tools.set(tool.id, tool);
    console.log(`[ToolManager] Registered tool: ${tool.name}`);
  }

  registerTools(tools: Tool[]): void {
    for (const tool of tools) {
      this.registerTool(tool);
    }
  }

  getTool(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  getToolByName(name: string): Tool | undefined {
    return Array.from(this.tools.values()).find(tool => tool.name === name);
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getToolsByCategory(category: string): Tool[] {
    return Array.from(this.tools.values())
      .filter(tool => tool.category === category);
  }

  updateTool(id: string, updates: Partial<Tool>): void {
    const tool = this.tools.get(id);
    if (tool) {
      Object.assign(tool, updates);
    }
  }

  deleteTool(id: string): void {
    this.tools.delete(id);
    this.disabledTools.delete(id);
  }

  disableTool(id: string): void {
    this.disabledTools.add(id);
  }

  enableTool(id: string): void {
    this.disabledTools.delete(id);
  }

  isToolEnabled(id: string): boolean {
    return !this.disabledTools.has(id);
  }

  getEnabledTools(): Tool[] {
    return this.getAllTools()
      .filter(tool => this.isToolEnabled(tool.id));
  }

  // 工具分类管理
  addCategory(category: ToolCategory): void {
    this.categories.set(category.id, category);
  }

  getCategory(id: string): ToolCategory | undefined {
    return this.categories.get(id);
  }

  getAllCategories(): ToolCategory[] {
    return Array.from(this.categories.values());
  }

  // 工具搜索
  searchTools(query: string): Tool[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTools()
      .filter(tool => 
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery) ||
        tool.type.toLowerCase().includes(lowerQuery)
      );
  }

  // 工具权限检查
  hasPermission(tool: Tool, permission: string): boolean {
    return tool.permissions.includes(permission) || tool.permissions.includes('*');
  }

  // 批量操作
  batchUpdateTools(updates: Record<string, Partial<Tool>>): void {
    for (const [id, update] of Object.entries(updates)) {
      this.updateTool(id, update);
    }
  }

  batchDeleteTools(ids: string[]): void {
    for (const id of ids) {
      this.deleteTool(id);
    }
  }

  // 导出工具列表
  exportTools(): string {
    const tools = this.getAllTools().map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      type: tool.type,
      permissions: tool.permissions,
      category: tool.category
    }));
    return JSON.stringify(tools, null, 2);
  }

  // 导入工具列表
  importTools(toolsData: string): void {
    try {
      const tools: Omit<Tool, 'execute'>[] = JSON.parse(toolsData);
      for (const toolData of tools) {
        // 注意：这里只导入元数据，不导入执行函数
        // 执行函数需要单独实现
        this.registerTool({
          ...toolData,
          execute: async (params: any) => {
            throw new Error(`Tool execution not implemented: ${toolData.name}`);
          }
        } as Tool);
      }
      console.log(`[ToolManager] Imported ${tools.length} tools`);
    } catch (error) {
      console.error('[ToolManager] Failed to import tools:', error);
    }
  }

  // 获取工具统计信息
  getToolStats(): {
    total: number;
    enabled: number;
    disabled: number;
    categories: Record<string, number>;
  } {
    const stats = {
      total: this.tools.size,
      enabled: this.getEnabledTools().length,
      disabled: this.disabledTools.size,
      categories: {} as Record<string, number>
    };

    Array.from(this.tools.values()).forEach(tool => {
      stats.categories[tool.category] = (stats.categories[tool.category] || 0) + 1;
    });

    return stats;
  }
}
