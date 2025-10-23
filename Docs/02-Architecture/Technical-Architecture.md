# Technical Architecture: BrowserGPT
## Detailed System Design and Component Specifications

**Version:** 1.0
**Last Updated:** 2025-10-22

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Component Architecture](#2-component-architecture)
3. [Data Flow](#3-data-flow)
4. [Technology Deep Dive](#4-technology-deep-dive)
5. [Performance Optimization](#5-performance-optimization)
6. [Scaling Considerations](#6-scaling-considerations)

---

## 1. System Overview

BrowserGPT is a pure client-side application that leverages modern browser capabilities to run AI models with no backend dependencies. The architecture prioritizes:

- **Privacy**: Zero data transmission to servers
- **Performance**: Hardware acceleration via WebGPU
- **Reliability**: Offline-first design with progressive enhancement
- **Efficiency**: Optimized memory usage and model caching

### 1.1 Architectural Principles

1. **Client-Side Only**: All computation in browser
2. **Progressive Enhancement**: Graceful degradation for older browsers
3. **Resource Conscious**: Efficient memory and CPU usage
4. **Offline First**: Full functionality without network
5. **Zero Backend**: No servers, no APIs, no databases

---

## 2. Component Architecture

### 2.1 Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React Components (UI)                              │   │
│  │  • ChatInterface                                    │   │
│  │  • ModelSelector                                    │   │
│  │  • FileUploader                                     │   │
│  │  • SettingsPanel                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  State Management (Zustand/Redux)                   │   │
│  │  • Conversation State                               │   │
│  │  • Model State                                      │   │
│  │  • UI State                                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Business Logic Services                            │   │
│  │  • InferenceService                                 │   │
│  │  • ModelLoaderService                               │   │
│  │  • CacheService                                     │   │
│  │  • MultimodalService                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Browser APIs & WASM Runtime                        │   │
│  │  • Transformers.js                                  │   │
│  │  • ONNX Runtime Web                                 │   │
│  │  • WebGPU                                           │   │
│  │  • Web Workers                                      │   │
│  │  • IndexedDB                                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Core Components

#### 2.2.1 Presentation Layer

**ChatInterface Component**
```typescript
interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isGenerating: boolean;
  tokensPerSecond: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  tokensPerSecond
}) => {
  // Render chat UI with message history
  // Handle user input
  // Display generation progress
};
```

**ModelSelector Component**
```typescript
interface ModelSelectorProps {
  availableModels: ModelInfo[];
  currentModel: string;
  onModelChange: (modelId: string) => void;
  downloadProgress?: DownloadProgress;
}

type ModelInfo = {
  id: string;
  name: string;
  size: number;
  capabilities: ('text' | 'vision' | 'audio')[];
  isDownloaded: boolean;
};
```

**FileUploader Component**
```typescript
interface FileUploaderProps {
  accept: string[]; // ['image/*', 'audio/*']
  maxSize: number;
  onFileSelect: (file: File) => void;
  multimodal: boolean;
}
```

#### 2.2.2 Application Layer

**State Management Structure**
```typescript
interface AppState {
  // Conversation State
  conversations: {
    [id: string]: {
      messages: Message[];
      model: string;
      createdAt: Date;
    };
  };
  currentConversationId: string;

  // Model State
  models: {
    [id: string]: {
      status: 'not-loaded' | 'downloading' | 'loaded' | 'error';
      progress?: number;
      error?: string;
      metadata: ModelMetadata;
    };
  };

  // UI State
  ui: {
    sidebarOpen: boolean;
    settingsOpen: boolean;
    theme: 'light' | 'dark';
    isGenerating: boolean;
  };

  // Settings
  settings: {
    temperature: number;
    maxTokens: number;
    topP: number;
    preferredModel: string;
  };
}
```

#### 2.2.3 Service Layer

**InferenceService**
```typescript
class InferenceService {
  private worker: Worker;
  private currentModel: any;

  async initialize(modelId: string): Promise<void> {
    // Load model into Web Worker
    // Initialize ONNX Runtime session
    // Configure WebGPU if available
  }

  async generate(
    prompt: string,
    options: GenerationOptions,
    onToken?: (token: string) => void
  ): Promise<string> {
    // Send to worker
    // Stream tokens back
    // Handle errors
  }

  async generateMultimodal(
    inputs: MultimodalInputs,
    options: GenerationOptions
  ): Promise<string> {
    // Process images/audio
    // Combine with text prompt
    // Generate response
  }

  getMetrics(): InferenceMetrics {
    return {
      tokensPerSecond: this.currentTPS,
      memoryUsage: this.getMemoryUsage(),
      modelLoadTime: this.loadTime
    };
  }
}
```

**ModelLoaderService**
```typescript
class ModelLoaderService {
  private cache: CacheService;
  private baseUrl: string;

  async loadModel(
    modelId: string,
    onProgress?: (progress: number) => void
  ): Promise<ModelBundle> {
    // Check cache first
    const cached = await this.cache.get(modelId);
    if (cached) return cached;

    // Download from R2
    const bundle = await this.downloadModel(modelId, onProgress);

    // Cache for future use
    await this.cache.set(modelId, bundle);

    return bundle;
  }

  private async downloadModel(
    modelId: string,
    onProgress?: (progress: number) => void
  ): Promise<ModelBundle> {
    const url = `${this.baseUrl}/${modelId}`;

    const response = await fetch(url);
    const total = parseInt(response.headers.get('content-length') || '0');
    let loaded = 0;

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      loaded += value.length;

      if (onProgress) {
        onProgress((loaded / total) * 100);
      }
    }

    return this.assembleModel(chunks);
  }
}
```

**CacheService**
```typescript
class CacheService {
  private db: IDBDatabase;

  async initialize(): Promise<void> {
    this.db = await this.openDatabase();
  }

  async get(modelId: string): Promise<ModelBundle | null> {
    const transaction = this.db.transaction(['models'], 'readonly');
    const store = transaction.objectStore('models');
    const request = store.get(modelId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async set(modelId: string, bundle: ModelBundle): Promise<void> {
    const transaction = this.db.transaction(['models'], 'readwrite');
    const store = transaction.objectStore('models');

    await store.put({ id: modelId, ...bundle });
  }

  async clear(): Promise<void> {
    const transaction = this.db.transaction(['models'], 'readwrite');
    const store = transaction.objectStore('models');
    await store.clear();
  }

  async getUsage(): Promise<StorageEstimate> {
    return navigator.storage.estimate();
  }
}
```

#### 2.2.4 Infrastructure Layer

**Web Worker Setup**
```typescript
// inference-worker.ts
import { pipeline } from '@xenova/transformers';

let model: any = null;

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'load':
      await loadModel(payload.modelId);
      break;

    case 'generate':
      await generate(payload.prompt, payload.options);
      break;

    case 'abort':
      abortGeneration();
      break;
  }
};

async function loadModel(modelId: string) {
  try {
    model = await pipeline('text-generation', modelId, {
      device: 'webgpu', // Falls back to wasm if unavailable
      dtype: 'q4', // Quantized model
    });

    self.postMessage({ type: 'loaded', success: true });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
}

async function generate(prompt: string, options: any) {
  const output = await model(prompt, {
    max_new_tokens: options.maxTokens,
    temperature: options.temperature,
    top_p: options.topP,
    callback_function: (output: any) => {
      // Stream tokens back to main thread
      self.postMessage({
        type: 'token',
        token: output[0].generated_text
      });
    }
  });

  self.postMessage({ type: 'complete', output });
}
```

---

## 3. Data Flow

### 3.1 Model Loading Flow

```
User Action: Select Model
         ↓
┌────────────────────┐
│  Check Cache       │ ← IndexedDB
└────────┬───────────┘
         │
    ┌────▼────┐
    │ Cached? │
    └────┬────┘
         │
    ┌────▼────┐              ┌──────────────┐
    │   YES   │──────────────→│ Load from DB │
    └─────────┘              └──────┬───────┘
         │                          │
    ┌────▼────┐                    │
    │    NO   │                    │
    └────┬────┘                    │
         │                          │
    ┌────▼─────────┐               │
    │ Download R2  │←──────────────┘
    │ (w/ progress)│
    └────┬─────────┘
         │
    ┌────▼─────────┐
    │  Save to DB  │
    └────┬─────────┘
         │
    ┌────▼─────────┐
    │ Init Worker  │
    └────┬─────────┘
         │
    ┌────▼─────────┐
    │ Load ONNX    │
    └────┬─────────┘
         │
    ┌────▼─────────┐
    │    Ready     │
    └──────────────┘
```

### 3.2 Inference Flow

```
User Input: "Hello, explain AI"
         ↓
┌─────────────────────┐
│  Preprocess Input   │
│  • Tokenize         │
│  • Add system prompt│
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Send to Worker     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  ONNX Inference     │
│  • WebGPU compute   │
│  • Generate tokens  │
└──────────┬──────────┘
           │
      ┌────▼────┐
      │ Stream  │──┐
      │ Tokens  │  │
      └────┬────┘  │
           │       │
           ↓       │
    ┌──────────┐  │
    │ Display  │←─┘
    │   UI     │
    └──────────┘
           ↓
    ┌──────────┐
    │ Complete │
    └──────────┘
```

### 3.3 Multimodal Flow

```
User Uploads Image + Text
         ↓
┌─────────────────────┐
│  Process Image      │
│  • Resize/normalize │
│  • Convert to tensor│
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Vision Encoder     │
│  (MobileNet-V5)     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Get embeddings     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Combine with text  │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Text generation    │
│  (GEMMA 3N)         │
└──────────┬──────────┘
           │
           ↓
       Response
```

---

## 4. Technology Deep Dive

### 4.1 Transformers.js Integration

**Library**: @xenova/transformers v3.x

**Key Features**:
- ONNX Runtime Web backend
- WebGPU acceleration
- Automatic model conversion
- Built-in quantization support

**Configuration**:
```typescript
import { env, pipeline } from '@xenova/transformers';

// Configure for browser
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.backends.onnx.wasm.proxy = true;

// Use custom model location (R2)
env.remoteHost = 'https://pub-xxxxx.r2.dev';
env.remotePathTemplate = '{model}/';

// Initialize pipeline
const generator = await pipeline(
  'text-generation',
  'gemma-3-270mb',
  {
    device: 'webgpu',      // Prefer GPU
    dtype: 'q4',           // INT4 quantization
    revision: 'main',
  }
);
```

### 4.2 ONNX Runtime Web

**Purpose**: Low-level inference engine

**Execution Providers**:
1. WebGPU (preferred)
2. WASM with SIMD
3. WASM fallback

**Configuration**:
```typescript
import * as ort from 'onnxruntime-web';

// Set execution provider
ort.env.wasm.numThreads = navigator.hardwareConcurrency;
ort.env.wasm.simd = true;

// Create session
const session = await ort.InferenceSession.create(modelPath, {
  executionProviders: [
    {
      name: 'webgpu',
      deviceType: 'gpu',
      powerPreference: 'high-performance'
    },
    {
      name: 'wasm',
      numThreads: 4
    }
  ],
  graphOptimizationLevel: 'all',
  enableCpuMemArena: true,
  enableMemPattern: true,
});
```

### 4.3 WebGPU Acceleration

**Browser Support**: Chrome 113+, Edge 113+

**Benefits**:
- 3-5x faster than WASM
- Parallel matrix operations
- Lower power consumption

**Detection**:
```typescript
async function checkWebGPU(): Promise<boolean> {
  if (!navigator.gpu) return false;

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return false;

    const device = await adapter.requestDevice();
    return !!device;
  } catch {
    return false;
  }
}
```

### 4.4 Web Workers for Concurrency

**Purpose**: Keep UI responsive during inference

**Architecture**:
```typescript
// Main thread
const worker = new Worker(
  new URL('./inference-worker.ts', import.meta.url),
  { type: 'module' }
);

worker.postMessage({
  type: 'generate',
  payload: { prompt, options }
});

worker.onmessage = (event) => {
  if (event.data.type === 'token') {
    updateUI(event.data.token);
  }
};
```

**Worker Thread**:
- Owns ONNX session
- Handles model loading
- Runs inference
- Streams tokens back

### 4.5 IndexedDB for Model Storage

**Schema**:
```typescript
interface ModelDB {
  models: {
    key: string;           // modelId
    value: {
      weights: ArrayBuffer;
      tokenizer: any;
      config: any;
      metadata: {
        version: string;
        size: number;
        checksum: string;
        downloadedAt: Date;
      };
    };
  };

  cache: {
    key: string;           // PLE cache keys
    value: ArrayBuffer;
  };
}
```

**Usage**:
```typescript
const db = await openDB<ModelDB>('browsergpt-models', 1, {
  upgrade(db) {
    db.createObjectStore('models');
    db.createObjectStore('cache');
  }
});

// Store model
await db.put('models', modelBundle, 'gemma-3-270mb');

// Retrieve model
const model = await db.get('models', 'gemma-3-270mb');
```

---

## 5. Performance Optimization

### 5.1 Model Loading Optimization

**Parallel Chunk Loading**:
```typescript
async function loadModelParallel(urls: string[]): Promise<ArrayBuffer[]> {
  const chunks = await Promise.all(
    urls.map(url => fetch(url).then(r => r.arrayBuffer()))
  );
  return chunks;
}
```

**Streaming Decompression**:
```typescript
const response = await fetch(modelUrl);
const decompressStream = new DecompressionStream('gzip');
const stream = response.body.pipeThrough(decompressStream);
```

### 5.2 Inference Optimization

**Batching** (for multiple requests):
```typescript
class InferenceBatcher {
  private queue: Request[] = [];
  private batchSize = 4;

  async add(request: Request): Promise<Response> {
    this.queue.push(request);

    if (this.queue.length >= this.batchSize) {
      return this.processBatch();
    }
  }

  private async processBatch() {
    const batch = this.queue.splice(0, this.batchSize);
    // Process all at once with ONNX
  }
}
```

**KV Cache Reuse**:
```typescript
// Reuse computed key-value cache for multi-turn
const cache = new Map<string, KVCache>();

async function generateWithCache(prompt: string, conversationId: string) {
  const kvCache = cache.get(conversationId);

  const result = await model.generate(prompt, {
    past_key_values: kvCache, // Reuse previous computations
  });

  cache.set(conversationId, result.kv_cache);
  return result;
}
```

### 5.3 Memory Management

**PLE Cache Offloading**:
```typescript
class PLECacheManager {
  private indexedDB: IDBDatabase;

  async offloadPLE(embeddings: ArrayBuffer): Promise<void> {
    // Store embeddings in IndexedDB
    await this.indexedDB
      .transaction(['cache'], 'readwrite')
      .objectStore('cache')
      .put(embeddings, 'ple-cache');
  }

  async loadPLE(): Promise<ArrayBuffer> {
    // Retrieve when needed
    return this.indexedDB
      .transaction(['cache'])
      .objectStore('cache')
      .get('ple-cache');
  }
}
```

**Garbage Collection Hints**:
```typescript
function releaseModel() {
  model = null;
  worker.terminate();

  // Hint GC
  if (globalThis.gc) {
    globalThis.gc();
  }
}
```

---

## 6. Scaling Considerations

### 6.1 Multi-Model Support

**Model Registry**:
```typescript
const MODEL_REGISTRY = {
  'gemma-3-270mb': {
    url: 'https://pub-xxx.r2.dev/gemma-3/270mb',
    size: 270_000_000,
    capabilities: ['text'],
    quantizations: ['bf16', 'int8', 'int4']
  },
  'gemma-3n-e2b': {
    url: 'https://pub-xxx.r2.dev/gemma-3n/e2b',
    size: 5_100_000_000,
    capabilities: ['text', 'vision', 'audio'],
    components: {
      text: 'text/model.onnx',
      vision: 'vision/mobilenet_v5.onnx',
      audio: 'audio/encoder.onnx'
    }
  }
};
```

### 6.2 Horizontal Scaling

**Multiple Workers**:
```typescript
class WorkerPool {
  private workers: Worker[] = [];
  private queue: Task[] = [];

  constructor(size: number) {
    for (let i = 0; i < size; i++) {
      this.workers.push(new Worker('./inference-worker.ts'));
    }
  }

  async execute(task: Task): Promise<Result> {
    const worker = this.getAvailableWorker();
    return this.runOnWorker(worker, task);
  }
}
```

### 6.3 Progressive Enhancement

**Feature Detection**:
```typescript
const CAPABILITIES = {
  webgpu: await checkWebGPU(),
  simd: await checkSIMD(),
  threads: navigator.hardwareConcurrency > 1,
  storage: await checkStorageQuota()
};

// Select optimal model variant
const modelVariant = selectModelVariant(CAPABILITIES);
```

---

## Conclusion

This architecture provides a robust foundation for browser-based AI with:

- **Modularity**: Clear separation of concerns
- **Performance**: Hardware acceleration and optimization
- **Reliability**: Offline-first with fallbacks
- **Maintainability**: Well-structured codebase

**Next Steps**:
1. Review API documentation in `06-API-Reference/`
2. Check implementation guide in `05-Implementation/`
3. See performance benchmarks in `07-Performance/`

---

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Maintainer**: Engineering Team
