/**
 * Landing Page - Modern design with aurora backgrounds and glassmorphism
 * Inspired by 21st.dev and Magic UI
 * @author Dr. Ernesto Lee
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getAvailableModels } from '../config/models';
import { useStore } from '../store/useStore';
import { AuroraBackground } from './AuroraBackground';

export function LandingPageNew({ onStartChat }: { onStartChat: () => void }) {
  const [selectedModel, setSelectedModel] = useState('gemma270m');
  const { setCurrentModel } = useStore();
  const models = getAvailableModels();

  const handleModelSelect = (modelId: string) => {
    console.log(`🎯 Model selected: ${modelId}`);
    setSelectedModel(modelId);
    setCurrentModel(modelId as any);
  };

  return (
    <AuroraBackground>
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-4xl"
        >
          {/* Logo/Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-white/90">
              100% Private · Zero Data Transmission
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight"
          >
            BrowserGPT
          </motion.h1>

          {/* Gradient Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
          >
            AI that runs entirely in your browser
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto"
          >
            Privacy-first conversations powered by GEMMA models.
            No servers, no tracking, no compromises.
          </motion.p>
        </motion.div>

        {/* Model Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full max-w-5xl mb-12"
        >
          <h2 className="text-xl font-semibold text-white/90 mb-6 text-center">
            Choose your model
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {models.map((model, index) => (
              <motion.button
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                onClick={() => handleModelSelect(model.id)}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  group relative p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300
                  ${
                    selectedModel === model.id
                      ? 'bg-white/20 border-white/40 shadow-2xl shadow-purple-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                `}
              >
                {/* Glow effect for selected */}
                {selectedModel === model.id && (
                  <motion.div
                    layoutId="selectedGlow"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div className="relative">
                  {/* Icon */}
                  <div className="text-5xl mb-4">{model.icon}</div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {model.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-white/60 mb-4 min-h-[40px]">
                    {model.description}
                  </p>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-2">
                    {model.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/70 border border-white/20"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>

                  {/* Selected indicator */}
                  {selectedModel === model.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </motion.div>
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
          transition={{ delay: 0.9, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartChat}
          className="group relative px-12 py-5 rounded-2xl font-semibold text-lg text-white overflow-hidden"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-transform group-hover:scale-105" />

          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          </div>

          <span className="relative flex items-center gap-3">
            Start Chat
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </span>
        </motion.button>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-24"
        >
          {[
            {
              icon: '🔒',
              title: 'Total Privacy',
              description: 'All processing happens locally. Your conversations never leave your device.',
            },
            {
              icon: '⚡',
              title: 'Blazing Fast',
              description: 'WebGPU acceleration for instant responses. No API delays.',
            },
            {
              icon: '🚀',
              title: 'Always Free',
              description: 'No subscriptions, no usage limits. Unlimited conversations forever.',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-white/60">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-24 text-center text-sm text-white/40"
        >
          <p>
            Created by{' '}
            <a
              href="https://drlee.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors underline decoration-white/20 hover:decoration-white/60"
            >
              Dr. Ernesto Lee
            </a>
          </p>
          <p className="mt-2">
            Powered by Google GEMMA · MediaPipe · WebGPU
          </p>
        </motion.footer>
      </div>
    </AuroraBackground>
  );
}
