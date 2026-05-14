import React, { useState } from 'react';
import { Agent } from '../../store/useStore';
import { useStore } from '../../store/useStore';
import AgentEditModal from '../AgentEditModal';

interface AgentCardProps {
  agent: Agent;
  compact: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, compact }) => {
  const { updateAgent, models, setActiveAgent, mode, activeAgentId } = useStore();
  const model = models.find(m => m.id === agent.modelId);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingFull, setIsEditingFull] = useState(false);
  const [tempName, setTempName] = useState(agent.name);

  const handleToggleEnable = () => {
    updateAgent(agent.id, { enabled: !agent.enabled });
  };

  const handleSelectAgent = () => {
    setActiveAgent(agent.id);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateAgent(agent.id, { name: tempName.trim() });
    } else {
      setTempName(agent.name);
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setTempName(agent.name);
    setIsEditingName(false);
  };

  const getStatusClass = () => {
    switch (agent.status) {
      case 'idle': return 'agent-idle';
      case 'thinking': return 'agent-thinking';
      case 'working': return 'agent-working';
      case 'completed': return 'agent-completed';
      default: return '';
    }
  };

  const getStatusIndicator = () => {
    switch (agent.status) {
      case 'idle': return 'bg-cyan-500';
      case 'thinking': return 'bg-yellow-500';
      case 'working': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (compact) {
    return (
      <div 
        className={`flex flex-col items-center gap-1.5 p-2 rounded-lg glassmorphism border border-cyan-500/30 cursor-pointer transition-all ${activeAgentId === agent.id ? 'ring-2 ring-cyan-400' : ''} ${!agent.enabled ? 'opacity-50' : ''} ${getStatusClass()}`}
        onClick={handleSelectAgent}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${agent.enabled ? 'bg-cyan-900/50' : 'bg-gray-800/50'}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={agent.enabled ? 'text-cyan-400' : 'text-gray-400'}
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div className={`w-1.5 h-1.5 rounded-full ${getStatusIndicator()}`} />
      </div>
    );
  }

  return (
    <>
      <div 
        className={`p-2 rounded-lg glassmorphism border border-cyan-500/30 cursor-pointer transition-all ${activeAgentId === agent.id ? 'ring-2 ring-cyan-400' : ''} ${!agent.enabled ? 'opacity-50' : ''} ${getStatusClass()}`}
        onClick={handleSelectAgent}
      >
        <div className="flex justify-between items-start mb-1.5">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${agent.enabled ? 'bg-cyan-900/50' : 'bg-gray-800/50'}`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={agent.enabled ? 'text-cyan-400' : 'text-gray-400'}
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  autoFocus
                  className="bg-transparent border border-cyan-500/30 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
                <button onClick={handleSaveName} className="text-green-400 hover:text-green-300 ml-1">
                  ✓
                </button>
                <button onClick={handleCancelEdit} className="text-red-400 hover:text-red-300 ml-1">
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <h3 className="font-medium text-white text-sm">{agent.name}</h3>
              </div>
            )}
            <p className="text-xs text-gray-400">{agent.personality.role}</p>
          </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 ml-auto mr-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={agent.enabled} 
                onChange={handleToggleEnable}
                className="sr-only peer"
              />
              <div className="w-7 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-600" />
            </label>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingFull(true);
              }}
              className="text-gray-400 hover:text-cyan-400 text-xs"
            >
              ⚙️
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>模型: {model?.name || '未知'}</span>
          <span>状态: {agent.status === 'idle' ? '空闲' : agent.status === 'thinking' ? '思考中' : agent.status === 'working' ? '工作中' : '已完成'}</span>
        </div>
      </div>
      
      <AgentEditModal
        agentId={agent.id}
        isOpen={isEditingFull}
        onClose={() => setIsEditingFull(false)}
      />
    </>
  );
};

export default AgentCard;
