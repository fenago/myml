/**
 * Features Page
 * Experience the Power of On-Device AI
 * @author Dr. Ernesto Lee
 */

import { motion } from 'framer-motion';

export function Features() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="text-xl sm:text-2xl font-normal text-gray-900 hover:text-blue-600 transition-colors">
            MyML
          </a>
          <div className="flex gap-3 sm:gap-6 text-sm">
            <a href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
            <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-light text-gray-900 mb-6 sm:mb-8 leading-tight">
            Features: Experience the Power of On-Device AI
          </h1>

          {/* Introduction */}
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-12 sm:mb-16">
            <strong>MyML.app</strong> by <strong>Dr. Ernesto Lee</strong> brings the most advanced on-device AI technology to your fingertips. Built on a foundation that leverages Google's Gemma 3 and Gemma 3n models, Dr. Lee has created a comprehensive platform that combines cutting-edge performance with absolute privacy, environmental responsibility, and universal accessibility.
          </p>

          {/* Features Grid */}
          <div className="space-y-12 sm:space-y-16">
            {/* Multimodal Intelligence */}
            <section className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl sm:text-5xl">🎨</span>
                <h2 className="text-2xl sm:text-3xl font-light text-gray-900">
                  Multimodal Intelligence: See, Hear, and Understand
                </h2>
              </div>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8">
                Modern AI should understand the world as you do—through multiple senses. MyML.app delivers true multimodal capabilities, allowing you to interact with AI using text, images, audio, and video.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">📸 Image Understanding</h3>
                  <p className="text-sm text-gray-700">
                    Upload images for interpretation, object identification, text extraction, or detailed descriptions. Handle hundreds of images in a single conversation—all privately on your device.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">🎤 Audio Processing</h3>
                  <p className="text-sm text-gray-700">
                    Process sound data for speech recognition, real-time transcription, language translation, and audio analysis. Your voice stays completely private.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">🎬 Video Analysis</h3>
                  <p className="text-sm text-gray-700">
                    Process video content, understand motion and context. Your videos never leave your device, protecting your privacy completely.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">🔗 Combined Understanding</h3>
                  <p className="text-sm text-gray-700">
                    Upload an image, ask about it in text, receive a spoken response. This integrated approach mirrors how humans actually communicate.
                  </p>
                </div>
              </div>
            </section>

            {/* Massive Context Windows */}
            <section className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl sm:text-5xl">📚</span>
                <h2 className="text-2xl sm:text-3xl font-light text-gray-900">
                  Massive Context Windows: Think Bigger, Go Deeper
                </h2>
              </div>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                MyML.app leverages extraordinary context windows of up to <strong>128,000 tokens</strong>—sixteen times larger than previous generations. Process multiple articles, entire documents, or hundreds of images in a single conversation without losing the thread.
              </p>

              <div className="bg-white rounded-xl p-6">
                <ul className="space-y-3 text-sm sm:text-base text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Analyze lengthy research papers and compare multiple documents side-by-side</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Work with extensive codebases while maintaining context</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Maintain complex conversations spanning thousands of words</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Mobile devices get 32,000-token windows for optimal performance</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Multilingual Mastery */}
            <section className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl sm:text-5xl">🌍</span>
                <h2 className="text-2xl sm:text-3xl font-light text-gray-900">
                  Multilingual Mastery: Speak the Language of the World
                </h2>
              </div>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                Language should never be a barrier to accessing AI. MyML.app supports <strong>over 140 languages</strong>, making it one of the most linguistically diverse AI platforms available.
              </p>

              <div className="bg-white rounded-xl p-6">
                <p className="text-sm sm:text-base text-gray-700 mb-4">
                  This multilingual capability is particularly important for <strong>bridging the digital divide</strong>. Communities that have been underserved by AI technology can now access powerful tools in their own languages.
                </p>
                <p className="text-sm sm:text-base text-gray-700">
                  The AI doesn't just translate words—it truly understands cultural context and linguistic nuances, making it valuable for translation, language learning, and global collaboration.
                </p>
              </div>
            </section>

            {/* Flexible Model Sizes */}
            <section className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl sm:text-5xl">⚡</span>
                <h2 className="text-2xl sm:text-3xl font-light text-gray-900">
                  Flexible Model Sizes: Choose Your Power Level
                </h2>
              </div>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                Not every task requires the same computational power. MyML.app offers multiple model sizes to match your needs and hardware.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Standard Models</h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li><strong>270M & 1B:</strong> Ultra-lightweight for basic tasks</li>
                    <li><strong>4B:</strong> Balanced multimodal capabilities</li>
                    <li><strong>12B:</strong> Advanced performance for complex work</li>
                    <li><strong>27B:</strong> State-of-the-art quality</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile-Optimized</h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li><strong>E2B:</strong> Optimized for mobile devices & laptops</li>
                    <li><strong>E4B:</strong> Enhanced for devices with more resources</li>
                    <li><strong>Quantization:</strong> 16-bit, 8-bit, or 4-bit precision</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Advanced Optimization */}
            <section className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl sm:text-5xl">🚀</span>
                <h2 className="text-2xl sm:text-3xl font-light text-gray-900">
                  Advanced On-Device Optimization
                </h2>
              </div>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                MyML.app introduces groundbreaking technologies that make powerful AI accessible on everyday devices.
              </p>

              <div className="space-y-4">
                <div className="bg-white rounded-xl p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Per-Layer Embedding (PLE) Caching</h3>
                  <p className="text-sm text-gray-700">
                    Caches parameters to fast storage, reducing active memory footprint by 60% while maintaining quality.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">MatFormer Architecture</h3>
                  <p className="text-sm text-gray-700">
                    Nested sub-models within a larger model. Activate only the parameters you need, reducing compute costs and energy consumption.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Conditional Parameter Loading</h3>
                  <p className="text-sm text-gray-700">
                    Load only the parameters you need. Text-only? Skip audio/visual parameters to save memory.
                  </p>
                </div>
              </div>
            </section>

            {/* Privacy & Offline */}
            <section className="bg-gradient-to-br from-red-50 to-pink-100 rounded-3xl p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl sm:text-5xl">🔒</span>
                <h2 className="text-2xl sm:text-3xl font-light text-gray-900">
                  Privacy-First, Offline-Ready
                </h2>
              </div>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                <strong>Privacy is not a feature—it's the foundation of MyML.app.</strong> Every computation happens on your device. Your conversations, images, audio, and data never leave your computer.
              </p>

              <div className="bg-white rounded-xl p-6 mb-6">
                <p className="text-sm sm:text-base text-gray-700 mb-3">
                  No servers logging your activity, no third parties analyzing your behavior, and no hidden data collection. Your data belongs to you, and you alone.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">✈️ Offline Capability</h3>
                <p className="text-sm sm:text-base text-gray-700">
                  Everything runs locally—no internet connection needed. Perfect for travel, limited connectivity areas, or situations where network access is restricted.
                </p>
              </div>
            </section>

            {/* Zero Cost */}
            <section className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-3xl p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl sm:text-5xl">💰</span>
                <h2 className="text-2xl sm:text-3xl font-light text-gray-900">
                  Zero Cost, Unlimited Potential
                </h2>
              </div>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                <strong>MyML.app is completely free to use.</strong> Dr. Lee believes that powerful AI should be accessible to everyone, not just those who can afford expensive subscriptions.
              </p>

              <div className="bg-white rounded-xl p-6">
                <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600 font-bold">✓</span>
                    <span>No hidden costs or subscription fees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600 font-bold">✓</span>
                    <span>No token limits or usage caps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600 font-bold">✓</span>
                    <span>Unlimited conversations and image processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600 font-bold">✓</span>
                    <span>AI that serves people, not profits</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Environmental */}
            <section className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-3xl p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl sm:text-5xl">🌱</span>
                <h2 className="text-2xl sm:text-3xl font-light text-gray-900">
                  Environmental Responsibility
                </h2>
              </div>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                Every query to a cloud-based AI service consumes energy in distant data centers. By running AI on your device, MyML.app dramatically reduces the carbon footprint of your AI usage.
              </p>

              <div className="bg-white rounded-xl p-6">
                <p className="text-sm sm:text-base text-gray-700 mb-3">
                  Dr. Lee designed MyML.app with environmental sustainability as a core principle. AI should solve global challenges like climate change, not contribute to them.
                </p>
                <p className="text-sm sm:text-base text-gray-700 font-medium">
                  Every conversation you have with MyML.app is a small act of environmental responsibility.
                </p>
              </div>
            </section>
          </div>

          {/* Closing Statement */}
          <div className="mt-16 sm:mt-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 sm:p-12 text-center">
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed mb-6">
              MyML.app's features represent more than just technical capabilities—they embody <strong>Dr. Ernesto Lee's vision</strong> of AI as a tool for empowerment, privacy, environmental stewardship, and universal access.
            </p>
            <a
              href="/"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Start Using MyML
            </a>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-4 sm:px-6 py-8 mt-12 sm:mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-600 mb-3">
            Created by{' '}
            <a
              href="https://drlee.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline"
            >
              Dr. Ernesto Lee
            </a>
          </p>
          <p className="text-xs text-gray-500">
            100% Private · 100% Free · 100% On-Device
          </p>
        </div>
      </footer>
    </div>
  );
}
