/**
 * Performance Monitoring Utilities
 * Track and measure app performance metrics
 *
 * @author Dr. Ernesto Lee
 */

export interface PerformanceMetrics {
  componentLoadTime: number;
  modelLoadTime: number;
  inferenceTime: number;
  firstTokenLatency: number;
  tokensPerSecond: number;
  memoryUsage: number;
  bundleSize?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private marks: Map<string, number> = new Map();

  /**
   * Start measuring a metric
   */
  startMeasure(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * End measuring and record result
   */
  endMeasure(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.set(name, duration);
    this.marks.delete(name);

    return duration;
  }

  /**
   * Get a specific metric
   */
  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Measure memory usage
   */
  getMemoryUsage(): number {
    if ('memory' in performance && performance.memory) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }

  /**
   * Measure component render time
   */
  measureComponentLoad(componentName: string, callback: () => void): number {
    this.startMeasure(`component:${componentName}`);
    callback();
    return this.endMeasure(`component:${componentName}`);
  }

  /**
   * Log performance metrics to console
   */
  logMetrics(): void {
    const metrics = this.getAllMetrics();
    const memory = this.getMemoryUsage();

    console.group('📊 Performance Metrics');
    console.table(metrics);
    console.log(`Memory Usage: ${memory.toFixed(2)} MB`);
    console.groupEnd();
  }

  /**
   * Get navigation timing metrics
   */
  getNavigationMetrics(): {
    domContentLoaded: number;
    load: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
  } | null {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!navigation) {
      return null;
    }

    const result: any = {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      load: navigation.loadEventEnd - navigation.fetchStart,
    };

    // Get paint metrics
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      if (entry.name === 'first-paint') {
        result.firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        result.firstContentfulPaint = entry.startTime;
      }
    });

    return result;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.marks.clear();
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.getAllMetrics(),
      memory: this.getMemoryUsage(),
      navigation: this.getNavigationMetrics(),
      timestamp: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Measure async operation
   */
  async measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    try {
      const result = await operation();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Monitor FPS (frames per second)
   */
  monitorFPS(duration: number = 1000): Promise<number> {
    return new Promise((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();

      const countFrame = () => {
        frameCount++;
        const elapsed = performance.now() - startTime;

        if (elapsed < duration) {
          requestAnimationFrame(countFrame);
        } else {
          const fps = (frameCount / elapsed) * 1000;
          resolve(Math.round(fps));
        }
      };

      requestAnimationFrame(countFrame);
    });
  }

  /**
   * Check if performance API is supported
   */
  isSupported(): boolean {
    return typeof performance !== 'undefined';
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Measure component render time (call at component start)
 */
export function measureComponentStart(componentName: string): void {
  if (performanceMonitor.isSupported()) {
    performanceMonitor.startMeasure(`component:${componentName}`);
  }
}

/**
 * Log component render time (call on component unmount)
 */
export function measureComponentEnd(componentName: string): void {
  if (performanceMonitor.isSupported()) {
    const renderTime = performanceMonitor.endMeasure(`component:${componentName}`);
    console.log(`⚡ ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
  }
}
