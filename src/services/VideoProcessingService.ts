/**
 * Video Processing Service
 * Extracts frames from video files for multimodal processing
 *
 * @author Dr. Ernesto Lee
 */

export interface VideoFrame {
  dataURL: string; // Base64 encoded image
  timestamp: number; // Time in seconds
}

export interface VideoProcessingResult {
  frames: VideoFrame[];
  duration: number; // Video duration in seconds
  width: number;
  height: number;
  processingTime: number; // Time taken to process in ms
}

export class VideoProcessingService {
  /**
   * Extract frames from a video file
   * @param file Video file
   * @param frameInterval Interval in seconds between frames (default: 1 second)
   * @param maxFrames Maximum number of frames to extract (default: 10)
   * @param targetResolution Target resolution for frames (e.g., '512x512')
   */
  async extractFrames(
    file: File,
    frameInterval: number = 1,
    maxFrames: number = 10,
    targetResolution?: string
  ): Promise<VideoProcessingResult> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      // Create video element
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const frames: VideoFrame[] = [];
      let width = 0;
      let height = 0;
      let duration = 0;

      // Create object URL for video
      const videoURL = URL.createObjectURL(file);
      video.src = videoURL;

      video.onloadedmetadata = async () => {
        try {
          duration = video.duration;
          width = video.videoWidth;
          height = video.videoHeight;

          // Calculate which frames to extract
          const frameTimes: number[] = [];
          const actualFrameInterval = Math.max(frameInterval, duration / maxFrames);

          for (let time = 0; time < duration && frameTimes.length < maxFrames; time += actualFrameInterval) {
            frameTimes.push(time);
          }

          // Extract frames
          for (const time of frameTimes) {
            try {
              const frameDataURL = await this.extractFrameAtTime(video, time, targetResolution);
              frames.push({
                dataURL: frameDataURL,
                timestamp: time,
              });
            } catch (error) {
              console.warn(`Failed to extract frame at ${time}s:`, error);
            }
          }

          // Cleanup
          URL.revokeObjectURL(videoURL);

          const processingTime = Date.now() - startTime;

          resolve({
            frames,
            duration,
            width,
            height,
            processingTime,
          });
        } catch (error) {
          URL.revokeObjectURL(videoURL);
          reject(error);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(videoURL);
        reject(new Error('Failed to load video'));
      };
    });
  }

  /**
   * Extract a single frame from video at a specific time
   */
  private extractFrameAtTime(
    video: HTMLVideoElement,
    time: number,
    targetResolution?: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const seeked = () => {
        try {
          // Create canvas
          let targetWidth = video.videoWidth;
          let targetHeight = video.videoHeight;

          // Parse target resolution if provided
          if (targetResolution) {
            const [w, h] = targetResolution.split('x').map(Number);
            if (w && h) {
              // Maintain aspect ratio
              const aspectRatio = video.videoWidth / video.videoHeight;
              if (aspectRatio > 1) {
                targetWidth = w;
                targetHeight = Math.round(w / aspectRatio);
              } else {
                targetHeight = h;
                targetWidth = Math.round(h * aspectRatio);
              }
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

          // Convert to data URL
          const dataURL = canvas.toDataURL('image/jpeg', 0.9);

          video.removeEventListener('seeked', seeked);
          resolve(dataURL);
        } catch (error) {
          video.removeEventListener('seeked', seeked);
          reject(error);
        }
      };

      video.addEventListener('seeked', seeked);
      video.currentTime = time;
    });
  }

  /**
   * Get video metadata without extracting frames
   */
  async getVideoMetadata(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      const videoURL = URL.createObjectURL(file);
      video.src = videoURL;

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(videoURL);
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };

      video.onerror = () => {
        URL.revokeObjectURL(videoURL);
        reject(new Error('Failed to load video metadata'));
      };
    });
  }
}

// Singleton instance
export const videoProcessingService = new VideoProcessingService();
