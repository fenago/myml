# Complete Model Reference for BrowserGPT
**Quick reference for all available models**

**Version:** 1.0
**Last Updated:** 2025-10-22
**Author:** Dr. Ernesto Lee

---

## Primary Models (GEMMA via Transformers.js)

All GEMMA models are hosted on CloudFlare R2 and loaded via Transformers.js with WASM/WebGPU acceleration.

### GEMMA 3 270M - Fast Text Model

**URL:**
```
https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma3-270m-it-q8-web.task
```

**Specifications:**
- **Size**: 297 MB
- **Format**: .task (Web Task format)
- **Quantization**: Q8 (8-bit)
- **Parameters**: 270 million
- **Context Window**: 8,000 tokens
- **Capabilities**: Text generation only
- **Speed**: ~45 tokens/second (M1 Mac)

**Best For:**
- Quick queries and simple Q&A
- Text classification and extraction
- Fast responses on low-end devices
- Offline mode (smallest footprint)

**Memory Requirements:**
- Minimum: 450 MB RAM
- Recommended: 1 GB RAM

---

### GEMMA 3N E2B - Multimodal Model

**URL:**
```
https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma-3n-E2B-it-int4-Web.litertlm
```

**Specifications:**
- **Size**: 1.9 GB
- **Format**: .litertlm (LiterTLM format)
- **Quantization**: INT4 (4-bit)
- **Parameters**: 1.91 billion (effective with PLE caching)
- **Total Parameters**: 5.1 billion
- **Context Window**: 32,000 tokens
- **Capabilities**: Text, Vision, Audio
- **Speed**: ~18 tokens/second (M1 Mac)

**Features:**
- PLE Caching (reduces memory by ~60%)
- MobileNet-V5 vision encoder
- Dedicated audio encoder
- MatFormer architecture

**Best For:**
- Image analysis and description
- Visual question answering
- Audio transcription
- Multimodal chat interactions

**Memory Requirements:**
- Minimum: 2.5 GB RAM
- Recommended: 4 GB RAM
- With PLE cache: 1.91 GB active memory

---

### GEMMA 3N E4B - Advanced Multimodal Model

**URL:**
```
https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma-3n-E4B-it-int4-Web.litertlm
```

**Specifications:**
- **Size**: 2.1 GB
- **Format**: .litertlm (LiterTLM format)
- **Quantization**: INT4 (4-bit)
- **Parameters**: 2.1 billion (effective with PLE caching)
- **Total Parameters**: 5.5 billion
- **Context Window**: 32,000 tokens
- **Capabilities**: Text, Vision, Audio (Enhanced)
- **Speed**: ~15 tokens/second (M1 Mac)

**Features:**
- All E2B features plus:
- Enhanced vision processing
- Improved multimodal understanding
- Better context retention
- Advanced reasoning capabilities

**Best For:**
- Complex multimodal tasks
- Detailed image analysis
- Long-form conversations with context
- Professional use cases

**Memory Requirements:**
- Minimum: 2.8 GB RAM
- Recommended: 4 GB RAM
- With PLE cache: 2.1 GB active memory

---

## Legacy/Backup Models (WebLLM)

These models are available as a backup option via the WebLLM library (@mlc-ai/web-llm).

### Llama 3.1 8B Instruct

**Model ID:** `Llama-3.1-8B-Instruct-q4f32_1-MLC`

**Specifications:**
- **Size**: 4.8 GB
- **Parameters**: 8 billion
- **Provider**: Meta
- **Capabilities**: Text generation
- **Speed**: ~12 tokens/second (M1 Mac)

**Best For:**
- Long-form text generation
- Creative writing
- Code generation
- Advanced reasoning

---

### Phi-3 Mini

**Model ID:** `Phi-3-mini-4k-instruct-q4f16_1-MLC`

**Specifications:**
- **Size**: 2.3 GB
- **Parameters**: 3.8 billion
- **Provider**: Microsoft
- **Capabilities**: Text generation
- **Speed**: ~22 tokens/second (M1 Mac)

**Best For:**
- Balanced performance and size
- General-purpose chat
- Educational applications
- Resource-constrained environments

---

### Gemma 2 2B

**Model ID:** `gemma-2-2b-it-q4f16_1-MLC`

**Specifications:**
- **Size**: 1.5 GB
- **Parameters**: 2 billion
- **Provider**: Google
- **Capabilities**: Text generation
- **Speed**: ~28 tokens/second (M1 Mac)

**Best For:**
- Lightweight alternative to GEMMA 3N
- Fast text generation
- Mobile devices
- Quick prototyping

---

## Model Selection Guide

### By Use Case

| Use Case | Recommended Model |
|----------|------------------|
| Quick Q&A | GEMMA 3 270M |
| Image Analysis | GEMMA 3N E2B or E4B |
| Voice Transcription | GEMMA 3N E2B or E4B |
| Creative Writing | Llama 3.1 8B (WebLLM) |
| Code Generation | Llama 3.1 8B (WebLLM) |
| Mobile Devices | GEMMA 3 270M or Gemma 2 2B |
| Complex Reasoning | GEMMA 3N E4B |

### By Device Capability

| Device | RAM | Recommended Model |
|--------|-----|-------------------|
| Low-end phone | 2-3 GB | GEMMA 3 270M |
| Mid-range phone | 4-6 GB | GEMMA 3N E2B |
| High-end phone | 8+ GB | GEMMA 3N E4B |
| Laptop (Intel) | 8 GB | GEMMA 3N E2B |
| Laptop (M1/M2) | 8-16 GB | GEMMA 3N E4B or Llama 3.1 8B |
| Desktop | 16+ GB | Any model |

### By Network Speed

**First-time Download Times** (estimated):

| Model | 10 Mbps | 50 Mbps | 100 Mbps |
|-------|---------|---------|----------|
| GEMMA 3 270M | ~4 min | ~1 min | ~30 sec |
| GEMMA 3N E2B | ~25 min | ~5 min | ~2.5 min |
| GEMMA 3N E4B | ~28 min | ~6 min | ~3 min |
| Llama 3.1 8B | ~64 min | ~13 min | ~6 min |

*After first download, all models load instantly from browser cache.*

---

## Implementation

### Loading Primary Models (Transformers.js)

```typescript
import { pipeline } from '@xenova/transformers';

// Load GEMMA 3 270M
const model270m = await pipeline(
  'text-generation',
  'https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma3-270m-it-q8-web.task'
);

// Load GEMMA 3N E2B
const modelE2B = await pipeline(
  'text-generation',
  'https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma-3n-E2B-it-int4-Web.litertlm'
);

// Load GEMMA 3N E4B
const modelE4B = await pipeline(
  'text-generation',
  'https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma-3n-E4B-it-int4-Web.litertlm'
);
```

### Loading Legacy Models (WebLLM)

```typescript
import { CreateMLCEngine } from '@mlc-ai/web-llm';

// Load Llama 3.1 8B
const llamaEngine = await CreateMLCEngine(
  'Llama-3.1-8B-Instruct-q4f32_1-MLC'
);

// Load Phi-3 Mini
const phiEngine = await CreateMLCEngine(
  'Phi-3-mini-4k-instruct-q4f16_1-MLC'
);

// Load Gemma 2 2B
const gemma2Engine = await CreateMLCEngine(
  'gemma-2-2b-it-q4f16_1-MLC'
);
```

---

## Browser Compatibility

### Primary Models (Transformers.js)
- ✅ Chrome 113+ (WebGPU)
- ✅ Edge 113+ (WebGPU)
- ⚠️ Firefox 115+ (WASM only, slower)
- ⚠️ Safari 16+ (limited support)

### Legacy Models (WebLLM)
- ✅ Chrome 113+ (WebGPU)
- ✅ Edge 113+  (WebGPU)
- ❌ Firefox (WebGPU not supported)
- ❌ Safari (WebGPU not supported)

---

## Model Updates

Models are hosted on CloudFlare R2 and can be updated independently:

1. Upload new model to R2
2. Update URL in `src/config/models.ts`
3. Rebuild and redeploy application
4. Users will download new model on next use

**Version Control:**
- Model URLs can include version numbers
- Browser cache uses URL as key
- New URL = fresh download

---

**Built with ❤️ by Dr. Ernesto Lee**
