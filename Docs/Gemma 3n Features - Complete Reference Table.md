# Gemma 3n Features - Complete Reference Table

## Multimodal Input Capabilities

| Feature | Description | Documentation Link |
|---------|-------------|-------------------|
| **Text Input** | Process text strings including questions, prompts, documents for summarization. Supports 140+ languages for text-only tasks. 32K token context window. | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |
| **Image Input** | Process images at multiple resolutions (256x256, 512x512, 768x768 pixels). Each image encoded to 256 tokens. Supports image understanding, analysis, OCR, and visual reasoning. | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |
| **Video Input** | Process video content to understand motion, context, and temporal relationships. Enables video analysis and information extraction. | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |
| **Audio Input** | Process audio data encoded at 6.25 tokens per second (160ms per token) from single channel. Based on Universal Speech Model (USM) encoder. Supports up to 30 seconds at launch. | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |

## Audio-Specific Features

| Feature | Description | Documentation Link |
|---------|-------------|-------------------|
| **Automatic Speech Recognition (ASR)** | High-quality speech-to-text transcription directly on device. Converts spoken language to written text. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |
| **Automatic Speech Translation (AST)** | Translate spoken language into text in another language. Particularly strong for English ↔ Spanish, French, Italian, Portuguese. Chain-of-Thought prompting recommended for best results. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |
| **Audio Data Analysis** | General audio content analysis and understanding beyond speech (sound recognition, audio context understanding). | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |

## Vision Features

| Feature | Description | Documentation Link |
|---------|-------------|-------------------|
| **MobileNet-V5 Vision Encoder** | State-of-the-art 300M parameter vision encoder. 10x larger than MobileNet-V4. Delivers 13x speedup with quantization on Google Pixel Edge TPU. 46% fewer parameters than baseline, 4x smaller memory footprint. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |
| **Multiple Input Resolutions** | Natively supports 256x256, 512x512, and 768x768 pixel resolutions for flexibility in balancing performance and detail. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |
| **Real-time Video Processing** | Processes up to 60 frames per second on Google Pixel devices, enabling real-time on-device video analysis. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |
| **Multi-Scale Fusion VLM Adapter** | Novel adapter that enhances token quality for better accuracy and efficiency in vision-language tasks. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |

## Language Support

| Feature | Description | Documentation Link |
|---------|-------------|-------------------|
| **140+ Languages (Text)** | Wide linguistic capabilities for text-only tasks across 140+ spoken languages. | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |
| **35 Languages (Multimodal)** | Multimodal understanding (image/audio/video + text) supported in 35 languages. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |

## Context and Output

| Feature | Description | Documentation Link |
|---------|-------------|-------------------|
| **32K Token Context Window** | Substantial input context for analyzing data and handling processing tasks. Can process long documents, multiple images, or extended audio/video. | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |
| **Text Output Generation** | Generates text responses up to 32K tokens (minus input tokens). Supports answers, analysis, summaries, code, creative writing, etc. | [https://ai.google.dev/gemma/docs/gemma-3n/model_card](https://ai.google.dev/gemma/docs/gemma-3n/model_card) |

## Efficiency & Architecture Features

| Feature | Description | Documentation Link |
|---------|-------------|-------------------|
| **MatFormer Architecture** | Matryoshka Transformer with nested sub-models. E4B model contains E2B model within it. Allows selective parameter activation to reduce compute cost and response times. Enables custom model sizes between 2B-4B via Mix-n-Match. | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |
| **Per-Layer Embedding (PLE) Caching** | PLE parameters can be cached to fast local storage and computed on CPU, reducing accelerator (GPU/TPU) memory requirements while maintaining quality. Reduces E2B from 5B to ~2B effective parameters in accelerator memory. | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |
| **Conditional Parameter Loading** | Bypass loading of vision and audio parameters when not needed. Dynamically load modality-specific parameters at runtime. Reduces memory footprint for text-only tasks. | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |
| **KV Cache Sharing** | Keys and values from middle layer attention are shared with top layers. Delivers 2x improvement on prefill performance vs Gemma 3 4B. Accelerates time-to-first-token for streaming applications. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |
| **LAuReL Architecture Component** | Novel architectural component for efficiency (part of groundbreaking architecture). | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |
| **AltUp Architecture Component** | Novel architectural component for efficiency (part of groundbreaking architecture). | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |

## Model Variants

| Feature | Description | Documentation Link |
|---------|-------------|-------------------|
| **E2B (Effective 2 Billion)** | Operates with ~2B effective parameters in accelerator memory. Total 5B parameters with PLE. Optimized for mobile devices, tablets, laptops. Requires as little as 2GB memory. | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |
| **E4B (Effective 4 Billion)** | Operates with ~4B effective parameters in accelerator memory. Total 8B parameters with PLE. Enhanced capabilities for devices with more resources. Requires as little as 3GB memory. LMArena score over 1300 (first under 10B to reach this). | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |
| **Mix-n-Match Custom Sizing** | Create custom model sizes between E2B and E4B by adjusting feed-forward network dimensions (8192-16384) and selectively skipping layers. Use MatFormer Lab tool to identify optimal configurations. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |

## Advanced Capabilities

| Feature | Description | Documentation Link |
|---------|-------------|-------------------|
| **Function Calling** | Define functions with syntax and constraints that the model can invoke. Build intelligent workflows and automate tasks. (Note: Inherited from Gemma 3 family capabilities) | [https://ai.google.dev/gemma/docs/capabilities/function-calling](https://ai.google.dev/gemma/docs/capabilities/function-calling) |
| **Structured Output** | Generate data in specific formats (JSON, XML, custom formats) for integration with databases, spreadsheets, and applications. (Note: Inherited from Gemma 3 family capabilities) | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |

## Performance Characteristics

| Feature | Description | Documentation Link |
|---------|-------------|-------------------|
| **On-Device Optimization** | Engineered specifically for edge devices with minimal memory footprint. Runs on phones, laptops, tablets without cloud connectivity. | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |
| **Privacy-First, Offline-Ready** | Complete on-device execution. No data sent to cloud. Works without internet connection. | [https://deepmind.google/models/gemma/gemma-3n/](https://deepmind.google/models/gemma/gemma-3n/) |
| **Quantization Support** | Supports 16-bit (highest quality), 8-bit (balanced), and 4-bit (most efficient) quantization for further memory reduction. | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |

## Quality & Benchmarks

| Feature | Description | Documentation Link |
|---------|-------------|-------------------|
| **Enhanced Multilingual Quality** | Quality improvements across 140 languages for text and 35 languages for multimodal understanding. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |
| **Math & Reasoning** | Improved mathematical reasoning and problem-solving capabilities. Trained on mathematical text for logical reasoning. | [https://ai.google.dev/gemma/docs/gemma-3n/model_card](https://ai.google.dev/gemma/docs/gemma-3n/model_card) |
| **Code Generation** | Enhanced coding capabilities. Trained on code to understand programming syntax and patterns. | [https://ai.google.dev/gemma/docs/gemma-3n/model_card](https://ai.google.dev/gemma/docs/gemma-3n/model_card) |
| **LMArena Score 1300+** | E4B version achieves LMArena score over 1300, first model under 10 billion parameters to reach this benchmark. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |

## Deployment & Integration

| Feature | Description | Documentation Link |
|---------|-------------|-------------------|
| **Open Weights** | Pre-trained and instruction-tuned variants available with open weights for responsible commercial use. | [https://ai.google.dev/gemma/docs/gemma-3n/model_card](https://ai.google.dev/gemma/docs/gemma-3n/model_card) |
| **Multiple Framework Support** | Hugging Face Transformers, llama.cpp, Google AI Edge, Ollama, MLX, Keras, PyTorch, Gemma.cpp, transformers.js, Docker, and more. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |
| **Web Deployment** | Can be deployed in web browsers using WebGPU acceleration via frameworks like transformers.js. | [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n) |
| **Mobile Deployment** | Optimized for mobile deployment via Google AI Edge/LiteRT-LLM and other mobile frameworks. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |
| **Cloud Deployment** | Available on Vertex AI, Google GenAI API, NVIDIA API Catalog, SGLang, vLLM, Cloud Run. | [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/) |

## Training Details

| Feature | Description | Documentation Link |
|---------|-------------|-------------------|
| **Training Data Volume** | Trained on ~11 trillion tokens from diverse sources including web documents, code, mathematics, images, and audio. | [https://ai.google.dev/gemma/docs/gemma-3n/model_card](https://ai.google.dev/gemma/docs/gemma-3n/model_card) |
| **Knowledge Cutoff** | Training data knowledge cutoff: June 2024. | [https://ai.google.dev/gemma/docs/gemma-3n/model_card](https://ai.google.dev/gemma/docs/gemma-3n/model_card) |
| **Safety Filtering** | CSAM filtering, sensitive data filtering, content quality and safety filtering applied during training. | [https://ai.google.dev/gemma/docs/gemma-3n/model_card](https://ai.google.dev/gemma/docs/gemma-3n/model_card) |

---

## Key Documentation Resources

- **Main Overview**: [https://ai.google.dev/gemma/docs/gemma-3n](https://ai.google.dev/gemma/docs/gemma-3n)
- **Developer Guide**: [https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/](https://developers.googleblog.com/en/introducing-gemma-3n-developer-guide/)
- **Model Card**: [https://ai.google.dev/gemma/docs/gemma-3n/model_card](https://ai.google.dev/gemma/docs/gemma-3n/model_card)
- **Hugging Face**: [https://huggingface.co/google/gemma-3n-E4B-it](https://huggingface.co/google/gemma-3n-E4B-it)
- **Kaggle**: [https://www.kaggle.com/models/google/gemma-3n](https://www.kaggle.com/models/google/gemma-3n)
- **Function Calling Guide**: [https://ai.google.dev/gemma/docs/capabilities/function-calling](https://ai.google.dev/gemma/docs/capabilities/function-calling)
- **Visual Data Processing**: [https://ai.google.dev/gemma/docs/capabilities/visual-data-processing](https://ai.google.dev/gemma/docs/capabilities/visual-data-processing)
- **Audio Data Processing**: [https://ai.google.dev/gemma/docs/capabilities/audio-data-processing](https://ai.google.dev/gemma/docs/capabilities/audio-data-processing)

---

**Note for In-Browser Solutions**: For building in-browser solutions, focus on:
- WebGPU acceleration support via transformers.js or similar frameworks
- Conditional parameter loading to reduce initial load size
- Quantization (4-bit/8-bit) for browser memory constraints
- Progressive loading of modality-specific parameters (load text first, then vision/audio as needed)
- MatFormer Mix-n-Match for creating smaller custom models optimized for browser performance

