/**
 * Type definitions for BrowserGPT
 * @author Dr. Ernesto Lee
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokensPerSecond?: number;
  image?: string; // Base64 encoded image
  audio?: string; // Base64 encoded audio
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
}
