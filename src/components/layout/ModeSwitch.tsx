import React from 'react';
import { useStore } from '../../store/useStore';

const ModeSwitch: React.FC = () => {
  const { mode, switchMode, sidebarCollapsed } = useStore();

  const cycleMode = () => {
    if (mode === 'single') switchMode('multi');
    else if (mode === 'multi') switchMode('brainstorming');
    else switchMode('single');
  };

  const getModeColor = () => {
    if (mode === 'single') return 'cyan';
    if (mode === 'multi') return 'green';
    return 'purple';
  };

  const getModeLabel = () => {
    if (mode === 'single') return '单人';
    if (mode === 'multi') return '多人';
    return '头脑风暴';
  };

  const color = getModeColor();

  return (
    <div className={`flex flex-col gap-1.5 ${sidebarCollapsed ? 'items-center' : ''}`}>
      {!sidebarCollapsed && (
        <div className="flex justify-between items-center w-full">
          <span className="text-sm font-medium text-gray-400">模式</span>
          <button
            onClick={cycleMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 border border-${color}-500/30 bg-${color}-900/20 text-${color}-400 hover:bg-${color}-900/30`}
          >
            {getModeLabel()}
          </button>
        </div>
      )}
      {sidebarCollapsed && (
        <button
          onClick={cycleMode}
          className={`w-12 h-6 rounded-lg text-xs font-medium transition-all duration-300 border border-${color}-500/30 bg-${color}-900/20 flex items-center justify-center text-${color}-400`}
        >
          {mode === 'single' ? '1' : mode === 'multi' ? 'N' : '💡'}
        </button>
      )}
      {!sidebarCollapsed && (
        <div className="flex justify-between text-xs text-gray-500 w-full">
          <span className={`${mode === 'single' ? 'text-cyan-400 font-medium' : ''}`}>单人</span>
          <span className={`${mode === 'multi' ? 'text-green-400 font-medium' : ''}`}>多人</span>
          <span className={`${mode === 'brainstorming' ? 'text-purple-400 font-medium' : ''}`}>头脑风暴</span>
        </div>
      )}
    </div>
  );
};

export default ModeSwitch;
