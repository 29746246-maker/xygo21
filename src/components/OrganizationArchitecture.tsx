import React, { useState, useRef } from 'react';
import { useStore, OrgNode, Agent } from '../store/useStore';

interface DraggingState {
  isDragging: boolean;
  nodeId: string | null;
  offsetX: number;
  offsetY: number;
}

const OrganizationArchitecture: React.FC = () => {
  const { orgNodes, agents, updateOrgNode, addOrgNode, deleteOrgNode, assignAgentToOrgNode } = useStore();
  const [dragging, setDragging] = useState<DraggingState>({
    isDragging: false,
    nodeId: null,
    offsetX: 0,
    offsetY: 0,
  });
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showAgentSelector, setShowAgentSelector] = useState(false);

  const getNodeColor = (isManager: boolean) => {
    return isManager ? 'rgba(20, 184, 166, 0.8)' : 'rgba(59, 130, 246, 0.8)';
  };

  const getNodeBorderColor = (isManager: boolean) => {
    return isManager ? '#14b8a6' : '#3b82f6';
  };

  const getAgentById = (agentId: string | undefined): Agent | undefined => {
    if (!agentId) return undefined;
    return agents.find(agent => agent.id === agentId);
  };

  const drawConnections = (nodes: OrgNode[]) => {
    const connections: JSX.Element[] = [];
    
    nodes.forEach(node => {
      node.children.forEach(childId => {
        const childNode = nodes.find(n => n.id === childId);
        if (childNode) {
          const startX = node.position.x;
          const startY = node.position.y + 40;
          const endX = childNode.position.x;
          const endY = childNode.position.y;
          
          const controlPointY = (startY + endY) / 2;
          
          connections.push(
            <g key={`conn-${node.id}-${childId}`}>
              <path
                d={`M ${startX} ${startY} C ${startX} ${controlPointY}, ${endX} ${controlPointY}, ${endX} ${endY}`}
                fill="none"
                stroke={getNodeBorderColor(node.isManager)}
                strokeWidth="2"
                className="transition-all duration-300"
              />
              <circle
                cx={startX}
                cy={startY}
                r="4"
                fill={getNodeBorderColor(node.isManager)}
              />
              <circle
                cx={endX}
                cy={endY}
                r="4"
                fill={getNodeBorderColor(childNode.isManager)}
              />
            </g>
          );
        }
      });
    });
    
    return connections;
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const node = orgNodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setDragging({
      isDragging: true,
      nodeId,
      offsetX: e.clientX - rect.left - node.position.x,
      offsetY: e.clientY - rect.top - node.position.y,
    });
    
    setSelectedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.isDragging || !dragging.nodeId || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragging.offsetX;
    const newY = e.clientY - rect.top - dragging.offsetY;
    
    updateOrgNode(dragging.nodeId, {
      position: { x: newX, y: newY },
    });
  };

  const handleMouseUp = () => {
    setDragging({
      isDragging: false,
      nodeId: null,
      offsetX: 0,
      offsetY: 0,
    });
  };

  const handleAddChildNode = (parentNodeId: string) => {
    const parentNode = orgNodes.find(n => n.id === parentNodeId);
    if (!parentNode) return;
    
    // Use a simple approach - create a node, add it, then update parent
    const tempId = Date.now().toString();
    
    // Get the store and add the node
    const store = useStore.getState();
    
    // We'll manually set the state to avoid issues
    store.updateOrgNode(parentNodeId, {
      children: [...parentNode.children, tempId],
    });
    
    // Add the new node
    const currentOrgNodes = store.orgNodes;
    const newNode: OrgNode = {
      id: tempId,
      label: '新节点',
      children: [],
      position: {
        x: parentNode.position.x + (Math.random() * 100 - 50),
        y: parentNode.position.y + 150,
      },
      isManager: false,
    };
    
    // Update the store with the new node
    useStore.setState({
      orgNodes: [...currentOrgNodes, newNode],
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    deleteOrgNode(nodeId);
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  const renderNode = (node: OrgNode) => {
    const assignedAgent = getAgentById(node.agentId);
    
    return (
      <g
        key={node.id}
        className={`transition-all duration-200 ${selectedNode === node.id ? 'scale-105' : ''}`}
        onMouseDown={(e) => handleMouseDown(e, node.id)}
      >
        <rect
          x={node.position.x - 70}
          y={node.position.y}
          width="140"
          height="80"
          rx="12"
          ry="12"
          fill={getNodeColor(node.isManager)}
          stroke={getNodeBorderColor(node.isManager)}
          strokeWidth={selectedNode === node.id ? "3" : "2"}
          className="shadow-lg"
        />
        <rect
          x={node.position.x - 65}
          y={node.position.y + 5}
          width="130"
          height="70"
          rx="8"
          ry="8"
          fill="rgba(0, 0, 0, 0.2)"
        />
        <text
          x={node.position.x}
          y={node.position.y + 30}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
          className="font-orbitron"
        >
          {assignedAgent ? assignedAgent.name : node.label}
        </text>
        <text
          x={node.position.x}
          y={node.position.y + 50}
          textAnchor="middle"
          fill="rgba(255, 255, 255, 0.7)"
          fontSize="10"
        >
          {node.isManager ? '管理者' : '成员'}
        </text>
        
        {node.isManager && (
          <circle
            cx={node.position.x + 50}
            cy={node.position.y + 20}
            r="8"
            fill="rgba(245, 158, 11, 0.8)"
            stroke="#f59e0b"
            strokeWidth="1"
          />
        )}
        
        {selectedNode === node.id && (
          <g>
            <circle
              cx={node.position.x + 60}
              cy={node.position.y + 40}
              r="12"
              fill="rgba(22, 163, 74, 0.9)"
              stroke="#16a34a"
              strokeWidth="2"
              className="cursor-pointer hover:scale-110 transition-transform duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleAddChildNode(node.id);
              }}
            />
            <text
              x={node.position.x + 60}
              y={node.position.y + 44}
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontWeight="bold"
            >
              +
            </text>
            
            <circle
              cx={node.position.x - 60}
              cy={node.position.y + 40}
              r="12"
              fill="rgba(239, 68, 68, 0.9)"
              stroke="#ef4444"
              strokeWidth="2"
              className="cursor-pointer hover:scale-110 transition-transform duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNode(node.id);
              }}
            />
            <text
              x={node.position.x - 60}
              y={node.position.y + 44}
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontWeight="bold"
            >
              ×
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="glassmorphism border border-cyan-500/30 rounded-xl p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-orbitron font-bold text-cyan-400 text-lg">组织架构</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const store = useStore.getState();
              const tempId = Date.now().toString();
              const newNode: OrgNode = {
                id: tempId,
                label: '新节点',
                children: [],
                position: { x: 400, y: 300 },
                isManager: false,
              };
              useStore.setState({
                orgNodes: [...store.orgNodes, newNode],
              });
            }}
            className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-3 py-1.5 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-sm"
          >
            添加节点
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto rounded-lg bg-gradient-to-br from-slate-900/50 to-slate-800/50">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 800 500"
          style={{ minWidth: '800px', minHeight: '500px' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-grab active:cursor-grabbing"
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(100, 116, 139, 0.2)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {drawConnections(orgNodes)}
          {orgNodes.map(node => renderNode(node))}
        </svg>
      </div>
      
      {selectedNode && (
        <div className="mt-4 p-4 glassmorphism border border-cyan-500/30 rounded-lg">
          <h4 className="font-bold text-cyan-400 mb-3">节点设置</h4>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAgentSelector(!showAgentSelector)}
              className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-3 py-1.5 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-sm"
            >
              分配智能体
            </button>
          </div>
          
          {showAgentSelector && (
            <div className="mt-3">
              <div className="grid grid-cols-2 gap-2">
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      assignAgentToOrgNode(selectedNode, agent.id);
                      setShowAgentSelector(false);
                    }}
                    className="glassmorphism border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-left hover:bg-cyan-500/10 transition-colors"
                  >
                    <div className="font-medium text-white">{agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.personality.role}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationArchitecture;
