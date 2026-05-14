import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';

type TabType = 'tasks' | 'memory';

const TaskDashboard: React.FC = () => {
  const { tasks, agents, updateTask, mode, experiences } = useStore();
  const [animateTasks, setAnimateTasks] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('tasks');

  useEffect(() => {
    setAnimateTasks(true);
    const timer = setTimeout(() => setAnimateTasks(false), 1000);
    return () => clearTimeout(timer);
  }, [mode]);

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || 'Unknown Agent';
  };

  const getAgentColor = (agentId: string) => {
    const agentIndex = agents.findIndex(a => a.id === agentId);
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500'];
    return colors[agentIndex % colors.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-700';
      case 'in_progress': return 'bg-blue-700';
      case 'completed': return 'bg-green-700';
      default: return 'bg-gray-700';
    }
  };

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      let newStatus: 'pending' | 'in_progress' | 'completed';
      switch (task.status) {
        case 'pending': newStatus = 'in_progress'; break;
        case 'in_progress': newStatus = 'completed'; break;
        case 'completed': newStatus = 'pending'; break;
      }
      updateTask(taskId, { status: newStatus, progress: newStatus === 'completed' ? 100 : newStatus === 'in_progress' ? 50 : 0 });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`task-card glassmorphism border border-cyan-500/30 rounded-lg p-3 cursor-pointer transition-all hover:border-cyan-400 ${animateTasks ? 'agent-movement' : ''}`}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    transform: animateTasks ? 'translateX(10px)' : 'translateX(0)'
                  }}
                  onClick={() => handleTaskClick(task.id)}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <h4 className="font-medium text-white text-sm">{task.name}</h4>
                      <p className="text-xs text-gray-400 mb-1.5">{task.description}</p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(task.status)}`} />
                        <span className="text-gray-400">{task.status === 'pending' ? '待处理' : task.status === 'in_progress' ? '进行中' : '已完成'}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">分配给: {getAgentName(task.agentId)}</span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full ${getAgentColor(task.agentId)} flex items-center justify-center text-white text-xs font-bold`}>
                      {getAgentName(task.agentId).charAt(0)}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStatusColor(task.status)} task-progress rounded-full`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5 text-xs text-gray-500">
                      <span>进度</span>
                      <span>{task.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p className="mt-1.5 text-xs">暂无任务</p>
              </div>
            )}
          </div>
        );



      case 'memory':
        return (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Working Memory - 工作记忆 */}
            <div className="glassmorphism border border-cyan-500/30 rounded-lg p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <h4 className="font-medium text-green-400 text-xs uppercase tracking-wider">
                    Working Memory
                  </h4>
                </div>
                <p className="text-xs text-gray-400">
                  当前对话上下文与任务进度追踪。工作记忆是智能体的即时工作台，
                  存储正在处理的任务状态、临时变量和当前思考链。
                </p>
                <div className="bg-gray-800/50 rounded p-2 text-xs text-gray-300">
                  活跃任务: {tasks.filter(t => t.status === 'in_progress').length || 0}
                  {' | '}待处理: {tasks.filter(t => t.status === 'pending').length || 0}
                  {' | '}已完成: {tasks.filter(t => t.status === 'completed').length || 0}
                </div>
              </div>
            </div>

            {/* Episodic Memory - 情景记忆 */}
            <div className="glassmorphism border border-purple-500/30 rounded-lg p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <h4 className="font-medium text-purple-400 text-xs uppercase tracking-wider">
                    Episodic Memory
                  </h4>
                </div>
                <p className="text-xs text-gray-400">
                  历史经验与决策记录。智能体从过往任务中学习，记住哪些策略有效、哪些模式需要避免。
                </p>
                {experiences.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">暂无经验记录</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {experiences.slice().reverse().slice(0, 5).map(exp => (
                      <div key={exp.id} className="bg-gray-800/50 rounded p-2">
                        <p className="text-xs text-purple-300 font-medium">{exp.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{exp.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Semantic Memory - 语义记忆 */}
            <div className="glassmorphism border border-blue-500/30 rounded-lg p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <h4 className="font-medium text-blue-400 text-xs uppercase tracking-wider">
                    Semantic Memory
                  </h4>
                </div>
                <p className="text-xs text-gray-400">
                  概念知识与世界观。智能体关于领域知识的理解，包括任务类型识别、工具使用方法和决策原则。
                </p>
                <div className="space-y-1">
                  {agents.filter(a => a.enabled).map(agent => (
                    <div key={agent.id} className="flex items-center gap-2 bg-gray-800/50 rounded p-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-xs text-cyan-300">{agent.name}</span>
                      <span className="text-xs text-gray-500">({agent.personality.role})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Procedural Memory - 程序性记忆 */}
            <div className="glassmorphism border border-yellow-500/30 rounded-lg p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <h4 className="font-medium text-yellow-400 text-xs uppercase tracking-wider">
                    Procedural Memory
                  </h4>
                </div>
                <p className="text-xs text-gray-400">
                  技能与操作流程。智能体掌握的任务执行能力，包括任务编排、工具调用链和协作模式。
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-yellow-900/30 text-yellow-300 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">任务分解</span>
                  <span className="bg-yellow-900/30 text-yellow-300 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">多智能体协作</span>
                  <span className="bg-yellow-900/30 text-yellow-300 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">进度追踪</span>
                  <span className="bg-yellow-900/30 text-yellow-300 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">状态管理</span>
                  <span className="bg-yellow-900/30 text-yellow-300 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">工具编排</span>
                  <span className="bg-yellow-900/30 text-yellow-300 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">经验复用</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="glassmorphism border border-cyan-500/30 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="flex border-b border-cyan-500/30">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-all ${
            activeTab === 'tasks'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          任务
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-all ${
            activeTab === 'memory'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          记忆
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default TaskDashboard;
