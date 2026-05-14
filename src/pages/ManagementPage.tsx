import React, { useState } from 'react';
import OrganizationArchitecture from '../components/OrganizationArchitecture';
import CloudSyncConfig from '../components/CloudSyncConfig';
import WorkflowCanvas from '../components/WorkflowCanvas';
import { useStore, WorkLog } from '../store/useStore';

const ManagementPage: React.FC = () => {
  const { workflowTemplates, workLogs, addWorkLog, updateWorkLog, deleteWorkLog, applyWorkflowTemplate, deleteWorkflowTemplate, addWorkflowTemplate, updateWorkflowTemplate, addExperience } = useStore();
  const [activeTab, setActiveTab] = useState<'organization' | 'workflow' | 'sync' | 'experiences' | 'worklog'>('workflow');
  const [editingWorkLog, setEditingWorkLog] = useState<WorkLog | null>(null);
  const [newWorkLog, setNewWorkLog] = useState({
    title: '',
    content: '',
    type: 'daily' as const,
    tags: [] as string[],
    status: 'draft' as const,
  });
  const [tagInput, setTagInput] = useState('');

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-cyan-500/20 pb-3">
        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'workflow' ? 'bg-cyan-500/20 text-cyan-400 border-t border-l border-r border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'}`}
        >
          工作流
        </button>
        <button
          onClick={() => setActiveTab('organization')}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'organization' ? 'bg-cyan-500/20 text-cyan-400 border-t border-l border-r border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'}`}
        >
          组织架构
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'sync' ? 'bg-cyan-500/20 text-cyan-400 border-t border-l border-r border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'}`}
        >
          云同步
        </button>
        <button
          onClick={() => setActiveTab('experiences')}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'experiences' ? 'bg-cyan-500/20 text-cyan-400 border-t border-l border-r border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'}`}
        >
          工作流模板库
        </button>
        <button
          onClick={() => setActiveTab('worklog')}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'worklog' ? 'bg-cyan-500/20 text-cyan-400 border-t border-l border-r border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'}`}
        >
          工作日志
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'workflow' && (
          <div className="h-full" style={{ minHeight: '600px' }}>
            <WorkflowCanvas />
          </div>
        )}
        {activeTab === 'organization' && (
          <div className="h-full">
            <OrganizationArchitecture />
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="max-w-2xl mx-auto">
            <CloudSyncConfig />
            <div className="mt-6 glassmorphism border border-cyan-500/30 rounded-xl p-4">
              <h4 className="font-orbitron font-bold text-cyan-400 mb-3">快速操作</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    addWorkLog({
                      title: `工作日志 ${new Date().toLocaleString()}`,
                      content: '今日工作内容...',
                      type: 'daily',
                      tags: ['日常'],
                      status: 'in_progress',
                    });
                    alert('工作日志已添加！');
                  }}
                  className="glassmorphism border border-cyan-500/30 rounded-lg px-4 py-3 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-sm text-left"
                >
                  快速添加工作日志
                </button>
                <button
                  onClick={() => {
                    addExperience({
                      title: '手动添加的经验',
                      content: '这里可以记录手动添加的经验和知识',
                      createdAt: new Date().toISOString(),
                    });
                    alert('经验已添加！');
                  }}
                  className="glassmorphism border border-green-500/30 rounded-lg px-4 py-3 text-green-400 hover:bg-green-500/10 transition-colors text-sm text-left"
                >
                  手动添加经验
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'experiences' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-orbitron font-bold text-cyan-400 text-lg">工作流模板库</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.files && target.files[0]) {
                        const file = target.files[0];
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const templateData = JSON.parse(event.target?.result as string);
                            if (templateData.name && templateData.description && templateData.workflow) {
                              // Add template to store
                              addWorkflowTemplate({
                                name: templateData.name,
                                description: templateData.description,
                                workflow: templateData.workflow,
                                createdAt: new Date().toISOString(),
                                category: templateData.category || '通用',
                              });
                              alert('模板导入成功！');
                            } else {
                              alert('无效的模板文件！');
                            }
                          } catch (error) {
                            alert('文件解析失败，请确保是有效的模板文件！');
                          }
                        };
                        reader.readAsText(file);
                      }
                    };
                    input.click();
                  }}
                  className="sci-fi-button glassmorphism border border-green-500/30 px-3 py-1.5 text-green-400 hover:bg-green-500/10 transition-colors text-sm"
                >
                  导入模板
                </button>
              </div>
            </div>

            {workflowTemplates.length === 0 ? (
              <div className="glassmorphism border border-cyan-500/30 rounded-xl p-8 text-center">
                <p className="text-gray-400 text-sm mb-2">暂无工作流模板</p>
                <p className="text-gray-500 text-xs">系统已内置基础工作流模板</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflowTemplates.map((template) => (
                  <div key={template.id} className="glassmorphism border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-white">{template.name}</h4>
                        <span className="inline-block mt-1 text-xs text-cyan-400 bg-cyan-900/30 px-2 py-1 rounded-full">
                          {template.category}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            applyWorkflowTemplate(template.id);
                            setActiveTab('workflow');
                          }}
                          className="text-xs text-green-400 hover:text-green-300 transition-colors"
                        >
                          使用模板
                        </button>
                        <button
                          onClick={() => {
                            const newName = prompt('请输入新的模板名称:', template.name);
                            if (newName) {
                              updateWorkflowTemplate(template.id, { name: newName });
                            }
                          }}
                          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => deleteWorkflowTemplate(template.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{template.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>节点数: {template.workflow.nodes.length}</span>
                      <span>{new Date(template.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'worklog' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-2">
              <h3 className="font-orbitron font-bold text-cyan-400 text-lg">工作日志</h3>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      // 显示加载状态
                      alert('AI 正在生成工作日志，请稍候...');
                      // 调用 AI 生成工作日志
                      await useStore.getState().generateWorkLog('daily');
                      // 刷新界面
                      alert('AI 工作日志生成成功！');
                    } catch (error) {
                      console.error('生成工作日志失败:', error);
                      alert('生成工作日志失败，请重试');
                    }
                  }}
                  className="sci-fi-button glassmorphism border border-purple-500/30 rounded-lg px-3 py-1.5 text-purple-400 hover:bg-purple-500/10 transition-colors text-sm"
                >
                  AI 自动生成
                </button>
                <button
                  onClick={() => setEditingWorkLog(null)}
                  className="sci-fi-button glassmorphism border border-green-500/30 rounded-lg px-3 py-1.5 text-green-400 hover:bg-green-500/10 transition-colors text-sm"
                >
                  新建日志
                </button>
              </div>
            </div>

            {/* 工作日志编辑表单 */}
            {((editingWorkLog === null && newWorkLog) || editingWorkLog) && (
              <div className="glassmorphism border border-cyan-500/30 rounded-xl p-4">
                <h4 className="font-medium text-white mb-3">
                  {editingWorkLog ? '编辑工作日志' : '新建工作日志'}
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">标题</label>
                    <input
                      type="text"
                      value={editingWorkLog?.title || newWorkLog.title}
                      onChange={(e) => {
                        if (editingWorkLog) {
                          updateWorkLog(editingWorkLog.id, { title: e.target.value });
                        } else {
                          setNewWorkLog({ ...newWorkLog, title: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-800/50 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      placeholder="输入日志标题"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">内容</label>
                    <textarea
                      value={editingWorkLog?.content || newWorkLog.content}
                      onChange={(e) => {
                        if (editingWorkLog) {
                          updateWorkLog(editingWorkLog.id, { content: e.target.value });
                        } else {
                          setNewWorkLog({ ...newWorkLog, content: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-800/50 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 min-h-[100px]"
                      placeholder="输入日志内容"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">类型</label>
                      <select
                        value={editingWorkLog?.type || newWorkLog.type}
                        onChange={(e) => {
                          if (editingWorkLog) {
                            updateWorkLog(editingWorkLog.id, { type: e.target.value as 'daily' | 'project' | 'task' });
                          } else {
                            setNewWorkLog({ ...newWorkLog, type: e.target.value as any });
                          }
                        }}
                        className="w-full bg-slate-800/50 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="daily">日常</option>
                        <option value="project">项目</option>
                        <option value="task">任务</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">状态</label>
                      <select
                        value={editingWorkLog?.status || newWorkLog.status}
                        onChange={(e) => {
                          if (editingWorkLog) {
                            updateWorkLog(editingWorkLog.id, { status: e.target.value as 'draft' | 'in_progress' | 'completed' });
                          } else {
                            setNewWorkLog({ ...newWorkLog, status: e.target.value as any });
                          }
                        }}
                        className="w-full bg-slate-800/50 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="draft">草稿</option>
                        <option value="in_progress">进行中</option>
                        <option value="completed">已完成</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">标签</label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {(editingWorkLog?.tags || newWorkLog.tags).map((tag, index) => (
                        <span key={index} className="text-xs text-cyan-400 bg-cyan-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                          {tag}
                          <button
                            onClick={() => {
                              if (editingWorkLog) {
                                updateWorkLog(editingWorkLog.id, { 
                                  tags: editingWorkLog.tags.filter((_, i) => i !== index) 
                                });
                              } else {
                                setNewWorkLog({ 
                                  ...newWorkLog, 
                                  tags: newWorkLog.tags.filter((_, i) => i !== index) 
                                });
                              }
                            }}
                            className="text-xs text-gray-400 hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && tagInput.trim()) {
                            if (editingWorkLog) {
                              updateWorkLog(editingWorkLog.id, { 
                                tags: [...(editingWorkLog.tags || []), tagInput.trim()] 
                              });
                            } else {
                              setNewWorkLog({ 
                                ...newWorkLog, 
                                tags: [...newWorkLog.tags, tagInput.trim()] 
                              });
                            }
                            setTagInput('');
                          }
                        }}
                        className="flex-1 bg-slate-800/50 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                        placeholder="输入标签并按Enter添加"
                      />
                      <button
                        onClick={() => {
                          if (tagInput.trim()) {
                            if (editingWorkLog) {
                              updateWorkLog(editingWorkLog.id, { 
                                tags: [...(editingWorkLog.tags || []), tagInput.trim()] 
                              });
                            } else {
                              setNewWorkLog({ 
                                ...newWorkLog, 
                                tags: [...newWorkLog.tags, tagInput.trim()] 
                              });
                            }
                            setTagInput('');
                          }
                        }}
                        className="glassmorphism border border-cyan-500/30 rounded px-3 py-2 text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditingWorkLog(null);
                        setNewWorkLog({ title: '', content: '', type: 'daily', tags: [], status: 'draft' });
                        setTagInput('');
                      }}
                      className="glassmorphism border border-gray-700 rounded px-3 py-2 text-sm text-gray-400 hover:bg-gray-700/50 transition-colors"
                    >
                      取消
                    </button>
                    {!editingWorkLog && (
                      <button
                        onClick={() => {
                          if (newWorkLog.title) {
                            addWorkLog(newWorkLog);
                            setNewWorkLog({ title: '', content: '', type: 'daily', tags: [], status: 'draft' });
                            setTagInput('');
                            alert('工作日志已添加！');
                          } else {
                            alert('请输入标题');
                          }
                        }}
                        className="glassmorphism border border-green-500/30 rounded px-3 py-2 text-sm text-green-400 hover:bg-green-500/10 transition-colors"
                      >
                        保存
                      </button>
                    )}
                    {editingWorkLog && (
                      <button
                        onClick={() => {
                          setEditingWorkLog(null);
                          setTagInput('');
                          alert('工作日志已更新！');
                        }}
                        className="glassmorphism border border-green-500/30 rounded px-3 py-2 text-sm text-green-400 hover:bg-green-500/10 transition-colors"
                      >
                        完成编辑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 工作日志列表 */}
            <div className="space-y-3">
              {workLogs.length === 0 ? (
                <div className="glassmorphism border border-cyan-500/30 rounded-xl p-8 text-center">
                  <p className="text-gray-400 text-sm mb-2">暂无工作日志</p>
                  <p className="text-gray-500 text-xs">点击右上角按钮新建工作日志</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workLogs.map((workLog) => (
                    <div key={workLog.id} className="glassmorphism border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-white">{workLog.title}</h4>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full">
                              {workLog.type === 'daily' ? '日常' : workLog.type === 'project' ? '项目' : '任务'}
                            </span>
                            <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                              {workLog.status === 'draft' ? '草稿' : workLog.status === 'in_progress' ? '进行中' : '已完成'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(workLog.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingWorkLog(workLog)}
                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('确定要删除这个工作日志吗？')) {
                                deleteWorkLog(workLog.id);
                              }
                            }}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                        {workLog.content}
                      </p>
                      {workLog.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {workLog.tags.map((tag, index) => (
                            <span key={index} className="text-xs text-cyan-400 bg-cyan-900/30 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagementPage;