/**
 * Gamification Service
 * Handles achievements, badges, streaks, and gamification features
 *
 * @author Dr. Ernesto Lee
 */

import type { ModelId } from '../config/models';

export interface GamificationStats {
  // Token Economy
  totalTokens: number;
  tokenMilestones: {
    wordsmith: boolean; // 10K
    novelist: boolean; // 100K
    shakespeare: boolean; // 1M
  };

  // Feature Discovery
  featuresDiscovered: {
    uploadImage: boolean;
    useVoice: boolean;
    useVideo: boolean;
    functionCalling: boolean;
    multiModal: boolean;
  };

  // Conversation Streaks
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;

  // Model Mastery
  modelUsage: Record<ModelId, number>;
  modelMastery: {
    explorer: boolean; // Tried all 3 models
    triModelMaster: boolean; // 1000 tokens each
  };

  // Privacy Score
  totalConversations: number;
  totalMessages: number;
  dataTransmitted: number; // Always 0!
}

export class GamificationService {
  private stats: GamificationStats;
  private readonly STORAGE_KEY = 'myml_gamification';

  constructor() {
    this.stats = this.loadStats();
  }

  /**
   * Load stats from localStorage
   */
  private loadStats(): GamificationStats {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse gamification stats:', e);
      }
    }

    return {
      totalTokens: 0,
      tokenMilestones: {
        wordsmith: false,
        novelist: false,
        shakespeare: false,
      },
      featuresDiscovered: {
        uploadImage: false,
        useVoice: false,
        useVideo: false,
        functionCalling: false,
        multiModal: false,
      },
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: new Date().toDateString(),
      modelUsage: {
        gemma270m: 0,
        gemma3nE2B: 0,
        gemma3nE4B: 0,
      },
      modelMastery: {
        explorer: false,
        triModelMaster: false,
      },
      totalConversations: 0,
      totalMessages: 0,
      dataTransmitted: 0,
    };
  }

  /**
   * Save stats to localStorage
   */
  private saveStats(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
  }

  /**
   * Get current stats
   */
  getStats(): GamificationStats {
    return { ...this.stats };
  }

  /**
   * Track token usage
   */
  trackTokens(modelId: ModelId, tokens: number): string[] {
    const achievements: string[] = [];

    this.stats.totalTokens += tokens;
    this.stats.modelUsage[modelId] = (this.stats.modelUsage[modelId] || 0) + tokens;

    // Check token milestones
    if (!this.stats.tokenMilestones.wordsmith && this.stats.totalTokens >= 10_000) {
      this.stats.tokenMilestones.wordsmith = true;
      achievements.push('🏆 Wordsmith - Generated 10,000 tokens!');
    }
    if (!this.stats.tokenMilestones.novelist && this.stats.totalTokens >= 100_000) {
      this.stats.tokenMilestones.novelist = true;
      achievements.push('📚 Novelist - Generated 100,000 tokens!');
    }
    if (!this.stats.tokenMilestones.shakespeare && this.stats.totalTokens >= 1_000_000) {
      this.stats.tokenMilestones.shakespeare = true;
      achievements.push('🎭 Shakespeare - Generated 1,000,000 tokens!');
    }

    // Check model mastery
    const modelsUsed = Object.values(this.stats.modelUsage).filter(count => count > 0).length;
    if (!this.stats.modelMastery.explorer && modelsUsed >= 3) {
      this.stats.modelMastery.explorer = true;
      achievements.push('🧭 Model Explorer - Tried all 3 models!');
    }

    const triModelQualified = Object.values(this.stats.modelUsage).every(count => count >= 1000);
    if (!this.stats.modelMastery.triModelMaster && triModelQualified) {
      this.stats.modelMastery.triModelMaster = true;
      achievements.push('⭐ Tri-Model Master - 1000+ tokens with each model!');
    }

    this.saveStats();
    return achievements;
  }

  /**
   * Track feature discovery
   */
  trackFeature(feature: keyof GamificationStats['featuresDiscovered']): string | null {
    if (!this.stats.featuresDiscovered[feature]) {
      this.stats.featuresDiscovered[feature] = true;

      // Check if multimodal master
      const { uploadImage, useVoice, useVideo } = this.stats.featuresDiscovered;
      if (uploadImage && useVoice && useVideo && !this.stats.featuresDiscovered.multiModal) {
        this.stats.featuresDiscovered.multiModal = true;
        this.saveStats();
        return '🎨 Multimodal Master - Used all media types!';
      }

      this.saveStats();
      return `✅ Discovered: ${feature.replace(/([A-Z])/g, ' $1').trim()}`;
    }
    return null;
  }

  /**
   * Update conversation streak
   */
  updateStreak(): string | null {
    const today = new Date().toDateString();
    const lastActive = new Date(this.stats.lastActiveDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (this.stats.lastActiveDate === today) {
      // Already counted today
      return null;
    }

    if (lastActive.toDateString() === yesterday.toDateString()) {
      // Consecutive day - increment streak
      this.stats.currentStreak++;
      if (this.stats.currentStreak > this.stats.longestStreak) {
        this.stats.longestStreak = this.stats.currentStreak;
      }
    } else {
      // Streak broken - reset
      this.stats.currentStreak = 1;
    }

    this.stats.lastActiveDate = today;
    this.saveStats();

    // Return achievement for milestones
    if (this.stats.currentStreak === 7) {
      return '🔥 Week Streak - 7 days in a row!';
    } else if (this.stats.currentStreak === 30) {
      return '🔥 Month Streak - 30 days in a row!';
    } else if (this.stats.currentStreak === 100) {
      return '🔥 Century Streak - 100 days in a row!';
    }

    return null;
  }

  /**
   * Track conversation
   */
  trackConversation(): void {
    this.stats.totalConversations++;
    this.saveStats();
  }

  /**
   * Track message
   */
  trackMessage(): void {
    this.stats.totalMessages++;
    this.saveStats();
  }

  /**
   * Get privacy score message
   */
  getPrivacyScore(): string {
    return `100% Private - ${this.stats.totalConversations} conversations, ${this.stats.totalTokens.toLocaleString()} tokens, 0 bytes sent to servers`;
  }

  /**
   * Get feature discovery progress (0-100)
   */
  getFeatureProgress(): number {
    const discovered = Object.values(this.stats.featuresDiscovered).filter(Boolean).length;
    return Math.round((discovered / Object.keys(this.stats.featuresDiscovered).length) * 100);
  }

  /**
   * Reset all stats (for testing or user request)
   */
  reset(): void {
    this.stats = {
      totalTokens: 0,
      tokenMilestones: {
        wordsmith: false,
        novelist: false,
        shakespeare: false,
      },
      featuresDiscovered: {
        uploadImage: false,
        useVoice: false,
        useVideo: false,
        functionCalling: false,
        multiModal: false,
      },
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: new Date().toDateString(),
      modelUsage: {
        gemma270m: 0,
        gemma3nE2B: 0,
        gemma3nE4B: 0,
      },
      modelMastery: {
        explorer: false,
        triModelMaster: false,
      },
      totalConversations: 0,
      totalMessages: 0,
      dataTransmitted: 0,
    };
    this.saveStats();
  }
}

export const gamificationService = new GamificationService();
