import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { getHarness, Harness } from '../harness';
import { Message as HarnessMessage } from '../harness/types';

// Agent state
export interface Agent {
  id: string;
  name: string;
  modelId: string;
  personality: {
    role: string;
    description: string;
    traits: string[];
    keywords: string[];
  };
  enabled: boolean;
  status: 'idle' | 'thinking' | 'working' | 'completed';
  parentId?: string;
}

// Model state
export interface Model {
  id: string;
  name: string;
  type: string;
  base_url?: string;
  api_key?: string;
  model_name?: string;
  parameters: Record<string, any>;
}

// Task state
export interface Task {
  id: string;
  name: string;
  description: string;
  agentId: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  startTime?: string;
  endTime?: string;
}

// Message state
export interface Message {
  id: string;
  content: string;
  agentId: string;
  timestamp: string;
  type: 'text' | 'system' | 'summary';
}

// Skill state
export interface Skill {
  id: string;
  name: string;
  description: string;
  type: string;
  source: 'CLAWhub' | 'ModelScope' | 'MCP' | 'custom';
  parameters: Record<string, any>;
  assignedAgents: string[];
}

// Brainstorming session state
export interface BrainstormingSession {
  id: string;
  topic: string;
  participants: string[];
  status: 'idle' | 'in_progress' | 'completed';
  messages: Message[];
  summary?: string;
  createdAt: string;
  completedAt?: string;
}

// Workflow node types
export type WorkflowNodeType =
  | 'input'
  | 'router'
  | 'plan'
  | 'visual'
  | 'code'
  | 'merge'
  | 'check'
  | 'export';

// Workflow node state
export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  title: string;
  description: string;
  inputs: string[];
  outputs: string[];
  status: 'idle' | 'running' | 'completed' | 'error';
  config?: Record<string, any>;
}

// Workflow connection
export interface WorkflowConnection {
  id: string;
  fromNode: string;
  fromOutput: string;
  toNode: string;
  toInput: string;
}

// Workflow state
export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  status: 'idle' | 'running' | 'completed' | 'error';
  createdAt: string;
}

// Organization node for organization architecture (keep for compatibility)
export interface OrgNode {
  id: string;
  agentId?: string;
  label: string;
  children: string[];
  position: { x: number; y: number };
  isManager: boolean;
}

// Cloud sync configuration
export interface CloudSyncConfig {
  provider: 'baidu' | 'none';
  folderPath: string;
  isConnected: boolean;
  lastSyncTime?: string;
}

// Experience record
export interface Experience {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  brainstormingSessionId?: string;
}

// Workflow template
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  workflow: Workflow;
  createdAt: string;
  category: string;
}

// Work log
export interface WorkLog {
  id: string;
  title: string;
  content: string;
  type: 'daily' | 'project' | 'task';
  createdAt: string;
  updatedAt: string;
  tags: string[];
  agentId?: string;
  projectId?: string;
  taskId?: string;
  status: 'draft' | 'completed' | 'in_progress';
}

// OLLAMA state
interface OllamaConfig {
  apiBaseUrl: string;
  models: string[];
  isConnected: boolean;
}

// Log state
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  category: string;
  details?: Record<string, any>;
}

// App state
interface AppState {
  // UI state
  mode: 'single' | 'multi' | 'brainstorming';
  activeAgentId: string | null;
  sidebarCollapsed: boolean;
  language: 'zh' | 'en';
  
  // Data state
  agents: Agent[];
  models: Model[];
  tasks: Task[];
  messages: Message[];
  skills: Skill[];
  ollamaConfig: OllamaConfig;
  tokenStats: {
    totalTokens: number;
    tokensPerSecond: number;
    lastTokenTime: number;
  };
  
  // Log state
  logs: LogEntry[];
  
  // Brainstorming state
  brainstormingSessions: BrainstormingSession[];
  currentBrainstormingSession: BrainstormingSession | null;
  
  // Organization architecture (keep for compatibility)
  orgNodes: OrgNode[];
  
  // Workflow system
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  
  // Cloud sync
  cloudSyncConfig: CloudSyncConfig;
  workLogs: WorkLog[];
  experiences: Experience[];
  workflowTemplates: WorkflowTemplate[];
  
  // Harness system
  harness: Harness;
  harnessLogs: LogEntry[];
  harnessContext: HarnessMessage[];
  
  // Actions
  addAgent: (agent: Omit<Agent, 'id'>) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  addModel: (model: Omit<Model, 'id'>) => void;
  updateModel: (id: string, updates: Partial<Model>) => void;
  deleteModel: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addMessage: (message: Omit<Message, 'id'>) => void;
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  assignSkillToAgent: (skillId: string, agentId: string) => void;
  unassignSkillFromAgent: (skillId: string, agentId: string) => void;
  syncSkillsFromSource: (source: 'CLAWhub' | 'ModelScope') => Promise<void>;
  switchMode: (mode: 'single' | 'multi' | 'brainstorming') => void;
  setActiveAgent: (agentId: string | null) => void;
  toggleSidebar: () => void;
  configureOllama: () => Promise<void>;
  testOllamaModel: (modelName: string) => Promise<boolean>;
  updateTokenStats: (tokens: number) => void;
  
  // Log actions
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  
  // Brainstorming actions
  startBrainstormingSession: (topic: string, participants: string[]) => void;
  addBrainstormingMessage: (message: Omit<Message, 'id'>) => void;
  completeBrainstormingSession: (summary: string) => void;
  
  // Organization architecture actions
  addOrgNode: (node: Omit<OrgNode, 'id'>) => void;
  updateOrgNode: (id: string, updates: Partial<OrgNode>) => void;
  deleteOrgNode: (id: string) => void;
  assignAgentToOrgNode: (nodeId: string, agentId: string) => void;
  unassignAgentFromOrgNode: (nodeId: string) => void;
  
  // Cloud sync actions
  configureCloudSync: (config: Partial<CloudSyncConfig>) => void;
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
  
  // Work log actions
  addWorkLog: (workLog: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkLog: (id: string, updates: Partial<WorkLog>) => void;
  deleteWorkLog: (id: string) => void;
  getWorkLogs: () => WorkLog[];
  searchWorkLogs: (query: string) => WorkLog[];
  
  // Experience actions
  addExperience: (experience: Omit<Experience, 'id'>) => void;
  switchLanguage: (lang: 'zh' | 'en') => void;
  
  // Workflow template actions
  addWorkflowTemplate: (template: Omit<WorkflowTemplate, 'id'>) => void;
  updateWorkflowTemplate: (id: string, updates: Partial<WorkflowTemplate>) => void;
  deleteWorkflowTemplate: (id: string) => void;
  applyWorkflowTemplate: (templateId: string) => Workflow;
  
  // Workflow actions
  createWorkflow: (name: string) => Workflow;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  addWorkflowNode: (workflowId: string, node: Omit<WorkflowNode, 'id'>) => void;
  updateWorkflowNode: (workflowId: string, nodeId: string, updates: Partial<WorkflowNode>) => void;
  deleteWorkflowNode: (workflowId: string, nodeId: string) => void;
  addWorkflowConnection: (workflowId: string, connection: Omit<WorkflowConnection, 'id'>) => void;
  deleteWorkflowConnection: (workflowId: string, connectionId: string) => void;
  runWorkflow: (workflowId: string) => Promise<void>;
  
  // Harness actions
  addHarnessMessage: (message: Omit<HarnessMessage, 'id' | 'timestamp'>) => void;
  refreshHarnessLogs: () => void;
  refreshHarnessContext: () => void;
  getHarness: () => Harness;
  
  // Plan management actions
  createPlan: (title: string, description: string, steps: any[]) => any;
  executePlan: (planId: string) => Promise<any>;
  generatePlan: (task: string) => any;
  getAllPlans: () => any[];
  getPlan: (planId: string) => any | undefined;
  
  // AI work log generation
  generateWorkLog: (type?: 'daily' | 'project' | 'task', context?: string) => Promise<any>;
}

// Mock data
const mockModels: Model[] = [
  {
    id: '1',
    name: 'GPT-4',
    type: '语言',
    parameters: { temperature: 0.7, max_tokens: 1000 },
  },
  {
    id: '2',
    name: 'Claude 3',
    type: '语言',
    parameters: { temperature: 0.5, max_tokens: 2000 },
  },
  {
    id: '3',
    name: 'Gemini Pro',
    type: '语言',
    parameters: { temperature: 0.6, max_tokens: 1500 },
  },
  {
    id: '4',
    name: 'DALL-E 3',
    type: '图像',
    parameters: { size: '1024x1024' },
  },
];

const mockAgents: Agent[] = [
  {
    id: '1',
    name: '产品经理',
    modelId: '1',
    personality: {
      role: '产品经理',
      description: '负责产品规划、需求分析和项目管理，确保产品方向符合用户需求和商业目标。',
      traits: ['战略性', '用户导向', '有条理'],
      keywords: ['产品规划', '需求分析', '市场调研', '用户研究', '项目管理'],
    },
    enabled: true,
    status: 'idle',
  },
  {
    id: '2',
    name: '软件工程师',
    modelId: '2',
    personality: {
      role: '软件工程师',
      description: '负责技术架构设计、代码开发、性能优化和系统维护，确保产品技术实现的质量和效率。',
      traits: ['技术型', '问题解决', '注重细节'],
      keywords: ['编程', '开发', '架构', '性能优化', '代码质量', '系统设计'],
    },
    enabled: true,
    status: 'idle',
  },
  {
    id: '3',
    name: 'UX设计师',
    modelId: '3',
    personality: {
      role: 'UX设计师',
      description: '负责用户界面设计、交互体验优化和视觉设计，打造直观、美观、易用的产品界面。',
      traits: ['创意', '用户中心', '视觉设计'],
      keywords: ['UI设计', 'UX设计', '原型设计', '交互设计', '视觉美学', '用户体验'],
    },
    enabled: true,
    status: 'idle',
  },
  {
    id: '4',
    name: '内容创作者',
    modelId: '1',
    personality: {
      role: '内容创作者',
      description: '负责文案创作、内容策划和营销传播，用优质内容吸引用户、传递价值。',
      traits: ['创意', '写作', '市场营销'],
      keywords: ['文案', '内容策划', '营销', '传播', '故事讲述', '品牌建设'],
    },
    enabled: false,
    status: 'idle',
  },
];

const mockTasks: Task[] = [
  {
    id: '1',
    name: '市场调研',
    description: '分析市场趋势和竞争对手分析',
    agentId: '1',
    status: 'pending',
    progress: 0,
  },
  {
    id: '2',
    name: '技术架构',
    description: '设计项目的技术架构',
    agentId: '2',
    status: 'pending',
    progress: 0,
  },
  {
    id: '3',
    name: 'UI/UX设计',
    description: '创建界面的线框图和原型',
    agentId: '3',
    status: 'pending',
    progress: 0,
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    content: '欢迎使用AI团队协作界面！',
    agentId: 'system',
    timestamp: new Date().toISOString(),
    type: 'system',
  },
  {
    id: '2',
    content: '我准备好协助产品策略和市场分析。',
    agentId: '1',
    timestamp: new Date().toISOString(),
    type: 'text',
  },
  {
    id: '3',
    content: '我可以协助技术实现和架构设计。',
    agentId: '2',
    timestamp: new Date().toISOString(),
    type: 'text',
  },
  {
    id: '4',
    content: '我将帮助创建直观且视觉吸引力的用户界面。',
    agentId: '3',
    timestamp: new Date().toISOString(),
    type: 'text',
  },
];

const mockSkills: Skill[] = [
  {
    id: '1',
    name: '网页搜索',
    description: '使用搜索引擎获取最新信息',
    type: '工具',
    source: 'CLAWhub',
    parameters: { engine: 'google', timeout: 30000 },
    assignedAgents: ['1', '2'],
  },
  {
    id: '2',
    name: '代码生成',
    description: '生成各种编程语言的代码',
    type: '工具',
    source: 'ModelScope',
    parameters: { languages: ['javascript', 'python', 'java'] },
    assignedAgents: ['2'],
  },
  {
    id: '3',
    name: '数据分析',
    description: '分析和可视化数据',
    type: '工具',
    source: 'MCP',
    parameters: { formats: ['csv', 'json', 'excel'] },
    assignedAgents: ['1', '3'],
  },
  {
    id: '4',
    name: '图像生成',
    description: '根据描述生成图像',
    type: '工具',
    source: 'CLAWhub',
    parameters: { size: '1024x1024', style: 'realistic' },
    assignedAgents: ['3'],
  },
];

export const useStore = create<AppState>((set, get) => {
  // Initialize Harness
  const harness = getHarness();
  
  return {
    // UI state
    mode: 'single',
    activeAgentId: '1',
    sidebarCollapsed: false,
    language: 'zh',
    
    // Data state
    agents: mockAgents,
    models: mockModels,
    tasks: mockTasks,
    messages: mockMessages,
    skills: mockSkills,
    ollamaConfig: {
      apiBaseUrl: 'http://localhost:11434',
      models: [],
      isConnected: false,
    },
    tokenStats: {
      totalTokens: 0,
      tokensPerSecond: 0,
      lastTokenTime: Date.now(),
    },
    
    // Harness system
    harness,
    harnessLogs: [],
    harnessContext: [],
    
    // Brainstorming state
    brainstormingSessions: [],
    currentBrainstormingSession: null,
    
    // Organization architecture - default organization structure (keep for compatibility)
    orgNodes: [
    {
      id: 'root',
      label: 'CEO/总指挥',
      children: ['pm', 'tech', 'design'],
      position: { x: 400, y: 50 },
      isManager: true,
      agentId: '1',
    },
    {
      id: 'pm',
      label: '产品管理',
      children: [],
      position: { x: 200, y: 180 },
      isManager: true,
      agentId: '1',
    },
    {
      id: 'tech',
      label: '技术团队',
      children: [],
      position: { x: 400, y: 180 },
      isManager: true,
      agentId: '2',
    },
    {
      id: 'design',
      label: '设计团队',
      children: [],
      position: { x: 600, y: 180 },
      isManager: true,
      agentId: '3',
    },
  ],
  
  // Workflow system - default workflow
  workflows: [
    {
      id: 'default',
      name: '全能AI项目自动生成工作流',
      nodes: [
        {
          id: 'input',
          type: 'input',
          position: { x: 100, y: 200 },
          title: '用户需求输入',
          description: '接收用户需求，读取附加要求',
          inputs: [],
          outputs: ['output'],
          status: 'idle',
        },
        {
          id: 'router',
          type: 'router',
          position: { x: 350, y: 200 },
          title: '需求智能拆解路由',
          description: 'AI自动拆分项目，智能判断分支',
          inputs: ['input'],
          outputs: ['output'],
          status: 'idle',
        },
        {
          id: 'plan',
          type: 'plan',
          position: { x: 600, y: 200 },
          title: '方案规划生成',
          description: '输出整体架构、模块拆分、步骤计划',
          inputs: ['input'],
          outputs: ['output1', 'output2'],
          status: 'idle',
        },
        {
          id: 'visual',
          type: 'visual',
          position: { x: 850, y: 100 },
          title: '视觉美术生成',
          description: '自动界面、原画、图标、场景素材',
          inputs: ['input'],
          outputs: ['output'],
          status: 'idle',
        },
        {
          id: 'code',
          type: 'code',
          position: { x: 850, y: 300 },
          title: '逻辑代码生成',
          description: '自动脚本、后端、前端、游戏蓝图',
          inputs: ['input'],
          outputs: ['output'],
          status: 'idle',
        },
        {
          id: 'merge',
          type: 'merge',
          position: { x: 1100, y: 200 },
          title: '素材 & 代码合并整合',
          description: 'UI画面 + 程序逻辑自动拼接适配',
          inputs: ['input1', 'input2'],
          outputs: ['output'],
          status: 'idle',
        },
        {
          id: 'check',
          type: 'check',
          position: { x: 1350, y: 200 },
          title: '自检报错循环回流',
          description: '检测Bug、漏洞、适配问题',
          inputs: ['input'],
          outputs: ['output', 'retry'],
          status: 'idle',
        },
        {
          id: 'export',
          type: 'export',
          position: { x: 1600, y: 200 },
          title: '成品打包导出',
          description: '完整项目源码、全套文件+教程一键输出',
          inputs: ['input'],
          outputs: [],
          status: 'idle',
        },
      ],
      connections: [
        {
          id: 'conn1',
          fromNode: 'input',
          fromOutput: 'output',
          toNode: 'router',
          toInput: 'input',
        },
        {
          id: 'conn2',
          fromNode: 'router',
          fromOutput: 'output',
          toNode: 'plan',
          toInput: 'input',
        },
        {
          id: 'conn3',
          fromNode: 'plan',
          fromOutput: 'output1',
          toNode: 'visual',
          toInput: 'input',
        },
        {
          id: 'conn4',
          fromNode: 'plan',
          fromOutput: 'output2',
          toNode: 'code',
          toInput: 'input',
        },
        {
          id: 'conn5',
          fromNode: 'visual',
          fromOutput: 'output',
          toNode: 'merge',
          toInput: 'input1',
        },
        {
          id: 'conn6',
          fromNode: 'code',
          fromOutput: 'output',
          toNode: 'merge',
          toInput: 'input2',
        },
        {
          id: 'conn7',
          fromNode: 'merge',
          fromOutput: 'output',
          toNode: 'check',
          toInput: 'input',
        },
        {
          id: 'conn8',
          fromNode: 'check',
          fromOutput: 'output',
          toNode: 'export',
          toInput: 'input',
        },
      ],
      status: 'idle',
      createdAt: new Date().toISOString(),
    },
  ],
  currentWorkflow: null,
  
  // Cloud sync
  cloudSyncConfig: {
    provider: 'none',
    folderPath: '',
    isConnected: false,
  },
  workLogs: [],
  experiences: [],
  workflowTemplates: [
    {
      id: '1',
      name: 'AI项目开发工作流',
      description: '完整的AI项目开发流程，从需求分析到部署上线',
      workflow: {
        id: 'template-1',
        name: 'AI项目开发工作流',
        nodes: [
          {
            id: 'input',
            type: 'input',
            position: { x: 100, y: 200 },
            title: '用户需求输入',
            description: '接收用户需求，读取附加要求',
            inputs: [],
            outputs: ['output'],
            status: 'idle',
          },
          {
            id: 'router',
            type: 'router',
            position: { x: 350, y: 200 },
            title: '需求智能拆解路由',
            description: 'AI自动拆分项目，智能判断分支',
            inputs: ['input'],
            outputs: ['output'],
            status: 'idle',
          },
          {
            id: 'plan',
            type: 'plan',
            position: { x: 600, y: 200 },
            title: '方案规划生成',
            description: '输出整体架构、模块拆分、步骤计划',
            inputs: ['input'],
            outputs: ['output1', 'output2'],
            status: 'idle',
          },
          {
            id: 'visual',
            type: 'visual',
            position: { x: 850, y: 100 },
            title: '视觉美术生成',
            description: '自动界面、原画、图标、场景素材',
            inputs: ['input'],
            outputs: ['output'],
            status: 'idle',
          },
          {
            id: 'code',
            type: 'code',
            position: { x: 850, y: 300 },
            title: '逻辑代码生成',
            description: '自动脚本、后端、前端、游戏蓝图',
            inputs: ['input'],
            outputs: ['output'],
            status: 'idle',
          },
          {
            id: 'merge',
            type: 'merge',
            position: { x: 1100, y: 200 },
            title: '素材 & 代码合并整合',
            description: 'UI画面 + 程序逻辑自动拼接适配',
            inputs: ['input1', 'input2'],
            outputs: ['output'],
            status: 'idle',
          },
          {
            id: 'check',
            type: 'check',
            position: { x: 1350, y: 200 },
            title: '自检报错循环回流',
            description: '检测Bug、漏洞、适配问题',
            inputs: ['input'],
            outputs: ['output', 'retry'],
            status: 'idle',
          },
          {
            id: 'export',
            type: 'export',
            position: { x: 1600, y: 200 },
            title: '成品打包导出',
            description: '完整项目源码、全套文件+教程一键输出',
            inputs: ['input'],
            outputs: [],
            status: 'idle',
          },
        ],
        connections: [
          {
            id: 'conn1',
            fromNode: 'input',
            fromOutput: 'output',
            toNode: 'router',
            toInput: 'input',
          },
          {
            id: 'conn2',
            fromNode: 'router',
            fromOutput: 'output',
            toNode: 'plan',
            toInput: 'input',
          },
          {
            id: 'conn3',
            fromNode: 'plan',
            fromOutput: 'output1',
            toNode: 'visual',
            toInput: 'input',
          },
          {
            id: 'conn4',
            fromNode: 'plan',
            fromOutput: 'output2',
            toNode: 'code',
            toInput: 'input',
          },
          {
            id: 'conn5',
            fromNode: 'visual',
            fromOutput: 'output',
            toNode: 'merge',
            toInput: 'input1',
          },
          {
            id: 'conn6',
            fromNode: 'code',
            fromOutput: 'output',
            toNode: 'merge',
            toInput: 'input2',
          },
          {
            id: 'conn7',
            fromNode: 'merge',
            fromOutput: 'output',
            toNode: 'check',
            toInput: 'input',
          },
          {
            id: 'conn8',
            fromNode: 'check',
            fromOutput: 'output',
            toNode: 'export',
            toInput: 'input',
          },
        ],
        status: 'idle',
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      category: '开发',
    },
    {
      id: '2',
      name: '数据分析工作流',
      description: '从数据收集到可视化分析的完整流程',
      workflow: {
        id: 'template-2',
        name: '数据分析工作流',
        nodes: [
          {
            id: 'input',
            type: 'input',
            position: { x: 100, y: 200 },
            title: '数据输入',
            description: '导入或输入原始数据',
            inputs: [],
            outputs: ['output'],
            status: 'idle',
          },
          {
            id: 'process',
            type: 'code',
            position: { x: 350, y: 200 },
            title: '数据处理',
            description: '清洗、转换和预处理数据',
            inputs: ['input'],
            outputs: ['output'],
            status: 'idle',
          },
          {
            id: 'analyze',
            type: 'code',
            position: { x: 600, y: 200 },
            title: '数据分析',
            description: '执行统计分析和机器学习',
            inputs: ['input'],
            outputs: ['output'],
            status: 'idle',
          },
          {
            id: 'visualize',
            type: 'visual',
            position: { x: 850, y: 200 },
            title: '数据可视化',
            description: '生成图表和报告',
            inputs: ['input'],
            outputs: ['output'],
            status: 'idle',
          },
          {
            id: 'export',
            type: 'export',
            position: { x: 1100, y: 200 },
            title: '结果导出',
            description: '导出分析结果和报告',
            inputs: ['input'],
            outputs: [],
            status: 'idle',
          },
        ],
        connections: [
          {
            id: 'conn1',
            fromNode: 'input',
            fromOutput: 'output',
            toNode: 'process',
            toInput: 'input',
          },
          {
            id: 'conn2',
            fromNode: 'process',
            fromOutput: 'output',
            toNode: 'analyze',
            toInput: 'input',
          },
          {
            id: 'conn3',
            fromNode: 'analyze',
            fromOutput: 'output',
            toNode: 'visualize',
            toInput: 'input',
          },
          {
            id: 'conn4',
            fromNode: 'visualize',
            fromOutput: 'output',
            toNode: 'export',
            toInput: 'input',
          },
        ],
        status: 'idle',
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      category: '数据分析',
    },
    {
      id: '3',
      name: 'CLAWDE CODE工作流',
      description: '基于CLAWDE CODE Harness的AI编程工作流，包含计划、代码生成和验证',
      workflow: {
        id: 'template-3',
        name: 'CLAWDE CODE工作流',
        nodes: [
          {
            id: 'input',
            type: 'input',
            position: { x: 100, y: 200 },
            title: '编程需求输入',
            description: '接收用户的编程需求和要求',
            inputs: [],
            outputs: ['output'],
            status: 'idle',
          },
          {
            id: 'plan',
            type: 'plan',
            position: { x: 350, y: 200 },
            title: '代码规划生成',
            description: '生成详细的代码实现计划和架构设计',
            inputs: ['input'],
            outputs: ['output'],
            status: 'idle',
          },
          {
            id: 'code',
            type: 'code',
            position: { x: 600, y: 200 },
            title: '代码生成',
            description: '根据计划生成完整的代码实现',
            inputs: ['input'],
            outputs: ['output'],
            status: 'idle',
          },
          {
            id: 'check',
            type: 'check',
            position: { x: 850, y: 200 },
            title: '代码验证',
            description: '验证代码的正确性和质量',
            inputs: ['input'],
            outputs: ['output', 'retry'],
            status: 'idle',
          },
          {
            id: 'export',
            type: 'export',
            position: { x: 1100, y: 200 },
            title: '代码导出',
            description: '导出完整的代码和文档',
            inputs: ['input'],
            outputs: [],
            status: 'idle',
          },
        ],
        connections: [
          {
            id: 'conn1',
            fromNode: 'input',
            fromOutput: 'output',
            toNode: 'plan',
            toInput: 'input',
          },
          {
            id: 'conn2',
            fromNode: 'plan',
            fromOutput: 'output',
            toNode: 'code',
            toInput: 'input',
          },
          {
            id: 'conn3',
            fromNode: 'code',
            fromOutput: 'output',
            toNode: 'check',
            toInput: 'input',
          },
          {
            id: 'conn4',
            fromNode: 'check',
            fromOutput: 'output',
            toNode: 'export',
            toInput: 'input',
          },
          {
            id: 'conn5',
            fromNode: 'check',
            fromOutput: 'retry',
            toNode: 'code',
            toInput: 'input',
          },
        ],
        status: 'idle',
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      category: '编程',
    },
  ],
  logs: [],
  
  // Actions
  addAgent: (agent) => set((state) => {
    const newAgent = { ...agent, id: uuidv4() };
    return {
      agents: [...state.agents, newAgent],
      logs: [...state.logs, {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level: 'success',
        message: `添加了智能体: ${agent.name}`,
        category: 'agent',
        details: { agentId: newAgent.id, agentName: agent.name },
      }],
    };
  }),
  
  updateAgent: (id, updates) => set((state) => {
    const agent = state.agents.find(a => a.id === id);
    return {
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, ...updates } : agent
      ),
      logs: [...state.logs, {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `更新了智能体: ${agent?.name || id}`,
        category: 'agent',
        details: { agentId: id, updates: Object.keys(updates) },
      }],
    };
  }),
  
  deleteAgent: (id) => set((state) => {
    const agent = state.agents.find(a => a.id === id);
    return {
      agents: state.agents.filter((agent) => agent.id !== id),
      logs: [...state.logs, {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level: 'warning',
        message: `删除了智能体: ${agent?.name || id}`,
        category: 'agent',
        details: { agentId: id, agentName: agent?.name },
      }],
    };
  }),
  
  addModel: (model) => set((state) => ({
    models: [...state.models, { ...model, id: uuidv4() }],
  })),
  
  updateModel: (id, updates) => set((state) => ({
    models: state.models.map((model) =>
      model.id === id ? { ...model, ...updates } : model
    ),
  })),
  
  deleteModel: (id) => set((state) => ({
    models: state.models.filter((model) => model.id !== id),
  })),
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, { ...task, id: uuidv4() }],
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ),
  })),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, id: uuidv4() }],
  })),
  
  switchMode: (mode) => set({ mode }),
  
  setActiveAgent: (agentId) => set({ activeAgentId: agentId }),
  
  toggleSidebar: () => set((state) => ({
    sidebarCollapsed: !state.sidebarCollapsed,
  })),
  
  configureOllama: async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        const ollamaModels = data.models.map((model: any) => model.name);
        
        // Add Ollama models to the model list
        const currentModels = get().models;
        const newOllamaModels = ollamaModels.map((modelName: string) => ({
          id: `ollama-${modelName}`,
          name: `OLLAMA: ${modelName}`,
          type: '语言',
          parameters: { temperature: 0.7, max_tokens: 1000 },
        }));
        
        // Filter out existing Ollama models
        const existingOllamaModelIds = currentModels
          .filter((model) => model.id.startsWith('ollama-'))
          .map((model) => model.id);
        
        const filteredNewModels = newOllamaModels.filter(
          (model) => !existingOllamaModelIds.includes(model.id)
        );
        
        set((state) => ({
          ollamaConfig: {
            apiBaseUrl: 'http://localhost:11434',
            models: ollamaModels,
            isConnected: true,
          },
          models: [...state.models, ...filteredNewModels],
        }));
      }
    } catch (error) {
      console.error('Failed to configure OLLAMA:', error);
      set((state) => ({
        ollamaConfig: {
          ...state.ollamaConfig,
          isConnected: false,
        },
      }));
    }
  },
  
  testOllamaModel: async (modelName: string) => {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          prompt: 'Hello, test message',
          stream: false,
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to test OLLAMA model:', error);
      return false;
    }
  },
  
  updateTokenStats: (tokens: number) => set((state) => {
    const now = Date.now();
    const timeDiff = now - state.tokenStats.lastTokenTime;
    const tokensPerSecond = timeDiff > 0 ? (tokens / (timeDiff / 1000)) : 0;
    
    return {
      tokenStats: {
        totalTokens: state.tokenStats.totalTokens + tokens,
        tokensPerSecond,
        lastTokenTime: now,
      },
    };
  }),
  
  // Log actions
  addLog: (entry) => set((state) => ({
    logs: [...state.logs, {
      ...entry,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    }],
  })),
  
  clearLogs: () => set({ logs: [] }),
  
  addSkill: (skill) => set((state) => ({
    skills: [...state.skills, { ...skill, id: uuidv4() }],
  })),
  
  updateSkill: (id, updates) => set((state) => ({
    skills: state.skills.map((skill) =>
      skill.id === id ? { ...skill, ...updates } : skill
    ),
  })),
  
  deleteSkill: (id) => set((state) => ({
    skills: state.skills.filter((skill) => skill.id !== id),
  })),
  
  assignSkillToAgent: (skillId, agentId) => set((state) => ({
    skills: state.skills.map((skill) =>
      skill.id === skillId && !skill.assignedAgents.includes(agentId)
        ? { ...skill, assignedAgents: [...skill.assignedAgents, agentId] }
        : skill
    ),
  })),
  
  unassignSkillFromAgent: (skillId, agentId) => set((state) => ({
    skills: state.skills.map((skill) =>
      skill.id === skillId
        ? { ...skill, assignedAgents: skill.assignedAgents.filter(id => id !== agentId) }
        : skill
    ),
  })),
  
  syncSkillsFromSource: async (source) => {
    try {
      // 模拟从不同源同步技能
      const mockSkillsFromSource = [
        {
          name: `${source === 'CLAWhub' ? 'CLAWhub' : 'ModelScope'} 技能 1`,
          description: `从${source}同步的技能`,
          type: '工具',
          source: source,
          parameters: { source: source },
          assignedAgents: [],
        },
        {
          name: `${source === 'CLAWhub' ? 'CLAWhub' : 'ModelScope'} 技能 2`,
          description: `从${source}同步的另一个技能`,
          type: '工具',
          source: source,
          parameters: { source: source },
          assignedAgents: [],
        },
      ];
      
      set((state) => ({
        skills: [...state.skills, ...mockSkillsFromSource.map(skill => ({ ...skill, id: uuidv4() }))],
      }));
    } catch (error) {
      console.error(`Failed to sync skills from ${source}:`, error);
    }
  },
  
  // Brainstorming actions
  startBrainstormingSession: (topic, participants) => set((state) => {
    const newSession: BrainstormingSession = {
      id: uuidv4(),
      topic,
      participants,
      status: 'in_progress',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    return {
      brainstormingSessions: [...state.brainstormingSessions, newSession],
      currentBrainstormingSession: newSession,
      mode: 'brainstorming',
    };
  }),
  
  addBrainstormingMessage: (message) => set((state) => {
    if (!state.currentBrainstormingSession) return state;
    
    const updatedSession: BrainstormingSession = {
      ...state.currentBrainstormingSession,
      messages: [...state.currentBrainstormingSession.messages, { ...message, id: uuidv4() }],
    };
    
    return {
      currentBrainstormingSession: updatedSession,
      brainstormingSessions: state.brainstormingSessions.map(session =>
        session.id === updatedSession.id ? updatedSession : session
      ),
    };
  }),
  
  completeBrainstormingSession: (summary) => set((state) => {
    if (!state.currentBrainstormingSession) return state;
    
    const completedSession: BrainstormingSession = {
      ...state.currentBrainstormingSession,
      status: 'completed',
      summary,
      completedAt: new Date().toISOString(),
    };
    
    // Create experience
    const newExperience: Omit<Experience, 'id'> = {
      title: `${completedSession.topic} - 头脑风暴总结`,
      content: summary,
      createdAt: new Date().toISOString(),
      brainstormingSessionId: completedSession.id,
    };
    
    return {
      currentBrainstormingSession: completedSession,
      brainstormingSessions: state.brainstormingSessions.map(session =>
        session.id === completedSession.id ? completedSession : session
      ),
      experiences: [...state.experiences, { ...newExperience, id: uuidv4() }],
      mode: 'multi',
    };
  }),
  
  // Organization architecture actions
  addOrgNode: (node) => set((state) => ({
    orgNodes: [...state.orgNodes, { ...node, id: uuidv4() }],
  })),
  
  updateOrgNode: (id, updates) => set((state) => ({
    orgNodes: state.orgNodes.map(node =>
      node.id === id ? { ...node, ...updates } : node
    ),
  })),
  
  deleteOrgNode: (id) => set((state) => {
    // Also remove references to this node from parent nodes
    const filteredNodes = state.orgNodes.filter(node => node.id !== id);
    return {
      orgNodes: filteredNodes.map(node => ({
        ...node,
        children: node.children.filter(childId => childId !== id),
      })),
    };
  }),
  
  assignAgentToOrgNode: (nodeId, agentId) => set((state) => ({
    orgNodes: state.orgNodes.map(node =>
      node.id === nodeId ? { ...node, agentId } : node
    ),
  })),
  
  unassignAgentFromOrgNode: (nodeId) => set((state) => ({
    orgNodes: state.orgNodes.map(node =>
      node.id === nodeId ? { ...node, agentId: undefined } : node
    ),
  })),
  
  // Cloud sync actions
  configureCloudSync: (config) => set((state) => ({
    cloudSyncConfig: { ...state.cloudSyncConfig, ...config },
  })),
  
  syncToCloud: async () => {
    try {
      // 模拟云同步
      console.log('Syncing to cloud...');
      set((state) => ({
        cloudSyncConfig: {
          ...state.cloudSyncConfig,
          lastSyncTime: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('Failed to sync to cloud:', error);
    }
  },
  
  loadFromCloud: async () => {
    try {
      // 模拟从云加载
      console.log('Loading from cloud...');
    } catch (error) {
      console.error('Failed to load from cloud:', error);
    }
  },
  
  // Work log actions
  addWorkLog: (workLog) => set((state) => {
    const newWorkLog: WorkLog = {
      ...workLog,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return {
      workLogs: [...state.workLogs, newWorkLog],
      logs: [...state.logs, {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level: 'success',
        message: `添加了工作日志: ${workLog.title}`,
        category: 'worklog',
        details: { workLogId: newWorkLog.id, workLogTitle: workLog.title },
      }],
    };
  }),
  
  updateWorkLog: (id, updates) => set((state) => {
    const workLog = state.workLogs.find(wl => wl.id === id);
    return {
      workLogs: state.workLogs.map(wl =>
        wl.id === id ? { ...wl, ...updates, updatedAt: new Date().toISOString() } : wl
      ),
      logs: [...state.logs, {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `更新了工作日志: ${workLog?.title || id}`,
        category: 'worklog',
        details: { workLogId: id, updates: Object.keys(updates) },
      }],
    };
  }),
  
  deleteWorkLog: (id) => set((state) => {
    const workLog = state.workLogs.find(wl => wl.id === id);
    return {
      workLogs: state.workLogs.filter(wl => wl.id !== id),
      logs: [...state.logs, {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level: 'warning',
        message: `删除了工作日志: ${workLog?.title || id}`,
        category: 'worklog',
        details: { workLogId: id, workLogTitle: workLog?.title },
      }],
    };
  }),
  
  getWorkLogs: () => get().workLogs,
  
  searchWorkLogs: (query) => {
    const logs = get().workLogs;
    const lowerQuery = query.toLowerCase();
    return logs.filter(log =>
      log.title.toLowerCase().includes(lowerQuery) ||
      log.content.toLowerCase().includes(lowerQuery) ||
      log.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },
  
  // Experience actions
  addExperience: (experience) => set((state) => ({
    experiences: [...state.experiences, { ...experience, id: uuidv4() }],
  })),
  
  // Language switch
  switchLanguage: (lang) => set({ language: lang }),
  
  // Workflow template actions
  addWorkflowTemplate: (template) => set((state) => ({
    workflowTemplates: [...state.workflowTemplates, { ...template, id: uuidv4() }],
  })),
  
  updateWorkflowTemplate: (id, updates) => set((state) => ({
    workflowTemplates: state.workflowTemplates.map(template =>
      template.id === id ? { ...template, ...updates } : template
    ),
  })),
  
  deleteWorkflowTemplate: (id) => set((state) => ({
    workflowTemplates: state.workflowTemplates.filter(template => template.id !== id),
  })),
  
  applyWorkflowTemplate: (templateId) => {
    const template = get().workflowTemplates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');
    
    // Create nodes with new IDs and map old IDs to new IDs
    const nodeIdMap: Record<string, string> = {};
    const newNodes = template.workflow.nodes.map(node => {
      const newId = uuidv4();
      nodeIdMap[node.id] = newId;
      return {
        ...node,
        id: newId,
        status: 'idle' as const,
      };
    });
    
    // Create connections with updated node IDs
    const newConnections = template.workflow.connections.map(conn => ({
      ...conn,
      id: uuidv4(),
      fromNode: nodeIdMap[conn.fromNode],
      toNode: nodeIdMap[conn.toNode],
    }));
    
    const newWorkflow: Workflow = {
      ...template.workflow,
      id: uuidv4(),
      name: `${template.name} - 副本`,
      createdAt: new Date().toISOString(),
      status: 'idle',
      nodes: newNodes,
      connections: newConnections,
    };
    
    set((state) => ({
      workflows: [...state.workflows, newWorkflow],
      currentWorkflow: newWorkflow,
    }));
    
    return newWorkflow;
  },
  
  // Workflow actions
  createWorkflow: (name) => {
    const newWorkflow: Workflow = {
      id: uuidv4(),
      name,
      nodes: [],
      connections: [],
      status: 'idle',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      workflows: [...state.workflows, newWorkflow],
    }));
    return newWorkflow;
  },
  
  updateWorkflow: (id, updates) => set((state) => ({
    workflows: state.workflows.map(wf =>
      wf.id === id ? { ...wf, ...updates } : wf
    ),
    currentWorkflow: state.currentWorkflow?.id === id
      ? { ...state.currentWorkflow, ...updates }
      : state.currentWorkflow,
  })),
  
  deleteWorkflow: (id) => set((state) => ({
    workflows: state.workflows.filter(wf => wf.id !== id),
    currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
  })),
  
  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  
  addWorkflowNode: (workflowId, node) => set((state) => ({
    workflows: state.workflows.map(wf =>
      wf.id === workflowId
        ? { ...wf, nodes: [...wf.nodes, { ...node, id: uuidv4() }] }
        : wf
    ),
    currentWorkflow: state.currentWorkflow?.id === workflowId
      ? { ...state.currentWorkflow, nodes: [...state.currentWorkflow.nodes, { ...node, id: uuidv4() }] }
      : state.currentWorkflow,
  })),
  
  updateWorkflowNode: (workflowId, nodeId, updates) => set((state) => ({
    workflows: state.workflows.map(wf =>
      wf.id === workflowId
        ? { ...wf, nodes: wf.nodes.map(node =>
            node.id === nodeId ? { ...node, ...updates } : node
          )}
        : wf
    ),
    currentWorkflow: state.currentWorkflow?.id === workflowId
      ? { ...state.currentWorkflow, nodes: state.currentWorkflow.nodes.map(node =>
          node.id === nodeId ? { ...node, ...updates } : node
        )}
      : state.currentWorkflow,
  })),
  
  deleteWorkflowNode: (workflowId, nodeId) => set((state) => {
    const workflow = state.workflows.find(wf => wf.id === workflowId);
    if (!workflow) return state;
    
    // Remove connections to/from this node
    const filteredConnections = workflow.connections.filter(conn =>
      conn.fromNode !== nodeId && conn.toNode !== nodeId
    );
    
    return {
      workflows: state.workflows.map(wf =>
        wf.id === workflowId
          ? {
              ...wf,
              nodes: wf.nodes.filter(node => node.id !== nodeId),
              connections: filteredConnections,
            }
          : wf
      ),
      currentWorkflow: state.currentWorkflow?.id === workflowId
        ? {
            ...state.currentWorkflow,
            nodes: state.currentWorkflow.nodes.filter(node => node.id !== nodeId),
            connections: filteredConnections,
          }
        : state.currentWorkflow,
    };
  }),
  
  addWorkflowConnection: (workflowId, connection) => set((state) => ({
    workflows: state.workflows.map(wf =>
      wf.id === workflowId
        ? { ...wf, connections: [...wf.connections, { ...connection, id: uuidv4() }] }
        : wf
    ),
    currentWorkflow: state.currentWorkflow?.id === workflowId
      ? { ...state.currentWorkflow, connections: [...state.currentWorkflow.connections, { ...connection, id: uuidv4() }] }
      : state.currentWorkflow,
  })),
  
  deleteWorkflowConnection: (workflowId, connectionId) => set((state) => ({
    workflows: state.workflows.map(wf =>
      wf.id === workflowId
        ? { ...wf, connections: wf.connections.filter(conn => conn.id !== connectionId) }
        : wf
    ),
    currentWorkflow: state.currentWorkflow?.id === workflowId
      ? { ...state.currentWorkflow, connections: state.currentWorkflow.connections.filter(conn => conn.id !== connectionId) }
      : state.currentWorkflow,
  })),
  
  runWorkflow: async (workflowId) => {
    const store = get();
    const workflow = store.workflows.find(wf => wf.id === workflowId);
    if (!workflow) return;
    
    // Simulate workflow execution
    set((state) => ({
      workflows: state.workflows.map(wf =>
        wf.id === workflowId ? { ...wf, status: 'running' } : wf
      ),
      currentWorkflow: state.currentWorkflow?.id === workflowId
        ? { ...state.currentWorkflow, status: 'running' }
        : state.currentWorkflow,
    }));
    
    // Simulate step-by-step execution
    for (const node of workflow.nodes) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      set((state) => {
        const updateNodeStatus = (nodes: any[]) =>
          nodes.map(n =>
            n.id === node.id ? { ...n, status: 'completed' as const } : n
          );
        
        return {
          workflows: state.workflows.map(wf =>
            wf.id === workflowId
              ? { ...wf, nodes: updateNodeStatus(wf.nodes) }
              : wf
          ),
          currentWorkflow: state.currentWorkflow?.id === workflowId
            ? { ...state.currentWorkflow, nodes: updateNodeStatus(state.currentWorkflow.nodes) }
            : state.currentWorkflow,
        };
      });
    }
    
    // Mark workflow as completed
    set((state) => ({
      workflows: state.workflows.map(wf =>
        wf.id === workflowId ? { ...wf, status: 'completed' } : wf
      ),
      currentWorkflow: state.currentWorkflow?.id === workflowId
        ? { ...state.currentWorkflow, status: 'completed' }
        : state.currentWorkflow,
    }));
  },
  
  // Harness actions
  addHarnessMessage: (message) => {
    const harness = get().harness;
    harness.addMessage({
      ...message,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    });
    set((state) => ({
      harnessContext: harness.getContext(),
    }));
  },
  
  refreshHarnessLogs: () => {
    const harness = get().harness;
    set((state) => ({
      harnessLogs: harness.getLogs().map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        category: log.category,
        details: log.details,
      })),
    }));
  },
  
  refreshHarnessContext: () => {
    const harness = get().harness;
    set((state) => ({
      harnessContext: harness.getContext(),
    }));
  },
  
  // Plan management actions
  createPlan: (title, description, steps) => {
    const harness = get().harness;
    const plan = harness.createPlan(title, description, steps);
    set((state) => ({
      logs: [...state.logs, {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level: 'success',
        message: `创建了计划: ${title}`,
        category: 'plan',
        details: { planId: plan.id, planTitle: title },
      }],
    }));
    return plan;
  },
  
  executePlan: async (planId) => {
    const harness = get().harness;
    try {
      const plan = await harness.executePlan(planId);
      set((state) => ({
        logs: [...state.logs, {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          level: 'success',
          message: `执行计划: ${plan.title} - 状态: ${plan.status}`,
          category: 'plan',
          details: { planId: plan.id, planStatus: plan.status },
        }],
      }));
      return plan;
    } catch (error) {
      set((state) => ({
        logs: [...state.logs, {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `执行计划失败: ${(error as Error).message}`,
          category: 'plan',
          details: { planId, error: (error as Error).message },
        }],
      }));
      throw error;
    }
  },
  
  generatePlan: (task) => {
    const harness = get().harness;
    const plan = harness.generatePlan(task);
    set((state) => ({
      logs: [...state.logs, {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level: 'success',
        message: `生成了计划: ${task}`,
        category: 'plan',
        details: { task },
      }],
    }));
    return plan;
  },
  
  // AI work log generation
  generateWorkLog: async (type: 'daily' | 'project' | 'task' = 'daily', context?: string) => {
    const state = get();
    
    // 收集工作内容数据
    const workData = {
      tasks: state.tasks.filter(task => task.status === 'completed' || task.status === 'in_progress'),
      agents: state.agents.filter(agent => agent.status !== 'idle'),
      workflows: state.workflows.filter(workflow => workflow.status === 'completed' || workflow.status === 'running'),
      models: state.models,
      skills: state.skills,
      logs: state.logs.slice(-50), // 最近50条日志
      context: context || '',
    };
    
    // 生成日志标题
    const title = `${type === 'daily' ? '每日工作' : type === 'project' ? '项目工作' : '任务工作'} - ${new Date().toLocaleDateString('zh-CN')}`;
    
    // 模拟 AI 生成日志内容
    // 实际项目中可以使用真实的 AI 模型来生成更智能的内容
    let content = `# ${title}\n\n`;
    
    if (workData.tasks.length > 0) {
      content += '## 完成的任务\n';
      workData.tasks.forEach(task => {
        content += `- ${task.name}: ${task.description} (状态: ${task.status === 'completed' ? '已完成' : '进行中'})\n`;
      });
      content += '\n';
    }
    
    if (workData.workflows.length > 0) {
      content += '## 执行的工作流\n';
      workData.workflows.forEach(workflow => {
        content += `- ${workflow.name} (状态: ${workflow.status === 'completed' ? '已完成' : '运行中'})\n`;
      });
      content += '\n';
    }
    
    if (workData.agents.length > 0) {
      content += '## 活跃的智能体\n';
      workData.agents.forEach(agent => {
        content += `- ${agent.name} (状态: ${agent.status})\n`;
      });
      content += '\n';
    }
    
    if (workData.logs.length > 0) {
      content += '## 系统日志\n';
      workData.logs
        .filter(log => log.level === 'success' || log.level === 'info')
        .slice(-10)
        .forEach(log => {
          content += `- ${new Date(log.timestamp).toLocaleTimeString('zh-CN')}: ${log.message}\n`;
        });
    }
    
    if (workData.context) {
      content += `\n## 额外信息\n${workData.context}\n`;
    }
    
    content += `\n## 总结\n${type === 'daily' ? '今日完成了各项工作任务，系统运行正常。' : '项目/任务进展顺利，达到了预期目标。'}`;
    
    // 创建工作日志
    const newWorkLog: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      content,
      type,
      tags: [type, new Date().toLocaleDateString('zh-CN')],
      status: 'completed',
    };
    
    // 调用现有的 addWorkLog 方法
    state.addWorkLog(newWorkLog);
    
    return newWorkLog;

  },
  
  getPlan: (planId) => {
    const harness = get().harness;
    return harness.getPlan(planId);
  },
  
  getAllPlans: () => {
    const harness = get().harness;
    return harness.getAllPlans();
  },
  
  getHarness: () => get().harness,
}});

