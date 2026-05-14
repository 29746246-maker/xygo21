import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';

const ChatArea: React.FC = () => {
  const { messages, addMessage, mode, activeAgentId, agents, updateTokenStats } = useStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const calculateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userTokens = calculateTokens(inputValue);
    
    addMessage({
      content: inputValue,
      agentId: 'user',
      timestamp: new Date().toISOString(),
      type: 'text',
    });
    
    updateTokenStats(userTokens);

    if (mode === 'single' && activeAgentId) {
      setTimeout(() => {
        const response = `我已收到您的消息："${inputValue}"。让我来帮助您。`;
        const responseTokens = calculateTokens(response);
        
        addMessage({
          content: response,
          agentId: activeAgentId,
          timestamp: new Date().toISOString(),
          type: 'text',
        });
        
        updateTokenStats(responseTokens);
      }, 1000);
    } else if (mode === 'multi') {
      const enabledAgents = agents.filter(agent => agent.enabled);
      enabledAgents.forEach((agent, index) => {
        setTimeout(() => {
          const response = `[${agent.name}] 我已收到您的消息："${inputValue}"。我的观点：${agent.personality.role === '产品经理' ? '这符合我们的产品策略。' : agent.personality.role === '软件工程师' ? '我可以从技术上实现这一点。' : '这需要以用户为中心的设计方法。'}`;
          const responseTokens = calculateTokens(response);
          
          addMessage({
            content: response,
            agentId: agent.id,
            timestamp: new Date().toISOString(),
            type: 'text',
          });
          
          updateTokenStats(responseTokens);
        }, 1000 * (index + 1));
      });

      setTimeout(() => {
        const summary = `**总结：**基于我们团队的讨论，我们将通过结合产品策略、技术实现和以用户为中心的设计来处理这个任务。`;
        const summaryTokens = calculateTokens(summary);
        
        addMessage({
          content: summary,
          agentId: enabledAgents[0]?.id || 'system',
          timestamp: new Date().toISOString(),
          type: 'summary',
        });
        
        updateTokenStats(summaryTokens);
      }, 1000 * (enabledAgents.length + 1));
    }

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAgentName = (agentId: string) => {
    if (agentId === 'user') return 'You';
    if (agentId === 'system') return 'System';
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || 'Unknown Agent';
  };

  const getAgentColor = (agentId: string) => {
    if (agentId === 'user') return 'text-cyan-400';
    if (agentId === 'system') return 'text-green-400';
    const agentIndex = agents.findIndex(a => a.id === agentId);
    const colors = ['text-blue-400', 'text-purple-400', 'text-pink-400', 'text-yellow-400'];
    return colors[agentIndex % colors.length];
  };

  return (
    <div className="glassmorphism border border-cyan-500/30 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="border-b border-cyan-500/30 px-4 py-2 flex justify-between items-center">
        <span className="text-xs text-gray-400">聊天</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message-bubble ${message.agentId === 'user' ? 'flex justify-end' : 'flex'}`}
          >
            <div className={`max-w-[80%] ${message.agentId === 'user' ? 'bg-cyan-900/30' : 'bg-gray-800/50'} rounded-lg p-3 border ${message.agentId === 'user' ? 'border-cyan-500/30' : 'border-gray-700'}`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-xs font-medium ${getAgentColor(message.agentId)}`}>
                  {getAgentName(message.agentId)}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className={message.type === 'summary' ? 'font-medium text-green-400 text-xs' : 'text-gray-300 text-xs'}>
                {message.content}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-cyan-500/30 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1 glassmorphism border border-cyan-500/30 rounded-lg px-4 py-6 text-white placeholder-gray-500 sci-fi-input focus:outline-none text-sm"
          />
          <button
            onClick={handleSendMessage}
            className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-4 py-6 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-sm"
          >
            发送
          </button>
        </div>
      </div>


    </div>
  );
};

export default ChatArea;
