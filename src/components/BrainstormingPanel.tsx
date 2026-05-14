import React, { useState, useEffect, useRef } from 'react';
import { useStore, Agent } from '../store/useStore';

const BrainstormingPanel: React.FC = () => {
  const {
    mode,
    agents,
    currentBrainstormingSession,
    startBrainstormingSession,
    addBrainstormingMessage,
    completeBrainstormingSession,
    switchMode,
    updateAgent,
    addTask,
  } = useStore();

  const [topic, setTopic] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [autoSelect, setAutoSelect] = useState(false);
  const [isDiscussing, setIsDiscussing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingAgentName, setEditingAgentName] = useState<string | null>(null);
  const [tempAgentName, setTempAgentName] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentBrainstormingSession) {
      scrollToBottom();
    }
  }, [currentBrainstormingSession?.messages]);

  // 产品经理智能选择参与讨论的智能体
  const autoSelectAgents = (topicText: string): string[] => {
    const pmAgent = agents.find(a => a.personality.role === '产品经理');
    if (!pmAgent) return agents.filter(a => a.enabled).map(a => a.id);

    const selected: string[] = [pmAgent.id];
    
    const topicLower = topicText.toLowerCase();
    
    // 根据话题关键词智能选择
    if (topicLower.includes('技术') || topicLower.includes('开发') || topicLower.includes('实现')) {
      const techAgent = agents.find(a => a.personality.role === '软件工程师');
      if (techAgent) selected.push(techAgent.id);
    }
    
    if (topicLower.includes('设计') || topicLower.includes('用户') || topicLower.includes('界面')) {
      const designAgent = agents.find(a => a.personality.role === 'UX设计师');
      if (designAgent) selected.push(designAgent.id);
    }
    
    if (topicLower.includes('内容') || topicLower.includes('营销') || topicLower.includes('文案')) {
      const contentAgent = agents.find(a => a.personality.role === '内容创作者');
      if (contentAgent) selected.push(contentAgent.id);
    }
    
    // 如果没有特别匹配的，选择所有启用的智能体
    if (selected.length === 1) {
      return agents.filter(a => a.enabled).map(a => a.id);
    }
    
    return selected;
  };

  const handleStart = () => {
    if (!topic.trim()) return;
    
    let participants = selectedAgents;
    if (autoSelect) {
      participants = autoSelectAgents(topic);
    }
    
    if (participants.length === 0) {
      alert('请至少选择一个智能体参与讨论');
      return;
    }
    
    startBrainstormingSession(topic, participants);
  };

  const handleStartDiscussion = async () => {
    if (!currentBrainstormingSession) return;
    
    setIsDiscussing(true);
    const participantAgents = agents.filter(a => 
      currentBrainstormingSession.participants.includes(a.id)
    );

    // 模拟智能体讨论
    for (let i = 0; i < 3; i++) {
      for (const agent of participantAgents) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        let response = '';
        switch (agent.personality.role) {
          case '产品经理':
            response = `[${agent.name}] 从产品策略角度分析："${topic}" 这个想法很有价值，我们需要考虑用户需求和市场定位。核心目标是解决用户痛点。`;
            break;
          case '软件工程师':
            response = `[${agent.name}] 从技术实现角度：这个方案在技术上是可行的，我们可以采用现代技术栈来实现，需要关注性能和可扩展性。`;
            break;
          case 'UX设计师':
            response = `[${agent.name}] 从用户体验角度：我们需要确保界面直观、易用，以用户为中心进行设计，考虑各种使用场景。`;
            break;
          case '内容创作者':
            response = `[${agent.name}] 从内容角度：我们需要创作引人入胜的内容，传达核心价值，吸引目标用户群体。`;
            break;
        }
        
        addBrainstormingMessage({
          content: response,
          agentId: agent.id,
          timestamp: new Date().toISOString(),
          type: 'text',
        });
      }
    }

    setIsDiscussing(false);
  };

  const handleComplete = () => {
    if (!currentBrainstormingSession) return;
    
    const summary = `## 头脑风暴总结\n\n**主题：** ${currentBrainstormingSession.topic}\n\n**参与智能体：** ${
      currentBrainstormingSession.participants
        .map(id => agents.find(a => a.id === id)?.name)
        .filter(Boolean)
        .join(', ')
    }\n\n**核心观点：**\n1. 产品策略与市场定位至关重要\n2. 技术实现需要考虑可扩展性和性能\n3. 用户体验设计应以用户为中心\n4. 内容创作需要有针对性和吸引力\n\n**行动计划：** 建议基于以上讨论形成详细的执行方案，由产品经理牵头，各角色分工协作。\n\n---\n*记录时间：${new Date().toLocaleString()}*`;
    
    completeBrainstormingSession(summary);
  };

  const handleAgentNameEdit = (agent: Agent) => {
    setEditingAgentName(agent.id);
    setTempAgentName(agent.name);
  };

  const handleAgentNameSave = (agentId: string) => {
    if (tempAgentName.trim()) {
      updateAgent(agentId, { name: tempAgentName.trim() });
    }
    setEditingAgentName(null);
  };

  const handleAssignTask = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const taskName = prompt(`请输入要分配给 ${agent.name} 的任务名称：`);
    if (!taskName) return;
    
    const taskDesc = prompt('请输入任务描述（可选）：') || '';
    
    addTask({
      name: taskName,
      description: taskDesc,
      agentId,
      status: 'pending',
      progress: 0,
    });
  };

  if (mode !== 'brainstorming' && !currentBrainstormingSession) {
    return (
      <div className="glassmorphism border border-cyan-500/30 rounded-xl p-6 h-full flex flex-col">
        <h2 className="font-orbitron font-bold text-cyan-400 text-xl mb-6">头脑风暴模式</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">讨论主题</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="请输入要讨论的主题..."
              className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 sci-fi-input focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              选择参与讨论的智能体
            </label>
            
            <div className="mb-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="autoSelect"
                checked={autoSelect}
                onChange={(e) => setAutoSelect(e.target.checked)}
                className="w-4 h-4 rounded border-cyan-500 text-cyan-500 focus:ring-cyan-500"
              />
              <label htmlFor="autoSelect" className="text-sm text-gray-400">
                由产品经理智能选择参与智能体
              </label>
            </div>

            {!autoSelect && (
              <div className="grid grid-cols-2 gap-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`glassmorphism border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedAgents.includes(agent.id)
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => {
                      setSelectedAgents(prev =>
                        prev.includes(agent.id)
                          ? prev.filter(id => id !== agent.id)
                          : [...prev, agent.id]
                      );
                    }}
                  >
                    {editingAgentName === agent.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tempAgentName}
                          onChange={(e) => setTempAgentName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAgentNameSave(agent.id)}
                          className="flex-1 bg-slate-900/50 border border-cyan-500/30 rounded px-2 py-1 text-white text-sm focus:outline-none"
                        />
                        <button
                          onClick={() => handleAgentNameSave(agent.id)}
                          className="text-green-400 hover:text-green-300"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingAgentName(null)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{agent.name}</div>
                          <div className="text-xs text-gray-400">{agent.personality.role}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAgentNameEdit(agent);
                          }}
                          className="text-gray-400 hover:text-cyan-400 text-xs"
                        >
                          编辑
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {autoSelect && (
              <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <p className="text-sm text-purple-400">
                  ✨ 产品经理将根据话题智能选择最合适的智能体参与讨论
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleStart}
            className="w-full sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-6 py-4 text-cyan-400 hover:bg-cyan-500/10 transition-colors font-bold"
          >
            开始头脑风暴
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glassmorphism border border-cyan-500/30 rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-cyan-500/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-orbitron font-bold text-cyan-400 text-lg">
              头脑风暴中
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              主题：{currentBrainstormingSession?.topic}
            </p>
          </div>
          <button
            onClick={() => switchMode('multi')}
            className="text-gray-400 hover:text-white text-sm"
          >
            退出
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentBrainstormingSession?.messages.map((message) => {
          const agent = agents.find(a => a.id === message.agentId);
          return (
            <div 
              key={message.id}
              className="flex"
            >
              <div className="max-w-[85%] bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-cyan-400">
                    {agent?.name || 'System'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  {message.content}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="border-t border-cyan-500/30 p-4">
        {currentBrainstormingSession?.status === 'in_progress' && !isDiscussing && (
          <div className="flex gap-3">
            <button
              onClick={handleStartDiscussion}
              className="flex-1 sci-fi-button glassmorphism border border-green-500/30 rounded-lg px-4 py-3 text-green-400 hover:bg-green-500/10 transition-colors font-medium"
            >
              开始讨论
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 sci-fi-button glassmorphism border border-purple-500/30 rounded-lg px-4 py-3 text-purple-400 hover:bg-purple-500/10 transition-colors font-medium"
            >
              完成并总结
            </button>
          </div>
        )}

        {isDiscussing && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-3">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-cyan-400 text-sm">智能体讨论中...</span>
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}

        {currentBrainstormingSession?.status === 'completed' && currentBrainstormingSession.summary && (
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
              <h3 className="font-bold text-green-400 mb-3">🎉 讨论完成！</h3>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">
                {currentBrainstormingSession.summary}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">向智能体分配任务：</h4>
              <div className="grid grid-cols-2 gap-2">
                {currentBrainstormingSession.participants.map((agentId) => {
                  const agent = agents.find(a => a.id === agentId);
                  if (!agent) return null;
                  return (
                    <button
                      key={agentId}
                      onClick={() => handleAssignTask(agentId)}
                      className="glassmorphism border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    >
                      分配给 {agent.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => switchMode('multi')}
              className="w-full sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-4 py-3 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              返回多智能体模式
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrainstormingPanel;
