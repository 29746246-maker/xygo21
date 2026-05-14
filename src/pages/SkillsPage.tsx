import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import SkillAssignmentModal from '../components/skills/SkillAssignmentModal';
import AddSkillModal from '../components/skills/AddSkillModal';

const SkillsPage: React.FC = () => {
  const { skills, agents, addSkill, updateSkill, deleteSkill, assignSkillToAgent, syncSkillsFromSource } = useStore();
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAssignSkill = (skillId: string) => {
    setSelectedSkillId(skillId);
    setAssignmentModalOpen(true);
  };

  const handleSyncSkills = async (source: 'CLAWhub' | 'ModelScope') => {
    await syncSkillsFromSource(source);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-orbitron text-2xl font-bold text-cyan-400">技能管理</h2>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className="glassmorphism border border-cyan-500/30 rounded-xl p-4 sci-fi-card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-orbitron font-bold text-cyan-400">{skill.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{skill.source} - {skill.type}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center">
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
                  className="text-cyan-400"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs text-gray-400">
                <span className="font-medium text-gray-300">Description:</span>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-2 text-xs">
                <p className="text-gray-400">{skill.description}</p>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                <span className="font-medium text-gray-300">Assigned Agents:</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {skill.assignedAgents.map((agentId) => {
                  const agent = agents.find(a => a.id === agentId);
                  return agent ? (
                    <span key={agentId} className="text-xs px-2 py-0.5 bg-cyan-900/30 border border-cyan-500/30 rounded-full">
                      {agent.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => handleAssignSkill(skill.id)}
                className="sci-fi-button flex-1 glassmorphism border border-cyan-500/30 rounded-lg px-3 py-1.5 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-xs"
              >
                分配智能体
              </button>
              <button 
                onClick={() => deleteSkill(skill.id)}
                className="sci-fi-button glassmorphism border border-red-500/30 rounded-lg px-3 py-1.5 text-red-400 hover:bg-red-500/10 transition-colors text-xs"
              >
                删除
              </button>
            </div>
          </div>
        ))}

        {/* Add Skill Card */}
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <h3 className="font-orbitron font-bold text-cyan-400">添加技能</h3>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            从CLAWhub或ModelScope添加新技能
          </p>
        </div>
      </div>

      {/* Skill Sources */}
      <div className="mt-6">
        <h3 className="font-orbitron font-bold text-cyan-400 mb-3">技能源管理</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CLAWhub Skills */}
          <div className="glassmorphism border border-cyan-500/30 rounded-lg p-4">
            <h4 className="font-orbitron font-bold text-cyan-400 mb-2">CLAWhub 技能</h4>
            <p className="text-xs text-gray-400 mb-3">从CLAWhub平台导入技能</p>
            <button 
              onClick={() => handleSyncSkills('CLAWhub')}
              className="sci-fi-button w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              同步CLAWhub技能
            </button>
          </div>

          {/* ModelScope Skills */}
          <div className="glassmorphism border border-cyan-500/30 rounded-lg p-4">
            <h4 className="font-orbitron font-bold text-cyan-400 mb-2">ModelScope 技能</h4>
            <p className="text-xs text-gray-400 mb-3">从ModelScope平台导入技能</p>
            <button 
              onClick={() => handleSyncSkills('ModelScope')}
              className="sci-fi-button w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              同步ModelScope技能
            </button>
          </div>
        </div>
      </div>
      
      {/* Skill Assignment Modal */}
      <SkillAssignmentModal
        skillId={selectedSkillId}
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
      />
      
      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
};

export default SkillsPage;