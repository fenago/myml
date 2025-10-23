/**
 * About Us Page
 * Your Private, Powerful, and Planet-Friendly AI Companion
 * @author Dr. Ernesto Lee
 */

import { motion } from 'framer-motion';

export function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="text-xl sm:text-2xl font-normal text-gray-900 hover:text-blue-600 transition-colors">
            MyML
          </a>
          <div className="flex gap-3 sm:gap-6 text-sm">
            <a href="/features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-light text-gray-900 mb-6 sm:mb-8 leading-tight">
            About Us: Your Private, Powerful, and Planet-Friendly AI Companion
          </h1>

          {/* Introduction */}
          <div className="prose prose-lg max-w-none mb-10 sm:mb-16">
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
              In an era where artificial intelligence is reshaping our world, <strong>Dr. Ernesto Lee</strong> believes that its power should be in the hands of everyone, not locked away in distant data centers controlled by corporations. Dr. Lee envisions a future where AI is a tool for empowerment, creativity, and connection—a future that is both technologically advanced and deeply human. This vision is the heart of <strong>MyML.app</strong>.
            </p>

            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
              Dr. Lee has created a unique platform that offers a safe and private space for you to explore the limitless potential of AI. MyML.app is built on the principle that you should have complete control over your data and your digital footprint. That's why the AI runs entirely on your device. Nothing is ever sent to the cloud, no one is monitoring your interactions, and your privacy is unconditionally protected. In a world where surveillance has become the norm, MyML.app stands as a beacon of digital freedom.
            </p>
          </div>

          {/* Mission Section */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-6 sm:mb-8">
              Our Mission: AI for Everyone, with Responsibility
            </h2>

            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8">
              Dr. Lee's mission is to democratize access to powerful AI tools while addressing the critical concerns of our time: privacy, environmental sustainability, and the digital divide. MyML.app is committed to providing an AI experience that is:
            </p>

            {/* Mission Points */}
            <div className="space-y-8 sm:space-y-10">
              {/* Private by Design */}
              <div className="bg-blue-50 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-4 flex items-center gap-3">
                  <span className="text-3xl">🔒</span>
                  Private by Design
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Your conversations and creations are yours alone. By running on your device, MyML.app eliminates the privacy risks associated with cloud-based AI. Your data never leaves your computer. There are no terms of service that grant corporations the right to analyze your thoughts, no algorithms tracking your behavior, and no surveillance infrastructure monitoring your every interaction. Dr. Lee built MyML.app on the belief that privacy is a fundamental human right, not a luxury or a premium feature. In an age where your data is constantly being harvested and monetized, MyML.app offers a sanctuary where you can think freely, create boldly, and explore without fear of being watched.
                </p>
              </div>

              {/* Environmentally Conscious */}
              <div className="bg-green-50 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-4 flex items-center gap-3">
                  <span className="text-3xl">🌍</span>
                  Environmentally Conscious
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  The massive data centers that power most AI applications consume vast amounts of energy, contributing to climate change and environmental destruction. These facilities require constant cooling, consume electricity equivalent to entire cities, and leave a carbon footprint that grows larger every day. By leveraging the power of your own device, MyML.app significantly reduces the carbon footprint of AI, making it a more sustainable technology for a healthier planet. Dr. Lee designed MyML.app with the understanding that technology should be part of the solution to our environmental crisis, not part of the problem. Every time you use MyML.app instead of a cloud-based service, you're making a choice that benefits the planet.
                </p>
              </div>

              {/* Bridging the Digital Divide */}
              <div className="bg-purple-50 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-4 flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  Bridging the Digital Divide
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Dr. Lee believes that everyone, regardless of their economic status or location, should have access to the benefits of AI. MyML.app is <strong>completely free to use</strong>, with no hidden costs, subscription fees, or token limits. There are no paywalls, no premium tiers, and no artificial restrictions on what you can do. It even works offline, making it accessible to those with limited or no internet connectivity. This commitment to universal access means that a student in a rural village has the same AI capabilities as a researcher at a prestigious university.
                </p>
              </div>
            </div>
          </section>

          {/* Technology Section */}
          <section className="mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-6 sm:mb-8">
              The Technology Behind the Vision
            </h2>

            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
              To make this vision a reality, Dr. Lee has built MyML.app on a foundation that leverages the latest breakthroughs in on-device artificial intelligence. The platform incorporates Google's Gemma 3 and Gemma 3n models, which represent significant advances in AI research and development. However, MyML.app is far more than just an implementation of these models—it is Dr. Lee's comprehensive platform that combines these foundational technologies with innovative optimizations, thoughtful design, and a commitment to serving humanity.
            </p>

            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
              The underlying models are incredibly powerful and remarkably efficient, allowing them to run smoothly on a wide range of devices—from high-end workstations to modest laptops and even mobile devices. Dr. Lee has optimized every aspect of the platform to ensure that powerful AI is accessible to everyone, regardless of their hardware.
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3 flex items-center gap-3">
                <span className="text-2xl">🌐</span>
                Supporting 140+ Languages
              </h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Dr. Lee designed MyML.app to serve the entire world, not just English speakers. The platform supports over 140 languages, ensuring that people from every corner of the globe can access AI in their native tongue. This linguistic diversity is essential for bridging the digital divide and ensuring that AI benefits all of humanity, not just a privileged few.
              </p>
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-6">
              Join Us in Building a Better Future with AI
            </h2>

            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8">
              Dr. Lee invites you to join this journey to create a more equitable, sustainable, and private future for artificial intelligence. By using MyML.app, you are not just exploring the frontiers of AI; you are also making a statement about the kind of digital world you want to live in.
            </p>

            <div className="space-y-4 text-left max-w-2xl mx-auto mb-8">
              <div className="flex items-start gap-3">
                <span className="text-xl">✓</span>
                <p className="text-sm sm:text-base text-gray-700">
                  <strong>If you care about privacy</strong>, MyML.app offers you complete control over your data and freedom from surveillance.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">✓</span>
                <p className="text-sm sm:text-base text-gray-700">
                  <strong>If you care about the environment</strong>, MyML.app allows you to use powerful AI while dramatically reducing your carbon footprint.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">✓</span>
                <p className="text-sm sm:text-base text-gray-700">
                  <strong>If you care about equality and access</strong>, MyML.app provides world-class AI tools to everyone, completely free.
                </p>
              </div>
            </div>

            <p className="text-base sm:text-lg text-gray-800 font-medium mb-6">
              Together, we can build a future where AI serves humanity, respects our values, and empowers us all.
            </p>

            <a
              href="/"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Start Using MyML
            </a>
          </section>

          {/* Footer Quote */}
          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-lg sm:text-xl text-gray-800 italic font-light">
              "MyML.app is more than just a platform—it's a movement toward a better, more just, and more sustainable relationship with technology."
            </p>
            <p className="text-sm text-gray-600 mt-3">— Dr. Ernesto Lee</p>
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
