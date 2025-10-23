/**
 * Video Service
 * Handles video description, analysis, summarization, and Q&A using Gemma 3n
 * @author Dr. Ernesto Lee
 */

import type { InferenceEngine } from './InferenceEngine';

export interface VideoDescriptionResult {
  description: string;
  duration: number;
  frameCount: number;
}

export interface VideoAnalysisResult {
  type: 'scene' | 'action' | 'object' | 'emotion';
  findings: string;
  details: Record<string, any>;
  duration: number;
  frameCount: number;
}

export interface VideoSummaryResult {
  summary: string;
  keyMoments: string[];
  duration: number;
  frameCount: number;
}

export interface VideoQAResult {
  question: string;
  answer: string;
  confidence?: string;
  duration: number;
  frameCount: number;
}

export class VideoService {
  private inferenceEngine: InferenceEngine;

  constructor(inferenceEngine: InferenceEngine) {
    this.inferenceEngine = inferenceEngine;
  }

  /**
   * Describe what's happening in the video
   */
  async describeVideo(
    frameDataURLs: string[],
    _videoDuration: number
  ): Promise<VideoDescriptionResult> {
    console.log(`📹 Describing video with ${frameDataURLs.length} frames...`);

    const startTime = Date.now();

    try {
      const multimodalInputs: any[] = [
        {
          text: `Please provide a detailed description of this video. Include:\n1. What is happening\n2. Who or what is present\n3. The setting and environment\n4. Any notable actions or events\n5. Overall mood or atmosphere`,
        },
      ];

      // Add all frames
      frameDataURLs.forEach((frameURL) => {
        multimodalInputs.push({ imageSource: frameURL });
      });

      const result = await this.inferenceEngine.generateMultimodal(multimodalInputs, {
        maxTokens: 512,
        temperature: 0.7,
        topP: 0.9,
        streamTokens: false,
      });

      const duration = (Date.now() - startTime) / 1000;

      return {
        description: result.text.trim(),
        duration,
        frameCount: frameDataURLs.length,
      };
    } catch (error) {
      console.error('❌ Video description failed:', error);
      throw new Error(`Video description failed: ${error}`);
    }
  }

  /**
   * Analyze video for specific aspects
   */
  async analyzeVideo(
    frameDataURLs: string[],
    _videoDuration: number,
    analysisType: 'scene' | 'action' | 'object' | 'emotion'
  ): Promise<VideoAnalysisResult> {
    console.log(`🔍 Analyzing video (${analysisType}) with ${frameDataURLs.length} frames...`);

    const startTime = Date.now();

    const prompts: Record<typeof analysisType, string> = {
      scene:
        'Analyze this video for scene detection. Identify:\n1. Different scenes or locations\n2. Scene transitions and timing\n3. Visual setting of each scene\n4. Environmental changes',
      action:
        'Analyze this video for action recognition. Identify:\n1. All actions and activities\n2. Who is performing each action\n3. Movement patterns and dynamics\n4. Interaction between subjects',
      object:
        'Analyze this video for object tracking. Identify:\n1. All visible objects and people\n2. Object movement and positioning\n3. Important items or subjects\n4. How objects interact',
      emotion:
        'Analyze this video for emotion and mood. Identify:\n1. Facial expressions (if visible)\n2. Body language and gestures\n3. Overall emotional tone\n4. Mood progression throughout',
    };

    try {
      const multimodalInputs: any[] = [{ text: prompts[analysisType] }];

      frameDataURLs.forEach((frameURL) => {
        multimodalInputs.push({ imageSource: frameURL });
      });

      const result = await this.inferenceEngine.generateMultimodal(multimodalInputs, {
        maxTokens: 512,
        temperature: 0.7,
        topP: 0.9,
        streamTokens: false,
      });

      const duration = (Date.now() - startTime) / 1000;

      return {
        type: analysisType,
        findings: result.text.trim(),
        details: {
          processingTime: result.metadata.totalGenerationTime,
          videoProcessingTime: result.metadata.videoProcessingTime,
        },
        duration,
        frameCount: frameDataURLs.length,
      };
    } catch (error) {
      console.error('❌ Video analysis failed:', error);
      throw new Error(`Video analysis failed: ${error}`);
    }
  }

  /**
   * Summarize video content with key moments
   */
  async summarizeVideo(
    frameDataURLs: string[],
    _videoDuration: number
  ): Promise<VideoSummaryResult> {
    console.log(`📋 Summarizing video with ${frameDataURLs.length} frames...`);

    const startTime = Date.now();

    try {
      const multimodalInputs: any[] = [
        {
          text: `Please provide a concise summary of this video. Include:\n1. Brief overview of content (2-3 sentences)\n2. Key moments or highlights (bullet points)\n3. Main subjects or topics\n4. Important takeaways`,
        },
      ];

      frameDataURLs.forEach((frameURL) => {
        multimodalInputs.push({ imageSource: frameURL });
      });

      const result = await this.inferenceEngine.generateMultimodal(multimodalInputs, {
        maxTokens: 512,
        temperature: 0.7,
        topP: 0.9,
        streamTokens: false,
      });

      const duration = (Date.now() - startTime) / 1000;

      // Parse key moments from response
      const text = result.text.trim();
      const keyMoments: string[] = [];

      // Try to extract bullet points or numbered items
      const lines = text.split('\n');
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (
          trimmed.match(/^[-•*]\s/) ||
          trimmed.match(/^\d+[\.)]\s/) ||
          trimmed.toLowerCase().includes('key moment') ||
          trimmed.toLowerCase().includes('highlight')
        ) {
          keyMoments.push(trimmed.replace(/^[-•*]\s/, '').replace(/^\d+[\.)]\s/, ''));
        }
      });

      return {
        summary: text,
        keyMoments: keyMoments.length > 0 ? keyMoments : ['See full summary above'],
        duration,
        frameCount: frameDataURLs.length,
      };
    } catch (error) {
      console.error('❌ Video summarization failed:', error);
      throw new Error(`Video summarization failed: ${error}`);
    }
  }

  /**
   * Answer questions about video content
   */
  async answerVideoQuestion(
    frameDataURLs: string[],
    _videoDuration: number,
    question: string
  ): Promise<VideoQAResult> {
    console.log(`❓ Answering question about video with ${frameDataURLs.length} frames...`);

    const startTime = Date.now();

    try {
      const multimodalInputs: any[] = [
        {
          text: `Please answer the following question about this video:\n\nQuestion: ${question}\n\nProvide a clear, specific answer based on what you can see in the video frames.`,
        },
      ];

      frameDataURLs.forEach((frameURL) => {
        multimodalInputs.push({ imageSource: frameURL });
      });

      const result = await this.inferenceEngine.generateMultimodal(multimodalInputs, {
        maxTokens: 512,
        temperature: 0.7,
        topP: 0.9,
        streamTokens: false,
      });

      const duration = (Date.now() - startTime) / 1000;

      return {
        question,
        answer: result.text.trim(),
        duration,
        frameCount: frameDataURLs.length,
      };
    } catch (error) {
      console.error('❌ Video Q&A failed:', error);
      throw new Error(`Video Q&A failed: ${error}`);
    }
  }

  /**
   * Get quick video analysis preset prompts
   */
  static getPresetPrompts(): Array<{ label: string; prompt: string; icon: string }> {
    return [
      {
        label: 'Describe',
        prompt: 'Describe what is happening in this video.',
        icon: '📝',
      },
      {
        label: 'Summarize',
        prompt: 'Provide a brief summary of this video.',
        icon: '📋',
      },
      {
        label: 'Key moments',
        prompt: 'What are the key moments in this video?',
        icon: '⭐',
      },
      {
        label: 'Objects',
        prompt: 'What objects or people are visible?',
        icon: '🔍',
      },
      {
        label: 'Actions',
        prompt: 'What actions or activities are taking place?',
        icon: '🏃',
      },
      {
        label: 'Setting',
        prompt: 'Where does this video take place?',
        icon: '🌍',
      },
    ];
  }
}
