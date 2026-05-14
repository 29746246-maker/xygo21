import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Skill } from '../../store/useStore';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSkillModal: React.FC<AddSkillModalProps> = ({ isOpen, onClose }) => {
  const { addSkill } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '工具',
    source: 'custom' as Skill['source'],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSkill({
      ...formData,
      parameters: {},
      assignedAgents: [],
    });
    setFormData({
      name: '',
      description: '',
      type: '工具',
      source: 'custom',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glassmorphism border border-cyan-500/30 rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-orbitron font-bold text-cyan-400 text-lg">添加新技能</h3>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              技能名称
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="输入技能名称"
              required
              className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              技能描述
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="输入技能描述"
              required
              rows={3}
              className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              技能类型
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="工具">工具</option>
              <option value="分析">分析</option>
              <option value="生成">生成</option>
              <option value="处理">处理</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              技能来源
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="custom">自定义</option>
              <option value="CLAWhub">CLAWhub</option>
              <option value="ModelScope">ModelScope</option>
              <option value="MCP">MCP</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="sci-fi-button glassmorphism border border-gray-600 rounded-lg px-4 py-2 text-gray-400 hover:bg-gray-800/50 transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              添加技能
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkillModal;
