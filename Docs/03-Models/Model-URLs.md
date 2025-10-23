# BrowserGPT Model URLs
## Production CloudFlare R2 Model Endpoints

**Version:** 1.0
**Last Updated:** 2025-10-22
**CloudFlare R2 Account**: pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev

---

## Production Model URLs

### 1. GEMMA 3 270M (Q8 - Text Only)

**Full URL**:
```
https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma3-270m-it-q8-web.task
```

**Specifications**:
- **Parameters**: 270 million
- **Quantization**: Q8 (8-bit)
- **Format**: Web Task (.task)
- **Variant**: Instruction-tuned (IT)
- **Size**: ~297 MB
- **Capabilities**: Text generation only
- **Context Window**: 8K tokens

**Use Cases**:
- Fast text queries
- Simple Q&A
- Text classification
- Sentiment analysis
- Low-latency responses

---

### 2. GEMMA 3N E2B (INT4 - Multimodal)

**Full URL**:
```
https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma-3n-E2B-it-int4-Web.litertlm
```

**Specifications**:
- **Effective Parameters**: 1.91 billion (with PLE caching)
- **Total Parameters**: 5.1 billion
- **Quantization**: INT4 (4-bit)
- **Format**: LiterTLM (.litertlm)
- **Variant**: E2B Instruction-tuned (IT)
- **Size**: ~1.9 GB (optimized)
- **Capabilities**: Text, Image, Audio, Video
- **Context Window**: 32K tokens

**Use Cases**:
- Multimodal chat (text + images)
- Image understanding and description
- Visual question answering
- Audio transcription
- Document analysis
- Accessibility features

**Special Features**:
- PLE (Per-Layer Embedding) caching
- MatFormer architecture
- Conditional parameter loading
- MobileNet-V5 vision encoder

---

### 3. Third Model (To Be Provided)

**Full URL**:
```
[URL will be provided later]
```

**Specifications**:
- **Details**: To be determined
- **Quantization**: TBD
- **Format**: TBD
- **Size**: TBD
- **Capabilities**: TBD

---

## Code Configuration

### TypeScript/React Configuration

```typescript
// src/config/models.ts

/**
 * Production model URLs hosted on CloudFlare R2
 * All models are pre-configured and ready for browser inference
 */
export const MODEL_CONFIG = {
  // Base R2 URL
  R2_BASE_URL: 'https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev',

  // Model endpoints
  models: {
    // GEMMA 3 270M - Fast text-only model
    gemma270m: {
      url: 'https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma3-270m-it-q8-web.task',
      name: 'GEMMA 3 270M Q8',
      type: 'text-generation',
      format: 'task',
      quantization: 'q8',
      size: 297 * 1024 * 1024, // 297 MB in bytes
      capabilities: ['text'],
      contextWindow: 8000,
      parameters: 270_000_000,
      description: 'Fast, lightweight text-only model for simple queries',
      recommended: {
        device: 'webgpu',
        fallback: 'wasm',
        minMemory: 450 * 1024 * 1024, // 450 MB
      },
    },

    // GEMMA 3N E2B - Multimodal model
    gemma3nE2B: {
      url: 'https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma-3n-E2B-it-int4-Web.litertlm',
      name: 'GEMMA 3N E2B INT4',
      type: 'multimodal',
      format: 'litertlm',
      quantization: 'int4',
      size: 1.9 * 1024 * 1024 * 1024, // 1.9 GB in bytes
      capabilities: ['text', 'vision', 'audio', 'video'],
      contextWindow: 32000,
      parameters: 1_910_000_000, // Effective parameters
      totalParameters: 5_100_000_000,
      description: 'Multimodal model with vision, audio, and text capabilities',
      features: ['ple-caching', 'matformer', 'conditional-loading'],
      recommended: {
        device: 'webgpu',
        fallback: 'wasm',
        minMemory: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
      },
    },

    // Third model - To be added
    thirdModel: {
      url: null, // To be provided
      name: 'TBD',
      type: 'tbd',
      format: 'tbd',
      quantization: 'tbd',
      size: 0,
      capabilities: [],
      contextWindow: 0,
      parameters: 0,
      description: 'Third model - specifications to be determined',
      recommended: {
        device: 'webgpu',
        fallback: 'wasm',
        minMemory: 0,
      },
    },
  },
} as const;

/**
 * Get model configuration by ID
 */
export function getModelConfig(modelId: keyof typeof MODEL_CONFIG.models) {
  return MODEL_CONFIG.models[modelId];
}

/**
 * Get all available models
 */
export function getAvailableModels() {
  return Object.entries(MODEL_CONFIG.models)
    .filter(([_, config]) => config.url !== null)
    .map(([id, config]) => ({
      id,
      ...config,
    }));
}

/**
 * Select model based on capabilities needed
 */
export function selectModelByCapability(
  capabilities: Array<'text' | 'vision' | 'audio' | 'video'>
) {
  const models = getAvailableModels();

  // If only text is needed, prefer smaller model
  if (capabilities.length === 1 && capabilities[0] === 'text') {
    return models.find(m => m.id === 'gemma270m');
  }

  // For multimodal, use GEMMA 3N
  return models.find(m =>
    capabilities.every(cap => m.capabilities.includes(cap))
  );
}
```

### Environment Variables (.env)

```bash
# CloudFlare R2 Configuration
VITE_R2_BASE_URL=https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev

# Model URLs
VITE_MODEL_GEMMA_270M=https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma3-270m-it-q8-web.task
VITE_MODEL_GEMMA_3N_E2B=https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma-3n-E2B-it-int4-Web.litertlm

# Third model - to be added
# VITE_MODEL_THIRD=[to be provided]

# Model selection
VITE_DEFAULT_MODEL=gemma270m
```

---

## Usage Examples

### Loading GEMMA 3 270M

```typescript
import { pipeline } from '@xenova/transformers';
import { MODEL_CONFIG } from './config/models';

const config = MODEL_CONFIG.models.gemma270m;

const model = await pipeline(
  config.type,
  config.url,
  {
    device: config.recommended.device,
    dtype: config.quantization,
    format: config.format,
  }
);

const response = await model('What is AI?', {
  max_new_tokens: 256,
  temperature: 0.7,
});

console.log(response);
```

### Loading GEMMA 3N E2B with Progress

```typescript
import { MODEL_CONFIG } from './config/models';

const config = MODEL_CONFIG.models.gemma3nE2B;

async function loadModelWithProgress() {
  const response = await fetch(config.url);
  const total = config.size;
  let loaded = 0;

  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    loaded += value.length;

    const percentage = (loaded / total) * 100;
    console.log(`Loading: ${percentage.toFixed(1)}%`);

    // Update UI progress bar
    updateProgressBar(percentage);
  }

  // Combine chunks and initialize model
  const modelData = concatenateChunks(chunks);
  return initializeModel(modelData);
}
```

### Conditional Model Selection

```typescript
import { selectModelByCapability } from './config/models';

// User wants text-only chat
const textModel = selectModelByCapability(['text']);
console.log(textModel?.name); // "GEMMA 3 270M Q8"

// User wants to upload an image
const visionModel = selectModelByCapability(['text', 'vision']);
console.log(visionModel?.name); // "GEMMA 3N E2B INT4"

// User wants audio transcription
const audioModel = selectModelByCapability(['text', 'audio']);
console.log(audioModel?.name); // "GEMMA 3N E2B INT4"
```

---

## Model Download Verification

### Checksums (To Be Computed)

```typescript
// Compute and verify model checksums
async function verifyModelChecksum(
  arrayBuffer: ArrayBuffer,
  expectedChecksum: string
): Promise<boolean> {
  const hash = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hash));
  const actualChecksum = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return actualChecksum === expectedChecksum;
}

// Model checksums (compute after downloading models)
export const MODEL_CHECKSUMS = {
  gemma270m: {
    sha256: '[to be computed after download]',
  },
  gemma3nE2B: {
    sha256: '[to be computed after download]',
  },
  thirdModel: {
    sha256: '[to be computed after download]',
  },
};
```

---

## Bandwidth & Performance

### Expected Download Times

**GEMMA 3 270M (297 MB)**:
- 10 Mbps: ~4 minutes
- 25 Mbps: ~1.5 minutes
- 50 Mbps: ~48 seconds
- 100 Mbps: ~24 seconds

**GEMMA 3N E2B (1.9 GB)**:
- 10 Mbps: ~25 minutes
- 25 Mbps: ~10 minutes
- 50 Mbps: ~5 minutes
- 100 Mbps: ~2.5 minutes

### Caching Strategy

```typescript
// Cache models in IndexedDB after first download
import { openDB } from 'idb';

const db = await openDB('browsergpt-models', 1, {
  upgrade(db) {
    db.createObjectStore('models');
  },
});

// Check cache first
async function getModelCached(modelId: string) {
  const cached = await db.get('models', modelId);
  if (cached) {
    console.log(`✅ Model loaded from cache: ${modelId}`);
    return cached;
  }

  // Download from R2
  const config = getModelConfig(modelId);
  console.log(`⬇️ Downloading model from R2: ${modelId}`);
  const modelData = await downloadModel(config.url);

  // Cache for next time
  await db.put('models', modelData, modelId);
  console.log(`💾 Model cached: ${modelId}`);

  return modelData;
}
```

---

## Update History

| Date | Model | URL | Notes |
|------|-------|-----|-------|
| 2025-10-22 | GEMMA 3 270M Q8 | Added | Initial production deployment |
| 2025-10-22 | GEMMA 3N E2B INT4 | Added | Initial production deployment |
| TBD | Third Model | Pending | Awaiting URL from provider |

---

## CloudFlare R2 Details

**Account ID**: pub-8f8063a5b7fd42c1bf158b9ba33997d5
**Bucket Name**: (inferred from URL path)
**Region**: Global CDN
**Public Access**: Enabled
**CORS**: Configured for browser access
**Egress Fees**: $0 (free)

---

## Next Steps

1. ✅ Add model URLs to configuration
2. ✅ Update code examples with actual URLs
3. ⏳ Compute and add SHA-256 checksums
4. ⏳ Test model loading from R2
5. ⏳ Benchmark download times
6. ⏳ Add third model URL when provided

---

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Maintainer**: BrowserGPT Team
**Attribution**: Dr. Ernesto Lee
