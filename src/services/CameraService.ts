/**
 * Camera Service - Handle webcam access and frame capture
 * @author Dr. Ernesto Lee
 */

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export class CameraService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  /**
   * Get list of available camera devices
   */
  async getAvailableCameras(): Promise<CameraDevice[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
        }));
    } catch (error) {
      console.error('Error getting camera devices:', error);
      return [];
    }
  }

  /**
   * Start camera stream
   */
  async startCamera(deviceId?: string): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: 'user' }, // Default to front camera
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw new Error(this.getCameraErrorMessage(error));
    }
  }

  /**
   * Stop camera stream
   */
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  /**
   * Capture frame from video element as base64
   */
  captureFrame(
    videoElement: HTMLVideoElement,
    resolution: number = 512
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
      height = resolution / videoAspect;
    } else {
      width = resolution * videoAspect;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw video frame to canvas
    ctx.drawImage(videoElement, 0, 0, width, height);

    // Convert to base64
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  /**
   * Capture multiple frames at intervals
   */
  async captureFrames(
    videoElement: HTMLVideoElement,
    count: number,
    intervalMs: number,
    resolution: number = 512
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
   * Check if camera is supported
   */
  isCameraSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    );
  }

  /**
   * Get user-friendly error message
   */
  private getCameraErrorMessage(error: any): string {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'Camera access denied. Please allow camera permissions in your browser settings.';
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return 'No camera found. Please connect a camera and try again.';
    }
    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return 'Camera is already in use by another application.';
    }
    if (error.name === 'OverconstrainedError') {
      return 'Camera constraints could not be satisfied. Try a different camera.';
    }
    return 'Failed to access camera. Please check your browser settings.';
  }
}

export const cameraService = new CameraService();
