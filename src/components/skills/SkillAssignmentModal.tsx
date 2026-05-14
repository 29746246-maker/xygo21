import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

interface SkillAssignmentModalProps {
  skillId: string;
  isOpen: boolean;
  onClose: () => void;
}

const SkillAssignmentModal: React.FC<SkillAssignmentModalProps> = ({ skillId, isOpen, onClose }) => {
  const { agents, skills, assignSkillToAgent, unassignSkillFromAgent } = useStore();
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  const skill = skills.find(s => s.id === skillId);

  React.useEffect(() => {
    if (skill) {
      setSelectedAgents(skill.assignedAgents);
    }
  }, [skill]);

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentId)) {
        unassignSkillFromAgent(skillId, agentId);
        return prev.filter(id => id !== agentId);
      } else {
        assignSkillToAgent(skillId, agentId);
        return [...prev, agentId];
      }
    });
  };

  if (!isOpen || !skill) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glassmorphism border border-cyan-500/30 rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-orbitron font-bold text-cyan-400 text-lg">分配技能: {skill.name}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-400">选择要分配此技能的智能体：</p>
          
          <div className="space-y-2">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`agent-${agent.id}`}
                  checked={selectedAgents.includes(agent.id)}
                  onChange={() => handleAgentToggle(agent.id)}
                  className="rounded border-cyan-500/30 text-cyan-400 focus:ring-cyan-400"
                />
                <label 
                  htmlFor={`agent-${agent.id}`} 
                  className="flex-1 text-sm text-gray-300 cursor-pointer"
                >
                  {agent.name}
                </label>
                <span className={`text-xs px-2 py-0.5 rounded-full ${agent.enabled ? 'bg-green-900/30 text-green-400' : 'bg-gray-700/50 text-gray-400'}`}>
                  {agent.enabled ? '已启用' : '已禁用'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button 
              onClick={onClose}
              className="sci-fi-button glassmorphism border border-gray-600 rounded-lg px-4 py-2 text-gray-400 hover:bg-gray-800/50 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={onClose}
              className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillAssignmentModal;