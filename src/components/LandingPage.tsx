/**
 * Landing Page - Simple Google-style aesthetic
 * MyML.app by Dr. Ernesto Lee
 */

import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { TextShimmer } from './TextShimmer';
import { getAvailableModels } from '../config/models';
import type { ModelId } from '../config/models';

export function LandingPage({ onStartChat }: { onStartChat: () => void }) {
  const { settings, currentModelId, setCurrentModel } = useStore();
  const availableModels = getAvailableModels();

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      {/* Navigation */}
      <header className="w-full border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xl sm:text-2xl font-normal text-gray-900">MyML</span>
          <nav className="flex gap-4 sm:gap-6 text-sm">
            <a href="/features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
      {/* Logo / Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-16 text-center"
      >
        {settings.microinteractions.textShimmer ? (
          <TextShimmer as="h1" className="text-6xl md:text-7xl font-normal mb-4 tracking-tight">
            MyML
          </TextShimmer>
        ) : (
          <h1 className="text-6xl md:text-7xl font-normal text-gray-900 mb-4 tracking-tight">
            MyML
          </h1>
        )}
        <p className="text-xl text-gray-600">
          Privacy-first AI that runs entirely in your browser
        </p>
        <p className="text-sm text-gray-500 mt-2">
          by <a href="https://drlee.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Dr. Ernesto Lee</a>
        </p>
      </motion.div>

      {/* Main Prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-12 text-center max-w-2xl"
      >
        {settings.microinteractions.textShimmer ? (
          <TextShimmer as="h2" className="text-3xl md:text-4xl font-light mb-4" duration={3}>
            What's on your mind?
          </TextShimmer>
        ) : (
          <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
            What's on your mind?
          </h2>
        )}
        <p className="text-base text-gray-600">
          Ask anything and experience AI that respects your privacy
        </p>
      </motion.div>

      {/* Model Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mb-8 w-full max-w-3xl"
      >
        <p className="text-sm text-gray-600 mb-3 text-center">Choose your AI model:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableModels.map((model) => (
            <motion.button
              key={model.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentModel(model.id as ModelId)}
              className={`
                p-4 rounded-2xl border-2 text-left transition-all duration-200
                ${currentModelId === model.id
                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{model.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base mb-1">{model.name}</h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{model.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {(model.capabilities as readonly string[]).includes('text') && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Text</span>
                    )}
                    {(model.capabilities as readonly string[]).includes('vision') && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">Vision</span>
                    )}
                    {(model.capabilities as readonly string[]).includes('audio') && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Audio</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {(model.size / 1024 / 1024 / 1024).toFixed(1)} GB
                  </p>
                </div>
                {currentModelId === model.id && (
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStartChat}
        className="
          px-10 py-4 rounded-full
          bg-blue-600 text-white
          font-medium text-base
          shadow-md hover:shadow-lg hover:bg-blue-700
          transition-all duration-200
        "
      >
        Start Chat
      </motion.button>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full"
      >
        <div className="text-center">
          <div className="text-3xl mb-3">🔒</div>
          <h4 className="font-medium text-gray-900 mb-2">100% Private</h4>
          <p className="text-sm text-gray-600">
            All processing happens in your browser. Zero data transmission.
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-3">⚡</div>
          <h4 className="font-medium text-gray-900 mb-2">Fast & Free</h4>
          <p className="text-sm text-gray-600">
            No API costs, no usage limits. Unlimited conversations.
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-3">🌍</div>
          <h4 className="font-medium text-gray-900 mb-2">Planet-Friendly</h4>
          <p className="text-sm text-gray-600">
            On-device AI reduces carbon footprint by 95%.
          </p>
        </div>
      </motion.div>

      {/* Footer Links */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-16 text-center text-sm text-gray-500"
      >
        <p className="mt-4">Powered by GEMMA models · MediaPipe · WebGPU</p>
      </motion.footer>
      </div>
    </div>
  );
}
