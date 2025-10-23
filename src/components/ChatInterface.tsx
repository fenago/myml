/**
 * Chat Interface Component
 * Main chat UI with messages and input
 *
 * @author Dr. Ernesto Lee
 */

import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { TextShimmer } from './TextShimmer';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { ContextIndicator } from './microinteractions/ContextIndicator';
import { useKonamiCode } from '../hooks/useKonamiCode';
import { applyTheme, getThemeByCommand, getThemeById, resetTheme, loadSavedTheme } from '../config/themes';
import { MilestoneCelebration } from './MilestoneCelebration';

// Lazy load Settings for better initial load performance
const Settings = lazy(() => import('./Settings').then(m => ({ default: m.Settings })));
import { getModelConfig } from '../config/models';
import { exportService } from '../services/ExportService';
import type { MultimodalInput } from './ChatInput';

interface Props {
  onSendMessage: (input: MultimodalInput) => void;
  onChangeModel?: () => void;
}

export function ChatInterface({ onSendMessage }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentConversationId, conversations, isGenerating, currentModelId, settings, createConversation, addMessage, setCurrentConversation, forkConversation, updateConversationSummary } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [_currentTheme, setCurrentTheme] = useState<string | null>(null);
  const [showThemeNotification, setShowThemeNotification] = useState(false);
  const [themeNotificationText, setThemeNotificationText] = useState('');

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      description: 'Clear conversation',
      action: () => {
        const newConvId = createConversation(currentModelId);
        setCurrentConversation(newConvId);
      },
    },
    {
      key: '/',
      ctrl: true,
      description: 'Toggle settings',
      action: () => setShowSettings(prev => !prev),
    },
    {
      key: 'Escape',
      description: 'Close settings',
      action: () => setShowSettings(false),
    },
  ]);

  // Konami code easter egg - activates Matrix theme
  useKonamiCode(() => {
    if (settings.easterEggs.konamiCode) {
      const matrixTheme = getThemeById('matrix');
      if (matrixTheme) {
        applyTheme(matrixTheme);
        setCurrentTheme('matrix');
        setThemeNotificationText('🎮 Matrix Mode Activated! 🟢');
        setShowThemeNotification(true);
        setTimeout(() => setShowThemeNotification(false), 3000);
      }
    }
  });

  // Load saved theme on mount
  useEffect(() => {
    if (settings.easterEggs.hiddenThemes) {
      const savedTheme = loadSavedTheme();
      if (savedTheme) {
        setCurrentTheme(savedTheme.id);
      }
    }
  }, [settings.easterEggs.hiddenThemes]);

  // Handle theme commands in messages
  const handleThemeCommand = (text: string) => {
    if (!settings.easterEggs.hiddenThemes) return false;

    const theme = getThemeByCommand(text.toLowerCase().trim());
    if (theme) {
      applyTheme(theme);
      setCurrentTheme(theme.id);
      setThemeNotificationText(`🎨 ${theme.name} theme activated!`);
      setShowThemeNotification(true);
      setTimeout(() => setShowThemeNotification(false), 3000);
      return true;
    }

    // Reset theme command
    if (text.toLowerCase().trim() === '/reset') {
      resetTheme();
      setCurrentTheme(null);
      setThemeNotificationText('🔄 Theme reset to default');
      setShowThemeNotification(true);
      setTimeout(() => setShowThemeNotification(false), 3000);
      return true;
    }

    return false;
  };

  const currentConversation = currentConversationId
    ? conversations[currentConversationId]
    : null;

  const currentModel = getModelConfig(currentModelId);

  // Calculate token usage (rough estimate)
  const estimateTokens = (text: string): number => {
    // Simple estimation: ~1 token per 4 characters or 1 token per word (whichever is higher)
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    return Math.round(Math.max(words, chars / 4));
  };

  const contextLimit = 32000; // GEMMA 3n context window
  const tokensUsed = currentConversation
    ? currentConversation.messages.reduce((total, msg) => total + estimateTokens(msg.content), 0)
    : 0;

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages, isGenerating]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && !(event.target as Element).closest('.relative')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu]);

  // Handle conversation fork
  const handleForkConversation = (messageId: string) => {
    if (!currentConversationId) return;

    const messageCount = currentConversation?.messages.findIndex(m => m.id === messageId);
    if (messageCount === undefined || messageCount === -1) return;

    forkConversation(currentConversationId, messageId);
    alert(`✅ Conversation forked! Created new conversation with ${messageCount + 1} messages.`);
  };

  // Handle conversation summarization
  const handleSummarizeConversation = async () => {
    if (!currentConversationId || !currentConversation) return;

    const messagesToSummarize = currentConversation.summarizedUpTo
      ? currentConversation.messages.slice(currentConversation.summarizedUpTo, -5)
      : currentConversation.messages.slice(0, -5); // Keep last 5 messages unsummarized

    if (messagesToSummarize.length < 5) {
      alert('⚠️ Not enough messages to summarize. Need at least 10 messages.');
      return;
    }

    setIsSummarizing(true);

    try {
      // Build summarization prompt
      const conversationText = messagesToSummarize
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      const summaryPrompt = `Please provide a concise summary of the following conversation. Focus on key topics, decisions, and important information discussed:\n\n${conversationText}\n\nSummary:`;

      // Generate summary using inference engine
      const { inferenceEngine } = await import('../services/InferenceEngine');
      let summary = '';

      await inferenceEngine.generateStreaming(
        summaryPrompt,
        {
          maxTokens: 256,
          temperature: 0.5,
          topP: 0.9,
          streamTokens: true,
        },
        (chunk: string) => {
          summary += chunk;
        },
        settings.responseStyle.verbosity
      );

      // Update conversation with summary
      const summarizedUpTo = currentConversation.summarizedUpTo
        ? currentConversation.summarizedUpTo + messagesToSummarize.length
        : messagesToSummarize.length;

      const fullSummary = currentConversation.summary
        ? `${currentConversation.summary}\n\n**Update:** ${summary}`
        : summary;

      updateConversationSummary(currentConversationId, fullSummary, summarizedUpTo);
      alert(`✅ Conversation summarized! Summarized ${messagesToSummarize.length} messages.`);
    } catch (error) {
      console.error('Summarization error:', error);
      alert('❌ Failed to summarize conversation. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Handle conversation import
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      // Validate the imported conversation structure
      if (!importedData.id || !importedData.messages || !Array.isArray(importedData.messages)) {
        alert('❌ Invalid conversation file format. Please ensure you are importing a valid JSON export.');
        return;
      }

      // Create a new conversation with imported data
      const newConversationId = createConversation(importedData.modelId || currentModelId);

      // Add all imported messages
      importedData.messages.forEach((message: any) => {
        addMessage(newConversationId, {
          ...message,
          timestamp: new Date(message.timestamp),
        });
      });

      // Switch to the imported conversation
      setCurrentConversation(newConversationId);

      alert(`✅ Successfully imported conversation with ${importedData.messages.length} messages!`);
    } catch (error) {
      console.error('Import error:', error);
      alert('❌ Failed to import conversation. Please check the file format and try again.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border bg-card px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {settings.microinteractions.textShimmer ? (
            <TextShimmer as="h1" className="text-xl font-semibold" duration={2.5}>
              MyML
            </TextShimmer>
          ) : (
            <h1 className="text-xl font-semibold text-foreground">MyML</h1>
          )}
          <div className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground flex items-center gap-2">
            <span>{currentModel.icon}</span>
            <span>{currentModel.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden sm:flex gap-4 text-sm mr-4">
            <a href="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          </nav>

          {/* Hidden file input for import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />

          {/* Import Button */}
          <button
            onClick={handleImportClick}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted flex items-center gap-2"
            title="Import Conversation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Summarize Button - Show when conversation is long */}
          {currentConversation && currentConversation.messages.length >= 10 && (
            <button
              onClick={handleSummarizeConversation}
              disabled={isSummarizing}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted flex items-center gap-2 disabled:opacity-50"
              title="Summarize Conversation"
            >
              {isSummarizing ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              <span className="hidden sm:inline">{isSummarizing ? 'Summarizing...' : 'Summarize'}</span>
            </button>
          )}

          {/* Export Menu */}
          {currentConversation && currentConversation.messages.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted flex items-center gap-2"
                title="Export Conversation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Export</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      exportService.exportAsJSON(currentConversation);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 rounded-t-lg"
                  >
                    <span>📄</span>
                    <span>Export as JSON</span>
                  </button>
                  <button
                    onClick={() => {
                      exportService.exportAsMarkdown(currentConversation);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <span>📝</span>
                    <span>Export as Markdown</span>
                  </button>
                  <button
                    onClick={() => {
                      exportService.exportAsText(currentConversation);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <span>📋</span>
                    <span>Export as Text</span>
                  </button>
                  <button
                    onClick={() => {
                      exportService.exportAsHTML(currentConversation);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 rounded-b-lg"
                  >
                    <span>🌐</span>
                    <span>Export as HTML</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Context Indicator - Enhanced with animations */}
          <ContextIndicator tokensUsed={tokensUsed} contextLimit={contextLimit} />

          <button
            onClick={() => setShowSettings(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted flex items-center gap-2"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Settings</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Ready</span>
          </div>
        </div>
      </motion.header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {currentConversation && currentConversation.messages.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            {/* Summary Section */}
            {currentConversation.summary && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setShowSummary(!showSummary)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      Conversation Summary ({currentConversation.summarizedUpTo} messages)
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-blue-600 transition-transform ${showSummary ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showSummary && (
                  <div className="px-4 py-3 border-t border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed whitespace-pre-wrap">
                      {currentConversation.summary}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Messages */}
            {currentConversation.messages.map((message) => (
              <ChatMessage key={message.id} message={message} onFork={handleForkConversation} />
            ))}
            {isGenerating && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                Start a conversation
              </h3>
              <p className="text-muted-foreground">
                Ask me anything! I'm running entirely in your browser with zero data transmission.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={(input) => {
          // Check for theme commands before sending
          if (input.text && handleThemeCommand(input.text)) {
            // Theme command was handled, don't send message
            return;
          }
          // Regular message
          onSendMessage(input);
        }}
        disabled={isGenerating}
        supportMultimodal={currentModel.capabilities.length > 1}
        placeholder={
          isGenerating ? 'Please wait...' : 'Ask anything... (100% private)'
        }
      />

      {/* Attribution */}
      <div className="text-center py-3 text-xs text-muted-foreground">
        Created by{' '}
        <a
          href="https://drlee.io"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:underline"
        >
          Dr. Ernesto Lee
        </a>
        {' · '}
        <span>All processing happens in your browser</span>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"><div className="text-white">Loading settings...</div></div>}>
          <Settings onClose={() => setShowSettings(false)} />
        </Suspense>
      )}

      {/* Theme Notification Toast */}
      <AnimatePresence>
        {showThemeNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                ✨
              </motion.div>
              <span className="font-medium">{themeNotificationText}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone Celebration */}
      {settings.easterEggs.messageMilestones && currentConversation && (
        <MilestoneCelebration messageCount={currentConversation.messages.length} />
      )}
    </div>
  );
}
