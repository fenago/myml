/**
 * Main App Component
 * Handles model loading, app state, and routing
 *
 * @author Dr. Ernesto Lee
 */

import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { ModelLoadProgress } from './components/ModelLoadProgress';
import { About } from './components/About';
import { Features } from './components/Features';
import { Particles } from './components/Particles';
import { Analytics } from './components/Analytics';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { useStore } from './store/useStore';
import { modelLoader } from './services/ModelLoader';
import { inferenceEngine } from './services/InferenceEngine';
import { AudioService } from './services/AudioService';
import { VideoService } from './services/VideoService';
import { functionService } from './services/FunctionService';
import { videoProcessingService } from './services/VideoProcessingService';
import { languageDetectionService } from './services/LanguageDetectionService';
import { analyticsService } from './services/AnalyticsService';
import { easterEggService } from './services/EasterEggService';
import { gamificationService } from './services/GamificationService';
import { SystemInfoService } from './services/SystemInfoService';
import { getModelConfig } from './config/models';
import type { Message } from './types';
import type { MultimodalInput } from './components/ChatInput';
import { formatFunctionResult } from './utils/formatFunctionResult';

// Create audio and video service instances
const audioService = new AudioService(inferenceEngine);
const videoService = new VideoService(inferenceEngine);

export function App() {
  const [showChat, setShowChat] = useState(false);

  const {
    currentModelId,
    modelStatus,
    loadProgress,
    setModelStatus,
    setLoadProgress,
    currentConversationId,
    createConversation,
    addMessage,
    updateMessage,
    setIsGenerating,
    settings,
    analyticsOpen,
    toggleAnalytics,
    setSystemInfo,
  } = useStore();

  /**
   * Register Service Worker for PWA functionality
   */
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  /**
   * Collect system information on app initialization
   */
  useEffect(() => {
    const collectSystemInfo = async () => {
      const info = await SystemInfoService.collect();
      setSystemInfo(info);
      console.log('✅ System info collected and stored');
    };

    collectSystemInfo();
  }, [setSystemInfo]);

  /**
   * Reset to landing page
   */
  const handleChangeModel = () => {
    setShowChat(false);
    setModelStatus('not-loaded');
    setLoadProgress(null);
  };

  /**
   * Load model when starting chat (with automatic fallback to CAESAR)
   */
  const handleStartChat = async () => {
    console.log(`📋 Starting chat with model ID: ${currentModelId}`);
    const config = getModelConfig(currentModelId);
    console.log(`📋 Model config loaded: ${config.name} (${config.id})`);

    try {
      setModelStatus('downloading');

      // Load model with progress tracking
      await modelLoader.loadModel(
        config,
        (progress) => {
          setLoadProgress(progress);
        },
        settings.storage.cacheLargeModels
      );

      // Keep showing loading screen during MediaPipe initialization
      setModelStatus('loading');
      console.log('🔄 Initializing MediaPipe inference engine...');

      // Initialize inference engine (this is where MediaPipe downloads large models)
      await inferenceEngine.initialize(config);

      setModelStatus('loaded');
      setShowChat(true);

      // Create first conversation
      createConversation(currentModelId);
    } catch (error) {
      console.error('Failed to load model:', error);
      setModelStatus('not-loaded');
      setLoadProgress(null);

      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Auto-fallback to CAESAR if not already using it
      if (currentModelId !== 'gemma270m') {
        const shouldFallback = window.confirm(
          `❌ Failed to load model: ${config.name}\n\n` +
          `Error: ${errorMessage}\n\n` +
          `\n📱 Auto-Fallback Available\n\n` +
          `Would you like to automatically switch to CAESAR 270M?\n\n` +
          `✅ CAESAR Benefits:\n` +
          `• Smaller size: 297 MB (vs ${(config.size / 1024 / 1024 / 1024).toFixed(1)} GB)\n` +
          `• Works on all devices including mobile\n` +
          `• Faster downloads and initialization\n` +
          `• Text-only (no image/audio features)\n\n` +
          `Click OK to try CAESAR, or Cancel to return to model selection.`
        );

        if (shouldFallback) {
          console.log('🔄 Auto-falling back to CAESAR 270M...');

          // Switch to CAESAR and try again
          const { setCurrentModel } = useStore.getState();
          setCurrentModel('gemma270m');

          // Retry with CAESAR
          return handleStartChat();
        }
      } else {
        // Already using CAESAR and it failed
        alert(
          `❌ Failed to load CAESAR 270M model\n\n` +
          `Error: ${errorMessage}\n\n` +
          `This is unusual as CAESAR is our smallest model.\n\n` +
          `Please check:\n` +
          `1. Your internet connection\n` +
          `2. Browser console for detailed errors\n` +
          `3. Try refreshing the page`
        );
      }
    }
  };

  /**
   * Handle sending a message (with multimodal support)
   */
  const handleSendMessage = async (input: MultimodalInput) => {
    if (!currentConversationId) return;

    const {
      text,
      imageFiles,
      audioFiles,
      videoFiles,
      audioAction,
      audioTranslationOptions,
      audioAnalysisOptions,
      videoAction,
      videoAnalysisOptions,
      videoQAOptions,
      translationMode,
      sourceLanguage,
      targetLanguage,
      overrideLanguage,
      skipAddingUserMessage
    } = input;
    const hasMultimodal =
      (imageFiles && imageFiles.length > 0) ||
      (audioFiles && audioFiles.length > 0) ||
      (videoFiles && videoFiles.length > 0);

    // Track feature discovery
    if (imageFiles && imageFiles.length > 0) gamificationService.trackFeature('uploadImage');
    if (audioFiles && audioFiles.length > 0) gamificationService.trackFeature('useVoice');
    if (videoFiles && videoFiles.length > 0) gamificationService.trackFeature('useVideo');

    // Add user message (skip if this is an edit/resend)
    if (!skipAddingUserMessage) {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text || '(Multimodal input)',
        timestamp: new Date(),
      };

      addMessage(currentConversationId, userMessage);

      // Track message for gamification
      gamificationService.trackMessage();

      // Update streak
      const streakAchievement = gamificationService.updateStreak();
      if (streakAchievement) {
        console.log('🔥', streakAchievement);
      }
    }

    setIsGenerating(true);

    try {
      // Check for model personality query (Easter egg)
      if (text && easterEggService.isModelPersonalityQuery(text)) {
        const personality = easterEggService.getModelPersonality(currentModelId);
        const personalityMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: personality,
          timestamp: new Date(),
        };
        addMessage(currentConversationId, personalityMessage);
        setIsGenerating(false);
        return;
      }

      // Check for function calling
      if (settings.functions.enableFunctionCalling && text) {
        const functionCall = functionService.detectFunctionCall(text);

        if (functionCall) {
          console.log('🔧 Function call detected:', functionCall);
          gamificationService.trackFeature('functionCalling');

          // Add function call message
          const functionCallMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `🔧 Calling function: ${functionCall.functionName}...`,
            timestamp: new Date(),
          };
          addMessage(currentConversationId, functionCallMessage);

          // Execute function
          const result = await functionService.executeFunction(functionCall);

          if (result.success) {
            console.log('✅ Function executed successfully:', result);

            // Add beautifully formatted function result message
            const formattedResult = formatFunctionResult(functionCall.functionName, result.result);
            const resultMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: formattedResult,
              timestamp: new Date(),
            };
            addMessage(currentConversationId, resultMessage);
          } else {
            console.error('❌ Function execution failed:', result.error);

            // Add error message
            const errorMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `❌ Function execution failed: ${result.error}`,
              timestamp: new Date(),
            };
            addMessage(currentConversationId, errorMessage);
          }
        }
      }

      // Generate AI response (optionally using function result)
      // Check if model supports multimodal
      const config = getModelConfig(currentModelId);
      const isMultimodal = config.capabilities.length > 1;

      if (hasMultimodal && isMultimodal) {
        console.log('🎨 Using multimodal generation');

        // Convert files to data URLs for MediaPipe
        const multimodalInputs = [];

        if (text) {
          multimodalInputs.push({ text });
        }

        if (imageFiles) {
          for (const file of imageFiles) {
            const imageSource = await fileToDataURL(file);
            multimodalInputs.push({ imageSource });
          }
        }

        if (audioFiles) {
          // Handle audio based on selected action
          if (audioAction === 'transcribe') {
            // Transcribe audio using selected ASR provider
            const infoMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `🎤 Transcribing audio using ${settings.audio.asrProvider === 'gemma' ? 'Gemma 3n' : 'Web Speech API'}...`,
              timestamp: new Date(),
            };
            addMessage(currentConversationId, infoMessage);

            for (const file of audioFiles) {
              const audioSource = await fileToDataURL(file);

              if (settings.audio.asrProvider === 'gemma') {
                const result = await audioService.transcribeWithGemma(audioSource);
                multimodalInputs.push({ text: `[Transcription]: ${result.text}` });
              } else {
                // For Web Speech API, just attach the audio and let user use mic button
                multimodalInputs.push({ audioSource });
              }
            }
          } else if (audioAction === 'translate' && audioTranslationOptions) {
            // Translate audio between languages
            const infoMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `🌐 Translating audio from ${audioTranslationOptions.sourceLanguage} to ${audioTranslationOptions.targetLanguage}...`,
              timestamp: new Date(),
            };
            addMessage(currentConversationId, infoMessage);

            for (const file of audioFiles) {
              const audioSource = await fileToDataURL(file);
              const result = await audioService.translateAudio(
                audioSource,
                audioTranslationOptions.sourceLanguage,
                audioTranslationOptions.targetLanguage
              );

              const translationMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `**Original (${result.sourceLanguage}):**\n${result.originalText}\n\n**Translated (${result.targetLanguage}):**\n${result.translatedText}`,
                timestamp: new Date(),
              };
              addMessage(currentConversationId, translationMessage);
            }
          } else if (audioAction === 'analyze' && audioAnalysisOptions) {
            // Analyze audio for sounds, emotions, scenes
            const analysisTypeLabels = {
              speech: 'Speech Analysis',
              sounds: 'Sound Recognition',
              emotion: 'Emotion Detection',
              scene: 'Scene Understanding'
            };

            const infoMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `🔍 Performing ${analysisTypeLabels[audioAnalysisOptions.analysisType]}...`,
              timestamp: new Date(),
            };
            addMessage(currentConversationId, infoMessage);

            for (const file of audioFiles) {
              const audioSource = await fileToDataURL(file);
              const result = await audioService.analyzeAudio(audioSource, audioAnalysisOptions.analysisType);

              const analysisMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `**${analysisTypeLabels[audioAnalysisOptions.analysisType]}:**\n\n${result.findings}`,
                timestamp: new Date(),
              };
              addMessage(currentConversationId, analysisMessage);
            }
          } else {
            // Default: just attach the audio
            for (const file of audioFiles) {
              const audioSource = await fileToDataURL(file);
              multimodalInputs.push({ audioSource });
            }
          }
        }

        if (videoFiles) {
          // Handle video based on selected action
          if (videoAction === 'describe') {
            // Describe video content
            const infoMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `📹 Describing video content...`,
              timestamp: new Date(),
            };
            addMessage(currentConversationId, infoMessage);

            for (const file of videoFiles) {
              // Extract frames
              const processingResult = await videoProcessingService.extractFrames(
                file,
                settings.video.frameExtractionRate,
                settings.video.maxFrames,
                settings.imageResolution + 'x' + settings.imageResolution
              );

              const frameDataURLs = processingResult.frames.map(f => f.dataURL);
              const result = await videoService.describeVideo(frameDataURLs, processingResult.duration);

              const descriptionMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `**Video Description:**\n\n${result.description}\n\n*Analyzed ${result.frameCount} frames in ${result.duration.toFixed(2)}s*`,
                timestamp: new Date(),
              };
              addMessage(currentConversationId, descriptionMessage);
            }
          } else if (videoAction === 'analyze' && videoAnalysisOptions) {
            // Analyze video for specific aspects
            const analysisTypeLabels = {
              scene: 'Scene Detection',
              action: 'Action Recognition',
              object: 'Object Tracking',
              emotion: 'Emotion Analysis'
            };

            const infoMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `🔍 Performing ${analysisTypeLabels[videoAnalysisOptions.analysisType]}...`,
              timestamp: new Date(),
            };
            addMessage(currentConversationId, infoMessage);

            for (const file of videoFiles) {
              // Extract frames
              const processingResult = await videoProcessingService.extractFrames(
                file,
                settings.video.frameExtractionRate,
                settings.video.maxFrames,
                settings.imageResolution + 'x' + settings.imageResolution
              );

              const frameDataURLs = processingResult.frames.map(f => f.dataURL);
              const result = await videoService.analyzeVideo(
                frameDataURLs,
                processingResult.duration,
                videoAnalysisOptions.analysisType
              );

              const analysisMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `**${analysisTypeLabels[videoAnalysisOptions.analysisType]}:**\n\n${result.findings}\n\n*Analyzed ${result.frameCount} frames in ${result.duration.toFixed(2)}s*`,
                timestamp: new Date(),
              };
              addMessage(currentConversationId, analysisMessage);
            }
          } else if (videoAction === 'summarize') {
            // Summarize video with key moments
            const infoMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `📋 Summarizing video...`,
              timestamp: new Date(),
            };
            addMessage(currentConversationId, infoMessage);

            for (const file of videoFiles) {
              // Extract frames
              const processingResult = await videoProcessingService.extractFrames(
                file,
                settings.video.frameExtractionRate,
                settings.video.maxFrames,
                settings.imageResolution + 'x' + settings.imageResolution
              );

              const frameDataURLs = processingResult.frames.map(f => f.dataURL);
              const result = await videoService.summarizeVideo(frameDataURLs, processingResult.duration);

              const summaryMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `**Video Summary:**\n\n${result.summary}\n\n**Key Moments:**\n${result.keyMoments.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n\n*Analyzed ${result.frameCount} frames in ${result.duration.toFixed(2)}s*`,
                timestamp: new Date(),
              };
              addMessage(currentConversationId, summaryMessage);
            }
          } else if (videoAction === 'qa' && videoQAOptions) {
            // Answer question about video
            const infoMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `❓ Analyzing video to answer: "${videoQAOptions.question}"`,
              timestamp: new Date(),
            };
            addMessage(currentConversationId, infoMessage);

            for (const file of videoFiles) {
              // Extract frames
              const processingResult = await videoProcessingService.extractFrames(
                file,
                settings.video.frameExtractionRate,
                settings.video.maxFrames,
                settings.imageResolution + 'x' + settings.imageResolution
              );

              const frameDataURLs = processingResult.frames.map(f => f.dataURL);
              const result = await videoService.answerVideoQuestion(
                frameDataURLs,
                processingResult.duration,
                videoQAOptions.question
              );

              const qaMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `**Q:** ${result.question}\n\n**A:** ${result.answer}\n\n*Analyzed ${result.frameCount} frames in ${result.duration.toFixed(2)}s*`,
                timestamp: new Date(),
              };
              addMessage(currentConversationId, qaMessage);
            }
          } else {
            // Default: just attach the video frames
            for (const file of videoFiles) {
              // Extract frames from video
              const processingResult = await videoProcessingService.extractFrames(
                file,
                settings.video.frameExtractionRate,
                settings.video.maxFrames,
                settings.imageResolution + 'x' + settings.imageResolution
              );

              // Add info message about frame extraction
              const frameInfoMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `📹 Extracted ${processingResult.frames.length} frames from video (${processingResult.duration.toFixed(1)}s duration, ${processingResult.width}x${processingResult.height})`,
                timestamp: new Date(),
              };
              addMessage(currentConversationId, frameInfoMessage);

              // Add each frame as an image
              for (const frame of processingResult.frames) {
                multimodalInputs.push({ imageSource: frame.dataURL });
              }
            }
          }
        }

        // Generate multimodal response with metadata
        const result = await inferenceEngine.generateMultimodal(
          multimodalInputs,
          {
            maxTokens: 512,
            temperature: 0.8,
            topP: 0.9,
            streamTokens: false,
          },
          settings.imageResolution + 'x' + settings.imageResolution
        );

        // Add assistant message with metadata
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.text,
          timestamp: new Date(),
          metadata: result.metadata,
        };

        addMessage(currentConversationId, assistantMessage);

        // Track analytics
        if (result.metadata?.inputTokens && result.metadata?.totalTokens) {
          analyticsService.trackTokenUsage(
            currentConversationId,
            currentModelId,
            result.metadata.inputTokens,
            result.metadata.totalTokens - result.metadata.inputTokens
          );

          // Track gamification achievements
          const outputTokens = result.metadata.totalTokens - result.metadata.inputTokens;
          const achievements = gamificationService.trackTokens(currentModelId, outputTokens);
          achievements.forEach(achievement => console.log('🏆', achievement));
        }
      } else {
        // Text-only generation with streaming
        const assistantMessageId = crypto.randomUUID();

        // Add empty assistant message that will be updated as tokens stream in
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };

        addMessage(currentConversationId, assistantMessage);

        // Accumulate text locally - MediaPipe sends INCREMENTAL chunks
        let accumulatedText = '';

        // Handle translation mode or language override
        let processedText = text || '';

        if (translationMode && text) {
          // Translation mode: translate from source to target language
          let detectedSourceLang = sourceLanguage || 'auto';

          // Auto-detect source language if needed
          if (detectedSourceLang === 'auto') {
            const detection = languageDetectionService.detectLanguage(text);
            detectedSourceLang = detection.detectedLanguage.code;

            // Add info message about detected language
            const detectionMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `🔍 Detected language: ${detection.detectedLanguage.name} (${detection.detectedLanguage.nativeName}) - Confidence: ${(detection.confidence * 100).toFixed(0)}%`,
              timestamp: new Date(),
            };
            addMessage(currentConversationId, detectionMessage);
          }

          // Generate translation prompt
          processedText = languageDetectionService.generateTranslationPrompt({
            text,
            sourceLanguage: detectedSourceLang,
            targetLanguage: targetLanguage || 'en',
          });
        } else if (overrideLanguage && text) {
          // Language override: add instruction to respond in specified language
          const lang = languageDetectionService.getLanguageByCode(overrideLanguage);
          if (lang) {
            processedText = `Please respond in ${lang.name} (${lang.nativeName}).\n\n${text}`;
          }
        }

        // Build conversation history for context (last 10 messages to avoid token overflow)
        const currentConv = useStore.getState().conversations[currentConversationId];
        const recentMessages = currentConv.messages.slice(-10); // Last 10 messages
        const conversationHistory = recentMessages
          .map((msg: Message) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n\n');

        // Append current user message to history
        const fullPrompt = conversationHistory
          ? `${conversationHistory}\n\nUser: ${processedText}`
          : `User: ${processedText}`;

        // Generate streaming response with verbosity control, system prompts, structured output, and safety
        await inferenceEngine.generateStreaming(
          fullPrompt,
          {
            maxTokens: 512,
            temperature: 0.8,
            topP: 0.9,
            streamTokens: true,
          },
          (chunk: string, isDone: boolean, metadata?: any) => {
            // Accumulate the chunk
            accumulatedText += chunk;

            // Update message with accumulated text
            updateMessage(currentConversationId, assistantMessageId, {
              content: accumulatedText,
              ...(isDone && metadata ? { metadata } : {}),
            });

            // Track analytics when streaming is complete
            if (isDone && metadata?.inputTokens && metadata?.totalTokens) {
              analyticsService.trackTokenUsage(
                currentConversationId,
                currentModelId,
                metadata.inputTokens,
                metadata.totalTokens - metadata.inputTokens
              );

              // Track gamification achievements
              const outputTokens = metadata.totalTokens - metadata.inputTokens;
              const achievements = gamificationService.trackTokens(currentModelId, outputTokens);
              achievements.forEach(achievement => console.log('🏆', achievement));
            }
          },
          settings.responseStyle.verbosity, // Pass verbosity setting
          settings.systemPrompt, // Pass system prompt settings
          settings.structuredOutput, // Pass structured output settings
          settings.safety // Pass safety settings
        );
      }
    } catch (error) {
      console.error('Generation error:', error);

      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error generating a response. Please try again.',
        timestamp: new Date(),
      };

      addMessage(currentConversationId, errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Convert File to Data URL for MediaPipe
   */
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      {/* Particles Background - Global */}
      {settings.microinteractions.particles && <Particles quantity={80} />}

      <Routes>
        {/* Home Route - Chat App */}
        <Route
          path="/"
          element={
            <div className="w-full h-screen overflow-hidden">
              {/* Landing Page */}
              {!showChat && modelStatus === 'not-loaded' && (
                <LandingPage onStartChat={handleStartChat} />
              )}

              {/* Model Loading Progress */}
              {(modelStatus === 'downloading' || modelStatus === 'loading') && (
                <ModelLoadProgress
                  progress={loadProgress}
                  modelName={getModelConfig(currentModelId).name}
                  status={modelStatus as 'downloading' | 'loading'}
                />
              )}

              {/* Chat Interface */}
              {showChat && modelStatus === 'loaded' && (
                <ChatInterface
                  onSendMessage={handleSendMessage}
                  onChangeModel={handleChangeModel}
                />
              )}
            </div>
          }
        />

        {/* About Page */}
        <Route path="/about" element={<About />} />

        {/* Features Page */}
        <Route path="/features" element={<Features />} />
      </Routes>

      {/* Analytics Dashboard */}
      {analyticsOpen && <Analytics onClose={toggleAnalytics} />}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </>
  );
}
