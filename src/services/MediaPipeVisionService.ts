/**
 * MediaPipe Vision Service
 * Provides browser-based computer vision capabilities for GEMMA 3N models
 *
 * @author Dr. Ernesto Lee
 */

import {
  FilesetResolver,
  HandLandmarker,
  FaceDetector,
  GestureRecognizer,
  ObjectDetector,
  ImageSegmenter,
} from '@mediapipe/tasks-vision';

export interface HandLandmarkResult {
  landmarks: Array<{ x: number; y: number; z: number }>;
  handedness: 'Left' | 'Right';
  worldLandmarks: Array<{ x: number; y: number; z: number }>;
}

export interface FaceDetectionResult {
  boundingBox: { x: number; y: number; width: number; height: number };
  keypoints: Array<{ x: number; y: number }>;
  confidence: number;
}

export interface GestureResult {
  gestureName: string;
  confidence: number;
  handedness: 'Left' | 'Right';
}

export interface ObjectDetectionResult {
  category: string;
  score: number;
  boundingBox: { x: number; y: number; width: number; height: number };
}

export type VisionTask =
  | 'handTracking'
  | 'faceDetection'
  | 'gestureRecognition'
  | 'objectDetection'
  | 'imageSegmentation';

/**
 * MediaPipe Vision Service for BrowserGPT
 * Integrates with GEMMA 3N multimodal models
 */
export class MediaPipeVisionService {
  private handLandmarker: HandLandmarker | null = null;
  private faceDetector: FaceDetector | null = null;
  private gestureRecognizer: GestureRecognizer | null = null;
  private objectDetector: ObjectDetector | null = null;
  private imageSegmenter: ImageSegmenter | null = null;

  private vision: any = null;
  private isInitialized = false;

  /**
   * Initialize MediaPipe vision tasks
   */
  async initialize(tasks: VisionTask[] = ['handTracking']): Promise<void> {
    if (this.isInitialized) return;

    console.log('🎥 Initializing MediaPipe Vision Service...');

    try {
      // Load MediaPipe Vision library
      this.vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Initialize requested tasks
      for (const task of tasks) {
        await this.initializeTask(task);
      }

      this.isInitialized = true;
      console.log('✅ MediaPipe Vision Service initialized');
    } catch (error) {
      console.error('❌ MediaPipe initialization failed:', error);
      throw new Error(`Failed to initialize MediaPipe: ${error}`);
    }
  }

  /**
   * Initialize specific vision task
   */
  private async initializeTask(task: VisionTask): Promise<void> {
    switch (task) {
      case 'handTracking':
        this.handLandmarker = await HandLandmarker.createFromOptions(this.vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });
        console.log('  ✓ Hand tracking initialized');
        break;

      case 'faceDetection':
        this.faceDetector = await FaceDetector.createFromOptions(this.vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
        });
        console.log('  ✓ Face detection initialized');
        break;

      case 'gestureRecognition':
        this.gestureRecognizer = await GestureRecognizer.createFromOptions(this.vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
        });
        console.log('  ✓ Gesture recognition initialized');
        break;

      case 'objectDetection':
        this.objectDetector = await ObjectDetector.createFromOptions(this.vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          scoreThreshold: 0.5,
          maxResults: 5,
        });
        console.log('  ✓ Object detection initialized');
        break;

      case 'imageSegmentation':
        this.imageSegmenter = await ImageSegmenter.createFromOptions(this.vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          outputCategoryMask: true,
          outputConfidenceMasks: false,
        });
        console.log('  ✓ Image segmentation initialized');
        break;
    }
  }

  /**
   * Detect hands in video frame
   */
  detectHands(
    videoElement: HTMLVideoElement,
    timestamp: number
  ): HandLandmarkResult[] | null {
    if (!this.handLandmarker) {
      console.warn('Hand landmarker not initialized');
      return null;
    }

    const results = this.handLandmarker.detectForVideo(videoElement, timestamp);

    if (!results.landmarks || results.landmarks.length === 0) {
      return null;
    }

    return results.landmarks.map((landmarks: any, index: number) => ({
      landmarks,
      handedness: results.handednesses[index][0].categoryName as 'Left' | 'Right',
      worldLandmarks: results.worldLandmarks[index],
    }));
  }

  /**
   * Detect faces in video frame
   */
  detectFaces(
    videoElement: HTMLVideoElement,
    timestamp: number
  ): FaceDetectionResult[] | null {
    if (!this.faceDetector) {
      console.warn('Face detector not initialized');
      return null;
    }

    const results = this.faceDetector.detectForVideo(videoElement, timestamp);

    if (!results.detections || results.detections.length === 0) {
      return null;
    }

    return results.detections.map((detection: any) => ({
      boundingBox: detection.boundingBox,
      keypoints: detection.keypoints,
      confidence: detection.categories[0].score,
    }));
  }

  /**
   * Recognize gestures in video frame
   */
  recognizeGestures(
    videoElement: HTMLVideoElement,
    timestamp: number
  ): GestureResult[] | null {
    if (!this.gestureRecognizer) {
      console.warn('Gesture recognizer not initialized');
      return null;
    }

    const results = this.gestureRecognizer.recognizeForVideo(videoElement, timestamp);

    if (!results.gestures || results.gestures.length === 0) {
      return null;
    }

    return results.gestures.map((gestures: any, index: number) => ({
      gestureName: gestures[0].categoryName,
      confidence: gestures[0].score,
      handedness: results.handednesses[index][0].categoryName as 'Left' | 'Right',
    }));
  }

  /**
   * Detect objects in video frame
   */
  detectObjects(
    videoElement: HTMLVideoElement,
    timestamp: number
  ): ObjectDetectionResult[] | null {
    if (!this.objectDetector) {
      console.warn('Object detector not initialized');
      return null;
    }

    const results = this.objectDetector.detectForVideo(videoElement, timestamp);

    if (!results.detections || results.detections.length === 0) {
      return null;
    }

    return results.detections.map((detection: any) => ({
      category: detection.categories[0].categoryName,
      score: detection.categories[0].score,
      boundingBox: detection.boundingBox,
    }));
  }

  /**
   * Process image for GEMMA 3N vision input
   * Converts video frame to base64 for multimodal model
   */
  captureImageForGemma(videoElement: HTMLVideoElement): string {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    ctx.drawImage(videoElement, 0, 0);

    // Return as base64 data URL
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  /**
   * Create annotated description for GEMMA 3N
   * Combines vision results into natural language prompt
   */
  createVisionPrompt(
    hands?: HandLandmarkResult[] | null,
    faces?: FaceDetectionResult[] | null,
    gestures?: GestureResult[] | null,
    objects?: ObjectDetectionResult[] | null
  ): string {
    const parts: string[] = ['I see in this image:'];

    if (hands && hands.length > 0) {
      parts.push(`\n- ${hands.length} hand(s) detected:`);
      hands.forEach((hand) => {
        parts.push(`  • ${hand.handedness} hand visible`);
      });
    }

    if (faces && faces.length > 0) {
      parts.push(`\n- ${faces.length} face(s) detected with ${(faces[0].confidence * 100).toFixed(1)}% confidence`);
    }

    if (gestures && gestures.length > 0) {
      parts.push(`\n- Gestures:`);
      gestures.forEach((gesture) => {
        parts.push(`  • ${gesture.gestureName} (${gesture.handedness} hand)`);
      });
    }

    if (objects && objects.length > 0) {
      parts.push(`\n- Objects detected:`);
      objects.forEach((obj) => {
        parts.push(`  • ${obj.category} (${(obj.score * 100).toFixed(1)}% confidence)`);
      });
    }

    return parts.join('');
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Cleanup and release resources
   */
  dispose(): void {
    this.handLandmarker?.close();
    this.faceDetector?.close();
    this.gestureRecognizer?.close();
    this.objectDetector?.close();
    this.imageSegmenter?.close();

    this.handLandmarker = null;
    this.faceDetector = null;
    this.gestureRecognizer = null;
    this.objectDetector = null;
    this.imageSegmenter = null;
    this.isInitialized = false;

    console.log('🗑️ MediaPipe Vision Service disposed');
  }
}

// Singleton instance
export const mediaPipeVision = new MediaPipeVisionService();
