/**
 * MediaPipe LLM Inference Engine
 * Handles GEMMA model initialization and text generation using MediaPipe
 *
 * @author Dr. Ernesto Lee
 */

import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';
import type { ModelConfig } from '../config/models';
import type { GenerationOptions, MessageMetadata } from '../types';

export interface MultimodalInput {
  text?: string;
  imageSource?: string;
  audioSource?: string;
  videoSource?: string;
}

export interface GenerationResult {
  text: string;
  metadata: MessageMetadata;
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
    options: GenerationOptions
  ): Promise<GenerationResult> {
    if (!this.llmInference) {
      throw new Error('Model not initialized');
    }

    console.log('🤖 Generating response with MediaPipe...');

    try {
      // Format prompt for GEMMA models
      const formattedPrompt = `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model\n`;

      const startTime = Date.now();
      let response = '';

      // Generate response
      response = await this.llmInference.generateResponse(formattedPrompt);

      const endTime = Date.now();
      const totalGenerationTime = endTime - startTime; // milliseconds

      // For non-streaming, we can't measure first token separately
      // So we approximate it as a small fraction of total time
      const responseLatency = Math.min(totalGenerationTime, 100);

      // Estimate token counts
      const inputTokens = this.estimateTokenCount(prompt);
      const totalTokens = this.estimateTokenCount(response);
      const tokensPerSecond = totalGenerationTime > 0 ? (totalTokens / (totalGenerationTime / 1000)) : 0;

      console.log(`✅ Generated in ${(totalGenerationTime / 1000).toFixed(2)}s`);

      // Build metadata
      const metadata: MessageMetadata = {
        tokensPerSecond,
        responseLatency,
        totalGenerationTime,
        totalTokens,
        inputTokens,
        modelName: this.modelConfig?.name || 'Unknown',
        temperature: options.temperature,
        topP: options.topP,
      };

      return {
        text: response,
        metadata,
      };
    } catch (error) {
      console.error('❌ Generation failed:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  /**
   * Generate streaming response with metadata
   */
  async generateStreaming(
    prompt: string,
    options: GenerationOptions,
    onToken: (token: string, isDone: boolean, metadata?: MessageMetadata) => void
  ): Promise<void> {
    if (!this.llmInference) {
      throw new Error('Model not initialized');
    }

    console.log('🤖 Generating streaming response...');

    try {
      const formattedPrompt = `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model\n`;

      const startTime = Date.now();
      let firstTokenTime: number | null = null;
      let totalTokens = 0;

      this.llmInference.generateResponse(
        formattedPrompt,
        (partialResult: string, done: boolean) => {
          // Track first token time
          if (firstTokenTime === null && partialResult.length > 0) {
            firstTokenTime = Date.now();
          }

          totalTokens = this.estimateTokenCount(partialResult);

          // Send token update
          onToken(partialResult, done);

          if (done) {
            const endTime = Date.now();
            const totalGenerationTime = endTime - startTime;
            const responseLatency = firstTokenTime ? firstTokenTime - startTime : 0;
            const tokensPerSecond = totalGenerationTime > 0 ? (totalTokens / (totalGenerationTime / 1000)) : 0;

            // Build final metadata
            const metadata: MessageMetadata = {
              tokensPerSecond,
              responseLatency,
              totalGenerationTime,
              totalTokens,
              inputTokens: this.estimateTokenCount(prompt),
              modelName: this.modelConfig?.name || 'Unknown',
              temperature: options.temperature,
              topP: options.topP,
            };

            // Send final update with metadata
            onToken(partialResult, true, metadata);
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
   * Supports text, images, audio, and video
   */
  async generateMultimodal(
    inputs: MultimodalInput[],
    options: GenerationOptions,
    imageResolution?: string
  ): Promise<GenerationResult> {
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
      let textPrompt = '';
      let imageCount = 0;
      let audioCount = 0;
      let videoCount = 0;
      let imageProcessingTime = 0;
      let audioProcessingTime = 0;
      let videoProcessingTime = 0;

      for (const input of inputs) {
        if (input.text) {
          textPrompt += input.text + ' ';
          promptArray.push(input.text);
        }
        if (input.imageSource) {
          const imgStart = Date.now();
          promptArray.push({ imageSource: input.imageSource });
          imageProcessingTime += Date.now() - imgStart;
          imageCount++;
        }
        if (input.audioSource) {
          const audioStart = Date.now();
          promptArray.push({ audioSource: input.audioSource });
          audioProcessingTime += Date.now() - audioStart;
          audioCount++;
        }
        if (input.videoSource) {
          const videoStart = Date.now();
          promptArray.push({ videoSource: input.videoSource });
          videoProcessingTime += Date.now() - videoStart;
          videoCount++;
        }
      }

      promptArray.push('<end_of_turn>\n<start_of_turn>model\n');

      const startTime = Date.now();

      // Generate response
      const response = await this.llmInference.generateResponse(promptArray);

      const endTime = Date.now();
      const totalGenerationTime = endTime - startTime;

      // Estimate response latency (first token time)
      const responseLatency = Math.min(totalGenerationTime, 150);

      // Estimate token counts
      const inputTokens = this.estimateTokenCount(textPrompt);
      const totalTokens = this.estimateTokenCount(response);
      const tokensPerSecond = totalGenerationTime > 0 ? (totalTokens / (totalGenerationTime / 1000)) : 0;

      console.log(`✅ Multimodal generation complete in ${(totalGenerationTime / 1000).toFixed(2)}s`);

      // Build metadata
      const metadata: MessageMetadata = {
        tokensPerSecond,
        responseLatency,
        totalGenerationTime,
        totalTokens,
        inputTokens,
        modelName: this.modelConfig?.name || 'Unknown',
        temperature: options.temperature,
        topP: options.topP,
      };

      // Add multimodal-specific metadata
      if (imageCount > 0) {
        metadata.imageProcessingTime = imageProcessingTime;
        metadata.imageResolution = imageResolution || '512x512';
      }
      if (audioCount > 0) {
        metadata.audioProcessingTime = audioProcessingTime;
        // We could estimate duration from file size, but skip for now
      }
      if (videoCount > 0) {
        metadata.videoProcessingTime = videoProcessingTime;
        // We could estimate duration from file size, but skip for now
      }

      return {
        text: response,
        metadata,
      };
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

  /**
   * Estimate token count from text
   * Uses rough approximation: ~1 token per 4 characters or 1 token per word
   */
  private estimateTokenCount(text: string): number {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const chars = text.length;
    // Use average of word count and char/4 for better estimate
    return Math.round((words.length + chars / 4) / 2);
  }
}

// Singleton instance
export const inferenceEngine = new InferenceEngine();
