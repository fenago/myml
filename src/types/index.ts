/**
 * Type definitions for BrowserGPT
 * @author Dr. Ernesto Lee
 */

export interface MessageMetadata {
  // Performance metrics
  tokensPerSecond?: number;
  responseLatency?: number; // Time to first token (ms)
  totalGenerationTime?: number; // Total time (ms)
  totalTokens?: number; // Tokens in response
  inputTokens?: number; // Tokens in prompt

  // Model info
  modelName?: string; // CAESAR/MADDY/JORDAN
  temperature?: number;
  topP?: number;

  // Multimodal processing
  imageProcessingTime?: number; // Time to process images (ms)
  audioProcessingTime?: number; // Time to process audio (ms)
  videoProcessingTime?: number; // Time to process video (ms)
  imageResolution?: string; // Resolution used (e.g., "512x512")
  audioDuration?: number; // Audio length (seconds)
  videoDuration?: number; // Video length (seconds)

  // System
  memoryUsage?: number; // Memory at generation time
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokensPerSecond?: number; // Legacy - kept for compatibility
  metadata?: MessageMetadata;
  image?: string; // Base64 encoded image
  audio?: string; // Base64 encoded audio
  video?: string; // Base64 encoded video
}

export interface Conversation {
  id: string;
  messages: Message[];
  modelId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationOptions {
  maxTokens: number;
  temperature: number;
  topP: number;
  streamTokens: boolean;
}

export interface ModelLoadProgress {
  modelId: string;
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
  eta: number; // seconds remaining
}

export interface InferenceMetrics {
  tokensPerSecond: number;
  memoryUsage: number;
  modelLoadTime: number;
  firstTokenLatency: number;
}

export type ModelStatus = 'not-loaded' | 'downloading' | 'loading' | 'loaded' | 'error';

export interface AppSettings {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  theme: 'light' | 'dark' | 'system';
  showMetrics: boolean;
  microinteractions: {
    textShimmer: boolean;
    splashCursor: boolean;
    particles: boolean;
    allEnabled: boolean;
  };
  metadata: {
    showPerformance: boolean; // tok/s, latency, generation time
    showModelInfo: boolean; // model name, temperature, topP
    showTokenCounts: boolean; // input/output token counts
    showMultimodalInfo: boolean; // processing times, resolutions, durations
    showTimestamp: boolean; // message timestamp
  };
  imageResolution: '256' | '512' | '768'; // Default image resolution for multimodal
  voice: {
    enableInput: boolean; // Speech-to-text
    enableOutput: boolean; // Text-to-speech
    outputVoice: string; // Voice name for TTS
    outputRate: number; // Speech rate (0.1-10, default 1)
    outputPitch: number; // Speech pitch (0-2, default 1)
  };
  language: {
    responseLanguage: string; // Default language for AI responses (ISO code)
    audioTranscriptionLanguage: string; // Default for audio transcription
  };
}
