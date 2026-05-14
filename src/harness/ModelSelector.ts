interface ModelConfig {
  id: string;
  name: string;
  maxTokens: number;
  costPerToken: number;
  recommendedFor: ('low' | 'medium' | 'high')[];
  capabilities: string[];
}

export class ModelSelector {
  private models: ModelConfig[] = [
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      maxTokens: 200000,
      costPerToken: 0.00000025,
      recommendedFor: ['low'],
      capabilities: ['text', 'code', 'simple_tasks']
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      maxTokens: 200000,
      costPerToken: 0.000003,
      recommendedFor: ['low', 'medium'],
      capabilities: ['text', 'code', 'analysis', 'reasoning']
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      maxTokens: 200000,
      costPerToken: 0.000015,
      recommendedFor: ['medium', 'high'],
      capabilities: ['text', 'code', 'complex_reasoning', 'creativity']
    },
    {
      id: 'claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      maxTokens: 200000,
      costPerToken: 0.000003,
      recommendedFor: ['medium', 'high'],
      capabilities: ['text', 'code', 'analysis', 'reasoning', 'vision']
    }
  ];

  private currentModel: string = 'claude-3.5-sonnet';

  selectModel(taskComplexity: 'low' | 'medium' | 'high'): string {
    const suitableModels = this.models.filter(model => 
      model.recommendedFor.includes(taskComplexity)
    );

    if (suitableModels.length === 0) {
      return this.currentModel;
    }

    suitableModels.sort((a, b) => a.costPerToken - b.costPerToken);

    this.currentModel = suitableModels[suitableModels.length - 1].id;
    return this.currentModel;
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  setCurrentModel(modelId: string): boolean {
    const model = this.models.find(m => m.id === modelId);
    if (model) {
      this.currentModel = modelId;
      return true;
    }
    return false;
  }

  getAvailableModels(): ModelConfig[] {
    return [...this.models];
  }

  getModel(modelId: string): ModelConfig | undefined {
    return this.models.find(m => m.id === modelId);
  }

  estimateCost(promptTokens: number, completionTokens: number, modelId?: string): number {
    const model = this.models.find(m => m.id === (modelId || this.currentModel));
    if (!model) {
      return 0;
    }
    return (promptTokens + completionTokens) * model.costPerToken;
  }
}
