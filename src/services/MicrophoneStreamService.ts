/**
 * Microphone Stream Service - Real-time audio recording and streaming
 * @author Dr. Ernesto Lee
 */

export class MicrophoneStreamService {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  /**
   * Start microphone stream
   */
  async startMicrophone(): Promise<MediaStream> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      // Set up audio context for visualization
      this.setupAudioAnalyser();

      return this.stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw new Error(this.getMicrophoneErrorMessage(error));
    }
  }

  /**
   * Setup audio analyser for visualization
   */
  private setupAudioAnalyser(): void {
    if (!this.stream) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);
    } catch (error) {
      console.error('Error setting up audio analyser:', error);
    }
  }

  /**
   * Get audio level for visualization (0-1)
   */
  getAudioLevel(): number {
    if (!this.analyser) return 0;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const average = sum / bufferLength;

    // Normalize to 0-1 range
    return Math.min(average / 128, 1);
  }

  /**
   * Get frequency data for waveform visualization
   */
  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    return dataArray;
  }

  /**
   * Start recording audio
   */
  startRecording(): void {
    if (!this.stream) {
      throw new Error('Microphone stream not started');
    }

    this.audioChunks = [];

    try {
      // Try different MIME types for compatibility
      const mimeTypes = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ];

      let mimeType = 'audio/webm';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });

      this.mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording');
    }
  }

  /**
   * Stop recording and get audio as base64
   */
  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.addEventListener('stop', async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const base64 = await this.blobToBase64(audioBlob);
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      });

      this.mediaRecorder.stop();
    });
  }

  /**
   * Stop microphone stream
   */
  stopMicrophone(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.mediaRecorder = null;
    this.analyser = null;
    this.audioChunks = [];
  }

  /**
   * Check if microphone is supported
   */
  isMicrophoneSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
  }

  /**
   * Get recording state
   */
  getRecordingState(): RecordingState | null {
    return this.mediaRecorder ? this.mediaRecorder.state : null;
  }

  /**
   * Convert Blob to base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get user-friendly error message
   */
  private getMicrophoneErrorMessage(error: any): string {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'Microphone access denied. Please allow microphone permissions in your browser settings.';
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return 'No microphone found. Please connect a microphone and try again.';
    }
    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return 'Microphone is already in use by another application.';
    }
    return 'Failed to access microphone. Please check your browser settings.';
  }
}

export const microphoneStreamService = new MicrophoneStreamService();
