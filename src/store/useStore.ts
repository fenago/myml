/**
 * Global state management using Zustand
 * @author Dr. Ernesto Lee
 */

import { create } from 'zustand';
import type { Message, Conversation, AppSettings, ModelStatus, ModelLoadProgress } from '../types';
import type { ModelId } from '../config/models';

interface AppState {
  // Model state
  currentModelId: ModelId;
  modelStatus: ModelStatus;
  loadProgress: ModelLoadProgress | null;

  // Conversation state
  conversations: Record<string, Conversation>;
  currentConversationId: string | null;

  // UI state
  isGenerating: boolean;
  sidebarOpen: boolean;
  settingsOpen: boolean;

  // Settings
  settings: AppSettings;

  // Actions
  setCurrentModel: (modelId: ModelId) => void;
  setModelStatus: (status: ModelStatus) => void;
  setLoadProgress: (progress: ModelLoadProgress | null) => void;

  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  createConversation: (modelId: ModelId) => string;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string | null) => void;

  setIsGenerating: (isGenerating: boolean) => void;
  toggleSidebar: () => void;
  toggleSettings: () => void;

  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  currentModelId: 'gemma3nE2B', // Default to MADDY E2B (multimodal)
  modelStatus: 'not-loaded',
  loadProgress: null,

  conversations: {},
  currentConversationId: null,

  isGenerating: false,
  sidebarOpen: false,
  settingsOpen: false,

  settings: {
    defaultModel: 'gemma3nE2B',
    temperature: 0.8,
    maxTokens: 1000,
    topP: 0.9,
    theme: 'light',
    showMetrics: true,
    microinteractions: {
      textShimmer: true,
      splashCursor: true,
      particles: true,
      allEnabled: true,
    },
    metadata: {
      showPerformance: true,
      showModelInfo: false,
      showTokenCounts: false,
      showMultimodalInfo: true,
      showTimestamp: true,
    },
    imageResolution: '512', // Balanced default
    voice: {
      enableInput: false, // Disabled by default
      enableOutput: false, // Disabled by default
      outputVoice: '', // Will use browser default
      outputRate: 1.0,
      outputPitch: 1.0,
    },
    language: {
      responseLanguage: 'en', // English default
      audioTranscriptionLanguage: 'en-US', // US English default
    },
    storage: {
      cacheLargeModels: false, // Don't cache large models by default (prevents memory errors)
    },
    functions: {
      enableFunctionCalling: true, // Enabled by default
      availableFunctions: ['weather_openmeteo'], // Weather function enabled by default
    },
  },

  // Actions
  setCurrentModel: (modelId) => set({ currentModelId: modelId }),

  setModelStatus: (status) => set({ modelStatus: status }),

  setLoadProgress: (progress) => set({ loadProgress: progress }),

  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversationId]: {
          ...state.conversations[conversationId],
          messages: [...state.conversations[conversationId].messages, message],
          updatedAt: new Date(),
        },
      },
    })),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversationId]: {
          ...state.conversations[conversationId],
          messages: state.conversations[conversationId].messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
          updatedAt: new Date(),
        },
      },
    })),

  createConversation: (modelId) => {
    const id = crypto.randomUUID();
    const conversation: Conversation = {
      id,
      messages: [],
      modelId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      conversations: { ...state.conversations, [id]: conversation },
      currentConversationId: id,
    }));

    return id;
  },

  deleteConversation: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.conversations;
      return {
        conversations: rest,
        currentConversationId:
          state.currentConversationId === id ? null : state.currentConversationId,
      };
    }),

  setCurrentConversation: (id) => set({ currentConversationId: id }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
}));
