import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import OllamaConfig from '../components/ollama/OllamaConfig';
import TokenStats from '../components/TokenStats';

const ModelsPage: React.FC = () => {
  const { models, addModel, updateModel, deleteModel } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showNvidiaModal, setShowNvidiaModal] = useState(false);
  const [nvidiaCode, setNvidiaCode] = useState('');
  const [currentModel, setCurrentModel] = useState({
    id: '',
    name: '',
    type: '',
    base_url: '',
    api_key: '',
    model_name: '',
    parameters: {}
  });
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    base_url: '',
    api_key: '',
    model_name: '',
    parameters: '{}'
  });

  const handleAddModel = () => {
    setFormData({
      name: '',
      type: '',
      base_url: '',
      api_key: '',
      model_name: '',
      parameters: '{}'
    });
    setIsAddModalOpen(true);
  };

  const handleEditModel = (model: any) => {
    setCurrentModel(model);
    setFormData({
      name: model.name,
      type: model.type,
      base_url: model.base_url || '',
      api_key: model.api_key || '',
      model_name: model.model_name || '',
      parameters: JSON.stringify(model.parameters, null, 2)
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteModel = (modelId: string) => {
    if (confirm('确定要删除这个模型吗？')) {
      deleteModel(modelId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const parameters = JSON.parse(formData.parameters);
      
      if (isAddModalOpen) {
        addModel({
          name: formData.name,
          type: formData.type,
          base_url: formData.base_url,
          api_key: formData.api_key,
          model_name: formData.model_name,
          parameters
        });
      } else if (isEditModalOpen) {
        updateModel(currentModel.id, {
          name: formData.name,
          type: formData.type,
          base_url: formData.base_url,
          api_key: formData.api_key,
          model_name: formData.model_name,
          parameters
        });
      }
      
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      alert('参数格式错误，请输入有效的JSON格式');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const parseNvidiaCode = (code: string) => {
    // 解析base_url
    const baseUrlMatch = code.match(/base_url\s*=\s*['"`](.*?)['"`]/);
    const baseUrl = baseUrlMatch ? baseUrlMatch[1] : 'https://integrate.api.nvidia.com/v1';

    // 解析api_key
    const apiKeyMatch = code.match(/api_key\s*=\s*['"`](.*?)['"`]/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : '';

    // 解析model
    const modelMatch = code.match(/model\s*=\s*['"`](.*?)['"`]/);
    const modelName = modelMatch ? modelMatch[1] : '';

    // 解析parameters
    const tempMatch = code.match(/temperature\s*=\s*(\d+\.?\d*)/);
    const topPMatch = code.match(/top_p\s*=\s*(\d+\.?\d*)/);
    const maxTokensMatch = code.match(/max_tokens\s*=\s*(\d+)/);

    const parameters = {
      temperature: tempMatch ? parseFloat(tempMatch[1]) : 0.7,
      top_p: topPMatch ? parseFloat(topPMatch[1]) : 0.95,
      max_tokens: maxTokensMatch ? parseInt(maxTokensMatch[1]) : 8192
    };

    return {
      base_url: baseUrl,
      api_key: apiKey,
      model_name: modelName,
      parameters,
      name: modelName ? modelName.split('/').pop() || 'NVIDIA Model' : 'NVIDIA Model',
      type: '语言'
    };
  };

  const handleNvidiaCodePaste = async () => {
    try {
      // 尝试从剪贴板读取
      const text = await navigator.clipboard.readText();
      if (text) {
        setNvidiaCode(text);
      }
    } catch (error) {
      console.log('无法从剪贴板读取，请手动粘贴');
    }
  };

  const handleNvidiaCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNvidiaCode(e.target.value);
  };

  const handleParseNvidiaCode = () => {
    try {
      const parsed = parseNvidiaCode(nvidiaCode);
      setFormData({
        name: parsed.name,
        type: parsed.type,
        base_url: parsed.base_url,
        api_key: parsed.api_key,
        model_name: parsed.model_name,
        parameters: JSON.stringify(parsed.parameters, null, 2)
      });
      setShowNvidiaModal(false);
      setIsAddModalOpen(true);
    } catch (error) {
      alert('解析失败，请检查代码格式');
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-orbitron text-2xl font-bold text-cyan-400">全局模型库</h2>
      </div>

      {/* OLLAMA Config and Token Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OllamaConfig />
        <TokenStats />
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <div key={model.id} className="model-card glassmorphism border border-cyan-500/30 rounded-xl p-4 sci-fi-card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-orbitron font-bold text-cyan-400">{model.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{model.type}模型</p>
                {model.model_name && <p className="text-xs text-green-400 mt-0.5">{model.model_name}</p>}
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
                  <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1.5">
              {model.base_url && <p className="text-xs text-gray-500">Base URL: {model.base_url}</p>}
              <div className="text-xs text-gray-400">
                <span className="font-medium text-gray-300">Parameters:</span>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-2 text-xs">
                <pre className="text-gray-400 whitespace-pre-wrap">
                  {JSON.stringify(model.parameters, null, 2)}
                </pre>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button 
                className="sci-fi-button flex-1 glassmorphism border border-cyan-500/30 rounded-lg px-3 py-1.5 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-xs"
                onClick={() => handleEditModel(model)}
              >
                编辑
              </button>
              <button 
                className="sci-fi-button glassmorphism border border-red-500/30 rounded-lg px-3 py-1.5 text-red-400 hover:bg-red-500/10 transition-colors text-xs"
                onClick={() => handleDeleteModel(model.id)}
              >
                删除
              </button>
            </div>
          </div>
        ))}

        {/* Add NVIDIA Model Card */}
        <div 
          className="glassmorphism border border-dashed border-green-500/30 rounded-xl p-4 flex flex-col items-center justify-center h-48 cursor-pointer hover:border-green-400 transition-colors"
          onClick={() => setShowNvidiaModal(true)}
        >
          <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center mb-3">
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
              className="text-green-400"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <line x1="2" y1="17" x2="12" y2="22" />
              <line x1="22" y1="17" x2="12" y2="22" />
            </svg>
          </div>
          <h3 className="font-orbitron font-bold text-green-400">添加NVIDIA模型</h3>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            一键粘贴Python代码添加NVIDIA模型
          </p>
        </div>

        {/* Add Model Card */}
        <div 
          className="glassmorphism border border-dashed border-cyan-500/30 rounded-xl p-4 flex flex-col items-center justify-center h-48 cursor-pointer hover:border-cyan-400 transition-colors"
          onClick={handleAddModel}
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
          <h3 className="font-orbitron font-bold text-cyan-400">添加模型</h3>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            向全局库添加新的AI模型
          </p>
        </div>
      </div>

      {/* NVIDIA Code Modal */}
      {showNvidiaModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="glassmorphism border border-green-500/30 rounded-xl w-full max-w-lg p-6">
            <h3 className="font-orbitron font-bold text-green-400 text-xl mb-4">
              添加NVIDIA模型（一键粘贴）
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  NVIDIA Python代码
                </label>
                <textarea
                  value={nvidiaCode}
                  onChange={handleNvidiaCodeChange}
                  placeholder={`from openai import OpenAI

client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = "$NVIDIA_API_KEY"
)

completion = client.chat.completions.create(
  model="minimaxai/minimax-m2.7",
  messages=[{"role":"user","content":""}],
  temperature=1,
  top_p=0.95,
  max_tokens=8192,
  stream=True
)`}
                  rows={12}
                  className="w-full glassmorphism border border-green-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-400 resize-none font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleNvidiaCodePaste}
                  className="sci-fi-button flex-1 glassmorphism border border-green-500/30 rounded-lg px-4 py-2 text-green-400 hover:bg-green-500/10 transition-colors text-sm"
                >
                  粘贴代码
                </button>
                <button
                  type="button"
                  onClick={() => setNvidiaCode('')}
                  className="glassmorphism border border-gray-500/30 rounded-lg px-4 py-2 text-gray-400 hover:bg-gray-500/10 transition-colors text-sm"
                >
                  清空
                </button>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNvidiaModal(false)}
                  className="glassmorphism border border-gray-500/30 rounded-lg px-6 py-3 text-gray-400 hover:bg-gray-500/10 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleParseNvidiaCode}
                  className="sci-fi-button glassmorphism border border-green-500/30 rounded-lg px-6 py-3 text-green-400 hover:bg-green-500/10 transition-colors font-medium"
                >
                  解析并添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Model Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="glassmorphism border border-cyan-500/30 rounded-xl w-full max-w-lg p-6">
            <h3 className="font-orbitron font-bold text-cyan-400 text-xl mb-4">
              {isAddModalOpen ? '添加模型' : '编辑模型'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  模型名称
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="输入模型名称"
                  className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  模型类型
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="例如：语言、图像、音频"
                  className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  name="base_url"
                  value={formData.base_url}
                  onChange={handleChange}
                  placeholder="https://integrate.api.nvidia.com/v1"
                  className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  name="api_key"
                  value={formData.api_key}
                  onChange={handleChange}
                  placeholder="输入API Key"
                  className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  模型名称
                </label>
                <input
                  type="text"
                  name="model_name"
                  value={formData.model_name}
                  onChange={handleChange}
                  placeholder="minimaxai/minimax-m2.7"
                  className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  参数 (JSON格式)
                </label>
                <textarea
                  name="parameters"
                  value={formData.parameters}
                  onChange={handleChange}
                  placeholder='{"temperature": 1, "top_p": 0.95, "max_tokens": 8192}'
                  rows={4}
                  className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="glassmorphism border border-gray-500/30 rounded-lg px-6 py-3 text-gray-400 hover:bg-gray-500/10 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-6 py-3 text-cyan-400 hover:bg-cyan-500/10 transition-colors font-medium"
                >
                  {isAddModalOpen ? '添加' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelsPage;
