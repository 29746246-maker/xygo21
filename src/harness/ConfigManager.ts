import { Config } from './types';

export interface ConfigSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export class ConfigManager {
  private configs: Map<string, Config> = new Map();
  private defaultConfig: Partial<Config> = {
    type: 'project',
    content: `# CLAUDE.md

## 项目概述
- 这是一个 AI 驱动的开发平台
- 使用 React + TypeScript + Vite 技术栈
- 集成了智能体、工作流、技能管理等功能

## 代码风格
- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 状态管理使用 Zustand
- CSS 使用 Tailwind CSS

## 常用命令
- 开发服务器: npm run dev
- 构建: npm run build
- 类型检查: npm run check
- 代码检查: npm run lint

## 核心文件
- src/store/useStore.ts - 全局状态管理
- src/harness/index.ts - Harness 控制层
- src/components/WorkflowCanvas.tsx - 工作流画布
- src/pages/ManagementPage.tsx - 管理页面

## 测试要求
- 使用 Vitest 进行单元测试
- 目标覆盖率: 70% 以上
- 每个功能模块都应该有测试

## 架构原则
- 单一职责原则
- 模块化设计
- 类型安全优先
- 性能优化考虑`
  };

  constructor() {
    // 初始化默认配置
    this.initDefaultConfig();
  }

  private initDefaultConfig(): void {
    const defaultConfig: Config = {
      id: 'default',
      path: '.claude/CLAUDE.md',
      content: this.defaultConfig.content || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'project'
    };
    this.configs.set('default', defaultConfig);
  }

  loadConfig(path: string): Config {
    // 首先检查是否已在内存中
    let config = this.configs.get(path);
    
    if (!config) {
      // 模拟从文件系统加载
      // 实际项目中应该使用 fs API
      config = {
        id: crypto.randomUUID(),
        path,
        content: this.defaultConfig.content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: path.includes('/.claude/') ? 'project' : 'global'
      };
      this.configs.set(path, config);
    }

    return config;
  }

  updateConfig(path: string, content: string): void {
    const config = this.configs.get(path);
    
    if (config) {
      config.content = content;
      config.updatedAt = new Date().toISOString();
    } else {
      this.configs.set(path, {
        id: crypto.randomUUID(),
        path,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: path.includes('/.claude/') ? 'project' : 'global'
      });
    }
  }

  getConfig(path: string): Config | undefined {
    return this.configs.get(path);
  }

  getAllConfigs(): Config[] {
    return Array.from(this.configs.values());
  }

  deleteConfig(path: string): void {
    this.configs.delete(path);
  }

  // 解析配置文件为结构化内容
  parseConfigContent(content: string): ConfigSection[] {
    const sections: ConfigSection[] = [];
    const lines = content.split('\n');
    let currentSection: ConfigSection | null = null;
    let contentBuffer: string[] = [];
    let order = 0;

    for (const line of lines) {
      if (line.startsWith('# ')) {
        // 结束上一个 section
        if (currentSection) {
          currentSection.content = contentBuffer.join('\n').trim();
          sections.push(currentSection);
        }

        // 开始新的 section
        currentSection = {
          id: line.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          title: line.slice(2).trim(),
          content: '',
          order: order++
        };
        contentBuffer = [];
      } else if (currentSection) {
        contentBuffer.push(line);
      }
    }

    // 添加最后一个 section
    if (currentSection) {
      currentSection.content = contentBuffer.join('\n').trim();
      sections.push(currentSection);
    }

    return sections;
  }

  // 获取特定 section 的内容
  getConfigSection(content: string, sectionId: string): string | undefined {
    const sections = this.parseConfigContent(content);
    const section = sections.find(s => s.id === sectionId);
    return section?.content;
  }

  // 添加或更新配置 section
  updateConfigSection(content: string, sectionId: string, newContent: string): string {
    const sections = this.parseConfigContent(content);
    let updated = false;

    // 更新现有 section
    for (const section of sections) {
      if (section.id === sectionId) {
        section.content = newContent;
        updated = true;
        break;
      }
    }

    // 如果没有找到，添加新 section
    if (!updated) {
      const title = sectionId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      sections.push({
        id: sectionId,
        title,
        content: newContent,
        order: sections.length
      });
    }

    // 重新构建内容
    return sections
      .sort((a, b) => a.order - b.order)
      .map(section => `# ${section.title}\n\n${section.content}`)
      .join('\n\n');
  }

  // 生成系统提示词
  generateSystemPrompt(configPath?: string): string {
    let config: Config | undefined;
    
    if (configPath) {
      config = this.configs.get(configPath);
    }
    
    if (!config) {
      config = this.configs.get('default');
    }

    if (!config) {
      return '';
    }

    const sections = this.parseConfigContent(config.content);
    let prompt = '';

    for (const section of sections) {
      prompt += `## ${section.title}\n\n${section.content}\n\n`;
    }

    return prompt.trim();
  }

  // 导出配置为字符串
  exportConfig(configPath: string): string {
    const config = this.configs.get(configPath);
    if (!config) {
      return '';
    }
    return config.content;
  }

  // 导入配置
  importConfig(path: string, content: string, type: 'project' | 'global' = 'project'): Config {
    const config: Config = {
      id: crypto.randomUUID(),
      path,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type
    };
    this.configs.set(path, config);
    return config;
  }

  // 验证配置格式
  validateConfig(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!content.trim()) {
      errors.push('配置内容不能为空');
    }

    const sections = this.parseConfigContent(content);
    if (sections.length === 0) {
      errors.push('配置至少需要包含一个标题（# 开头的行）');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
