import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useStore } from '../../store/useStore';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { sidebarCollapsed, toggleSidebar, mode, tokenStats, messages } = useStore();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="glassmorphism border-b border-cyan-500/30 py-2 px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="font-orbitron text-xl font-bold text-cyan-400">
              AI团队协作
            </h1>
            <div className={`h-2 w-2 rounded-full ${mode === 'single' ? 'bg-cyan-400' : 'bg-green-400'}`} />
            <span className="text-xs text-gray-400">
              {mode === 'single' ? '单智能体模式' : '多智能体模式'}
            </span>
          </div>
          <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 glassmorphism border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs">
            <div>
              <span className="text-gray-400">总 Token：</span>
              <span className="text-white font-bold ml-1">{tokenStats.totalTokens}</span>
            </div>
            <div>
              <span className="text-gray-400">速度：</span>
              <span className="text-white font-bold ml-1">{tokenStats.tokensPerSecond.toFixed(2)} t/s</span>
            </div>
            <div>
              <span className="text-gray-400">对话：</span>
              <span className="text-white font-bold ml-1">{messages.length}</span>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <a 
              href="/" 
              className="flex items-center gap-1 p-1.5 rounded hover:bg-cyan-500/10 transition-colors text-sm"
            >
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
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>首页</span>
            </a>
            <a 
              href="/agents" 
              className="flex items-center gap-1 p-1.5 rounded hover:bg-cyan-500/10 transition-colors text-sm"
            >
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>智能体</span>
            </a>
            <a 
              href="/models" 
              className="flex items-center gap-1 p-1.5 rounded hover:bg-cyan-500/10 transition-colors text-sm"
            >
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
              <span>模型</span>
            </a>
            <a 
              href="/skills" 
              className="flex items-center gap-1 p-1.5 rounded hover:bg-cyan-500/10 transition-colors text-sm"
            >
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
              <span>技能</span>
            </a>
            <a 
              href="/management" 
              className="flex items-center gap-1 p-1.5 rounded hover:bg-cyan-500/10 transition-colors text-sm"
            >
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
                className="text-purple-400"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>管理</span>
            </a>
            <a 
              href="/logs" 
              className="flex items-center gap-1 p-1.5 rounded hover:bg-cyan-500/10 transition-colors text-sm"
            >
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
                className="text-yellow-400"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>日志</span>
            </a>
            <a 
              href="/plans" 
              className="flex items-center gap-1 p-1.5 rounded hover:bg-cyan-500/10 transition-colors text-sm"
            >
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
                className="text-green-400"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>计划</span>
            </a>
          </nav>
            <button 
              onClick={toggleSidebar}
              className="sci-fi-button p-1 rounded-full border border-cyan-500/30 hover:bg-cyan-500/10"
            >
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
                className="text-cyan-400"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
