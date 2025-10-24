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
  analyticsOpen: boolean;

  // Settings
  settings: AppSettings;

  // Actions
  setCurrentModel: (modelId: ModelId) => void;
  setModelStatus: (status: ModelStatus) => void;
  setLoadProgress: (progress: ModelLoadProgress | null) => void;

  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  togglePinMessage: (conversationId: string, messageId: string) => void;
  truncateMessagesAfter: (conversationId: string, messageIndex: number) => void;
  createConversation: (modelId: ModelId) => string;
  forkConversation: (conversationId: string, fromMessageId: string) => string;
  updateConversationSummary: (conversationId: string, summary: string, summarizedUpTo: number) => void;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string | null) => void;

  setIsGenerating: (isGenerating: boolean) => void;
  toggleSidebar: () => void;
  toggleSettings: () => void;
  toggleAnalytics: () => void;

  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  currentModelId: 'gemma3nE4B', // Default to JORDAN E4B (most advanced multimodal)
  modelStatus: 'not-loaded',
  loadProgress: null,

  conversations: {},
  currentConversationId: null,

  isGenerating: false,
  sidebarOpen: false,
  settingsOpen: false,
  analyticsOpen: false,

  settings: {
    defaultModel: 'gemma3nE4B',
    temperature: 0.8,
    maxTokens: 1000,
    topP: 0.9,
    theme: 'light',
    showMetrics: true,
    microinteractions: {
      textShimmer: true,
      splashCursor: true,
      particles: true,
      neonGlowButtons: true,
      magneticButtons: true,
      skeletonLoaders: true,
      typingParticles: true,
      cardTilt: true,
      animatedCheckboxes: true,
      rippleEffect: true,
      allEnabled: true,
    },
    easterEggs: {
      konamiCode: true,
      messageMilestones: true,
      modelPersonalities: true,
      hiddenThemes: true,
      timeBased: true,
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
    audio: {
      asrProvider: 'web-speech', // Default to Web Speech API (widely supported)
      enableTranslation: true, // Enable audio translation features
      enableAnalysis: true, // Enable audio analysis beyond speech
      showOptionsOnUpload: true, // Show audio options modal when uploading
      defaultAction: 'attach', // Default action for audio uploads
    },
    video: {
      enableAnalysis: true, // Enable advanced video analysis
      enableQA: true, // Enable video question answering
      showOptionsOnUpload: true, // Show video options modal when uploading
      defaultAction: 'attach', // Default action for video uploads
      frameExtractionRate: 1, // 1 frame per second (balanced)
      maxFrames: 10, // Max 10 frames (prevents token overflow)
    },
    storage: {
      cacheLargeModels: false, // Don't cache large models by default (prevents memory errors)
    },
    functions: {
      enableFunctionCalling: true, // Enabled by default
      availableFunctions: [
        'weather_openmeteo',
        'currency_conversion',
        'country_info',
        'crypto_prices',
        'random_joke',
        'hacker_news',
        'reddit_news',
        'wikipedia_search',
        'ip_geolocation',
        'github_repo',
        'word_definition',
      ], // All 11 built-in functions enabled by default (no API keys required!)
    },
    responseStyle: {
      verbosity: 'concise', // Concise by default (was too verbose before)
    },
    systemPrompt: {
      enabled: false, // Disabled by default - uses model's default behavior
      customPrompt: '', // Empty by default
      selectedPreset: null, // No preset selected by default
    },
    structuredOutput: {
      enabled: false, // Disabled by default
      format: 'json', // JSON is most common
      jsonSchema: '{\n  "type": "object",\n  "properties": {\n    \n  }\n}', // Default empty schema
      xmlRootElement: 'root', // Default root element
      csvIncludeHeaders: true, // Include headers by default
      csvDelimiter: ',', // Comma delimiter by default
    },
    safety: {
      enabled: false, // Disabled by default
      level: 'moderate', // Moderate filtering when enabled
      blockProfanity: true,
      blockViolence: true,
      blockSexual: true,
      blockHate: true,
      customFilters: [], // No custom filters by default
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

  togglePinMessage: (conversationId, messageId) =>
    set((state) => {
      const conversation = state.conversations[conversationId];
      if (!conversation) return state;

      const message = conversation.messages.find((msg) => msg.id === messageId);
      if (!message) return state;

      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...conversation,
            messages: conversation.messages.map((msg) =>
              msg.id === messageId ? { ...msg, pinned: !msg.pinned } : msg
            ),
            updatedAt: new Date(),
          },
        },
      };
    }),

  truncateMessagesAfter: (conversationId, messageIndex) =>
    set((state) => {
      const conversation = state.conversations[conversationId];
      if (!conversation) return state;

      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...conversation,
            messages: conversation.messages.slice(0, messageIndex + 1),
            updatedAt: new Date(),
          },
        },
      };
    }),

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

  forkConversation: (conversationId, fromMessageId) => {
    const newId = crypto.randomUUID();

    set((state) => {
      const originalConv = state.conversations[conversationId];
      if (!originalConv) return state;

      // Find the index of the message to fork from
      const messageIndex = originalConv.messages.findIndex(m => m.id === fromMessageId);
      if (messageIndex === -1) return state;

      // Create new conversation with messages up to and including the fork point
      const forkedMessages = originalConv.messages.slice(0, messageIndex + 1);

      const newConversation: Conversation = {
        id: newId,
        messages: forkedMessages,
        modelId: originalConv.modelId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        conversations: { ...state.conversations, [newId]: newConversation },
        currentConversationId: newId,
      };
    });

    return newId;
  },

  updateConversationSummary: (conversationId, summary, summarizedUpTo) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversationId]: {
          ...state.conversations[conversationId],
          summary,
          summarizedUpTo,
          updatedAt: new Date(),
        },
      },
    })),

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

  toggleAnalytics: () => set((state) => ({ analyticsOpen: !state.analyticsOpen })),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
}));
