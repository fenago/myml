/**
 * System Information Service
 * Collects browser, device, and system capabilities
 * All data collected locally - nothing transmitted
 *
 * @author Dr. Ernesto Lee
 */

export interface SystemInfo {
  // Browser & System
  browser: string;
  browserVersion: string;
  userAgent: string;
  platform: string;
  language: string;
  languages: readonly string[];
  cpuCores: number;
  deviceMemory: number | undefined; // Chrome only
  isOnline: boolean;

  // Screen & Display
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
  prefersDarkMode: boolean;
  prefersReducedMotion: boolean;

  // Capabilities
  hasWebGPU: boolean;
  hasWebGL: boolean;
  hasTouch: boolean;
  hasGeolocation: boolean;
  hasNotifications: boolean;
  hasServiceWorker: boolean;
  hasIndexedDB: boolean;

  // Device Type Detection
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isMacOS: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isIOS: boolean;
  isAndroid: boolean;

  // Time & Locale
  timezone: string;
  timezoneOffset: number;
  locale: string;

  // Collection Metadata
  collectedAt: string;
}

export class SystemInfoService {
  /**
   * Collect all system information
   */
  static async collect(): Promise<SystemInfo> {
    const startTime = performance.now();

    // Browser & System
    const { browser, version } = this.getBrowserInfo();
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const languages = navigator.languages;
    const cpuCores = navigator.hardwareConcurrency || 1;
    const deviceMemory = (navigator as any).deviceMemory; // Chrome only
    const isOnline = navigator.onLine;

    // Screen & Display
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Capabilities
    const hasWebGPU = !!navigator.gpu;
    const hasWebGL = this.checkWebGL();
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasGeolocation = 'geolocation' in navigator;
    const hasNotifications = 'Notification' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasIndexedDB = 'indexedDB' in window;

    // Device Type Detection
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || (hasTouch && viewportWidth < 768);
    const isTablet = /iPad|Android/i.test(userAgent) && viewportWidth >= 768 && viewportWidth < 1024;
    const isDesktop = !isMobile && !isTablet;
    const isMacOS = /Mac|iPhone|iPad|iPod/i.test(platform) || /Mac/i.test(userAgent);
    const isWindows = /Win/i.test(platform);
    const isLinux = /Linux/i.test(platform) && !/Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);

    // Time & Locale
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneOffset = new Date().getTimezoneOffset();
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;

    const collectionTime = performance.now() - startTime;
    console.log(`📊 System info collected in ${collectionTime.toFixed(2)}ms`);

    return {
      browser,
      browserVersion: version,
      userAgent,
      platform,
      language,
      languages,
      cpuCores,
      deviceMemory,
      isOnline,
      screenWidth,
      screenHeight,
      viewportWidth,
      viewportHeight,
      pixelRatio,
      prefersDarkMode,
      prefersReducedMotion,
      hasWebGPU,
      hasWebGL,
      hasTouch,
      hasGeolocation,
      hasNotifications,
      hasServiceWorker,
      hasIndexedDB,
      isMobile,
      isTablet,
      isDesktop,
      isMacOS,
      isWindows,
      isLinux,
      isIOS,
      isAndroid,
      timezone,
      timezoneOffset,
      locale,
      collectedAt: new Date().toISOString(),
    };
  }

  /**
   * Get browser name and version
   */
  private static getBrowserInfo(): { browser: string; version: string } {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';

    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browser = 'Chrome';
      const match = ua.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'Safari';
      const match = ua.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Edg')) {
      browser = 'Edge';
      const match = ua.match(/Edg\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
      const match = ua.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('OPR') || ua.includes('Opera')) {
      browser = 'Opera';
      const match = ua.match(/(?:OPR|Opera)\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }

    return { browser, version };
  }

  /**
   * Check WebGL support
   */
  private static checkWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Get human-readable device description
   */
  static getDeviceDescription(info: SystemInfo): string {
    const deviceType = info.isMobile ? 'Mobile' : info.isTablet ? 'Tablet' : 'Desktop';
    const os = info.isIOS ? 'iOS' : info.isAndroid ? 'Android' : info.isMacOS ? 'macOS' : info.isWindows ? 'Windows' : info.isLinux ? 'Linux' : 'Unknown OS';
    return `${deviceType} • ${os} • ${info.browser} ${info.browserVersion}`;
  }

  /**
   * Get capabilities summary
   */
  static getCapabilitiesSummary(info: SystemInfo): string {
    const capabilities: string[] = [];
    if (info.hasWebGPU) capabilities.push('WebGPU');
    if (info.hasWebGL) capabilities.push('WebGL');
    if (info.hasTouch) capabilities.push('Touch');
    if (info.hasServiceWorker) capabilities.push('PWA');
    return capabilities.join(' • ');
  }
}
