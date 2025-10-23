# MediaPipe LLM Inference Integration Guide
**Using Google's official on-device AI for GEMMA models**

**Version:** 1.0
**Last Updated:** 2025-10-22
**Author:** Dr. Ernesto Lee

---

## Overview

BrowserGPT uses **MediaPipe Tasks GenAI**, Google's official solution for running large language models entirely in the browser. This provides native support for GEMMA models with WebGPU acceleration and built-in multimodal capabilities.

### Why MediaPipe over Transformers.js?

✅ **Official Google Support** - First-party support for GEMMA models
✅ **Optimized for GEMMA** - Built specifically for Google's models
✅ **Native Multimodal** - Built-in image + audio support for GEMMA 3N
✅ **WebGPU First** - Designed for hardware acceleration
✅ **LiterTLM Format** - Direct support for .litertlm files
✅ **Streaming Built-in** - Native streaming token generation

---

## Installation

### NPM Package

```bash
npm install @mediapipe/tasks-genai
```

### CDN (Alternative)

```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/genai_bundle.cjs"></script>
```

---

## Basic Usage

### 1. Initialize MediaPipe

```typescript
import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';

// Load MediaPipe WASM files
const genAi = await FilesetResolver.forGenAiTasks(
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm'
);

// Create LLM Inference instance
const llmInference = await LlmInference.createFromOptions(genAi, {
  baseOptions: {
    modelAssetPath: '/path/to/gemma-model.litertlm'
  },
  maxTokens: 1000,
  topK: 40,
  temperature: 0.8,
  randomSeed: 101
});
```

### 2. Text Generation

```typescript
const response = await llmInference.generateResponse(
  '<start_of_turn>user\nWhat is AI?<end_of_turn>\n<start_of_turn>model\n'
);

console.log(response);
```

### 3. Streaming Generation

```typescript
llmInference.generateResponse(
  prompt,
  (partialResult, done) => {
    console.log(partialResult); // Incremental tokens
    if (done) {
      console.log('Complete!');
    }
  }
);
```

---

## Multimodal Support (GEMMA 3N)

### Enable Multimodal

```typescript
const llmInference = await LlmInference.createFromOptions(genAi, {
  baseOptions: {
    modelAssetPath: '/path/to/gemma-3n-E4B.litertlm'
  },
  maxTokens: 1000,
  topK: 40,
  temperature: 0.8,
  // Enable vision and audio
  maxNumImages: 5,
  supportAudio: true,
});
```

### Multimodal Prompts

```typescript
const response = await llmInference.generateResponse([
  '<start_of_turn>user\n',
  'Describe this image: ',
  { imageSource: '/path/to/image.png' },
  ' and transcribe this audio: ',
  { audioSource: '/path/to/audio.wav' },
  '<end_of_turn>\n<start_of_turn>model\n',
]);
```

### Supported Input Types

**Images:**
- Image URLs
- `HTMLImageElement`
- `HTMLCanvasElement`
- `HTMLVideoElement`

**Audio:**
- Audio file URLs (mono-channel only)
- `AudioBuffer` (single-channel)

---

## Model Format Requirements

### LiterTLM Format

MediaPipe requires models in **LiterTLM** format with `.litertlm` extension:

```
gemma-3n-E4B-it-int4-Web.litertlm
gemma-3n-E2B-it-int4-Web.litertlm
gemma3-270m-it-q8-web.task
```

### Official Models

Download from HuggingFace:

**GEMMA 3N E4B:**
```
https://huggingface.co/google/gemma-3n-E4B-it-litert-lm/blob/main/gemma-3n-E4B-it-int4-Web.litertlm
```

**GEMMA 3N E2B:**
```
https://huggingface.co/google/gemma-3n-E2B-it-litert-lm/blob/main/gemma-3n-E2B-it-int4-Web.litertlm
```

**GEMMA 3 270M:**
```
https://huggingface.co/litert-community/gemma-3-270m-it
```

---

## Configuration Options

| Option | Description | Default | Range |
|--------|-------------|---------|-------|
| `maxTokens` | Max input + output tokens | 512 | 1-4096 |
| `topK` | Top-k sampling | 40 | 1-100 |
| `temperature` | Randomness (0=deterministic) | 0.8 | 0.0-2.0 |
| `randomSeed` | Seed for reproducibility | 0 | Any integer |
| `maxNumImages` | Max images per prompt | 0 | 0-10 |
| `supportAudio` | Enable audio input | false | true/false |

---

## Prompt Formatting for GEMMA

### Standard Format

```
<start_of_turn>user
Your question here
<end_of_turn>
<start_of_turn>model
```

### Multi-turn Conversation

```typescript
const conversation = `
<start_of_turn>user
Hello!
<end_of_turn>
<start_of_turn>model
Hi! How can I help you?
<end_of_turn>
<start_of_turn>user
What's 2+2?
<end_of_turn>
<start_of_turn>model
`;

const response = await llmInference.generateResponse(conversation);
```

---

## Integration with CloudFlare R2

### Loading from R2 URLs

```typescript
const llmInference = await LlmInference.createFromOptions(genAi, {
  baseOptions: {
    modelAssetPath: 'https://pub-YOUR-ID.r2.dev/gemma-3n-E4B-it-int4-Web.litertlm'
  },
  maxTokens: 1000,
});
```

### With Progress Tracking

MediaPipe doesn't natively support progress callbacks, so use browser fetch:

```typescript
const response = await fetch(modelUrl);
const reader = response.body.getReader();
const contentLength = +response.headers.get('Content-Length');

let receivedLength = 0;
const chunks = [];

while(true) {
  const {done, value} = await reader.read();
  if (done) break;

  chunks.push(value);
  receivedLength += value.length;

  const progress = (receivedLength / contentLength) * 100;
  console.log(`Downloaded: ${progress.toFixed(1)}%`);
}

const blob = new Blob(chunks);
const blobUrl = URL.createObjectURL(blob);

// Now use blob URL with MediaPipe
const llmInference = await LlmInference.createFromOptions(genAi, {
  baseOptions: { modelAssetPath: blobUrl }
});
```

---

## BrowserGPT Implementation

### InferenceEngine.ts

```typescript
import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';

export class InferenceEngine {
  private llmInference: any = null;
  private genAi: any = null;

  async initialize(config: ModelConfig): Promise<void> {
    // Load MediaPipe GenAI library
    this.genAi = await FilesetResolver.forGenAiTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm'
    );

    // Check if model supports multimodal
    const isMultimodal = config.capabilities.length > 1;

    // Create LLM Inference instance
    this.llmInference = await LlmInference.createFromOptions(this.genAi, {
      baseOptions: {
        modelAssetPath: config.url,
      },
      maxTokens: 1000,
      topK: 40,
      temperature: 0.8,
      randomSeed: 101,
      // Enable multimodal if supported
      ...(isMultimodal && {
        maxNumImages: 5,
        supportAudio: true,
      }),
    });
  }

  async generate(prompt: string): Promise<string> {
    const formattedPrompt = `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model\n`;
    return await this.llmInference.generateResponse(formattedPrompt);
  }
}
```

---

## Performance Optimization

### WebGPU Requirements

MediaPipe requires WebGPU for optimal performance:

```javascript
// Check WebGPU support
if (!navigator.gpu) {
  console.error('WebGPU not supported');
}
```

**Compatible Browsers:**
- Chrome 113+
- Edge 113+
- Opera 99+

### Memory Management

```typescript
// MediaPipe handles memory internally
// Just clear references for garbage collection
llmInference = null;
genAi = null;

if (global.gc) {
  global.gc(); // Suggest GC
}
```

---

## Troubleshooting

### Model Won't Load

**Error:** `Failed to load model`

**Solutions:**
1. Verify model is in `.litertlm` format
2. Check CORS headers on R2:
   ```json
   {
     "AllowOrigins": ["*"],
     "AllowMethods": ["GET"],
     "AllowHeaders": ["*"]
   }
   ```
3. Ensure WebGPU is enabled

### WebGPU Not Available

**Error:** `WebGPU is not supported`

**Solutions:**
1. Update browser to latest version
2. Enable WebGPU in Chrome flags:
   ```
   chrome://flags/#enable-unsafe-webgpu
   ```
3. Check GPU compatibility

### Out of Memory

**Error:** `Out of memory`

**Solutions:**
1. Use smaller model (270M instead of E4B)
2. Reduce `maxTokens` parameter
3. Close other tabs
4. Use text-only mode (disable multimodal)

---

## Advanced Features

### LoRA Customization

MediaPipe supports LoRA (Low-Rank Adaptation) for model fine-tuning:

```typescript
const llmInference = await LlmInference.createFromOptions(genAi, {
  baseOptions: { modelAssetPath: baseModelPath },
  loraRanks: [4, 8, 16] // Support multiple LoRA ranks
});

// Load LoRA weights
const loraModel = await llmInference.loadLoraModel(loraModelUrl);

// Use LoRA during inference
llmInference.generateResponse(prompt, loraModel, callback);
```

---

## Comparison: MediaPipe vs Transformers.js

| Feature | MediaPipe | Transformers.js |
|---------|-----------|-----------------|
| GEMMA Support | ✅ Native | ⚠️ Third-party |
| Multimodal | ✅ Built-in | ❌ Manual |
| WebGPU | ✅ Primary | ⚠️ Fallback |
| Streaming | ✅ Native | ⚠️ Limited |
| Model Format | .litertlm | .onnx |
| File Size | Optimized | Larger |
| Maintenance | Google | Community |

---

## Resources

- [MediaPipe LLM Inference Docs](https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference)
- [MediaPipe Studio Demo](https://mediapipe-studio.webapps.google.com/studio/demo/llm_inference)
- [GEMMA 3N Documentation](https://ai.google.dev/gemma/docs/gemma-3n)
- [HuggingFace GEMMA Models](https://huggingface.co/google)

---

**Built with ❤️ by Dr. Ernesto Lee**
