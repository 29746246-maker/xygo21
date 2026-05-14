import React, { useState } from 'react';
import { useStore } from '../store/useStore';

const CloudSyncConfig: React.FC = () => {
  const { cloudSyncConfig, configureCloudSync, syncToCloud, loadFromCloud } = useStore();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempFolderPath, setTempFolderPath] = useState(cloudSyncConfig.folderPath);

  const handleSelectFolder = () => {
    // 模拟文件夹选择
    const mockPaths = [
      '/Users/xxx/Documents/AI团队同步',
      '/Work/AI同步文件夹',
      '/Cloud/百度网盘/AI团队',
    ];
    const selectedPath = prompt(
      '请输入百度网盘同步文件夹的路径（模拟选择）：', 
      tempFolderPath || mockPaths[0]
    );
    if (selectedPath) {
      setTempFolderPath(selectedPath);
    }
  };

  const handleSaveConfig = () => {
    configureCloudSync({
      folderPath: tempFolderPath,
      provider: 'baidu',
      isConnected: true,
    });
    setIsConfiguring(false);
  };

  const handleDisconnect = () => {
    configureCloudSync({
      folderPath: '',
      provider: 'none',
      isConnected: false,
    });
  };

  const handleSync = async () => {
    await syncToCloud();
    alert('同步成功！（模拟）');
  };

  const handleLoad = async () => {
    await loadFromCloud();
    alert('加载成功！（模拟）');
  };

  return (
    <div className="glassmorphism border border-cyan-500/30 rounded-xl p-4">
      <h3 className="font-orbitron font-bold text-cyan-400 mb-4">云同步配置</h3>
      
      {cloudSyncConfig.isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">已连接到百度网盘</span>
          </div>
          
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">同步文件夹</div>
            <div className="text-sm text-white break-all">{cloudSyncConfig.folderPath}</div>
          </div>

          {cloudSyncConfig.lastSyncTime && (
            <div className="text-xs text-gray-400">
              上次同步：{new Date(cloudSyncConfig.lastSyncTime).toLocaleString()}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSync}
              className="flex-1 sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-sm"
            >
              同步到云端
            </button>
            <button
              onClick={handleLoad}
              className="flex-1 sci-fi-button glassmorphism border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 hover:bg-blue-500/10 transition-colors text-sm"
            >
              从云端加载
            </button>
          </div>

          <button
            onClick={handleDisconnect}
            className="w-full sci-fi-button glassmorphism border border-red-500/30 rounded-lg px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
          >
            断开连接
          </button>
        </div>
      ) : isConfiguring ? (
        <div className="space-y-4">
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-gray-400 mb-2">百度网盘同步文件夹路径</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempFolderPath}
                onChange={(e) => setTempFolderPath(e.target.value)}
                placeholder="输入文件夹路径"
                className="flex-1 bg-slate-900/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSelectFolder}
                className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-sm"
              >
                选择文件夹
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveConfig}
              className="flex-1 sci-fi-button glassmorphism border border-green-500/30 rounded-lg px-4 py-2 text-green-400 hover:bg-green-500/10 transition-colors text-sm"
            >
              保存并连接
            </button>
            <button
              onClick={() => setIsConfiguring(false)}
              className="flex-1 sci-fi-button glassmorphism border border-gray-500/30 rounded-lg px-4 py-2 text-gray-400 hover:bg-gray-500/10 transition-colors text-sm"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 text-center">
            <p className="text-gray-400 text-sm mb-3">尚未连接到百度网盘</p>
            <p className="text-gray-500 text-xs mb-4">连接后可自动同步聊天记录、经验和组织架构</p>
          </div>
          
          <button
            onClick={() => setIsConfiguring(true)}
            className="w-full sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-4 py-3 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-sm"
          >
            连接百度网盘
          </button>
        </div>
      )}
    </div>
  );
};

export default CloudSyncConfig;