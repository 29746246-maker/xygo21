import React from 'react';
import { useStore } from '../store/useStore';

const TokenStats: React.FC = () => {
  const { tokenStats, messages } = useStore();

  return (
    <div className="glassmorphism border border-cyan-500/30 rounded-lg p-4">
      <h3 className="font-orbitron font-bold text-cyan-400 mb-3">Token 统计</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">总 Token 数:</span>
          <span className="text-sm font-medium text-white">{tokenStats.totalTokens}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Token 生成速度:</span>
          <span className="text-sm font-medium text-white">
            {tokenStats.tokensPerSecond.toFixed(2)} tokens/s
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-300">对话总数:</span>
          <span className="text-sm font-medium text-white">{messages.length}</span>
        </div>
        
        <div className="mt-4">
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              style={{ width: '100%' }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Token 使用情况</span>
            <span>实时更新</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenStats;