/**
 * Model Info Service
 * Collects and provides statistics about loaded model and system performance
 * @author Dr. Ernesto Lee
 */

export interface ModelInfo {
  // Model Details
  name: string;
  size: number; // MB
  quantization: string;
  capabilities: string[];

  // Memory Usage
  memoryUsed: number; // MB
  memoryTotal: number; // MB
  memoryPercent: number;

  // Performance Stats
  averageTokensPerSecond: number;
  averageLatency: number; // ms
  totalInferences: number;
  totalTokensGenerated: number;

  // System Info
  platform: string;
  hardwareConcurrency: number;
  deviceMemory?: number; // GB (if available)

  // Status
  isLoaded: boolean;
  loadTime?: number; // ms
}

export class ModelInfoService {
  private inferenceHistory: Array<{
    tokensPerSecond: number;
    latency: number;
    tokens: number;
  }> = [];

  /**
   * Get current model information and statistics
   */
  async getModelInfo(modelConfig: any, isLoaded: boolean, loadTime?: number): Promise<ModelInfo> {
    // Get memory info
    const memory = await this.getMemoryInfo();

    // Calculate performance stats
    const perfStats = this.calculatePerformanceStats();

    return {
      // Model details
      name: modelConfig?.name || 'No model loaded',
      size: modelConfig?.size || 0,
      quantization: modelConfig?.quantization || 'Unknown',
      capabilities: modelConfig?.capabilities || [],

      // Memory usage
      memoryUsed: memory.used,
      memoryTotal: memory.total,
      memoryPercent: memory.percent,

      // Performance stats
      averageTokensPerSecond: perfStats.avgTokensPerSecond,
      averageLatency: perfStats.avgLatency,
      totalInferences: this.inferenceHistory.length,
      totalTokensGenerated: perfStats.totalTokens,

      // System info
      platform: this.getPlatform(),
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: this.getDeviceMemory(),

      // Status
      isLoaded,
      loadTime,
    };
  }

  /**
   * Record inference performance
   */
  recordInference(tokensPerSecond: number, latency: number, tokens: number) {
    this.inferenceHistory.push({
      tokensPerSecond,
      latency,
      tokens,
    });

    // Keep only last 100 inferences to avoid memory bloat
    if (this.inferenceHistory.length > 100) {
      this.inferenceHistory.shift();
    }
  }

  /**
   * Get memory information
   */
  private async getMemoryInfo(): Promise<{ used: number; total: number; percent: number }> {
    try {
      // Use Performance Memory API if available
      if ('memory' in performance) {
        const perfMemory = (performance as any).memory;
        const usedMB = perfMemory.usedJSHeapSize / 1024 / 1024;
        const totalMB = perfMemory.jsHeapSizeLimit / 1024 / 1024;

        return {
          used: Math.round(usedMB),
          total: Math.round(totalMB),
          percent: Math.round((usedMB / totalMB) * 100),
        };
      }

      // Fallback: estimate based on device memory
      const deviceMemoryGB = this.getDeviceMemory();
      if (deviceMemoryGB) {
        // Assume browser can use ~25% of device memory
        const totalMB = deviceMemoryGB * 1024 * 0.25;
        // Rough estimate of used memory (can't get actual without API)
        const estimatedUsedMB = 500; // Conservative estimate

        return {
          used: estimatedUsedMB,
          total: Math.round(totalMB),
          percent: Math.round((estimatedUsedMB / totalMB) * 100),
        };
      }

      // Last resort: return unknown
      return {
        used: 0,
        total: 0,
        percent: 0,
      };
    } catch (error) {
      console.warn('Could not get memory info:', error);
      return {
        used: 0,
        total: 0,
        percent: 0,
      };
    }
  }

  /**
   * Calculate performance statistics from history
   */
  private calculatePerformanceStats() {
    if (this.inferenceHistory.length === 0) {
      return {
        avgTokensPerSecond: 0,
        avgLatency: 0,
        totalTokens: 0,
      };
    }

    const totalTokensPerSecond = this.inferenceHistory.reduce((sum, inf) => sum + inf.tokensPerSecond, 0);
    const totalLatency = this.inferenceHistory.reduce((sum, inf) => sum + inf.latency, 0);
    const totalTokens = this.inferenceHistory.reduce((sum, inf) => sum + inf.tokens, 0);

    return {
      avgTokensPerSecond: Math.round(totalTokensPerSecond / this.inferenceHistory.length),
      avgLatency: Math.round(totalLatency / this.inferenceHistory.length),
      totalTokens,
    };
  }

  /**
   * Get platform information
   */
  private getPlatform(): string {
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes('win')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS';

    return 'Unknown';
  }

  /**
   * Get device memory if available
   */
  private getDeviceMemory(): number | undefined {
    // @ts-ignore - deviceMemory is not in TypeScript types yet
    return navigator.deviceMemory;
  }

  /**
   * Clear inference history
   */
  clearHistory() {
    this.inferenceHistory = [];
  }

  /**
   * Get detailed performance breakdown
   */
  getPerformanceBreakdown() {
    if (this.inferenceHistory.length === 0) {
      return null;
    }

    const sorted = [...this.inferenceHistory].sort((a, b) => a.tokensPerSecond - b.tokensPerSecond);
    const mid = Math.floor(sorted.length / 2);

    return {
      min: sorted[0].tokensPerSecond,
      max: sorted[sorted.length - 1].tokensPerSecond,
      median: sorted.length % 2 === 0
        ? (sorted[mid - 1].tokensPerSecond + sorted[mid].tokensPerSecond) / 2
        : sorted[mid].tokensPerSecond,
      p95: sorted[Math.floor(sorted.length * 0.95)].tokensPerSecond,
    };
  }
}

export const modelInfoService = new ModelInfoService();
