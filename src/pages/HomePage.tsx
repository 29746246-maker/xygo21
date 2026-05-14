import React from 'react';
import ChatArea from '../components/layout/ChatArea';
import TaskDashboard from '../components/layout/TaskDashboard';
import { useStore } from '../store/useStore';
import BrainstormingPanel from '../components/BrainstormingPanel';

const HomePage: React.FC = () => {
  const { mode } = useStore();

  return (
    <div className="h-full flex flex-col">
      {/* Main Content */}
      {mode === 'brainstorming' ? (
        <div className="h-[calc(100vh-56px)]">
          <BrainstormingPanel />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Chat Area */}
          <div className="lg:col-span-2 h-[calc(100vh-56px)]">
            <ChatArea />
          </div>

          {/* Task Dashboard */}
          <div className="lg:col-span-1 h-[calc(100vh-56px)]">
            <TaskDashboard />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
