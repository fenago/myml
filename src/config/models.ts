/**
 * Production model configuration for BrowserGPT
 * All models hosted on CloudFlare R2
 *
 * @author Dr. Ernesto Lee
 */

export const MODEL_CONFIG = {
  // CloudFlare R2 Base URL
  R2_BASE_URL: 'https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev',

  // Available models
  models: {
    // CAESAR 270M - Fast text-only model
    gemma270m: {
      id: 'gemma270m',
      url: 'https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma3-270m-it-q8-web.task',
      name: 'CAESAR 270M',
      description: 'Lightning-fast text generation',
      type: 'text-generation' as const,
      format: 'task' as const,
      quantization: 'q8' as const,
      size: 297 * 1024 * 1024, // 297 MB
      capabilities: ['text'] as const,
      contextWindow: 8000,
      parameters: 270_000_000,
      icon: '✨',
      recommended: {
        device: 'webgpu' as const,
        fallback: 'wasm' as const,
        minMemory: 450 * 1024 * 1024, // 450 MB
      },
    },

    // MADDY E2B - Multimodal model
    gemma3nE2B: {
      id: 'gemma3nE2B',
      url: 'https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma-3n-E2B-it-int4-Web.litertlm',
      name: 'MADDY E2B',
      description: 'Multimodal powerhouse (text, vision, audio)',
      type: 'multimodal' as const,
      format: 'litertlm' as const,
      quantization: 'int4' as const,
      size: 1.9 * 1024 * 1024 * 1024, // 1.9 GB
      capabilities: ['text', 'vision', 'audio'] as const,
      contextWindow: 32000,
      parameters: 1_910_000_000, // Effective
      totalParameters: 5_100_000_000,
      icon: '🎯',
      features: ['ple-caching', 'matformer', 'conditional-loading'],
      recommended: {
        device: 'webgpu' as const,
        fallback: 'wasm' as const,
        minMemory: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
      },
    },

    // JORDAN E4B - Advanced multimodal model
    gemma3nE4B: {
      id: 'gemma3nE4B',
      url: 'https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma-3n-E4B-it-int4-Web.litertlm',
      name: 'JORDAN E4B',
      description: 'Elite multimodal intelligence (text, vision, audio)',
      type: 'multimodal' as const,
      format: 'litertlm' as const,
      quantization: 'int4' as const,
      size: 2.1 * 1024 * 1024 * 1024, // 2.1 GB estimated
      capabilities: ['text', 'vision', 'audio'] as const,
      contextWindow: 32000,
      parameters: 2_100_000_000, // Effective
      totalParameters: 5_500_000_000,
      icon: '🔮',
      features: ['ple-caching', 'matformer', 'conditional-loading', 'enhanced-vision'],
      recommended: {
        device: 'webgpu' as const,
        fallback: 'wasm' as const,
        minMemory: 2.8 * 1024 * 1024 * 1024, // 2.8 GB
      },
    },
  },
} as const;

export type ModelId = keyof typeof MODEL_CONFIG.models;
export type ModelConfig = typeof MODEL_CONFIG.models[ModelId];

/**
 * Get model configuration by ID
 */
export function getModelConfig(modelId: ModelId): ModelConfig {
  return MODEL_CONFIG.models[modelId];
}

/**
 * Get all available models
 */
export function getAvailableModels() {
  return Object.values(MODEL_CONFIG.models);
}

/**
 * Select best model based on required capabilities
 */
export function selectModelByCapability(
  capabilities: Array<'text' | 'vision' | 'audio'>
): ModelConfig {
  // If only text is needed, prefer smaller model
  if (capabilities.length === 1 && capabilities[0] === 'text') {
    return MODEL_CONFIG.models.gemma270m;
  }

  // For multimodal, prefer E4B (most advanced) or fall back to E2B
  return MODEL_CONFIG.models.gemma3nE4B;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Estimate download time based on connection speed
 */
export function estimateDownloadTime(
  bytes: number,
  speedMbps: number
): number {
  const speedBps = (speedMbps * 1024 * 1024) / 8; // Convert Mbps to bytes/sec
  return bytes / speedBps; // Return seconds
}
