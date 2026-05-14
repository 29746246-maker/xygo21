import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

const OllamaConfig: React.FC = () => {
  const { ollamaConfig, configureOllama, testOllamaModel } = useStore();
  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ model: string; success: boolean } | null>(null);

  const handleConfigureOllama = async () => {
    await configureOllama();
  };

  const handleTestModel = async (modelName: string) => {
    setTestingModel(modelName);
    const success = await testOllamaModel(modelName);
    setTestResult({ model: modelName, success });
    setTestingModel(null);
  };

  return (
    <div className="glassmorphism border border-cyan-500/30 rounded-lg p-4">
      <h3 className="font-orbitron font-bold text-cyan-400 mb-3">OLLAMA 配置</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">OLLAMA 状态:</span>
          <span className={`text-sm font-medium ${ollamaConfig.isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {ollamaConfig.isConnected ? '已连接' : '未连接'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-300">API 基础 URL:</span>
          <span className="text-sm text-gray-400">{ollamaConfig.apiBaseUrl}</span>
        </div>
        
        <button
          onClick={handleConfigureOllama}
          className="sci-fi-button w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
        >
          一键配置本地 OLLAMA 模型
        </button>
        
        {ollamaConfig.isConnected && ollamaConfig.models.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">可用模型:</h4>
            <div className="space-y-2">
              {ollamaConfig.models.map((modelName) => (
                <div key={modelName} className="flex items-center justify-between p-2 glassmorphism border border-gray-700 rounded-lg">
                  <span className="text-sm text-gray-300">{modelName}</span>
                  <button
                    onClick={() => handleTestModel(modelName)}
                    disabled={testingModel === modelName}
                    className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-3 py-1 text-xs text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                  >
                    {testingModel === modelName ? '测试中...' : '测试模型'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {testResult && (
          <div className={`mt-3 p-2 rounded-lg ${testResult.success ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30'}`}>
            <p className="text-sm">
              模型 <span className="font-medium">{testResult.model}</span> 测试
              <span className={`ml-2 ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {testResult.success ? '成功' : '失败'}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OllamaConfig;