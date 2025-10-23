/**
 * Settings Page
 * Model selection and parameter configuration
 * @author Dr. Ernesto Lee
 */

import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getAvailableModels, type ModelId } from '../config/models';

interface Props {
  onClose: () => void;
}

export function Settings({ onClose }: Props) {
  const { currentModelId, setCurrentModel, settings, updateSettings } = useStore();
  const models = getAvailableModels();
  const currentModel = models.find(m => m.id === currentModelId);

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
