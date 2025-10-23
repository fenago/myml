/**
 * Analytics Service
 * Tracks and provides insights into token usage, conversations, and model performance
 * @author Dr. Ernesto Lee
 */

export interface TokenUsage {
  conversationId: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  timestamp: Date;
}

export interface ConversationAnalytics {
  conversationId: string;
  modelId: string;
  messageCount: number;
  totalTokens: number;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface ModelAnalytics {
  modelId: string;
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  averageTokensPerMessage: number;
  lastUsed: Date;
}

export interface OverallAnalytics {
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  mostUsedModel: string;
  averageMessagesPerConversation: number;
  averageTokensPerMessage: number;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  conversations: number;
  messages: number;
  tokens: number;
}

class AnalyticsService {
  private readonly STORAGE_KEY = 'browsergpt_analytics';
  private tokenUsageLog: TokenUsage[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load analytics data from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        this.tokenUsageLog = data.tokenUsageLog.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load analytics from storage:', error);
    }
  }

  /**
   * Save analytics data to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        tokenUsageLog: this.tokenUsageLog,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save analytics to storage:', error);
    }
  }

  /**
   * Track token usage for a conversation
   */
  trackTokenUsage(
    conversationId: string,
    modelId: string,
    inputTokens: number,
    outputTokens: number
  ): void {
    const usage: TokenUsage = {
      conversationId,
      modelId,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      timestamp: new Date(),
    };

    this.tokenUsageLog.push(usage);
    this.saveToStorage();
  }

  /**
   * Get analytics for a specific conversation
   */
  getConversationAnalytics(conversationId: string): ConversationAnalytics | null {
    const entries = this.tokenUsageLog.filter(e => e.conversationId === conversationId);
    if (entries.length === 0) return null;

    const totalTokens = entries.reduce((sum, e) => sum + e.totalTokens, 0);
    const sortedEntries = [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      conversationId,
      modelId: entries[0].modelId,
      messageCount: entries.length,
      totalTokens,
      createdAt: sortedEntries[0].timestamp,
      lastActiveAt: sortedEntries[sortedEntries.length - 1].timestamp,
    };
  }

  /**
   * Get analytics for a specific model
   */
  getModelAnalytics(modelId: string): ModelAnalytics | null {
    const entries = this.tokenUsageLog.filter(e => e.modelId === modelId);
    if (entries.length === 0) return null;

    const conversations = new Set(entries.map(e => e.conversationId));
    const totalTokens = entries.reduce((sum, e) => sum + e.totalTokens, 0);
    const sortedEntries = [...entries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      modelId,
      totalConversations: conversations.size,
      totalMessages: entries.length,
      totalTokens,
      averageTokensPerMessage: entries.length > 0 ? totalTokens / entries.length : 0,
      lastUsed: sortedEntries[0].timestamp,
    };
  }

  /**
   * Get overall analytics across all conversations and models
   */
  getOverallAnalytics(): OverallAnalytics {
    const conversations = new Set(this.tokenUsageLog.map(e => e.conversationId));
    const totalInputTokens = this.tokenUsageLog.reduce((sum, e) => sum + e.inputTokens, 0);
    const totalOutputTokens = this.tokenUsageLog.reduce((sum, e) => sum + e.outputTokens, 0);
    const totalTokens = totalInputTokens + totalOutputTokens;

    // Find most used model
    const modelUsage = new Map<string, number>();
    this.tokenUsageLog.forEach(entry => {
      modelUsage.set(entry.modelId, (modelUsage.get(entry.modelId) || 0) + 1);
    });
    let mostUsedModel = '';
    let maxUsage = 0;
    modelUsage.forEach((count, modelId) => {
      if (count > maxUsage) {
        maxUsage = count;
        mostUsedModel = modelId;
      }
    });

    return {
      totalConversations: conversations.size,
      totalMessages: this.tokenUsageLog.length,
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      mostUsedModel,
      averageMessagesPerConversation: conversations.size > 0 ? this.tokenUsageLog.length / conversations.size : 0,
      averageTokensPerMessage: this.tokenUsageLog.length > 0 ? totalTokens / this.tokenUsageLog.length : 0,
    };
  }

  /**
   * Get daily usage statistics
   */
  getDailyUsage(days: number = 7): DailyUsage[] {
    const dailyMap = new Map<string, DailyUsage>();

    // Initialize days
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, {
        date: dateStr,
        conversations: 0,
        messages: 0,
        tokens: 0,
      });
    }

    // Count usage per day
    const conversationsPerDay = new Map<string, Set<string>>();
    this.tokenUsageLog.forEach(entry => {
      const dateStr = entry.timestamp.toISOString().split('T')[0];
      const usage = dailyMap.get(dateStr);
      if (usage) {
        usage.messages++;
        usage.tokens += entry.totalTokens;

        if (!conversationsPerDay.has(dateStr)) {
          conversationsPerDay.set(dateStr, new Set());
        }
        conversationsPerDay.get(dateStr)!.add(entry.conversationId);
      }
    });

    // Update conversation counts
    conversationsPerDay.forEach((conversations, dateStr) => {
      const usage = dailyMap.get(dateStr);
      if (usage) {
        usage.conversations = conversations.size;
      }
    });

    return Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get token usage breakdown by model
   */
  getTokensByModel(): { modelId: string; tokens: number; percentage: number }[] {
    const modelTokens = new Map<string, number>();
    let totalTokens = 0;

    this.tokenUsageLog.forEach(entry => {
      modelTokens.set(entry.modelId, (modelTokens.get(entry.modelId) || 0) + entry.totalTokens);
      totalTokens += entry.totalTokens;
    });

    return Array.from(modelTokens.entries())
      .map(([modelId, tokens]) => ({
        modelId,
        tokens,
        percentage: totalTokens > 0 ? (tokens / totalTokens) * 100 : 0,
      }))
      .sort((a, b) => b.tokens - a.tokens);
  }

  /**
   * Export analytics data as JSON
   */
  exportAsJSON(): string {
    const data = {
      overall: this.getOverallAnalytics(),
      daily: this.getDailyUsage(30),
      byModel: this.getTokensByModel(),
      rawData: this.tokenUsageLog,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export analytics data as CSV
   */
  exportAsCSV(): string {
    const lines = [
      'Conversation ID,Model ID,Input Tokens,Output Tokens,Total Tokens,Timestamp',
      ...this.tokenUsageLog.map(entry =>
        `${entry.conversationId},${entry.modelId},${entry.inputTokens},${entry.outputTokens},${entry.totalTokens},${entry.timestamp.toISOString()}`
      ),
    ];

    return lines.join('\n');
  }

  /**
   * Clear all analytics data
   */
  clearData(): void {
    this.tokenUsageLog = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get recent activity (last N entries)
   */
  getRecentActivity(limit: number = 10): TokenUsage[] {
    return [...this.tokenUsageLog]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
