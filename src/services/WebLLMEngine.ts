/**
 * WebLLM Inference Engine - Backup option for legacy models
 * Provides access to additional models via @mlc-ai/web-llm
 *
 * @author Dr. Ernesto Lee
 */

import type { GenerationOptions } from '../types';

// WebLLM types (will be imported from @mlc-ai/web-llm when installed)
interface MLCEngine {
  chat: {
    completions: {
      create: (options: any) => Promise<any>;
    };
  };
  reload: (model: string) => Promise<void>;
  getMessage: () => Promise<string>;
}

export interface WebLLMModelConfig {
  id: string;
  name: string;
  description: string;
  size: number;
  capabilities: string[];
}

/**
 * Available WebLLM models (legacy/backup options)
 */
export const WEBLLM_MODELS: Record<string, WebLLMModelConfig> = {
  llama31_8b: {
    id: 'Llama-3.1-8B-Instruct-q4f32_1-MLC',
    name: 'Llama 3.1 8B',
    description: 'Meta Llama 3.1 - Legacy option',
    size: 4.8 * 1024 * 1024 * 1024, // 4.8 GB
    capabilities: ['text'],
  },
  phi3_mini: {
    id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
    name: 'Phi-3 Mini',
    description: 'Microsoft Phi-3 Mini - Legacy option',
    size: 2.3 * 1024 * 1024 * 1024, // 2.3 GB
    capabilities: ['text'],
  },
  gemma2_2b: {
    id: 'gemma-2-2b-it-q4f16_1-MLC',
    name: 'Gemma 2 2B',
    description: 'Google Gemma 2 2B - Legacy option',
    size: 1.5 * 1024 * 1024 * 1024, // 1.5 GB
    capabilities: ['text'],
  },
};

export class WebLLMInferenceEngine {
  private engine: MLCEngine | null = null;
  private currentModel: string | null = null;

  /**
   * Check if WebLLM is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Check if @mlc-ai/web-llm is installed
      // @ts-ignore - Optional dependency
      const webllm = await import('@mlc-ai/web-llm');
      return !!webllm;
    } catch {
      return false;
    }
  }

  /**
   * Initialize WebLLM engine with a specific model
   */
  async initialize(
    modelId: string,
    onProgress?: (progress: any) => void
  ): Promise<void> {
    console.log(`🚀 Initializing WebLLM model: ${modelId}`);

    try {
      // Dynamically import WebLLM
      // @ts-ignore - Optional dependency
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

      // Create engine with progress callback
      this.engine = await CreateMLCEngine(modelId, {
        initProgressCallback: (progress: any) => {
          if (onProgress) {
            onProgress({
              loaded: progress.progress || 0,
              total: 100,
              percentage: (progress.progress || 0) * 100,
              status: progress.text || 'Loading...',
            });
          }
        },
      });

      this.currentModel = modelId;
      console.log(`✅ WebLLM model initialized: ${modelId}`);
    } catch (error) {
      console.error('❌ WebLLM initialization failed:', error);
      throw new Error(`Failed to initialize WebLLM model: ${error}`);
    }
  }

  /**
   * Generate text response using WebLLM
   */
  async generate(
    prompt: string,
    options: GenerationOptions
  ): Promise<string> {
    if (!this.engine) {
      throw new Error('WebLLM engine not initialized');
    }

    console.log('🤖 Generating response with WebLLM...');

    try {
      const messages = [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: prompt },
      ];

      // Use streaming for better UX
      if (options.streamTokens) {
        const chunks = await this.engine.chat.completions.create({
          messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          stream: true,
          stream_options: { include_usage: true },
        });

        let reply = '';
        for await (const chunk of chunks as any) {
          reply += chunk.choices[0]?.delta?.content || '';
        }

        return reply;
      } else {
        // Non-streaming
        const response = await this.engine.chat.completions.create({
          messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
        });

        return response.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('❌ WebLLM generation failed:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  /**
   * Switch to a different model
   */
  async switchModel(
    modelId: string,
    _onProgress?: (progress: any) => void
  ): Promise<void> {
    if (!this.engine) {
      throw new Error('Engine not initialized');
    }

    console.log(`🔄 Switching to model: ${modelId}`);

    await this.engine.reload(modelId);
    this.currentModel = modelId;
  }

  /**
   * Check if engine is loaded
   */
  isLoaded(): boolean {
    return this.engine !== null;
  }

  /**
   * Get current model ID
   */
  getCurrentModel(): string | null {
    return this.currentModel;
  }

  /**
   * Unload engine and free memory
   */
  async unload(): Promise<void> {
    this.engine = null;
    this.currentModel = null;
    console.log('🗑️ WebLLM engine unloaded');
  }
}

// Singleton instance
export const webllmEngine = new WebLLMInferenceEngine();
