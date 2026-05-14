import React from 'react';
import { useStore } from '../../store/useStore';
import AgentCard from '../agents/AgentCard';
import ModeSwitch from './ModeSwitch';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const { agents, sidebarCollapsed, mode } = useStore();

  return (
    <div className={`sidebar glassmorphism border-r border-cyan-500/30 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-48'}`}>
      {/* Logo */}
      <div className="p-3 border-b border-cyan-500/30">
        {!sidebarCollapsed && (
          <h2 className="font-orbitron font-bold text-cyan-400">AI智能体</h2>
        )}
      </div>

      {/* Mode Switch */}
      <div className="p-3 border-b border-cyan-500/30">
        <ModeSwitch />
      </div>

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} compact={sidebarCollapsed} />
          ))}
        </div>
      </div>


    </div>
  );
};

export default Sidebar;
