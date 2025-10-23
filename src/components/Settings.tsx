/**
 * Settings Page
 * Model selection and parameter configuration
 * @author Dr. Ernesto Lee
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getAvailableModels, type ModelId } from '../config/models';
import { getAllLanguages, AUDIO_TRANSCRIPTION_LANGUAGES } from '../config/languages';
import { voiceService } from '../services/VoiceService';
import { functionService } from '../services/FunctionService';
import type { FunctionDefinition } from '../types';

interface Props {
  onClose: () => void;
}

export function Settings({ onClose }: Props) {
  const { currentModelId, setCurrentModel, settings, updateSettings } = useStore();
  const models = getAvailableModels();
  const currentModel = models.find(m => m.id === currentModelId);
  const languages = getAllLanguages();
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [functions, setFunctions] = useState<FunctionDefinition[]>([]);

  // Load available TTS voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = voiceService.getAvailableVoices();
      setAvailableVoices(voices);
    };

    // Voices might not be loaded immediately
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Load available functions
  useEffect(() => {
    setFunctions(functionService.getFunctions());
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-3xl font-light text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-10">
          {/* Model Selection */}
          <section>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Model Selection</h3>
            <p className="text-sm text-gray-600 mb-6">
              Choose the AI model that best fits your needs. Multimodal models support images and audio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setCurrentModel(model.id as ModelId)}
                  className={`
                    p-6 rounded-xl border-2 transition-all duration-200 text-left
                    ${
                      currentModelId === model.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{model.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{model.name}</h4>
                      {currentModelId === model.id && (
                        <span className="text-xs text-blue-600 font-medium">Active</span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{model.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {model.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500">
                    {(model.size / 1024 / 1024 / 1024).toFixed(2)} GB
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Generation Parameters */}
          <section>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Generation Parameters</h3>
            <p className="text-sm text-gray-600 mb-6">
              Adjust these settings to control how the AI generates responses.
            </p>

            <div className="space-y-6">
              {/* Temperature */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-900">
                    Temperature
                  </label>
                  <span className="text-sm text-gray-600">
                    {settings.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Lower values (0.0-0.5): More focused and deterministic responses<br/>
                  Higher values (1.0-2.0): More creative and varied responses
                </p>
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-900">
                    Max Tokens
                  </label>
                  <span className="text-sm text-gray-600">
                    {settings.maxTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="256"
                  value={settings.maxTokens}
                  onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Controls the maximum length of generated responses. Higher values allow longer responses but take more time.
                </p>
              </div>

              {/* Top-P */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-900">
                    Top-P (Nucleus Sampling)
                  </label>
                  <span className="text-sm text-gray-600">
                    {settings.topP.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.topP}
                  onChange={(e) => updateSettings({ topP: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Controls diversity via nucleus sampling. 0.9 recommended for balanced results.
                </p>
              </div>
            </div>
          </section>

          {/* Response Style */}
          <section>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Response Style</h3>
            <p className="text-sm text-gray-600 mb-6">
              Control the length and detail of AI responses.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Verbosity</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => updateSettings({ responseStyle: { verbosity: 'concise' } })}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    settings.responseStyle.verbosity === 'concise'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-semibold">Concise</div>
                  <div className={`text-xs mt-1 ${settings.responseStyle.verbosity === 'concise' ? 'text-blue-100' : 'text-gray-500'}`}>
                    Brief & to-the-point
                  </div>
                </button>
                <button
                  onClick={() => updateSettings({ responseStyle: { verbosity: 'balanced' } })}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    settings.responseStyle.verbosity === 'balanced'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-semibold">Balanced</div>
                  <div className={`text-xs mt-1 ${settings.responseStyle.verbosity === 'balanced' ? 'text-blue-100' : 'text-gray-500'}`}>
                    Moderate detail
                  </div>
                </button>
                <button
                  onClick={() => updateSettings({ responseStyle: { verbosity: 'detailed' } })}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    settings.responseStyle.verbosity === 'detailed'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-semibold">Detailed</div>
                  <div className={`text-xs mt-1 ${settings.responseStyle.verbosity === 'detailed' ? 'text-blue-100' : 'text-gray-500'}`}>
                    Comprehensive
                  </div>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {settings.responseStyle.verbosity === 'concise' && 'Responses will be brief and focused, ideal for quick answers.'}
                {settings.responseStyle.verbosity === 'balanced' && 'Responses will provide moderate detail with clear explanations.'}
                {settings.responseStyle.verbosity === 'detailed' && 'Responses will be thorough with extensive explanations and examples.'}
              </p>
            </div>
          </section>

          {/* Microinteractions */}
          <section>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Visual Effects</h3>
            <p className="text-sm text-gray-600 mb-6">
              Customize the visual microinteractions and animations throughout the app.
            </p>

            <div className="space-y-4">
              {/* Enable All */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-900">Enable All Effects</label>
                  <p className="text-xs text-gray-600 mt-1">Turn all visual effects on or off at once</p>
                </div>
                <button
                  onClick={() => {
                    const newValue = !settings.microinteractions.allEnabled;
                    updateSettings({
                      microinteractions: {
                        ...settings.microinteractions,
                        allEnabled: newValue,
                        textShimmer: newValue,
                        splashCursor: newValue,
                        particles: newValue,
                      }
                    });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.microinteractions.allEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.microinteractions.allEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Text Shimmer */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-900">Text Shimmer</label>
                  <p className="text-xs text-gray-600 mt-1">Animated gradient effect on headings</p>
                </div>
                <button
                  onClick={() => updateSettings({
                    microinteractions: { ...settings.microinteractions, textShimmer: !settings.microinteractions.textShimmer }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.microinteractions.textShimmer ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.microinteractions.textShimmer ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Particles Background */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-900">Particles Background</label>
                  <p className="text-xs text-gray-600 mt-1">Animated particles floating in the background</p>
                </div>
                <button
                  onClick={() => updateSettings({
                    microinteractions: { ...settings.microinteractions, particles: !settings.microinteractions.particles }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.microinteractions.particles ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.microinteractions.particles ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Splash Cursor */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl opacity-50">
                <div>
                  <label className="text-sm font-medium text-gray-900">Splash Cursor</label>
                  <p className="text-xs text-gray-600 mt-1">Coming soon - Particle effects on click</p>
                </div>
                <button
                  disabled
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 cursor-not-allowed"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                </button>
              </div>
            </div>
          </section>

          {/* Metadata Display */}
          <section>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Response Metadata</h3>
            <p className="text-sm text-gray-600 mb-6">
              Control what information is displayed below AI responses
            </p>

            <div className="space-y-4">
              {/* Performance Metrics */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-900">Performance Metrics</label>
                  <p className="text-xs text-gray-600 mt-1">Speed (tok/s), latency, generation time</p>
                </div>
                <button
                  onClick={() => updateSettings({
                    metadata: { ...settings.metadata, showPerformance: !settings.metadata.showPerformance }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.metadata.showPerformance ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.metadata.showPerformance ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Model Info */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-900">Model Information</label>
                  <p className="text-xs text-gray-600 mt-1">Model name, temperature, top-P values</p>
                </div>
                <button
                  onClick={() => updateSettings({
                    metadata: { ...settings.metadata, showModelInfo: !settings.metadata.showModelInfo }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.metadata.showModelInfo ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.metadata.showModelInfo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Token Counts */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-900">Token Counts</label>
                  <p className="text-xs text-gray-600 mt-1">Input and output token counts</p>
                </div>
                <button
                  onClick={() => updateSettings({
                    metadata: { ...settings.metadata, showTokenCounts: !settings.metadata.showTokenCounts }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.metadata.showTokenCounts ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.metadata.showTokenCounts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Multimodal Info */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-900">Multimodal Processing</label>
                  <p className="text-xs text-gray-600 mt-1">Processing times, resolutions, media durations</p>
                </div>
                <button
                  onClick={() => updateSettings({
                    metadata: { ...settings.metadata, showMultimodalInfo: !settings.metadata.showMultimodalInfo }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.metadata.showMultimodalInfo ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.metadata.showMultimodalInfo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-900">Timestamp</label>
                  <p className="text-xs text-gray-600 mt-1">Show message timestamps</p>
                </div>
                <button
                  onClick={() => updateSettings({
                    metadata: { ...settings.metadata, showTimestamp: !settings.metadata.showTimestamp }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.metadata.showTimestamp ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.metadata.showTimestamp ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Image Resolution */}
          <section>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Image Processing</h3>
            <p className="text-sm text-gray-600 mb-6">
              Choose default image resolution for multimodal models. Higher resolution = better quality but slower processing.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => updateSettings({ imageResolution: '256' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.imageResolution === '256'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-semibold text-sm mb-1">Fast</div>
                  <div className="text-xs text-gray-600">256×256</div>
                </div>
              </button>

              <button
                onClick={() => updateSettings({ imageResolution: '512' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.imageResolution === '512'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">⚖️</div>
                  <div className="font-semibold text-sm mb-1">Balanced</div>
                  <div className="text-xs text-gray-600">512×512</div>
                </div>
              </button>

              <button
                onClick={() => updateSettings({ imageResolution: '768' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.imageResolution === '768'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="font-semibold text-sm mb-1">Quality</div>
                  <div className="text-xs text-gray-600">768×768</div>
                </div>
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Current setting: {settings.imageResolution}×{settings.imageResolution}</strong>
                <br/>
                This resolution will be used for processing images uploaded to multimodal models.
              </p>
            </div>
          </section>

          {/* Language & Voice */}
          <section>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Language & Voice</h3>
            <p className="text-sm text-gray-600 mb-6">
              Configure language preferences and voice features for AI interactions
            </p>

            <div className="space-y-6">
              {/* Response Language */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Default Response Language
                </label>
                <select
                  value={settings.language.responseLanguage}
                  onChange={(e) => updateSettings({
                    language: { ...settings.language, responseLanguage: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName}) {lang.multimodal ? '🎨' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Language for AI text responses · 🎨 = Multimodal supported
                </p>
              </div>

              {/* Audio Transcription Language */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Audio Transcription Language
                </label>
                <select
                  value={settings.language.audioTranscriptionLanguage}
                  onChange={(e) => updateSettings({
                    language: { ...settings.language, audioTranscriptionLanguage: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {AUDIO_TRANSCRIPTION_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Language for voice input transcription
                </p>
              </div>

              {/* Voice Input Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-900">Enable Voice Input</label>
                  <p className="text-xs text-gray-600 mt-1">Speak your messages instead of typing</p>
                </div>
                <button
                  onClick={() => updateSettings({
                    voice: { ...settings.voice, enableInput: !settings.voice.enableInput }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.voice.enableInput ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.voice.enableInput ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Voice Output Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-900">Enable Voice Output</label>
                  <p className="text-xs text-gray-600 mt-1">AI can read responses aloud</p>
                </div>
                <button
                  onClick={() => updateSettings({
                    voice: { ...settings.voice, enableOutput: !settings.voice.enableOutput }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.voice.enableOutput ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.voice.enableOutput ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Voice Output Settings (only show if enabled) */}
              {settings.voice.enableOutput && (
                <div className="pl-4 border-l-2 border-blue-200 space-y-4">
                  {/* Voice Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Voice
                    </label>
                    <select
                      value={settings.voice.outputVoice}
                      onChange={(e) => updateSettings({
                        voice: { ...settings.voice, outputVoice: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Browser Default</option>
                      {availableVoices.map((voice, idx) => (
                        <option key={idx} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Speech Rate */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-900">
                        Speech Rate
                      </label>
                      <span className="text-sm text-gray-600">
                        {settings.voice.outputRate.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.voice.outputRate}
                      onChange={(e) => updateSettings({
                        voice: { ...settings.voice, outputRate: parseFloat(e.target.value) }
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      0.5x = Slow · 1.0x = Normal · 2.0x = Fast
                    </p>
                  </div>

                  {/* Speech Pitch */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-900">
                        Speech Pitch
                      </label>
                      <span className="text-sm text-gray-600">
                        {settings.voice.outputPitch.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.voice.outputPitch}
                      onChange={(e) => updateSettings({
                        voice: { ...settings.voice, outputPitch: parseFloat(e.target.value) }
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      0.5 = Low · 1.0 = Normal · 2.0 = High
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Storage Settings */}
          <section>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Storage Settings</h3>
            <p className="text-sm text-gray-600 mb-6">
              Configure how models are cached for faster subsequent loads
            </p>

            <div className="space-y-4">
              {/* Cache Large Models Toggle */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-900">Cache Large Models</label>
                  <p className="text-xs text-gray-600 mt-1">
                    Store models larger than 500MB in browser storage (uses ~3GB disk space but loads faster)
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSettings({
                      storage: {
                        ...settings.storage,
                        cacheLargeModels: !settings.storage.cacheLargeModels,
                      },
                    })
                  }
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.storage.cacheLargeModels ? 'bg-blue-600' : 'bg-gray-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.storage.cacheLargeModels ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">How caching works:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• <strong>Disabled</strong>: Models download each time but use less disk space</li>
                      <li>• <strong>Enabled</strong>: Models are stored locally for instant loading on subsequent uses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Function Calling */}
          <section>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Function Calling</h3>
            <p className="text-sm text-gray-600 mb-6">
              Enable AI to call functions (APIs, tools) when needed. Functions are automatically detected from your queries.
            </p>

            {/* Global Enable/Disable */}
            <div className="mb-6">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <span className="font-medium text-gray-900">Enable Function Calling</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Allow AI to detect and execute functions based on your queries
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.functions.enableFunctionCalling}
                  onChange={(e) => updateSettings({
                    functions: {
                      ...settings.functions,
                      enableFunctionCalling: e.target.checked,
                    },
                  })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            {/* Available Functions */}
            {settings.functions.enableFunctionCalling && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Available Functions</h4>
                <div className="space-y-3">
                  {functions.map((func) => (
                    <div
                      key={func.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium text-gray-900">{func.name}</h5>
                            {func.builtIn && (
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                                Built-in
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{func.description}</p>

                          {/* Parameters */}
                          {func.parameters.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-700">Parameters:</p>
                              {func.parameters.map((param) => (
                                <div key={param.name} className="text-xs text-gray-600 ml-2">
                                  <span className="font-mono text-gray-800">{param.name}</span>
                                  {' '}
                                  ({param.type})
                                  {param.required && <span className="text-red-600"> *</span>}
                                  {' - '}
                                  {param.description}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Toggle */}
                        <div className="ml-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.functions.availableFunctions.includes(func.id)}
                              onChange={(e) => {
                                const newFunctions = e.target.checked
                                  ? [...settings.functions.availableFunctions, func.id]
                                  : settings.functions.availableFunctions.filter(id => id !== func.id);

                                updateSettings({
                                  functions: {
                                    ...settings.functions,
                                    availableFunctions: newFunctions,
                                  },
                                });

                                // Update function service
                                functionService.toggleFunction(func.id, e.target.checked);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {functions.length === 0 && (
                  <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-xl">
                    No functions available. Add custom functions below.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Model Info */}
          {currentModel && (
            <section className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Current Model: {currentModel.name}
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Capabilities:</span>
                  <div className="mt-1 space-y-1">
                    {currentModel.capabilities.map(cap => (
                      <div key={cap} className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-gray-900 capitalize">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-gray-600">Details:</span>
                  <div className="mt-1 space-y-1 text-gray-900">
                    <div>Size: {(currentModel.size / 1024 / 1024 / 1024).toFixed(2)} GB</div>
                    <div>Format: {currentModel.url.endsWith('.litertlm') ? 'LiterTLM' : 'Task'}</div>
                    <div>Multimodal: {currentModel.capabilities.length > 1 ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  <strong>Note:</strong> Changing the model requires reloading the app. Your current conversation will be preserved.
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
