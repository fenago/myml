/**
 * Modern Settings Component with Tab Navigation
 * Clean, organized settings with easy navigation
 * @author Dr. Ernesto Lee
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getAvailableModels } from '../config/models';
import { getAllLanguages, AUDIO_TRANSCRIPTION_LANGUAGES } from '../config/languages';
import { voiceService } from '../services/VoiceService';
import { functionService } from '../services/FunctionService';
import type { FunctionDefinition } from '../types';
import { FunctionEditor } from './FunctionEditor';
import { SystemPromptEditor } from './SystemPromptEditor';
import { StructuredOutputEditor } from './StructuredOutputEditor';
import { SafetySettingsEditor } from './SafetySettingsEditor';
import { languageDetectionService } from '../services/LanguageDetectionService';
import { SystemInfoService } from '../services/SystemInfoService';

interface Props {
  onClose: () => void;
}

type TabId = 'model' | 'appearance' | 'language' | 'functions' | 'advanced';

interface Tab {
  id: TabId;
  label: string;
  icon: JSX.Element;
}

const TABS: Tab[] = [
  {
    id: 'model',
    label: 'Model',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    id: 'language',
    label: 'Language & Voice',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
  },
  {
    id: 'functions',
    label: 'Functions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
];

export function Settings({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('model');
  const { currentModelId, setCurrentModel, settings, updateSettings, systemInfo } = useStore();
  const models = getAvailableModels();
  const currentModel = models.find(m => m.id === currentModelId);
  const languages = getAllLanguages();
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [functions, setFunctions] = useState<FunctionDefinition[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [functionToEdit, setFunctionToEdit] = useState<FunctionDefinition | undefined>();

  // Load available TTS voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = voiceService.getAvailableVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Load available functions
  useEffect(() => {
    setFunctions(functionService.getFunctions());
  }, []);

  // Function editor handlers
  const handleCreateNew = () => {
    setFunctionToEdit(undefined);
    setIsEditorOpen(true);
  };

  const handleEditFunction = (func: FunctionDefinition) => {
    setFunctionToEdit(func);
    setIsEditorOpen(true);
  };

  const handleSaveFunction = (func: FunctionDefinition) => {
    functionService.setFunction(func);
    setFunctions(functionService.getFunctions());
    setIsEditorOpen(false);
    setFunctionToEdit(undefined);
  };

  const handleDeleteFunction = (id: string) => {
    if (confirm('Are you sure you want to delete this function?')) {
      functionService.removeFunction(id);
      setFunctions(functionService.getFunctions());
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Settings</h2>
                <p className="text-sm text-blue-100">Customize your MyML experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="flex overflow-x-auto hide-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap
                    transition-all relative
                    ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                {activeTab === 'model' && (
                  <ModelTab
                    models={models}
                    currentModelId={currentModelId}
                    currentModel={currentModel}
                    setCurrentModel={setCurrentModel}
                    settings={settings}
                    updateSettings={updateSettings}
                  />
                )}

                {activeTab === 'appearance' && (
                  <AppearanceTab settings={settings} updateSettings={updateSettings} />
                )}

                {activeTab === 'language' && (
                  <LanguageTab
                    languages={languages}
                    availableVoices={availableVoices}
                    settings={settings}
                    updateSettings={updateSettings}
                  />
                )}

                {activeTab === 'functions' && (
                  <FunctionsTab
                    functions={functions}
                    settings={settings}
                    updateSettings={updateSettings}
                    onCreateNew={handleCreateNew}
                    onEditFunction={handleEditFunction}
                    onDeleteFunction={handleDeleteFunction}
                  />
                )}

                {activeTab === 'advanced' && (
                  <AdvancedTab settings={settings} updateSettings={updateSettings} systemInfo={systemInfo} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Function Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <FunctionEditor
            functionToEdit={functionToEdit}
            onSave={handleSaveFunction}
            onCancel={() => {
              setIsEditorOpen(false);
              setFunctionToEdit(undefined);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Model Tab Component
function ModelTab({ models, currentModelId, setCurrentModel, settings, updateSettings }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Model</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose the model that best fits your needs. Multimodal models support images and audio.
        </p>

        <div className="grid gap-3">
          {models.map((model: any) => (
            <button
              key={model.id}
              onClick={() => {
                if (model.id !== currentModelId) {
                  if (confirm(`Switch to ${model.name}? This will reload the page.`)) {
                    setCurrentModel(model.id);
                    window.location.reload();
                  }
                }
              }}
              className={`
                p-4 rounded-xl border-2 text-left transition-all
                ${
                  currentModelId === model.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{model.icon}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{model.name}</h4>
                    {currentModelId === model.id && (
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{model.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300">
                      {model.size} MB
                    </span>
                    {model.capabilities.map((cap: string) => (
                      <span
                        key={cap}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-xs font-medium rounded-md text-purple-700 dark:text-purple-300"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Generation Parameters */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generation Parameters</h3>

        <div className="space-y-6">
          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Temperature: {settings.temperature.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Lower = More focused, Higher = More creative
            </p>
          </div>

          {/* Top-P */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Top-P: {settings.topP.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.topP}
              onChange={(e) => updateSettings({ topP: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Controls diversity of responses
            </p>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Max Tokens: {settings.maxTokens}
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={settings.maxTokens}
              onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum length of AI responses
            </p>
          </div>

          {/* Response Style */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Response Verbosity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['concise', 'balanced', 'detailed'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => updateSettings({ responseStyle: { ...settings.responseStyle, verbosity: style } })}
                  className={`
                    py-2 px-3 rounded-lg text-sm font-medium transition-all
                    ${
                      settings.responseStyle.verbosity === style
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Prompts & Personas */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Personality & Behavior</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Customize how the AI responds with preset personas or custom instructions
        </p>
        <SystemPromptEditor
          enabled={settings.systemPrompt.enabled}
          customPrompt={settings.systemPrompt.customPrompt}
          selectedPreset={settings.systemPrompt.selectedPreset}
          onUpdate={(updates) => updateSettings({ systemPrompt: { ...settings.systemPrompt, ...updates } })}
        />
      </div>
    </div>
  );
}

// Appearance Tab Component
function AppearanceTab({ settings, updateSettings }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Visual Effects</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Customize the visual appearance and animations
        </p>

        <div className="space-y-3">
          {/* Text Shimmer */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Text Shimmer Effect</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Animated shimmer on text elements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.microinteractions.textShimmer}
                onChange={(e) =>
                  updateSettings({
                    microinteractions: { ...settings.microinteractions, textShimmer: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Splash Cursor */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Splash Cursor</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Animated cursor effects on click</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.microinteractions.splashCursor}
                onChange={(e) =>
                  updateSettings({
                    microinteractions: { ...settings.microinteractions, splashCursor: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Particles */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Background Particles</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Floating particles in background</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.microinteractions.particles}
                onChange={(e) =>
                  updateSettings({
                    microinteractions: { ...settings.microinteractions, particles: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Neon Glow Buttons */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Neon Glow Buttons</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Electric glow effect on buttons</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.microinteractions.neonGlowButtons}
                onChange={(e) =>
                  updateSettings({
                    microinteractions: { ...settings.microinteractions, neonGlowButtons: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Magnetic Buttons */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Magnetic Buttons</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Buttons pull cursor toward them</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.microinteractions.magneticButtons}
                onChange={(e) =>
                  updateSettings({
                    microinteractions: { ...settings.microinteractions, magneticButtons: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Skeleton Loaders */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Skeleton Loaders</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Smooth animated loading states</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.microinteractions.skeletonLoaders}
                onChange={(e) =>
                  updateSettings({
                    microinteractions: { ...settings.microinteractions, skeletonLoaders: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Typing Particles */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Typing Indicator Particles</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Floating particles when AI is typing</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.microinteractions.typingParticles}
                onChange={(e) =>
                  updateSettings({
                    microinteractions: { ...settings.microinteractions, typingParticles: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Card Tilt */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Card Tilt on Hover</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">3D perspective effect on messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.microinteractions.cardTilt}
                onChange={(e) =>
                  updateSettings({
                    microinteractions: { ...settings.microinteractions, cardTilt: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Animated Checkboxes */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Animated Checkboxes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Smooth bounce effect on toggles</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.microinteractions.animatedCheckboxes}
                onChange={(e) =>
                  updateSettings({
                    microinteractions: { ...settings.microinteractions, animatedCheckboxes: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Ripple Effect */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Ripple Click Effect</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Material Design ripple on clicks</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.microinteractions.rippleEffect}
                onChange={(e) =>
                  updateSettings({
                    microinteractions: { ...settings.microinteractions, rippleEffect: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Easter Eggs */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Easter Eggs & Fun Features</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Hidden surprises and delightful interactions
        </p>

        <div className="space-y-3">
          {/* Konami Code */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Konami Code Secret</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">↑↑↓↓←→←→BA unlocks Matrix theme</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.easterEggs.konamiCode}
                onChange={(e) =>
                  updateSettings({
                    easterEggs: { ...settings.easterEggs, konamiCode: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Message Milestones */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Message Milestones</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confetti at 100, 500, 1000 messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.easterEggs.messageMilestones}
                onChange={(e) =>
                  updateSettings({
                    easterEggs: { ...settings.easterEggs, messageMilestones: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Model Personalities */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Model Personality Quirks</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fun responses to special phrases</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.easterEggs.modelPersonalities}
                onChange={(e) =>
                  updateSettings({
                    easterEggs: { ...settings.easterEggs, modelPersonalities: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Hidden Themes */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Hidden Themes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">/midnight, /neon, /sunset, /hacker, /minimal</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.easterEggs.hiddenThemes}
                onChange={(e) =>
                  updateSettings({
                    easterEggs: { ...settings.easterEggs, hiddenThemes: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Time-Based Surprises */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Time-Based Surprises</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Special themes for holidays and midnight</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.easterEggs.timeBased}
                onChange={(e) =>
                  updateSettings({
                    easterEggs: { ...settings.easterEggs, timeBased: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Metadata Display */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Metadata Display</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose what information to display with AI responses
        </p>

        <div className="space-y-3">
          {/* Performance Metrics */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Performance Metrics</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tokens/sec, latency, generation time</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.metadata.showPerformance}
                onChange={(e) =>
                  updateSettings({
                    metadata: { ...settings.metadata, showPerformance: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Model Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Model Information</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Model name, temperature, top-p</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.metadata.showModelInfo}
                onChange={(e) =>
                  updateSettings({
                    metadata: { ...settings.metadata, showModelInfo: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Token Counts */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Token Counts</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Input/output token usage</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.metadata.showTokenCounts}
                onChange={(e) =>
                  updateSettings({
                    metadata: { ...settings.metadata, showTokenCounts: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Multimodal Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Multimodal Information</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Image/audio/video processing times</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.metadata.showMultimodalInfo}
                onChange={(e) =>
                  updateSettings({
                    metadata: { ...settings.metadata, showMultimodalInfo: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Timestamps</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Message timestamps</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.metadata.showTimestamp}
                onChange={(e) =>
                  updateSettings({
                    metadata: { ...settings.metadata, showTimestamp: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Image Resolution */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multimodal Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Configure settings for image and video processing
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Image Resolution
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['256', '512', '768'] as const).map((res) => (
              <button
                key={res}
                onClick={() => updateSettings({ imageResolution: res })}
                className={`
                  py-2 px-3 rounded-lg text-sm font-medium transition-all
                  ${
                    settings.imageResolution === res
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                {res}x{res}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Lower = Faster, Higher = Better quality
          </p>
        </div>
      </div>
    </div>
  );
}

// Language Tab Component
function LanguageTab({ languages, availableVoices, settings, updateSettings }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Response Language</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select the default language for AI responses
        </p>

        <select
          value={settings.language.responseLanguage}
          onChange={(e) => updateSettings({ language: { ...settings.language, responseLanguage: e.target.value } })}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {languages.map((lang: any) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} ({lang.nativeName}) {lang.multimodal ? '🎨' : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          🎨 = Supports multimodal (image/audio) inputs
        </p>
      </div>

      {/* Language Quality & Support Indicators */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Language Support Levels</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Gemma 3n supports 45+ languages with varying multimodal capabilities
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌟</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Full Support</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">(Text + Vision + Audio)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Partial Support</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">(Text + Vision OR Audio)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Text Only</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">(Text input/output only)</span>
          </div>
        </div>

        {/* Languages by Support Level */}
        <div className="space-y-4">
          {/* Full Support Languages */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-lg">🌟</span>
              Full Multimodal Support ({languageDetectionService.getLanguagesBySupport('full').length} languages)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languageDetectionService.getLanguagesBySupport('full').map((lang) => (
                <div
                  key={lang.code}
                  className="text-sm bg-white dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-700"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{lang.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">({lang.nativeName})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Partial Support Languages */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-lg">⭐</span>
              Partial Multimodal Support ({languageDetectionService.getLanguagesBySupport('partial').length} languages)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languageDetectionService.getLanguagesBySupport('partial').map((lang) => (
                <div
                  key={lang.code}
                  className="text-sm bg-white dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-700"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{lang.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">({lang.nativeName})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Text-Only Languages */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-lg">📝</span>
              Text-Only Support ({languageDetectionService.getLanguagesBySupport('text-only').length} languages)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languageDetectionService.getLanguagesBySupport('text-only').map((lang) => (
                <div
                  key={lang.code}
                  className="text-sm bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-600"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{lang.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">({lang.nativeName})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Audio Transcription</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Language used for audio transcription
        </p>

        <select
          value={settings.language.audioTranscriptionLanguage}
          onChange={(e) =>
            updateSettings({ language: { ...settings.language, audioTranscriptionLanguage: e.target.value } })
          }
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {AUDIO_TRANSCRIPTION_LANGUAGES.map((lang: any) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Voice Features</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Configure voice input and output settings
        </p>

        <div className="space-y-3 mb-6">
          {/* Enable Voice Input */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Voice Input (Speech-to-Text)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Speak instead of typing</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.voice.enableInput}
                onChange={(e) => updateSettings({ voice: { ...settings.voice, enableInput: e.target.checked } })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Enable Voice Output */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Voice Output (Text-to-Speech)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Listen to AI responses</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.voice.enableOutput}
                onChange={(e) => updateSettings({ voice: { ...settings.voice, enableOutput: e.target.checked } })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Voice Selection */}
        {settings.voice.enableOutput && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Voice</label>
              <select
                value={settings.voice.outputVoice}
                onChange={(e) => updateSettings({ voice: { ...settings.voice, outputVoice: e.target.value } })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">System Default</option>
                {availableVoices.map((voice: SpeechSynthesisVoice) => (
                  <option key={voice.voiceURI} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Speech Rate: {settings.voice.outputRate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.voice.outputRate}
                onChange={(e) => updateSettings({ voice: { ...settings.voice, outputRate: parseFloat(e.target.value) } })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Speech Pitch: {settings.voice.outputPitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.voice.outputPitch}
                onChange={(e) => updateSettings({ voice: { ...settings.voice, outputPitch: parseFloat(e.target.value) } })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Advanced Audio Features</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Configure Gemma 3n's advanced audio capabilities
        </p>

        <div className="space-y-3">
          {/* ASR Provider */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              Speech Recognition Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateSettings({ audio: { ...settings.audio, asrProvider: 'web-speech' } })}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  settings.audio.asrProvider === 'web-speech'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-300 dark:border-gray-700 hover:border-blue-500/50'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white">Web Speech API</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Browser-native (fast)</div>
              </button>
              <button
                onClick={() => updateSettings({ audio: { ...settings.audio, asrProvider: 'gemma' } })}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  settings.audio.asrProvider === 'gemma'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-300 dark:border-gray-700 hover:border-purple-500/50'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white">Gemma 3n</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">AI-powered (accurate)</div>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {settings.audio.asrProvider === 'gemma'
                ? '✨ Uses Gemma 3n for higher quality transcription'
                : '⚡ Uses browser API for fast transcription'}
            </p>
          </div>

          {/* Audio Translation */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Audio Translation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Translate audio between languages (EN↔ES/FR/IT/PT)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.audio.enableTranslation}
                onChange={(e) => updateSettings({ audio: { ...settings.audio, enableTranslation: e.target.checked } })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Audio Analysis */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Audio Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detect sounds, emotions, and audio scenes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.audio.enableAnalysis}
                onChange={(e) => updateSettings({ audio: { ...settings.audio, enableAnalysis: e.target.checked } })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Show Options on Upload */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Audio Options Dialog</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Show options when uploading audio files
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.audio.showOptionsOnUpload}
                onChange={(e) => updateSettings({ audio: { ...settings.audio, showOptionsOnUpload: e.target.checked } })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Default Action */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              Default Audio Action
            </label>
            <select
              value={settings.audio.defaultAction}
              onChange={(e) => updateSettings({ audio: { ...settings.audio, defaultAction: e.target.value as any } })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="attach">📎 Just Attach</option>
              <option value="transcribe">🎤 Transcribe Speech</option>
              <option value="translate">🌐 Translate Audio</option>
              <option value="analyze">🔍 Analyze Audio</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Used when audio options dialog is disabled
            </p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Advanced Video Features</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Configure Gemma 3n's video understanding capabilities
        </p>

        <div className="space-y-3">
          {/* Video Analysis */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Video Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analyze scenes, actions, objects, and emotions
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.video.enableAnalysis}
                onChange={(e) => updateSettings({ video: { ...settings.video, enableAnalysis: e.target.checked } })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Video Q&A */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Video Q&A</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ask questions about video content
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.video.enableQA}
                onChange={(e) => updateSettings({ video: { ...settings.video, enableQA: e.target.checked } })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Show Options on Upload */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Video Options Dialog</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Show options when uploading video files
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.video.showOptionsOnUpload}
                onChange={(e) => updateSettings({ video: { ...settings.video, showOptionsOnUpload: e.target.checked } })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Frame Extraction Rate */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              Frame Extraction Rate
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 5].map((fps) => (
                <button
                  key={fps}
                  onClick={() => updateSettings({ video: { ...settings.video, frameExtractionRate: fps as any } })}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    settings.video.frameExtractionRate === fps
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-300 dark:border-gray-700 hover:border-blue-500/50'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{fps} fps</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {fps === 1 && 'Balanced'}
                    {fps === 2 && 'Detailed'}
                    {fps === 5 && 'Very detailed'}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Higher rates extract more frames for better analysis
            </p>
          </div>

          {/* Max Frames */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              Maximum Frames
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[10, 20, 30].map((max) => (
                <button
                  key={max}
                  onClick={() => updateSettings({ video: { ...settings.video, maxFrames: max as any } })}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    settings.video.maxFrames === max
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-300 dark:border-gray-700 hover:border-purple-500/50'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{max} frames</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {max === 10 && 'Fast'}
                    {max === 20 && 'Balanced'}
                    {max === 30 && 'Thorough'}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Limits total frames to prevent token overflow
            </p>
          </div>

          {/* Default Action */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              Default Video Action
            </label>
            <select
              value={settings.video.defaultAction}
              onChange={(e) => updateSettings({ video: { ...settings.video, defaultAction: e.target.value as any } })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="attach">📎 Just Attach</option>
              <option value="describe">📝 Describe Video</option>
              <option value="analyze">🔍 Analyze Video</option>
              <option value="summarize">📋 Summarize Video</option>
              <option value="qa">❓ Ask About Video</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Used when video options dialog is disabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Functions Tab Component
function FunctionsTab({ functions, settings, updateSettings, onCreateNew, onEditFunction, onDeleteFunction }: any) {
  const enabledFunctions = settings.functions.availableFunctions || [];

  const toggleFunction = (functionId: string) => {
    const newEnabledFunctions = enabledFunctions.includes(functionId)
      ? enabledFunctions.filter((id: string) => id !== functionId)
      : [...enabledFunctions, functionId];

    updateSettings({
      functions: { ...settings.functions, availableFunctions: newEnabledFunctions },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Function Calling</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enable AI to call external functions and APIs
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.functions.enableFunctionCalling}
              onChange={(e) =>
                updateSettings({ functions: { ...settings.functions, enableFunctionCalling: e.target.checked } })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {settings.functions.enableFunctionCalling && (
          <>
            <div className="mb-4">
              <button
                onClick={onCreateNew}
                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Custom Function
              </button>
            </div>

            <div className="space-y-3">
              {functions.map((func: FunctionDefinition) => (
                <div
                  key={func.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{func.name}</h4>
                        {!func.builtIn && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{func.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={enabledFunctions.includes(func.id)}
                        onChange={() => toggleFunction(func.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {!func.builtIn && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => onEditFunction(func)}
                        className="flex-1 py-2 px-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteFunction(func.id)}
                        className="flex-1 py-2 px-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Advanced Tab Component
function AdvancedTab({ settings, updateSettings, systemInfo }: any) {
  return (
    <div className="space-y-6">
      {/* Structured Output */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Structured Output</h3>
        <StructuredOutputEditor
          enabled={settings.structuredOutput.enabled}
          format={settings.structuredOutput.format}
          jsonSchema={settings.structuredOutput.jsonSchema}
          xmlRootElement={settings.structuredOutput.xmlRootElement}
          csvIncludeHeaders={settings.structuredOutput.csvIncludeHeaders}
          csvDelimiter={settings.structuredOutput.csvDelimiter}
          onUpdate={(updates) => updateSettings({ structuredOutput: { ...settings.structuredOutput, ...updates } })}
        />
      </div>

      {/* Safety & Content Filtering */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Safety & Content Filtering</h3>
        <SafetySettingsEditor
          enabled={settings.safety.enabled}
          level={settings.safety.level}
          blockProfanity={settings.safety.blockProfanity}
          blockViolence={settings.safety.blockViolence}
          blockSexual={settings.safety.blockSexual}
          blockHate={settings.safety.blockHate}
          customFilters={settings.safety.customFilters}
          onUpdate={(updates) => updateSettings({ safety: { ...settings.safety, ...updates } })}
        />
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Storage</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Manage model caching and storage preferences
        </p>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Cache Large Models</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Store models &gt;500MB in browser cache for faster loading
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              ⚠️ Uses more disk space but prevents memory errors
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.storage.cacheLargeModels}
              onChange={(e) => updateSettings({ storage: { ...settings.storage, cacheLargeModels: e.target.checked } })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Keyboard Shortcuts</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Use these keyboard shortcuts for faster navigation
        </p>

        <div className="space-y-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Send message</span>
            <kbd className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-900 dark:text-white">
              Ctrl + Enter
            </kbd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Clear conversation</span>
            <kbd className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-900 dark:text-white">
              Ctrl + K
            </kbd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Toggle settings</span>
            <kbd className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-900 dark:text-white">
              Ctrl + /
            </kbd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Close modal/settings</span>
            <kbd className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-900 dark:text-white">
              Esc
            </kbd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">New line in message</span>
            <kbd className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-900 dark:text-white">
              Shift + Enter
            </kbd>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About MyML</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          All AI processing happens locally in your browser. No data is sent to external servers.
        </p>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🔒 Privacy First</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>✓ 100% local AI inference</li>
            <li>✓ No server uploads</li>
            <li>✓ No data collection</li>
            <li>✓ No API keys required</li>
          </ul>
        </div>
      </div>

      {/* System Information */}
      {systemInfo && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">System Information</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Device and browser capabilities detected on app initialization
          </p>

          <div className="space-y-4">
            {/* Device Summary */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Device
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {systemInfo.isMobile ? '📱 Mobile' : systemInfo.isTablet ? '📱 Tablet' : '💻 Desktop'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Platform:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemInfo.platform}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">OS:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {systemInfo.isIOS ? 'iOS' : systemInfo.isAndroid ? 'Android' : systemInfo.isMacOS ? 'macOS' : systemInfo.isWindows ? 'Windows' : systemInfo.isLinux ? 'Linux' : 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Touch:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemInfo.hasTouch ? '✅ Yes' : '❌ No'}</p>
                </div>
              </div>
            </div>

            {/* Browser Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Browser
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Name:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemInfo.browser}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Version:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemInfo.browserVersion}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Language:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemInfo.language}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Online:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemInfo.isOnline ? '✅ Yes' : '❌ Offline'}</p>
                </div>
              </div>
            </div>

            {/* Display Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Display
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Screen:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemInfo.screenWidth} × {systemInfo.screenHeight}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Viewport:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemInfo.viewportWidth} × {systemInfo.viewportHeight}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Pixel Ratio:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemInfo.pixelRatio}x</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Dark Mode:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemInfo.prefersDarkMode ? '🌙 Preferred' : '☀️ Not Preferred'}</p>
                </div>
              </div>
            </div>

            {/* Hardware Capabilities */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Hardware
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">CPU Cores:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemInfo.cpuCores}</p>
                </div>
                {systemInfo.deviceMemory && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Memory:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{systemInfo.deviceMemory} GB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Browser Capabilities */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Capabilities
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={systemInfo.hasWebGPU ? 'text-green-600' : 'text-gray-400'}>
                    {systemInfo.hasWebGPU ? '✅' : '❌'}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">WebGPU</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={systemInfo.hasWebGL ? 'text-green-600' : 'text-gray-400'}>
                    {systemInfo.hasWebGL ? '✅' : '❌'}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">WebGL</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={systemInfo.hasServiceWorker ? 'text-green-600' : 'text-gray-400'}>
                    {systemInfo.hasServiceWorker ? '✅' : '❌'}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">Service Worker</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={systemInfo.hasIndexedDB ? 'text-green-600' : 'text-gray-400'}>
                    {systemInfo.hasIndexedDB ? '✅' : '❌'}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">IndexedDB</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={systemInfo.hasGeolocation ? 'text-green-600' : 'text-gray-400'}>
                    {systemInfo.hasGeolocation ? '✅' : '❌'}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">Geolocation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={systemInfo.hasNotifications ? 'text-green-600' : 'text-gray-400'}>
                    {systemInfo.hasNotifications ? '✅' : '❌'}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">Notifications</span>
                </div>
              </div>
            </div>

            {/* Time & Locale */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Time & Locale
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Timezone:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemInfo.timezone}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Locale:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemInfo.locale}</p>
                </div>
              </div>
            </div>

            {/* Collection Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
              Collected: {new Date(systemInfo.collectedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
