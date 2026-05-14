import React, { useState } from 'react';
import { useStore } from '../store/useStore';

interface PlanStepForm {
  id: string;
  name: string;
  description: string;
  toolId?: string;
  params?: Record<string, any>;
  dependencies?: string[];
}

const PlansPage: React.FC = () => {
  const { createPlan, executePlan, generatePlan, getAllPlans, getPlan } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    steps: [] as PlanStepForm[]
  });
  const [generateTask, setGenerateTask] = useState('');

  const plans = getAllPlans();

  const handleAddPlan = () => {
    setFormData({
      title: '',
      description: '',
      steps: []
    });
    setIsAddModalOpen(true);
  };

  const handleExecutePlan = (planId: string) => {
    setSelectedPlanId(planId);
    setIsExecuteModalOpen(true);
  };

  const handleGeneratePlan = () => {
    setGenerateTask('');
    setIsGenerateModalOpen(true);
  };

  const handleAddStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, {
        id: `step-${Date.now()}`,
        name: '',
        description: '',
        params: {}
      }]
    });
  };

  const handleRemoveStep = (stepId: string) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter(step => step.id !== stepId)
    });
  };

  const handleStepChange = (stepId: string, field: string, value: any) => {
    setFormData({
      ...formData,
      steps: formData.steps.map(step =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      createPlan(
        formData.title,
        formData.description,
        formData.steps.map(step => ({
          name: step.name,
          description: step.description,
          toolId: step.toolId,
          params: step.params,
          dependencies: step.dependencies
        }))
      );
      setIsAddModalOpen(false);
    } catch (error) {
      alert('创建计划失败: ' + (error as Error).message);
    }
  };

  const handleExecute = async () => {
    try {
      await executePlan(selectedPlanId);
      setIsExecuteModalOpen(false);
      alert('计划执行成功！');
    } catch (error) {
      alert('执行计划失败: ' + (error as Error).message);
    }
  };

  const handleGenerate = async () => {
    try {
      const plan = generatePlan(generateTask);
      setIsGenerateModalOpen(false);
      alert(`计划生成成功: ${plan.title}`);
    } catch (error) {
      alert('生成计划失败: ' + (error as Error).message);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-orbitron text-2xl font-bold text-cyan-400">计划管理</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleGeneratePlan}
            className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            生成计划
          </button>
          <button 
            onClick={handleAddPlan}
            className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            添加计划
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="glassmorphism border border-cyan-500/30 rounded-xl p-4 sci-fi-card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-orbitron font-bold text-cyan-400">{plan.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{plan.steps.length} 个步骤</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center">
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
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">
                <span className="font-medium text-gray-300">描述:</span> {plan.description}
              </div>
              <div className="text-xs text-gray-400">
                <span className="font-medium text-gray-300">状态:</span> {plan.status}
              </div>
              <div className="text-xs text-gray-400">
                <span className="font-medium text-gray-300">创建时间:</span> {new Date(plan.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button 
                className="sci-fi-button flex-1 glassmorphism border border-cyan-500/30 rounded-lg px-3 py-1.5 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-xs"
                onClick={() => handleExecutePlan(plan.id)}
              >
                执行
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Plan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="glassmorphism border border-cyan-500/30 rounded-xl w-full max-w-3xl p-6">
            <h3 className="font-orbitron font-bold text-cyan-400 text-xl mb-4">添加计划</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  计划名称
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="输入计划名称"
                  className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  计划描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="输入计划描述"
                  rows={3}
                  className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  步骤
                </label>
                <div className="space-y-3">
                  {formData.steps.map((step, index) => (
                    <div key={step.id} className="glassmorphism border border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white text-sm">步骤 {index + 1}</h4>
                        <button 
                          type="button"
                          onClick={() => handleRemoveStep(step.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          删除
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <input
                            type="text"
                            value={step.name}
                            onChange={(e) => handleStepChange(step.id, 'name', e.target.value)}
                            placeholder="步骤名称"
                            className="w-full glassmorphism border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={step.description}
                            onChange={(e) => handleStepChange(step.id, 'description', e.target.value)}
                            placeholder="步骤描述"
                            className="w-full glassmorphism border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={step.toolId || ''}
                            onChange={(e) => handleStepChange(step.id, 'toolId', e.target.value)}
                            placeholder="工具ID (可选)"
                            className="w-full glassmorphism border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  type="button"
                  onClick={handleAddStep}
                  className="mt-3 glassmorphism border border-dashed border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-sm w-full"
                >
                  添加步骤
                </button>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="glassmorphism border border-gray-500/30 rounded-lg px-6 py-3 text-gray-400 hover:bg-gray-500/10 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-6 py-3 text-cyan-400 hover:bg-cyan-500/10 transition-colors font-medium"
                >
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Execute Plan Modal */}
      {isExecuteModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="glassmorphism border border-cyan-500/30 rounded-xl w-full max-w-md p-6">
            <h3 className="font-orbitron font-bold text-cyan-400 text-xl mb-4">执行计划</h3>
            <div className="space-y-4">
              <p className="text-gray-300">确定要执行这个计划吗？</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsExecuteModalOpen(false)}
                  className="glassmorphism border border-gray-500/30 rounded-lg px-6 py-3 text-gray-400 hover:bg-gray-500/10 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleExecute}
                  className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-6 py-3 text-cyan-400 hover:bg-cyan-500/10 transition-colors font-medium"
                >
                  执行
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Plan Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="glassmorphism border border-cyan-500/30 rounded-xl w-full max-w-md p-6">
            <h3 className="font-orbitron font-bold text-cyan-400 text-xl mb-4">生成计划</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  任务描述
                </label>
                <textarea
                  value={generateTask}
                  onChange={(e) => setGenerateTask(e.target.value)}
                  placeholder="输入任务描述，例如：分析B站视频BV1W6drBaErm并生成学习笔记"
                  rows={4}
                  className="w-full glassmorphism border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="glassmorphism border border-gray-500/30 rounded-lg px-6 py-3 text-gray-400 hover:bg-gray-500/10 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="sci-fi-button glassmorphism border border-cyan-500/30 rounded-lg px-6 py-3 text-cyan-400 hover:bg-cyan-500/10 transition-colors font-medium"
                >
                  生成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansPage;