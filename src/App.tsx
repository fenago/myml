/**
 * Main App Component
 * Handles model loading, app state, and routing
 *
 * @author Dr. Ernesto Lee
 */

import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { ModelLoadProgress } from './components/ModelLoadProgress';
import { About } from './components/About';
import { Features } from './components/Features';
import { Particles } from './components/Particles';
import { useStore } from './store/useStore';
import { modelLoader } from './services/ModelLoader';
import { inferenceEngine } from './services/InferenceEngine';
import { functionService } from './services/FunctionService';
import { videoProcessingService } from './services/VideoProcessingService';
import { getModelConfig } from './config/models';
import type { Message } from './types';
import type { MultimodalInput } from './components/ChatInput';

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
  } = useStore();

  /**
   * Reset to landing page
   */
  const handleChangeModel = () => {
    setShowChat(false);
    setModelStatus('not-loaded');
    setLoadProgress(null);
  };

  /**
   * Load model when starting chat
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

      // Check if it's a memory allocation error
      const isMemoryError = errorMessage.toLowerCase().includes('memory') ||
                           errorMessage.toLowerCase().includes('array buffer');

      if (isMemoryError) {
        // Memory-specific error message
        alert(
          `❌ Failed to load model: ${config.name}\n\n` +
          `${errorMessage}\n\n` +
          `💡 Quick Fix:\n` +
          `Try switching to CAESAR 270M (only 297 MB) which works reliably on all devices.\n\n` +
          `You can change models by refreshing the page.`
        );
      } else {
        // General error message
        alert(
          `❌ Failed to load model: ${config.name}\n\n` +
          `Error: ${errorMessage}\n\n` +
          `Please verify:\n` +
          `1. The model file exists at: ${config.url}\n` +
          `2. You have a stable internet connection\n` +
          `3. You have enough memory (need ${(config.size / 1024 / 1024 / 1024).toFixed(1)} GB)`
        );
      }
    }
  };

  /**
   * Handle sending a message (with multimodal support)
   */
  const handleSendMessage = async (input: MultimodalInput) => {
    if (!currentConversationId) return;

    const { text, imageFiles, audioFiles, videoFiles } = input;
    const hasMultimodal =
      (imageFiles && imageFiles.length > 0) ||
      (audioFiles && audioFiles.length > 0) ||
      (videoFiles && videoFiles.length > 0);

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text || '(Multimodal input)',
      timestamp: new Date(),
    };

    addMessage(currentConversationId, userMessage);
    setIsGenerating(true);

    try {
      // Check for function calling
      let functionResult: any = null;
      if (settings.functions.enableFunctionCalling && text) {
        const functionCall = functionService.detectFunctionCall(text);

        if (functionCall) {
          console.log('🔧 Function call detected:', functionCall);

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
            functionResult = result.result;

            // Add function result message
            const resultMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `✅ Function result:\n\`\`\`json\n${JSON.stringify(result.result, null, 2)}\n\`\`\``,
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
          for (const file of audioFiles) {
            const audioSource = await fileToDataURL(file);
            multimodalInputs.push({ audioSource });
          }
        }

        if (videoFiles) {
          for (const file of videoFiles) {
            // Extract frames from video
            const processingResult = await videoProcessingService.extractFrames(
              file,
              1, // Extract 1 frame per second
              10, // Max 10 frames
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

        // Generate streaming response with verbosity control
        await inferenceEngine.generateStreaming(
          text || '',
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
          },
          settings.responseStyle.verbosity // Pass verbosity setting
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
    </>
  );
}
