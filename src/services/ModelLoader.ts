/**
 * Model Loading Service
 * Handles downloading and caching models from CloudFlare R2
 *
 * @author Dr. Ernesto Lee
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { ModelConfig } from '../config/models';
import type { ModelLoadProgress } from '../types';

const DB_NAME = 'browsergpt-models';
const DB_VERSION = 1;
const STORE_NAME = 'models';

export class ModelLoader {
  private db: IDBPDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }

  /**
   * Load model with progress tracking
   * For large models (>500MB), optionally skip caching based on user settings
   */
  async loadModel(
    config: ModelConfig,
    onProgress?: (progress: ModelLoadProgress) => void,
    cacheLargeModels: boolean = false
  ): Promise<ArrayBuffer | null> {
    const LARGE_MODEL_THRESHOLD = 500 * 1024 * 1024; // 500 MB

    // Check cache first
    const cached = await this.getFromCache(config.id);
    if (cached) {
      console.log(`✅ Model loaded from cache: ${config.name}`);
      return cached;
    }

    // For large models, decide whether to cache based on user preference
    if (config.size > LARGE_MODEL_THRESHOLD && !cacheLargeModels) {
      console.log(`⚡ Large model detected: ${config.name} (${this.formatBytes(config.size)})`);
      console.log(`   Downloading with progress tracking (not caching to save space)`);
      console.log(`   💡 Tip: Enable "Cache Large Models" in Settings to speed up future loads`);

      // Download with progress but don't allocate memory
      await this.downloadWithProgress(config, onProgress, true);

      console.log(`✓ Model downloaded successfully: ${config.name}`);
      return null; // MediaPipe will use from browser cache
    }

    // For small models or when user wants to cache large models, download and cache
    console.log(`⬇️ Downloading model: ${config.name} (${this.formatBytes(config.size)})`);
    const arrayBuffer = await this.downloadWithProgress(config, onProgress);

    // Cache for future use
    await this.saveToCache(config.id, arrayBuffer);
    console.log(`💾 Model cached: ${config.name}`);

    return arrayBuffer;
  }

  /**
   * Download model with progress tracking
   */
  private async downloadWithProgress(
    config: ModelConfig,
    onProgress?: (progress: ModelLoadProgress) => void,
    trackOnly: boolean = false
  ): Promise<ArrayBuffer> {
    const response = await fetch(config.url);

    if (!response.ok) {
      throw new Error(`Failed to load model: ${response.statusText}`);
    }

    const total = config.size;
    let loaded = 0;
    const startTime = Date.now();

    // Emit initial progress to show 0% immediately
    if (onProgress) {
      onProgress({
        modelId: config.id,
        loaded: 0,
        total,
        percentage: 0,
        speed: 0,
        eta: 0,
      });
    }

    const reader = response.body!.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Only store chunks if we're not in track-only mode
      if (!trackOnly) {
        chunks.push(value);
      }
      loaded += value.length;

      if (onProgress) {
        const elapsed = (Date.now() - startTime) / 1000; // seconds
        const speed = loaded / elapsed; // bytes per second
        const remaining = Math.max(0, total - loaded);
        const eta = remaining > 0 ? remaining / speed : 0;

        // Cap percentage at 100% and ensure it's not negative
        const percentage = Math.min(100, Math.max(0, (loaded / total) * 100));

        onProgress({
          modelId: config.id,
          loaded: Math.min(loaded, total), // Don't show more than total
          total,
          percentage,
          speed,
          eta,
        });
      }
    }

    // If track-only mode, return empty ArrayBuffer
    if (trackOnly) {
      return new ArrayBuffer(0);
    }

    // Concatenate all chunks - with error handling for large allocations
    try {
      const concatenated = new Uint8Array(loaded);
      let position = 0;
      for (const chunk of chunks) {
        concatenated.set(chunk, position);
        position += chunk.length;
      }

      return concatenated.buffer;
    } catch (error) {
      // ArrayBuffer allocation failed - likely out of memory
      const errorMessage = `Failed to allocate memory for model ${config.name} (${this.formatBytes(loaded)}). ` +
        `Your browser may not have enough memory available. ` +
        `Try:\n` +
        `1. Switching to a smaller model (CAESAR 270M uses only 297 MB)\n` +
        `2. Disabling "Cache Large Models" in Settings\n` +
        `3. Closing other tabs to free up memory`;

      console.error('❌ ArrayBuffer allocation failed:', error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get model from IndexedDB cache
   */
  private async getFromCache(modelId: string): Promise<ArrayBuffer | null> {
    if (!this.db) await this.initialize();
    try {
      return await this.db!.get(STORE_NAME, modelId);
    } catch (error) {
      console.warn('Cache read error:', error);
      return null;
    }
  }

  /**
   * Save model to IndexedDB cache
   */
  private async saveToCache(modelId: string, data: ArrayBuffer): Promise<void> {
    if (!this.db) await this.initialize();
    try {
      await this.db!.put(STORE_NAME, data, modelId);
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  /**
   * Clear all cached models
   */
  async clearCache(): Promise<void> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction(STORE_NAME, 'readwrite');
    await tx.objectStore(STORE_NAME).clear();
    await tx.done;
    console.log('🗑️ Model cache cleared');
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { usage: 0, quota: 0 };
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}

// Singleton instance
export const modelLoader = new ModelLoader();
