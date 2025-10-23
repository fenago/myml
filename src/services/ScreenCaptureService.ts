/**
 * Screen Capture Service - Handle screen sharing and capture
 * @author Dr. Ernesto Lee
 */

export class ScreenCaptureService {
  private stream: MediaStream | null = null;

  /**
   * Start screen capture
   */
  async startScreenCapture(): Promise<MediaStream> {
    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always', // Show cursor in capture
        } as MediaTrackConstraints,
        audio: false,
      });

      // Add event listener for when user stops sharing via browser UI
      this.stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopScreenCapture();
      });

      return this.stream;
    } catch (error) {
      console.error('Error accessing screen capture:', error);
      throw new Error(this.getScreenCaptureErrorMessage(error));
    }
  }

  /**
   * Stop screen capture
   */
  stopScreenCapture(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  /**
   * Capture frame from video element as base64
   */
  captureFrame(
    videoElement: HTMLVideoElement,
    resolution: number = 768
  ): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Calculate dimensions maintaining aspect ratio
    const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
    let width = resolution;
    let height = resolution;

    if (videoAspect > 1) {
      // Landscape
      width = resolution;
      height = resolution / videoAspect;
    } else {
      // Portrait
      width = resolution * videoAspect;
      height = resolution;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw video frame to canvas
    ctx.drawImage(videoElement, 0, 0, width, height);

    // Convert to base64
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  /**
   * Capture multiple frames at intervals
   */
  async captureFrames(
    videoElement: HTMLVideoElement,
    count: number,
    intervalMs: number,
    resolution: number = 768
  ): Promise<string[]> {
    const frames: string[] = [];

    for (let i = 0; i < count; i++) {
      frames.push(this.captureFrame(videoElement, resolution));

      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    return frames;
  }

  /**
   * Check if screen capture is supported
   */
  isScreenCaptureSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getDisplayMedia
    );
  }

  /**
   * Get current stream
   */
  getStream(): MediaStream | null {
    return this.stream;
  }

  /**
   * Get user-friendly error message
   */
  private getScreenCaptureErrorMessage(error: any): string {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'Screen sharing denied. Please allow screen sharing permissions.';
    }
    if (error.name === 'NotFoundError') {
      return 'No screen source selected. Please select a window or screen to share.';
    }
    if (error.name === 'AbortError') {
      return 'Screen sharing was cancelled.';
    }
    return 'Failed to capture screen. Please try again.';
  }
}

export const screenCaptureService = new ScreenCaptureService();
