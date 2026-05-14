import { Plan, PlanStep, Tool } from './types';

export class PlanManager {
  private plans: Map<string, Plan> = new Map();

  createPlan(title: string, description: string, steps: Omit<PlanStep, 'id' | 'status'>[]): Plan {
    const plan: Plan = {
      id: crypto.randomUUID(),
      title,
      description,
      steps: steps.map(step => ({
        ...step,
        id: crypto.randomUUID(),
        status: 'pending'
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending'
    };

    this.plans.set(plan.id, plan);
    return plan;
  }

  getPlan(id: string): Plan | undefined {
    return this.plans.get(id);
  }

  getAllPlans(): Plan[] {
    return Array.from(this.plans.values());
  }

  updatePlanStatus(id: string, status: Plan['status']): void {
    const plan = this.plans.get(id);
    if (plan) {
      plan.status = status;
      plan.updatedAt = new Date().toISOString();
    }
  }

  updateStepStatus(planId: string, stepId: string, status: PlanStep['status'], result?: any): void {
    const plan = this.plans.get(planId);
    if (plan) {
      const step = plan.steps.find(s => s.id === stepId);
      if (step) {
        step.status = status;
        if (result !== undefined) {
          step.result = result;
        }
        plan.updatedAt = new Date().toISOString();

        // 检查所有步骤是否完成
        const allStepsCompleted = plan.steps.every(s => s.status === 'completed');
        if (allStepsCompleted) {
          plan.status = 'completed';
        }

        // 检查是否有步骤失败
        const anyStepFailed = plan.steps.some(s => s.status === 'failed');
        if (anyStepFailed && plan.status !== 'completed') {
          plan.status = 'failed';
        }
      }
    }
  }

  deletePlan(id: string): void {
    this.plans.delete(id);
  }

  // 智能规划生成
  generatePlan(task: string, availableTools: Tool[]): Plan {
    // 基于任务和可用工具生成智能规划
    // 这里可以实现更复杂的任务分解逻辑
    const steps: Omit<PlanStep, 'id' | 'status'>[] = [
      {
        name: '任务分析',
        description: '分析任务需求和目标',
        toolId: 'task_analyzer',
        params: { task }
      },
      {
        name: '工具选择',
        description: '选择适合完成任务的工具',
        toolId: 'tool_selector',
        params: { task, tools: availableTools.map(t => t.id) }
      }
    ];

    // 根据任务类型添加具体步骤
    if (task.includes('视频') || task.includes('video')) {
      steps.push({
        name: '视频分析',
        description: '分析视频内容和结构',
        toolId: 'video_analyzer',
        params: { bvid: task.match(/BV\w+/)?.[0] || '' }
      });
      steps.push({
        name: '学习笔记生成',
        description: '基于视频内容生成学习笔记',
        toolId: 'video_learning',
        params: { bvid: task.match(/BV\w+/)?.[0] || '' }
      });
    }

    return this.createPlan(
      `任务: ${task}`,
      `自动生成的任务执行计划`,
      steps
    );
  }

  // 执行计划
  async executePlan(planId: string, toolExecutor: (tool: Tool, params: any) => Promise<any>): Promise<Plan> {
    const plan = this.getPlan(planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    this.updatePlanStatus(planId, 'in_progress');

    try {
      // 构建依赖图
      const dependencyMap = new Map<string, string[]>();
      const stepMap = new Map<string, PlanStep>();
      
      plan.steps.forEach(step => {
        dependencyMap.set(step.id, step.dependencies || []);
        stepMap.set(step.id, step);
      });

      // 执行步骤的辅助函数
      const executeStep = async (stepId: string): Promise<void> => {
        const step = stepMap.get(stepId);
        if (!step) return;

        // 检查依赖是否完成
        const dependencies = dependencyMap.get(stepId) || [];
        for (const depId of dependencies) {
          const depStep = stepMap.get(depId);
          if (!depStep || depStep.status !== 'completed') {
            throw new Error(`Dependency step ${depId} is not completed`);
          }
        }

        if (step.status !== 'completed') {
          this.updateStepStatus(planId, step.id, 'in_progress');
          
          try {
            if (step.toolId) {
              // 执行工具
              const result = await toolExecutor({} as Tool, step.params || {});
              this.updateStepStatus(planId, step.id, 'completed', result);
            } else {
              // 无工具步骤，直接标记为完成
              this.updateStepStatus(planId, step.id, 'completed');
            }
          } catch (error) {
            this.updateStepStatus(planId, step.id, 'failed', {
              error: (error as Error).message
            });
            throw error;
          }
        }
      };

      // 找出所有无依赖的步骤
      const independentSteps = plan.steps.filter(step => !step.dependencies || step.dependencies.length === 0);
      
      // 并行执行无依赖的步骤
      await Promise.all(independentSteps.map(step => executeStep(step.id)));

      // 执行剩余的步骤（有依赖的步骤）
      // 这里简化处理，实际应该使用拓扑排序
      const remainingSteps = plan.steps.filter(step => step.dependencies && step.dependencies.length > 0);
      for (const step of remainingSteps) {
        if (step.status !== 'completed' && step.status !== 'failed') {
          try {
            await executeStep(step.id);
          } catch (error) {
            // 单个步骤失败不影响其他步骤
            console.error(`Step ${step.id} failed:`, error);
          }
        }
      }

      // 检查计划状态
      const allStepsCompleted = plan.steps.every(s => s.status === 'completed');
      if (allStepsCompleted) {
        plan.status = 'completed';
        plan.updatedAt = new Date().toISOString();
      } else {
        const anyStepFailed = plan.steps.some(s => s.status === 'failed');
        if (anyStepFailed) {
          plan.status = 'failed';
          plan.updatedAt = new Date().toISOString();
        }
      }

    } catch (error) {
      this.updatePlanStatus(planId, 'failed');
      throw error;
    }

    return plan;
  }
}
