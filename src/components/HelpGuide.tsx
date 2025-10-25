/**
 * Help & Feature Guide Component
 * Comprehensive guide to all features and keyboard shortcuts
 * @author Dr. Ernesto Lee
 */

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  onClose: () => void;
}

type TabType = 'features' | 'shortcuts' | 'tips' | 'install';

export function HelpGuide({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('features');

  const features = [
    {
      category: 'Core Features',
      items: [
        {
          name: 'Model Dashboard',
          icon: '📊',
          description: 'View model performance stats, memory usage, and system info',
          location: 'Dashboard button in header',
        },
        {
          name: 'Settings',
          icon: '⚙️',
          description: 'Customize model, response style, multimodal options, and more',
          location: 'Settings button in header',
        },
        {
          name: 'Import/Export',
          icon: '💾',
          description: 'Import conversations or export as JSON, Markdown, Text, or HTML',
          location: 'Import/Export buttons in header',
        },
        {
          name: 'Conversation Summary',
          icon: '📝',
          description: 'Auto-generate summaries of long conversations (10+ messages)',
          location: 'Summarize button in header',
        },
      ],
    },
    {
      category: 'Message Management',
      items: [
        {
          name: 'Pin Messages',
          icon: '📌',
          description: 'Pin important messages for quick access',
          location: 'Pin icon on each message',
        },
        {
          name: 'Message Search',
          icon: '🔍',
          description: 'Search through all messages with fuzzy matching',
          location: 'Search box above messages',
        },
        {
          name: 'Fork Conversation',
          icon: '🔀',
          description: 'Create a new conversation branch from any message',
          location: 'Fork icon on each message',
        },
        {
          name: 'Copy Message',
          icon: '📋',
          description: 'Copy message content to clipboard',
          location: 'Copy icon on each message',
        },
      ],
    },
    {
      category: 'Multimodal Input',
      items: [
        {
          name: 'Image Upload',
          icon: '🖼️',
          description: 'Upload images for visual Q&A and analysis',
          location: 'Attach button → Image',
        },
        {
          name: 'Audio Upload',
          icon: '🎵',
          description: 'Transcribe, translate, or analyze audio files',
          location: 'Attach button → Audio',
        },
        {
          name: 'Video Upload',
          icon: '🎬',
          description: 'Analyze videos, extract scenes, answer questions',
          location: 'Attach button → Video',
        },
        {
          name: 'Voice Input',
          icon: '🎤',
          description: 'Speak your questions using voice recognition',
          location: 'Microphone button in input',
        },
        {
          name: 'Camera Capture',
          icon: '📸',
          description: 'Take photos directly from your webcam',
          location: 'Attach button → Camera',
        },
        {
          name: 'Screen Capture',
          icon: '🖥️',
          description: 'Capture screenshots for analysis',
          location: 'Attach button → Screen',
        },
      ],
    },
    {
      category: 'Advanced Features',
      items: [
        {
          name: 'System Prompts & Personas',
          icon: '🎭',
          description: '15 AI personalities or create custom system prompts',
          location: 'Settings → Model → System Prompts',
        },
        {
          name: 'Structured Output',
          icon: '📐',
          description: 'Generate JSON, XML, CSV, or table-formatted responses',
          location: 'Settings → Advanced → Structured Output',
        },
        {
          name: 'Safety & Content Filtering',
          icon: '🛡️',
          description: 'Filter inappropriate content with customizable rules',
          location: 'Settings → Advanced → Safety Settings',
        },
        {
          name: 'Function Calling',
          icon: '🔧',
          description: 'Execute predefined functions (time, calculate, etc.)',
          location: 'Settings → Advanced → Function Calling',
        },
        {
          name: 'Response Verbosity',
          icon: '💬',
          description: 'Control response length: Concise, Balanced, or Detailed',
          location: 'Settings → Model → Response Style',
        },
      ],
    },
  ];

  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['Ctrl', 'K'], description: 'Clear conversation and start new' },
        { keys: ['Ctrl', '/'], description: 'Toggle Settings' },
        { keys: ['Ctrl', 'H'], description: 'Show Help & Features (this guide)' },
        { keys: ['Escape'], description: 'Close Settings or modals' },
      ],
    },
    {
      category: 'Input',
      items: [
        { keys: ['Enter'], description: 'Send message' },
        { keys: ['Shift', 'Enter'], description: 'New line in message' },
      ],
    },
  ];

  const tips = [
    {
      category: 'Privacy & Performance',
      items: [
        '🔒 All AI processing happens 100% in your browser - no data is sent to external servers',
        '⚡ First response may be slower as the model initializes',
        '💾 Enable model caching in Settings → Storage for faster loading on subsequent visits',
        '🧠 Memory usage varies by device - check Model Dashboard for real-time stats',
      ],
    },
    {
      category: 'Best Practices',
      items: [
        '📏 Keep conversations under 32,000 tokens for best performance',
        '🎯 Use System Prompts to customize AI behavior for specific tasks',
        '🖼️ Lower image resolution in Settings → Vision if experiencing performance issues',
        '📹 Video analysis extracts key frames - longer videos take more time',
        '🔍 Use Message Search to quickly find information in long conversations',
      ],
    },
    {
      category: 'Hidden Features',
      items: [
        '🎮 Type the Konami Code (↑↑↓↓←→←→BA) for a secret theme',
        '🎨 Try typing theme commands: /matrix, /cyberpunk, /ocean, /sunset, /forest',
        '🎉 Milestone celebrations appear at 10, 25, 50, 100+ messages',
        '🔄 Type /reset to restore default theme',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Help & Features</h2>
              <p className="text-sm text-blue-100">Your guide to BrowserGPT</p>
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

        {/* Tabs */}
        <div className="border-b border-border bg-muted/50 px-6">
          <div className="flex gap-6">
            {[
              { id: 'features' as TabType, label: 'Features', icon: '✨' },
              { id: 'shortcuts' as TabType, label: 'Shortcuts', icon: '⌨️' },
              { id: 'tips' as TabType, label: 'Tips & Tricks', icon: '💡' },
              { id: 'install' as TabType, label: 'Install as App', icon: '📱' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                {features.map((section, idx) => (
                  <div key={idx}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {section.category}
                    </h3>
                    <div className="grid gap-3">
                      {section.items.map((feature, fIdx) => (
                        <div
                          key={fIdx}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{feature.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                {feature.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {feature.description}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                📍 {feature.location}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Shortcuts Tab */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-6">
                {shortcuts.map((section, idx) => (
                  <div key={idx}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {section.category}
                    </h3>
                    <div className="space-y-2">
                      {section.items.map((shortcut, sIdx) => (
                        <div
                          key={sIdx}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-2">
                            {shortcut.keys.map((key, kIdx) => (
                              <span key={kIdx} className="flex items-center gap-1">
                                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                                  {key}
                                </kbd>
                                {kIdx < shortcut.keys.length - 1 && (
                                  <span className="text-gray-400">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tips Tab */}
            {activeTab === 'tips' && (
              <div className="space-y-6">
                {tips.map((section, idx) => (
                  <div key={idx}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {section.category}
                    </h3>
                    <div className="space-y-2">
                      {section.items.map((tip, tIdx) => (
                        <div
                          key={tIdx}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-start gap-3"
                        >
                          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {tip}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Install Tab */}
            {activeTab === 'install' && (
              <div className="space-y-6">
                {/* What is PWA */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">📱</span>
                    Install MyML as a Native App
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    MyML is a Progressive Web App (PWA) that can be installed on your device and run like a native application - no app store needed!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Works offline</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>100% private</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Faster launch</span>
                    </div>
                  </div>
                </div>

                {/* Windows */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">🪟</span>
                    Windows (Chrome, Edge)
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Method 1:</strong> Look for the install icon (⊕) in the address bar → Click "Install MyML"
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Method 2:</strong> Click browser menu (⋮) → "Install MyML" or "Apps" → "Install this site as an app"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      The app will appear in your Start Menu and Desktop
                    </p>
                  </div>
                </div>

                {/* macOS */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">🍎</span>
                    macOS (Safari, Chrome, Edge)
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Safari:</strong> Click Share button → "Add to Dock"
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Chrome/Edge:</strong> Look for install icon (⊕) in address bar or Menu → "Install MyML"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      The app will appear in your Dock and Applications folder
                    </p>
                  </div>
                </div>

                {/* Linux */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">🐧</span>
                    Linux (Chrome, Firefox, Edge)
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Chrome/Edge:</strong> Look for install icon (⊕) in address bar → "Install MyML"
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Firefox:</strong> Click menu (☰) → "Install MyML"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      The app will appear in your application launcher
                    </p>
                  </div>
                </div>

                {/* iOS */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    iOS (iPhone & iPad)
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Safari only:</strong> Tap Share button (square with arrow) → "Add to Home Screen" → "Add"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      The app icon will appear on your home screen and run full-screen like a native iOS app
                    </p>
                  </div>
                </div>

                {/* Android */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    Android
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Chrome:</strong> Tap "Install app" banner at bottom or Menu (⋮) → "Install app"
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Firefox:</strong> Tap "Add to Home Screen" when prompted or Menu → "Install"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      The app will appear in your app drawer and run like a native Android app
                    </p>
                  </div>
                </div>

                {/* ChromeOS */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">💻</span>
                    ChromeOS
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Click install icon (⊕) in address bar or Menu (⋮) → "Install MyML"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      The app will appear in your app launcher shelf
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    ✨ Benefits of Installing
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span><strong>Standalone window</strong> - No browser UI, looks like a native app</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span><strong>Faster launch</strong> - Cached files load instantly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span><strong>Works offline</strong> - Service worker caches everything</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span><strong>App shortcuts</strong> - Right-click icon for quick actions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span><strong>Still 100% private</strong> - All AI runs locally on your device</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 bg-muted/50">
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Need more help? Check out the{' '}
            <a href="/features" className="text-blue-600 hover:underline">
              Features
            </a>{' '}
            and{' '}
            <a href="/about" className="text-blue-600 hover:underline">
              About
            </a>{' '}
            pages
          </p>
        </div>
      </motion.div>
    </div>
  );
}
