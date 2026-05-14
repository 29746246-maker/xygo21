import React, { useState } from 'react';
import { useStore } from '../store/useStore';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddAgentModal: React.FC<AddAgentModalProps> = ({ isOpen, onClose }) => {
  const { addAgent, models } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    modelId: models[0]?.id || '',
    role: '',
    description: '',
    traits: '',
    keywords: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAgent({
      name: formData.name,
      modelId: formData.modelId,
      personality: {
        role: formData.role,
        description: formData.description,
        traits: formData.traits.split(',').map(t => t.trim()).filter(t => t),
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      },
      enabled: true,
      status: 'idle',
    });
    setFormData({
      name: '',
      modelId: models[0]?.id || '',
      role: '',
      description: '',
      traits: '',
      keywords: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glassmorphism border border-cyan-500/30 rounded-xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-orbitron font-bold text-cyan-400 text-lg">添加新智能体</h3>
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
              智能体名称
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="输入智能体名称"
              required
              className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              模型选择
            </label>
            <select
              name="modelId"
              value={formData.modelId}
              onChange={handleChange}
              required
              className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
            >
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              角色定位
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="例如：产品经理、软件工程师、UX设计师"
              required
              className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              职责描述（人格人设）
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="详细描述这个智能体的职责、能力和特点..."
              required
              rows={3}
              className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              性格特点（用逗号分隔）
            </label>
            <input
              type="text"
              name="traits"
              value={formData.traits}
              onChange={handleChange}
              placeholder="例如：战略性, 用户导向, 有条理"
              className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              专业关键词（用逗号分隔）
            </label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="例如：产品规划, 需求分析, 市场调研"
              className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
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
              添加智能体
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAgentModal;
