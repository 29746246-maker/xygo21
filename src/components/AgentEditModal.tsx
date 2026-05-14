import React, { useState, useEffect, useRef } from 'react';
import { useStore, Agent, Model, Skill } from '../store/useStore';

interface AgentEditModalProps {
  agentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AgentEditModal: React.FC<AgentEditModalProps> = ({ agentId, isOpen, onClose }) => {
  const {
    agents,
    models,
    skills,
    updateAgent,
    assignSkillToAgent,
    unassignSkillFromAgent,
    syncSkillsFromSource,
    addSkill,
  } = useStore();
  const agent = agents.find(a => a.id === agentId);

  const [formData, setFormData] = useState({
    name: '',
    modelId: '',
    role: '',
    description: '',
    traits: '',
    keywords: '',
  });

  const [activeTab, setActiveTab] = useState<'general' | 'skills' | 'mcp'>('general');
  const [searchingSkills, setSearchingSkills] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Skill[]>([]);
  
  // 拖动相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        modelId: agent.modelId,
        role: agent.personality.role,
        description: agent.personality.description,
        traits: agent.personality.traits.join(', '),
        keywords: agent.personality.keywords.join(', '),
      });
    }
  }, [agent]);
  
  // 每次打开时重置位置
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);
  
  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - startPos.x,
          y: e.clientY - startPos.y,
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos]);

  if (!isOpen || !agent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateAgent(agentId, {
      name: formData.name,
      modelId: formData.modelId,
      personality: {
        role: formData.role,
        description: formData.description,
        traits: formData.traits.split(',').map(t => t.trim()).filter(t => t),
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      },
    });

    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAutoSearchSkills = async () => {
    setSearchingSkills(true);
    try {
      // 模拟AI搜索相关技能
      const keywords = [...agent.personality.keywords, agent.personality.role];
      const relevantSkills = skills.filter(skill =>
        keywords.some(keyword =>
          skill.name.toLowerCase().includes(keyword.toLowerCase()) ||
          skill.description.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      // 模拟从源搜索
      if (skills.length < 6) {
        await syncSkillsFromSource('CLAWhub');
      }

      setSearchResults(relevantSkills.length > 0 ? relevantSkills : skills.slice(0, 5));
    } catch (error) {
      console.error('Failed to search skills:', error);
    } finally {
      setSearchingSkills(false);
    }
  };

  const handleAutoInstallSkill = async (skillId: string) => {
    assignSkillToAgent(skillId, agentId);
  };

  const handleRemoveSkill = (skillId: string) => {
    unassignSkillFromAgent(skillId, agentId);
  };

  const assignedSkills = skills.filter(skill => skill.assignedAgents.includes(agentId));
  const availableSkills = skills.filter(skill => !skill.assignedAgents.includes(agentId));

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="glassmorphism border border-cyan-500/30 rounded-xl w-full max-w-5xl h-[90vh] flex flex-col"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        {/* Header - 可拖动区域 */}
        <div 
          className="p-6 border-b border-cyan-500/30 flex justify-between items-center cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <circle cx="9" cy="6" r="1" />
              <circle cx="15" cy="6" r="1" />
              <circle cx="9" cy="12" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="9" cy="18" r="1" />
              <circle cx="15" cy="18" r="1" />
            </svg>
            <h2 className="font-orbitron font-bold text-cyan-400 text-2xl">
              编辑智能体 - {agent.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-cyan-500/30">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            基础信息
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'skills'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            技能管理
          </button>
          <button
            onClick={() => setActiveTab('mcp')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'mcp'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            MCP工具
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* General Info */}
          {activeTab === 'general' && (
            <form onSubmit={handleSubmit} className="max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    智能体名称
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="输入智能体名称"
                    className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    模型选择
                  </label>
                  <select
                    name="modelId"
                    value={formData.modelId}
                    onChange={handleChange}
                    className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    {models.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    角色定位
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="例如：产品经理、软件工程师"
                    className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    性格特点（逗号分隔）
                  </label>
                  <input
                    type="text"
                    name="traits"
                    value={formData.traits}
                    onChange={handleChange}
                    placeholder="战略性, 用户导向, 有条理"
                    className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    职责描述（人格人设）
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="详细描述这个智能体的职责、能力和特点..."
                    rows={3}
                    className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    专业关键词（逗号分隔）
                  </label>
                  <input
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    placeholder="产品规划, 需求分析, 市场调研"
                    className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </form>
          )}

          {/* Skills Management */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Auto Search Section */}
              <div className="glassmorphism border border-cyan-500/30 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-orbitron font-bold text-cyan-400">智能技能推荐</h3>
                  <button
                    onClick={handleAutoSearchSkills}
                    disabled={searchingSkills}
                    className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors disabled:opacity-50"
                  >
                    {searchingSkills ? '搜索中...' : 'AI自动查找技能'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 mb-2">发现的相关技能：</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {searchResults.map(skill => {
                        const isAssigned = skill.assignedAgents.includes(agentId);
                        return (
                          <div
                            key={skill.id}
                            className="glassmorphism border border-gray-700 rounded-lg p-3 flex justify-between items-center"
                          >
                            <div>
                              <h4 className="font-medium text-white text-sm">{skill.name}</h4>
                              <p className="text-xs text-gray-400">{skill.description}</p>
                            </div>
                            {!isAssigned && (
                              <button
                                onClick={() => handleAutoInstallSkill(skill.id)}
                                className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 rounded px-2 py-1"
                              >
                                一键安装
                              </button>
                            )}
                            {isAssigned && (
                              <span className="text-xs text-green-400">已安装</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Assigned Skills */}
              <div>
                <h3 className="font-orbitron font-bold text-cyan-400 mb-4">已分配技能</h3>
                {assignedSkills.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    暂无分配技能
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignedSkills.map(skill => (
                      <div key={skill.id} className="glassmorphism border border-cyan-500/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-white">{skill.name}</h4>
                            <p className="text-xs text-gray-400">{skill.source} - {skill.type}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveSkill(skill.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            删除
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Skills */}
              <div>
                <h3 className="font-orbitron font-bold text-cyan-400 mb-4">可用技能</h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="搜索技能..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="flex-1 glassmorphism border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableSkills
                    .filter(skill =>
                      skill.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      skill.description.toLowerCase().includes(searchKeyword.toLowerCase())
                    )
                    .map(skill => (
                      <div key={skill.id} className="glassmorphism border border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-white">{skill.name}</h4>
                            <p className="text-xs text-gray-400">{skill.source} - {skill.type}</p>
                          </div>
                          <button
                            onClick={() => assignSkillToAgent(skill.id, agentId)}
                            className="text-cyan-400 hover:text-cyan-300 text-sm border border-cyan-500/30 rounded px-2 py-1"
                          >
                            添加
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">{skill.description}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* MCP Tools */}
          {activeTab === 'mcp' && (
            <div className="text-center py-16">
              <h3 className="font-orbitron font-bold text-cyan-400 text-xl mb-4">
                MCP工具管理
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                MCP（Model Context Protocol）工具集成正在开发中。
                <br />
                您可以在此配置和管理外部工具连接。
              </p>
              <div className="mt-8 glassmorphism border border-cyan-500/30 rounded-lg p-6 max-w-md mx-auto">
                <h4 className="text-cyan-400 font-medium mb-2">即将支持</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• MCP服务器连接</li>
                  <li>• 工具自动发现</li>
                  <li>• 权限配置</li>
                  <li>• 使用统计</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'general' && (
          <div className="p-6 border-t border-cyan-500/30 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="glassmorphism border border-gray-500/30 rounded-lg px-6 py-3 text-gray-400 hover:bg-gray-500/10 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-6 py-3 text-cyan-400 hover:bg-cyan-500/10 transition-colors font-medium"
            >
              保存更改
            </button>
          </div>
        )}
        {activeTab !== 'general' && (
          <div className="p-6 border-t border-cyan-500/30 flex justify-end">
            <button
              onClick={onClose}
              className="glassmorphism border border-gray-500/30 rounded-lg px-6 py-3 text-gray-400 hover:bg-gray-500/10 transition-colors font-medium"
            >
              关闭
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentEditModal;
