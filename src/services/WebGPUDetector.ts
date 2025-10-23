/**
 * WebGPU Detection and Optimization Service
 * Detects WebGPU availability and provides performance hints
 *
 * @author Dr. Ernesto Lee
 */

// Type definitions for WebGPU (not yet in TypeScript lib)
declare global {
  interface Navigator {
    gpu?: any;
  }
}

export interface WebGPUCapabilities {
  supported: boolean;
  adapter: any | null;
  device: any | null;
  limits?: any;
  features?: string[];
  recommendedBackend: 'webgpu' | 'wasm';
}

class WebGPUDetector {
  private capabilities: WebGPUCapabilities | null = null;
  private detectionPromise: Promise<WebGPUCapabilities> | null = null;

  /**
   * Detect WebGPU availability and capabilities
   */
  async detect(): Promise<WebGPUCapabilities> {
    // Return cached result if already detected
    if (this.capabilities) {
      return this.capabilities;
    }

    // Return ongoing detection promise if already in progress
    if (this.detectionPromise) {
      return this.detectionPromise;
    }

    // Start new detection
    this.detectionPromise = this.performDetection();
    this.capabilities = await this.detectionPromise;
    return this.capabilities;
  }

  private async performDetection(): Promise<WebGPUCapabilities> {
    // Check if WebGPU is available
    if (!navigator.gpu) {
      console.info('WebGPU not available, will use WASM backend');
      return {
        supported: false,
        adapter: null,
        device: null,
        recommendedBackend: 'wasm',
      };
    }

    try {
      // Request WebGPU adapter
      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance',
      });

      if (!adapter) {
        console.warn('WebGPU adapter not available, falling back to WASM');
        return {
          supported: false,
          adapter: null,
          device: null,
          recommendedBackend: 'wasm',
        };
      }

      // Request device
      const device = await adapter.requestDevice();

      // Get limits and features
      const limits = adapter.limits;
      const features = Array.from(adapter.features) as string[];

      console.info('WebGPU detected and available!', {
        maxBufferSize: limits.maxBufferSize,
        maxComputeWorkgroupStorageSize: limits.maxComputeWorkgroupStorageSize,
        features,
      });

      return {
        supported: true,
        adapter,
        device,
        limits,
        features,
        recommendedBackend: 'webgpu',
      };
    } catch (error) {
      console.warn('WebGPU detection failed:', error);
      return {
        supported: false,
        adapter: null,
        device: null,
        recommendedBackend: 'wasm',
      };
    }
  }

  /**
   * Get recommended backend for inference
   */
  async getRecommendedBackend(): Promise<'webgpu' | 'wasm'> {
    const capabilities = await this.detect();
    return capabilities.recommendedBackend;
  }

  /**
   * Check if device has sufficient memory for model
   */
  async canHandleModel(estimatedMemoryMB: number): Promise<boolean> {
    const capabilities = await this.detect();

    if (!capabilities.supported || !capabilities.limits) {
      return estimatedMemoryMB <= 2000; // Conservative limit for WASM
    }

    // Check max buffer size (convert to MB)
    const maxBufferMB = capabilities.limits.maxBufferSize / (1024 * 1024);

    // Need at least 2x the model size for buffers
    return maxBufferMB >= estimatedMemoryMB * 2;
  }

  /**
   * Get performance tier estimate
   */
  async getPerformanceTier(): Promise<'high' | 'medium' | 'low'> {
    const capabilities = await this.detect();

    if (!capabilities.supported) {
      return 'low';
    }

    if (!capabilities.limits) {
      return 'medium';
    }

    // High-end: Large buffer size and modern features
    const maxBufferGB = capabilities.limits.maxBufferSize / (1024 * 1024 * 1024);
    const hasModernFeatures = capabilities.features?.includes('shader-f16') || false;

    if (maxBufferGB >= 4 && hasModernFeatures) {
      return 'high';
    }

    if (maxBufferGB >= 2) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationHints(): Promise<{
    useWebGPU: boolean;
    recommendedQuantization: '4bit' | '8bit' | '16bit';
    maxModelSize: number; // in MB
    enableKVCache: boolean;
  }> {
    await this.detect(); // Ensure capabilities are loaded
    const tier = await this.getPerformanceTier();

    if (tier === 'high') {
      return {
        useWebGPU: true,
        recommendedQuantization: '16bit',
        maxModelSize: 4000,
        enableKVCache: true,
      };
    }

    if (tier === 'medium') {
      return {
        useWebGPU: true,
        recommendedQuantization: '8bit',
        maxModelSize: 2000,
        enableKVCache: true,
      };
    }

    // Low tier
    return {
      useWebGPU: false,
      recommendedQuantization: '4bit',
      maxModelSize: 1000,
      enableKVCache: false,
    };
  }

  /**
   * Reset detection (useful for testing)
   */
  reset(): void {
    this.capabilities = null;
    this.detectionPromise = null;
  }
}

// Export singleton instance
export const webGPUDetector = new WebGPUDetector();
