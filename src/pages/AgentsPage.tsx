import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import AgentCard from '../components/agents/AgentCard';
import AddAgentModal from '../components/AddAgentModal';
import AgentEditModal from '../components/AgentEditModal';

const AgentsPage: React.FC = () => {
  const { agents, deleteAgent } = useStore();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const handleEdit = (agentId: string) => {
    setSelectedAgentId(agentId);
    setEditModalOpen(true);
  };

  const handleDelete = (agentId: string) => {
    if (window.confirm('确定要删除这个智能体吗？')) {
      deleteAgent(agentId);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-orbitron text-2xl font-bold text-cyan-400">智能体管理</h2>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="sci-fi-card">
            <AgentCard agent={agent} compact={false} />
            <div className="mt-2 flex gap-2">
              <button 
                onClick={() => handleEdit(agent.id)}
                className="sci-fi-button flex-1 glassmorphism border border-cyan-500/30 rounded-lg px-3 py-1.5 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-xs"
              >
                编辑
              </button>
              <button 
                onClick={() => handleDelete(agent.id)}
                className="sci-fi-button glassmorphism border border-red-500/30 rounded-lg px-3 py-1.5 text-red-400 hover:bg-red-500/10 transition-colors text-xs"
              >
                删除
              </button>
            </div>
          </div>
        ))}

        {/* Add Agent Card */}
        <div 
          onClick={() => setAddModalOpen(true)}
          className="glassmorphism border border-dashed border-cyan-500/30 rounded-xl p-4 flex flex-col items-center justify-center h-48 cursor-pointer hover:border-cyan-400 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center mb-3">
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
              className="text-cyan-400"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="font-orbitron font-bold text-cyan-400">添加智能体</h3>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            创建具有自定义个性和模型绑定的新AI智能体
          </p>
        </div>
      </div>

      {/* Add Agent Modal */}
      <AddAgentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      {/* Edit Agent Modal */}
      {selectedAgentId && (
        <AgentEditModal
          agentId={selectedAgentId}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AgentsPage;
