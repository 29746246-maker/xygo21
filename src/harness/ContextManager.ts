import { Message, CompactionStrategy, ContextStats } from './types';

export class ContextManager {
  private messages: Message[] = [];
  private compactionStrategies: CompactionStrategy[] = [];
  private maxTokens: number = 20000;
  private lastCompaction: string | null = null;
  private checkpointIndex: number = -1;

  constructor() {
    // 初始化默认压缩策略
    this.initDefaultStrategies();
  }

  private initDefaultStrategies(): void {
    // 策略1：移除旧的工具调用（保留最近的）
    this.compactionStrategies.push({
      id: 'tool_call_cleanup',
      name: 'Tool Call Cleanup',
      threshold: 0.6, // 60% 容量时触发
      apply: (messages: Message[]) => {
        const toolMessages = messages.filter(m => 
          m.type === 'tool_use' || m.type === 'tool_result'
        );
        if (toolMessages.length > 10) {
          // 保留最近的 5 个工具调用
          const keepCount = 5;
          const filtered: Message[] = [];
          let keptToolMessages = 0;
          
          for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            if (message.type === 'tool_use' || message.type === 'tool_result') {
              if (keptToolMessages < keepCount) {
                filtered.unshift(message);
                keptToolMessages++;
              }
            } else {
              filtered.unshift(message);
            }
          }
          
          return filtered;
        }
        return messages;
      }
    });

    // 策略2：合并连续的系统消息
    this.compactionStrategies.push({
      id: 'system_message_merge',
      name: 'System Message Merge',
      threshold: 0.8, // 80% 容量时触发
      apply: (messages: Message[]) => {
        const result: Message[] = [];
        let systemBuffer: Message[] = [];
        
        for (const message of messages) {
          if (message.type === 'system') {
            systemBuffer.push(message);
          } else {
            if (systemBuffer.length > 0) {
              if (systemBuffer.length === 1) {
                result.push(systemBuffer[0]);
              } else {
                // 合并系统消息
                result.push({
                  id: crypto.randomUUID(),
                  type: 'system',
                  content: systemBuffer.map(m => m.content).join('\n\n'),
                  agentId: 'system',
                  timestamp: new Date().toISOString()
                });
              }
              systemBuffer = [];
            }
            result.push(message);
          }
        }
        
        if (systemBuffer.length > 0) {
          result.push(...systemBuffer);
        }
        
        return result;
      }
    });

    // 策略3：截断最旧的文本消息
    this.compactionStrategies.push({
      id: 'old_message_truncation',
      name: 'Old Message Truncation',
      threshold: 0.95, // 95% 容量时触发
      apply: (messages: Message[]) => {
        // 保留最近的 20 条消息
        const keepCount = 20;
        if (messages.length > keepCount) {
          const result: Message[] = [
            // 保留第一条消息（通常是系统提示）
            messages[0],
            // 添加截断标记
            {
              id: crypto.randomUUID(),
              type: 'system',
              content: `[${messages.length - keepCount - 1} older messages truncated]`,
              agentId: 'system',
              timestamp: new Date().toISOString()
            },
            // 保留最近的 keepCount 条消息
            ...messages.slice(-keepCount)
          ];
          return result;
        }
        return messages;
      }
    });
  }

  addMessage(message: Message): void {
    this.messages.push(message);
    this.compactIfNeeded();
  }

  getContext(): Message[] {
    return [...this.messages];
  }

  clearContext(): void {
    this.messages = [];
    this.lastCompaction = null;
  }

  createCheckpoint(): number {
    this.checkpointIndex = this.messages.length;
    return this.checkpointIndex;
  }

  restoreToCheckpoint(): void {
    if (this.checkpointIndex >= 0) {
      this.messages = this.messages.slice(0, this.checkpointIndex);
    }
  }

  getStats(): ContextStats {
    const totalTokens = this.calculateTokens();
    const tokenUsageRate = totalTokens / this.maxTokens;

    return {
      totalTokens,
      messagesCount: this.messages.length,
      lastCompaction: this.lastCompaction,
      tokenUsageRate
    };
  }

  addCompactionStrategy(strategy: CompactionStrategy): void {
    this.compactionStrategies.push(strategy);
  }

  private calculateTokens(): number {
    // 简单估算：平均 4 个字符 = 1 个 token
    let totalChars = 0;
    for (const message of this.messages) {
      totalChars += message.content.length;
    }
    return Math.ceil(totalChars / 4);
  }

  private compactIfNeeded(): void {
    const currentTokens = this.calculateTokens();
    const usageRate = currentTokens / this.maxTokens;

    // 按阈值从低到高排序策略
    const sortedStrategies = [...this.compactionStrategies]
      .sort((a, b) => a.threshold - b.threshold);

    // 应用合适的策略
    for (const strategy of sortedStrategies) {
      if (usageRate >= strategy.threshold) {
        const beforeLength = this.messages.length;
        this.messages = strategy.apply(this.messages);
        const afterLength = this.messages.length;
        
        if (afterLength < beforeLength) {
          this.lastCompaction = new Date().toISOString();
          console.log(`[ContextManager] Applied compaction: ${strategy.name}, messages reduced: ${beforeLength} -> ${afterLength}`);
          break; // 只应用一个策略
        }
      }
    }
  }

  // 强制压缩（用于手动触发）
  forceCompact(): void {
    for (const strategy of this.compactionStrategies) {
      const beforeLength = this.messages.length;
      this.messages = strategy.apply(this.messages);
      const afterLength = this.messages.length;
      
      if (afterLength < beforeLength) {
        this.lastCompaction = new Date().toISOString();
        console.log(`[ContextManager] Forced compaction: ${strategy.name}, messages reduced: ${beforeLength} -> ${afterLength}`);
        break;
      }
    }
  }

  // 设置最大 token 限制
  setMaxTokens(maxTokens: number): void {
    this.maxTokens = maxTokens;
  }
}
