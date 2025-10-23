/**
 * MediaPipe LLM Inference Engine
 * Handles GEMMA model initialization and text generation using MediaPipe
 *
 * @author Dr. Ernesto Lee
 */

import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';
import type { ModelConfig } from '../config/models';
import type { GenerationOptions } from '../types';

export interface MultimodalInput {
  text?: string;
  imageSource?: string;
  audioSource?: string;
}

export class InferenceEngine {
  private llmInference: any = null;
  private modelConfig: ModelConfig | null = null;
  private genAi: any = null;

  /**
   * Initialize MediaPipe GEMMA model from CloudFlare R2
   */
  async initialize(config: ModelConfig): Promise<void> {
    console.log(`🚀 Initializing MediaPipe model: ${config.name}`);

    try {
      // Load MediaPipe GenAI library
      this.genAi = await FilesetResolver.forGenAiTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm'
      );

      // Check if model supports multimodal
      const isMultimodal = config.capabilities.length > 1;

      // Create LLM Inference instance
      this.llmInference = await LlmInference.createFromOptions(this.genAi, {
        baseOptions: {
          modelAssetPath: config.url,
        },
        maxTokens: 1000,
        topK: 40,
        temperature: 0.8,
        randomSeed: 101,
        // Enable multimodal if supported
        ...(isMultimodal && {
          maxNumImages: 5,
          supportAudio: true,
        }),
      });

      this.modelConfig = config;
      console.log(`✅ MediaPipe model initialized: ${config.name}`);
      console.log(`   Multimodal: ${isMultimodal ? 'Enabled' : 'Disabled'}`);
    } catch (error) {
      console.error('❌ MediaPipe initialization failed:', error);
      throw new Error(`Failed to initialize model: ${error}`);
    }
  }

  /**
   * Generate text response
   */
  async generate(
    prompt: string,
    _options: GenerationOptions
  ): Promise<string> {
    if (!this.llmInference) {
      throw new Error('Model not initialized');
    }

    console.log('🤖 Generating response with MediaPipe...');

    try {
      // Format prompt for GEMMA models
      const formattedPrompt = `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model\n`;

      const startTime = Date.now();

      // Generate response
      const response = await this.llmInference.generateResponse(formattedPrompt);

      const endTime = Date.now();
      const timeElapsed = (endTime - startTime) / 1000; // seconds

      console.log(`✅ Generated in ${timeElapsed.toFixed(2)}s`);

      return response;
    } catch (error) {
      console.error('❌ Generation failed:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  /**
   * Generate streaming response
   */
  async generateStreaming(
    prompt: string,
    _options: GenerationOptions,
    onToken: (token: string) => void
  ): Promise<void> {
    if (!this.llmInference) {
      throw new Error('Model not initialized');
    }

    console.log('🤖 Generating streaming response...');

    try {
      const formattedPrompt = `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model\n`;

      this.llmInference.generateResponse(
        formattedPrompt,
        (partialResult: string, done: boolean) => {
          onToken(partialResult);
          if (done) {
            console.log('✅ Streaming complete');
          }
        }
      );
    } catch (error) {
      console.error('❌ Streaming generation failed:', error);
      throw new Error(`Failed to generate streaming response: ${error}`);
    }
  }

  /**
   * Generate multimodal response (GEMMA 3N only)
   * Supports text, images, and audio
   */
  async generateMultimodal(
    inputs: MultimodalInput[],
    _options: GenerationOptions
  ): Promise<string> {
    if (!this.llmInference) {
      throw new Error('Model not initialized');
    }

    if (!this.modelConfig || this.modelConfig.capabilities.length === 1) {
      throw new Error('Multimodal generation requires GEMMA 3N model');
    }

    console.log('🎨 Generating multimodal response...');

    try {
      // Build multimodal prompt array
      const promptArray: any[] = ['<start_of_turn>user\n'];

      for (const input of inputs) {
        if (input.text) {
          promptArray.push(input.text);
        }
        if (input.imageSource) {
          promptArray.push({ imageSource: input.imageSource });
        }
        if (input.audioSource) {
          promptArray.push({ audioSource: input.audioSource });
        }
      }

      promptArray.push('<end_of_turn>\n<start_of_turn>model\n');

      const startTime = Date.now();

      // Generate response
      const response = await this.llmInference.generateResponse(promptArray);

      const endTime = Date.now();
      const timeElapsed = (endTime - startTime) / 1000;

      console.log(`✅ Multimodal generation complete in ${timeElapsed.toFixed(2)}s`);

      return response;
    } catch (error) {
      console.error('❌ Multimodal generation failed:', error);
      throw new Error(`Failed to generate multimodal response: ${error}`);
    }
  }

  /**
   * Check if model is loaded
   */
  isLoaded(): boolean {
    return this.llmInference !== null;
  }

  /**
   * Check if model supports multimodal
   */
  isMultimodal(): boolean {
    return this.modelConfig?.capabilities.length! > 1;
  }

  /**
   * Get current model config
   */
  getConfig(): ModelConfig | null {
    return this.modelConfig;
  }

  /**
   * Unload model and free memory
   */
  async unload(): Promise<void> {
    if (this.llmInference) {
      // MediaPipe doesn't expose a close method, just clear reference
      this.llmInference = null;
      this.modelConfig = null;
      this.genAi = null;

      // Suggest garbage collection (if available)
      if ((global as any).gc) {
        (global as any).gc();
      }

      console.log('🗑️ MediaPipe model unloaded');
    }
  }
}

// Singleton instance
export const inferenceEngine = new InferenceEngine();
