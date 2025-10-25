/**
 * Landing Page - Simple Google-style aesthetic
 * MyML.app by Dr. Ernesto Lee
 */

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { TextShimmer } from './TextShimmer';
import { getAvailableModels } from '../config/models';
import type { ModelId } from '../config/models';
import { easterEggService } from '../services/EasterEggService';

export function LandingPage({ onStartChat }: { onStartChat: () => void }) {
  const { settings, currentModelId, setCurrentModel } = useStore();
  const availableModels = getAvailableModels();
  const greeting = easterEggService.getTimeBasedGreeting();

  // Detect mobile and auto-select CAESAR (smaller, works on all devices)
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const screenWidth = window.innerWidth;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent) || screenWidth < 768;

    console.log('🔍 Device Detection:');
    console.log('   User Agent:', userAgent);
    console.log('   Screen Width:', screenWidth);
    console.log('   Is Mobile:', isMobile);
    console.log('   Current Model:', currentModelId);

    // Only auto-switch on first load
    if (isMobile && currentModelId !== 'gemma270m') {
      console.log('📱 Mobile device detected - auto-selecting CAESAR 270M');
      setCurrentModel('gemma270m');
    } else if (!isMobile) {
      console.log('💻 Desktop device detected - MADDY E2B selected by default');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

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
            {greeting}! What's on your mind?
          </TextShimmer>
        ) : (
          <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
            {greeting}! What's on your mind?
          </h2>
        )}
        <p className="text-base text-gray-600">
          Ask anything and experience AI that respects your privacy
        </p>
      </motion.div>

      {/* Model Selector - Minimal Google Style */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mb-8 flex flex-col items-center gap-3"
      >
        <p className="text-xs text-gray-500">Model</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {availableModels.map((model) => (
            <button
              key={model.id}
              onClick={() => setCurrentModel(model.id as ModelId)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${currentModelId === model.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {model.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          {availableModels.find(m => m.id === currentModelId)?.description}
        </p>
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
        <p className="mt-2 text-xs text-gray-400">v0.11.5</p>
      </motion.footer>
      </div>
    </div>
  );
}
