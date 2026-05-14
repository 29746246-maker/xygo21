import React, { useState } from 'react';
import { useStore, LogEntry } from '../store/useStore';

const LogsPage: React.FC = () => {
  const { logs, clearLogs } = useStore();
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = logs
    .filter(log => filterLevel === 'all' || log.level === filterLevel)
    .filter(log => filterCategory === 'all' || log.category === filterCategory)
    .filter(log => 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && Object.values(log.details).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return '✓';
      case 'info': return 'i';
      case 'warning': return '!';
      case 'error': return '✗';
      default: return '•';
    }
  };

  const categories = ['all', ...new Set(logs.map(log => log.category))];
  const levels = ['all', 'info', 'warning', 'error', 'success'];

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-orbitron text-2xl font-bold text-cyan-400">运行日志</h2>
        <button
          onClick={clearLogs}
          className="sci-fi-button glassmorphism border border-red-500/30 rounded-lg px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
        >
          清空日志
        </button>
      </div>

      {/* Filters */}
      <div className="glassmorphism border border-cyan-500/30 rounded-xl p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            搜索
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索日志内容..."
            className="w-full glassmorphism border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            日志级别
          </label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full glassmorphism border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
          >
            {levels.map(level => (
              <option key={level} value={level}>
                {level === 'all' ? '全部' : level}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            分类
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full glassmorphism border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? '全部' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            暂无日志记录
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log: LogEntry) => (
              <div 
                key={log.id} 
                className="glassmorphism border border-gray-700/50 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getLevelColor(log.level)}`}>
                      {getLevelIcon(log.level)}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{log.message}</h4>
                      <p className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-800/50 rounded-full text-gray-400">
                    {log.category}
                  </span>
                </div>
                {log.details && Object.keys(log.details).length > 0 && (
                  <div className="mt-2 text-xs text-gray-400 bg-gray-800/30 p-2 rounded">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;
