import React, { useState, useRef, useEffect } from 'react';
import { useStore, WorkflowNode, WorkflowConnection, WorkflowNodeType } from '../store/useStore';

interface NodeTemplate {
  type: WorkflowNodeType;
  title: string;
  description: string;
  color: string;
  defaultInputs: string[];
  defaultOutputs: string[];
}

const NODE_TEMPLATES: NodeTemplate[] = [
  {
    type: 'input',
    title: '用户需求输入',
    description: '接收用户需求，读取附加要求',
    color: '#06b6d4',
    defaultInputs: [],
    defaultOutputs: ['output'],
  },
  {
    type: 'router',
    title: '需求智能拆解路由',
    description: 'AI自动拆分项目，智能判断分支',
    color: '#8b5cf6',
    defaultInputs: ['input'],
    defaultOutputs: ['output'],
  },
  {
    type: 'plan',
    title: '方案规划生成',
    description: '输出整体架构、模块拆分、步骤计划',
    color: '#10b981',
    defaultInputs: ['input'],
    defaultOutputs: ['output1', 'output2'],
  },
  {
    type: 'visual',
    title: '视觉美术生成',
    description: '自动界面、原画、图标、场景素材',
    color: '#f59e0b',
    defaultInputs: ['input'],
    defaultOutputs: ['output'],
  },
  {
    type: 'code',
    title: '逻辑代码生成',
    description: '自动脚本、后端、前端、游戏蓝图',
    color: '#3b82f6',
    defaultInputs: ['input'],
    defaultOutputs: ['output'],
  },
  {
    type: 'merge',
    title: '素材 & 代码合并整合',
    description: 'UI画面 + 程序逻辑自动拼接适配',
    color: '#ec4899',
    defaultInputs: ['input1', 'input2'],
    defaultOutputs: ['output'],
  },
  {
    type: 'check',
    title: '自检报错循环回流',
    description: '检测Bug、漏洞、适配问题',
    color: '#ef4444',
    defaultInputs: ['input'],
    defaultOutputs: ['output', 'retry'],
  },
  {
    type: 'export',
    title: '成品打包导出',
    description: '完整项目源码、全套文件+教程一键输出',
    color: '#059669',
    defaultInputs: ['input'],
    defaultOutputs: [],
  },
];

interface DraggingState {
  isDragging: boolean;
  nodeId: string | null;
  startX: number;
  startY: number;
  nodeStartX: number;
  nodeStartY: number;
}

interface ConnectingState {
  isConnecting: boolean;
  fromNodeId: string | null;
  fromOutput: string | null;
  toNodeId: string | null;
  toInput: string | null;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface CanvasState {
  pan: { x: number; y: number };
  zoom: number;
  isPanning: boolean;
  lastMouseX: number;
  lastMouseY: number;
}

const WorkflowCanvas: React.FC = () => {
  const {
    workflows,
    currentWorkflow,
    setCurrentWorkflow,
    addWorkflowNode,
    updateWorkflowNode,
    deleteWorkflowNode,
    addWorkflowConnection,
    deleteWorkflowConnection,
    runWorkflow,
    updateWorkflow,
    addWorkflowTemplate,
  } = useStore();

  const [dragging, setDragging] = useState<DraggingState>({
    isDragging: false,
    nodeId: null,
    startX: 0,
    startY: 0,
    nodeStartX: 0,
    nodeStartY: 0,
  });

  const [connecting, setConnecting] = useState<ConnectingState>({
    isConnecting: false,
    fromNodeId: null,
    fromOutput: null,
    toNodeId: null,
    toInput: null,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    pan: { x: 0, y: 0 },
    zoom: 1,
    isPanning: false,
    lastMouseX: 0,
    lastMouseY: 0,
  });
  const [isNodeLibraryExpanded, setIsNodeLibraryExpanded] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (workflows.length > 0 && !currentWorkflow) {
      setCurrentWorkflow(workflows[0]);
    }
  }, [workflows, currentWorkflow, setCurrentWorkflow]);

  const getNodeTemplate = (type: WorkflowNodeType): NodeTemplate | undefined =>
    NODE_TEMPLATES.find(t => t.type === type);

  const drawConnections = (nodes: WorkflowNode[], connections: WorkflowConnection[]) => {
    const elements: JSX.Element[] = [];

    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.fromNode);
      const toNode = nodes.find(n => n.id === conn.toNode);

      if (!fromNode || !toNode) return;

      // 计算输出点和输入点的索引
      const outputIndex = fromNode.outputs.indexOf(conn.fromOutput);
      const inputIndex = toNode.inputs.indexOf(conn.toInput);

      // 节点的布局参数
      const nodeHeaderHeight = 40; // 标题栏高度
      const descHeight = 24; // 描述文本高度
      const pointHeight = 28; // 每个输入/输出点的高度
      const gapHeight = 8; // 点之间的间距
      const paddingHeight = 16; // 内容区域的padding
      const nodeWidth = 256; // 节点宽度 (w-64)

      // 计算输出点的位置
      const fromX = fromNode.position.x - nodeWidth/2;
      let fromY = fromNode.position.y + nodeHeaderHeight + descHeight + paddingHeight;
      // 加上输入部分的高度（如果有输入点）
      if (fromNode.inputs.length > 0) {
        fromY += fromNode.inputs.length * pointHeight + gapHeight;
      }
      // 加上对应输出点的位置
      fromY += outputIndex * pointHeight + pointHeight/2;

      // 计算输入点的位置
      const toX = toNode.position.x + nodeWidth/2;
      const toY = toNode.position.y + nodeHeaderHeight + descHeight + paddingHeight + 
                    inputIndex * pointHeight + pointHeight/2;

      // 优化连线路径，减少缠绕
      let controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y;
      
      // 根据节点位置关系调整控制点
      if (Math.abs(fromY - toY) < 100) {
        // 水平方向的连线，使用更高的控制点
        const offset = Math.abs(fromX - toX) / 3;
        controlPoint1X = fromX - offset;
        controlPoint1Y = fromY - 50;
        controlPoint2X = toX + offset;
        controlPoint2Y = toY - 50;
      } else if (fromX < toX) {
        // 从左到右的连线
        controlPoint1X = fromX - 50;
        controlPoint1Y = fromY;
        controlPoint2X = toX + 50;
        controlPoint2Y = toY;
      } else {
        // 从右到左的连线，使用更高的控制点
        const offset = Math.abs(fromX - toX) / 2;
        controlPoint1X = fromX + offset;
        controlPoint1Y = fromY - 100;
        controlPoint2X = toX - offset;
        controlPoint2Y = toY - 100;
      }

      elements.push(
        <g key={conn.id}>
          <path
            d={`M ${fromX} ${fromY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toX} ${toY}`}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            className="transition-all duration-300"
          />
          <path
            d={`M ${fromX} ${fromY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toX} ${toY}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            className="transition-all duration-300 animate-flow"
          />
        </g>
      );
    });

    return elements;
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const node = currentWorkflow?.nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDragging({
      isDragging: true,
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.position.x,
      nodeStartY: node.position.y,
    });

    setSelectedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    if (dragging.isDragging && dragging.nodeId && currentWorkflow) {
      const dx = (e.clientX - dragging.startX) / canvasState.zoom;
      const dy = (e.clientY - dragging.startY) / canvasState.zoom;
      
      const newX = dragging.nodeStartX + dx;
      const newY = dragging.nodeStartY + dy;

      updateWorkflowNode(currentWorkflow.id, dragging.nodeId, {
        position: { x: newX, y: newY },
      });
      return;
    }

    if (canvasState.isPanning) {
      setCanvasState(prev => ({
        ...prev,
        pan: {
          x: prev.pan.x + (e.clientX - prev.lastMouseX),
          y: prev.pan.y + (e.clientY - prev.lastMouseY),
        },
        lastMouseX: e.clientX,
        lastMouseY: e.clientY,
      }));
      return;
    }

    if (connecting.isConnecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - canvasState.pan.x;
      const mouseY = e.clientY - rect.top - canvasState.pan.y;
      
      setConnecting({
        ...connecting,
        endX: mouseX / canvasState.zoom,
        endY: mouseY / canvasState.zoom,
      });
    }
  };

  const handleMouseUp = () => {
    if (dragging.isDragging) {
      setDragging({
        isDragging: false,
        nodeId: null,
        startX: 0,
        startY: 0,
        nodeStartX: 0,
        nodeStartY: 0,
      });
    }

    if (canvasState.isPanning) {
      setCanvasState(prev => ({
        ...prev,
        isPanning: false,
      }));
    }

    if (connecting.isConnecting && connecting.fromNodeId && connecting.fromOutput &&
        connecting.toNodeId && connecting.toInput && currentWorkflow) {
      addWorkflowConnection(currentWorkflow.id, {
        fromNode: connecting.fromNodeId,
        fromOutput: connecting.fromOutput,
        toNode: connecting.toNodeId,
        toInput: connecting.toInput,
      });
    }

    setConnecting({
      isConnecting: false,
      fromNodeId: null,
      fromOutput: null,
      toNodeId: null,
      toInput: null,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (dragging.isDragging) return;
    
    if (e.button === 0 || e.button === 1) {
      e.preventDefault();
      setCanvasState(prev => ({
        ...prev,
        isPanning: true,
        lastMouseX: e.clientX,
        lastMouseY: e.clientY,
      }));
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(2, canvasState.zoom + 0.1);
    setCanvasState(prev => ({
      ...prev,
      zoom: newZoom,
    }));
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, canvasState.zoom - 0.1);
    setCanvasState(prev => ({
      ...prev,
      zoom: newZoom,
    }));
  };

  const handleResetView = () => {
    if (!currentWorkflow || currentWorkflow.nodes.length === 0) {
      setCanvasState({
        pan: { x: 0, y: 0 },
        zoom: 1,
        isPanning: false,
        lastMouseX: 0,
        lastMouseY: 0,
      });
      return;
    }

    const nodes = currentWorkflow.nodes;
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(node => {
      const nodeLeft = node.position.x - 128;
      const nodeRight = node.position.x + 128;
      const nodeTop = node.position.y;
      const nodeBottom = node.position.y + 200;

      minX = Math.min(minX, nodeLeft);
      maxX = Math.max(maxX, nodeRight);
      minY = Math.min(minY, nodeTop);
      maxY = Math.max(maxY, nodeBottom);
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasCenterX = rect.width / 2;
    const canvasCenterY = rect.height / 2;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const padding = 100;

    const scaleX = (rect.width - padding * 2) / contentWidth;
    const scaleY = (rect.height - padding * 2) / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    setCanvasState({
      pan: {
        x: canvasCenterX - centerX * scale,
        y: canvasCenterY - centerY * scale,
      },
      zoom: scale,
      isPanning: false,
      lastMouseX: 0,
      lastMouseY: 0,
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const zoomIntensity = 0.1;
    const newZoom = e.deltaY > 0
      ? Math.max(0.5, canvasState.zoom - zoomIntensity)
      : Math.min(2, canvasState.zoom + zoomIntensity);
    
    setCanvasState(prev => ({
      ...prev,
      zoom: newZoom,
    }));
  };

  const handleOutputClick = (e: React.MouseEvent, nodeId: string, output: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!canvasRef.current) return;

    const node = currentWorkflow?.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // 计算输出点的位置
    const outputIndex = node.outputs.indexOf(output);
    const nodeHeaderHeight = 40; 
    const descHeight = 24; 
    const pointHeight = 28; 
    const gapHeight = 8;
    const paddingHeight = 16; 
    const nodeWidth = 256;

    const startX = node.position.x - nodeWidth/2;
    let startY = node.position.y + nodeHeaderHeight + descHeight + paddingHeight;
    if (node.inputs.length > 0) {
      startY += node.inputs.length * pointHeight + gapHeight;
    }
    startY += outputIndex * pointHeight + pointHeight/2;

    setConnecting({
      isConnecting: true,
      fromNodeId: nodeId,
      fromOutput: output,
      toNodeId: null,
      toInput: null,
      startX: startX,
      startY: startY,
      endX: startX,
      endY: startY,
    });
  };

  const handleInputClick = (e: React.MouseEvent, nodeId: string, input: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!connecting.isConnecting || !connecting.fromNodeId || !connecting.fromOutput) return;

    setConnecting({
      ...connecting,
      toNodeId: nodeId,
      toInput: input,
    });
  };

  const handleAddNode = (template: NodeTemplate) => {
    if (!currentWorkflow) return;

    const newNode: Omit<WorkflowNode, 'id'> = {
      type: template.type,
      position: { x: 200, y: 200 },
      title: template.title,
      description: template.description,
      inputs: template.defaultInputs,
      outputs: template.defaultOutputs,
      status: 'idle',
    };

    addWorkflowNode(currentWorkflow.id, newNode);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!currentWorkflow) return;
    deleteWorkflowNode(currentWorkflow.id, nodeId);
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleRunWorkflow = () => {
    if (!currentWorkflow) return;
    runWorkflow(currentWorkflow.id);
  };

  const handleSaveWorkflow = () => {
    if (!currentWorkflow) return;
    const newName = prompt('请输入工作流名称:', currentWorkflow.name);
    if (newName) {
      updateWorkflow(currentWorkflow.id, { name: newName });
    }
  };

  const handleSaveAsTemplate = () => {
    if (!currentWorkflow) return;
    const templateName = prompt('请输入模板名称:', currentWorkflow.name);
    if (templateName) {
      const templateDescription = prompt('请输入模板描述:');
      const templateCategory = prompt('请输入模板分类:', '通用');
      addWorkflowTemplate({
        name: templateName,
        description: templateDescription || '',
        workflow: {
          ...currentWorkflow,
          id: crypto.randomUUID(),
          status: 'idle',
          createdAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        category: templateCategory || '通用',
      });
      alert('模板保存成功！');
    }
  };

  if (!currentWorkflow) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        没有可用的工作流
      </div>
    );
  }

  return (
    <div className="glassmorphism border border-cyan-500/30 rounded-xl h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
        <div>
          <h2 className="font-orbitron font-bold text-cyan-400 text-lg">{currentWorkflow.name}</h2>
          <p className="text-xs text-gray-400 mt-1">
            状态: {currentWorkflow.status === 'idle' ? '空闲' :
               currentWorkflow.status === 'running' ? '运行中' :
               currentWorkflow.status === 'completed' ? '已完成' : '错误'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveWorkflow}
            className="sci-fi-button glassmorphism border border-blue-500/30 px-3 py-2 text-sm font-medium transition-colors text-blue-400 hover:bg-blue-500/10"
          >
            保存
          </button>
          <button
            onClick={handleSaveAsTemplate}
            className="sci-fi-button glassmorphism border border-purple-500/30 px-3 py-2 text-sm font-medium transition-colors text-purple-400 hover:bg-purple-500/10"
          >
            保存为模板
          </button>
          <button
            onClick={handleRunWorkflow}
            disabled={currentWorkflow.status === 'running'}
            className={`sci-fi-button glassmorphism border px-3 py-2 text-sm font-medium transition-colors ${
              currentWorkflow.status === 'running'
                ? 'border-gray-500/30 text-gray-400'
                : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
            }`}
          >
            运行工作流
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`border-r border-cyan-500/30 overflow-y-auto transition-all duration-300 ${isNodeLibraryExpanded ? 'w-64 p-4' : 'w-16'}`}>
          <div className="flex items-center justify-between mb-4">
            {isNodeLibraryExpanded && <h3 className="text-sm font-bold text-cyan-400">节点库</h3>}
            <button
              onClick={() => setIsNodeLibraryExpanded(!isNodeLibraryExpanded)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
              title={isNodeLibraryExpanded ? '收缩节点库' : '展开节点库'}
            >
              {isNodeLibraryExpanded ? '‹' : '›'}
            </button>
          </div>
          <div className="space-y-3">
            {NODE_TEMPLATES.map((template) => (
              <div
                key={template.type}
                className={`glassmorphism border border-gray-700 cursor-pointer hover:border-cyan-500/50 transition-colors ${isNodeLibraryExpanded ? 'p-3' : 'p-2 flex items-center justify-center'}`}
                onClick={() => handleAddNode(template)}
                title={isNodeLibraryExpanded ? undefined : template.title}
              >
                {isNodeLibraryExpanded ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: template.color }}
                      />
                      <span className="text-white font-medium text-sm">{template.title}</span>
                    </div>
                    <p className="text-xs text-gray-400">{template.description}</p>
                  </>
                ) : (
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: template.color }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="glassmorphism border border-cyan-500/30 p-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
              title="放大"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className="glassmorphism border border-cyan-500/30 p-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
              title="缩小"
            >
              -
            </button>
            <button
              onClick={handleResetView}
              className="glassmorphism border border-cyan-500/30 p-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
              title="居中查看"
            >
              ⏎
            </button>
          </div>
          
          <div
            ref={canvasRef}
            className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-800/50"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseDown={handleCanvasMouseDown}
            onWheel={handleWheel}
            style={{
              cursor: canvasState.isPanning ? 'grabbing' : dragging.isDragging ? 'grabbing' : 'grab'
            }}
          >
            <div
              className="absolute top-0 left-0 transition-transform duration-100"
              style={{
                transform: `translate(${canvasState.pan.x}px, ${canvasState.pan.y}px) scale(${canvasState.zoom})`,
                transformOrigin: '0 0',
              }}
            >
              <svg
                ref={svgRef}
                width="20000"
                height="20000"
              >
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(100, 116, 139, 0.2)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {currentWorkflow && drawConnections(currentWorkflow.nodes, currentWorkflow.connections)}

                {connecting.isConnecting && (
                  <path
                    d={`M ${connecting.startX} ${connecting.startY} C ${connecting.startX} ${(connecting.startY + connecting.endY) / 2}, ${connecting.endX} ${(connecting.startY + connecting.endY) / 2}, ${connecting.endX} ${connecting.endY}`}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                )}
              </svg>

              {currentWorkflow?.nodes.map((node) => {
                const template = getNodeTemplate(node.type);
                return (
                  <div
                    key={node.id}
                    className={`absolute w-64 glassmorphism border-2 rounded-xl overflow-hidden transition-all duration-200 z-10 ${
                      selectedNode === node.id ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' : 'border-gray-700'
                    } ${dragging.isDragging && dragging.nodeId === node.id ? 'opacity-90' : ''}`}
                    style={{
                      left: node.position.x - 128,
                      top: node.position.y,
                    }}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node.id);
                    }}
                  >
                    <div
                      className="px-4 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing"
                      style={{ backgroundColor: template?.color + '20' }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${node.status === 'idle' ? 'bg-gray-500' : node.status === 'running' ? 'bg-yellow-500 animate-pulse' : node.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-white font-bold text-sm">{node.title}</span>
                      </div>
                      {selectedNode === node.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteNode(node.id);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-gray-400 mb-3">{node.description}</p>

                      <div className="flex flex-col gap-2 mb-2">
                        {node.inputs.map((input, idx) => (
                          <div
                            key={input}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-800/50 p-1 rounded transition-colors"
                            onClick={(e) => handleInputClick(e, node.id, input)}
                          >
                            <div className="w-3 h-3 rounded-full bg-cyan-500" />
                            <span className="text-xs text-gray-300">{input}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col gap-2">
                        {node.outputs.map((output, idx) => (
                          <div
                            key={output}
                            className="flex items-center justify-end gap-2 cursor-pointer hover:bg-gray-800/50 p-1 rounded transition-colors"
                            onClick={(e) => handleOutputClick(e, node.id, output)}
                          >
                            <span className="text-xs text-gray-300">{output}</span>
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
