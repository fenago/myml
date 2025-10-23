# CloudFlare R2 Setup Guide
## Complete Guide to Hosting GEMMA Models on R2

**Version:** 1.0
**Last Updated:** 2025-10-22
**Based on**: Dr. Ernesto Lee's CloudFlare R2 Guide

**Original Research**: https://medium.com/@ernestodotnet/host-your-gemma-3-ai-models-on-cloudflare-r2-a-complete-guide-55ef76c1143c

---

## Overview

This guide walks you through hosting GEMMA AI models on CloudFlare R2 object storage, eliminating the need to bundle large model files in your git repository and providing zero-cost egress for model downloads.

### Why CloudFlare R2?

- ✅ **Zero Egress Fees**: Unlike AWS S3, R2 doesn't charge for downloads
- ✅ **Global CDN**: Models distributed worldwide for low latency
- ✅ **S3-Compatible**: Works with existing tools and libraries
- ✅ **Generous Free Tier**: 10GB storage, 1M Class A ops, 10M Class B ops/month
- ✅ **Fast**: Built on CloudFlare's edge network

### Cost Comparison

| Service | Storage (10GB) | Egress (1TB) | Total/Month |
|---------|---------------|--------------|-------------|
| **CloudFlare R2** | Free | **$0** | **$0** |
| AWS S3 | $0.23 | $92.16 | **$92.39** |
| Google Cloud Storage | $0.20 | $120.00 | **$120.20** |

---

## Prerequisites

Before starting, ensure you have:

- CloudFlare account (free tier works)
- Node.js installed (for Wrangler CLI)
- GEMMA 3 model files downloaded locally
- Payment method (required for R2, even on free tier)
- Basic command line familiarity

---

## Step 1: CloudFlare Account Setup

### 1.1 Create CloudFlare Account

1. Visit https://dash.cloudflare.com/sign-up
2. Sign up with email/password or SSO
3. Verify your email address

### 1.2 Enable R2

**Important**: R2 must be explicitly enabled and requires a payment method:

1. Go to [CloudFlare Dashboard](https://dash.cloudflare.com/)
2. Click **R2** in the left sidebar
3. Click **Enable R2** button
4. Accept Terms of Service
5. Add payment method (card required even for free tier)
6. Wait for provisioning (usually instant)

---

## Step 2: Install Wrangler CLI

Wrangler is CloudFlare's CLI tool for managing Workers, Pages, and R2.

### 2.1 Install via npm

```bash
npm install -g wrangler
```

Or with pnpm:

```bash
pnpm install -g wrangler
```

Or with yarn:

```bash
yarn global add wrangler
```

### 2.2 Verify Installation

```bash
wrangler --version
```

You should see output like: `⛅️ wrangler 3.x.x`

### 2.3 Authenticate with CloudFlare

```bash
wrangler login
```

This opens your browser for authentication. Authorize Wrangler to access your CloudFlare account.

---

## Step 3: Create R2 Bucket

### 3.1 Create Bucket via CLI

```bash
wrangler r2 bucket create browsergpt-models
```

Expected output:
```
✅ Created bucket 'browsergpt-models'
```

### 3.2 Alternative: Create via Dashboard

1. Go to https://dash.cloudflare.com/
2. Navigate to **R2** → **Overview**
3. Click **Create Bucket**
4. Enter bucket name: `browsergpt-models`
5. Click **Create Bucket**

### 3.3 Verify Bucket Creation

```bash
wrangler r2 bucket list
```

You should see your new bucket listed.

---

## Step 4: Understand Model Size Thresholds

**Critical**: Upload method depends on model size.

### Models Under 270MB

✅ Use standard Wrangler CLI upload
✅ No additional configuration needed
✅ Simple and fast

### Models Over 300MB

⚠️ Requires R2 API credentials
⚠️ Must create Access Key and Secret Key
⚠️ Use S3-compatible clients (AWS CLI or SDK)

---

## Step 5: Upload Small Models (< 270MB)

For GEMMA 3 270MB model (under threshold):

### 5.1 Upload via Wrangler

```bash
wrangler r2 object put browsergpt-models/gemma-3/270mb/model.onnx \
  --file ./models/gemma-3-270mb/model.onnx
```

### 5.2 Upload Additional Files

```bash
# Upload tokenizer
wrangler r2 object put browsergpt-models/gemma-3/270mb/tokenizer.json \
  --file ./models/gemma-3-270mb/tokenizer.json

# Upload config
wrangler r2 object put browsergpt-models/gemma-3/270mb/config.json \
  --file ./models/gemma-3-270mb/config.json
```

### 5.3 Verify Upload

```bash
wrangler r2 object list browsergpt-models
```

---

## Step 6: Create R2 API Credentials (For Large Models)

### 6.1 Create API Token via Dashboard

1. Navigate to https://dash.cloudflare.com/
2. Click **R2** → Select your **browsergpt-models** bucket
3. Go to **Settings** tab
4. Scroll to **R2 API Tokens**
5. Click **Create API Token**

### 6.2 Configure Token Permissions

Set these permissions:

- **Permissions**: Object Read & Write
- **Bucket**: `browsergpt-models` (or "All buckets")
- **TTL**: Default or custom expiration

Click **Create API Token**.

### 6.3 Save Credentials

**CRITICAL**: Save these immediately (shown only once):

```
Access Key ID: <your-access-key-id>
Secret Access Key: <your-secret-access-key>
Endpoint: https://<account-id>.r2.cloudflarestorage.com
```

### 6.4 Store Securely in .env

Create `.env` file in your project:

```bash
# .env
R2_ACCESS_KEY_ID=your-access-key-id-here
R2_SECRET_ACCESS_KEY=your-secret-access-key-here
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET_NAME=browsergpt-models
```

**Add to .gitignore**:

```bash
echo ".env" >> .gitignore
```

---

## Step 7: Upload Large Models (> 300MB)

### Option A: Using AWS CLI (Recommended)

#### 7.1 Install AWS CLI

```bash
# macOS
brew install awscli

# Linux (Debian/Ubuntu)
sudo apt-get install awscli

# Windows
# Download from https://aws.amazon.com/cli/
```

#### 7.2 Configure AWS CLI for R2

```bash
aws configure --profile r2
```

Enter your values:

```
AWS Access Key ID: <your-r2-access-key-id>
AWS Secret Access Key: <your-r2-secret-access-key>
Default region name: auto
Default output format: json
```

#### 7.3 Upload Large Model

```bash
aws s3 cp ./models/gemma-3n-e2b/model.onnx \
  s3://browsergpt-models/gemma-3n/e2b/model.onnx \
  --endpoint-url https://your-account-id.r2.cloudflarestorage.com \
  --profile r2
```

Expected output:

```
upload: models/gemma-3n-e2b/model.onnx to s3://browsergpt-models/gemma-3n/e2b/model.onnx
Completed 2.1 GB/5.1 GB (41.2%) with 18.5 MB/s, ETA: 00:02:43
```

#### 7.4 Upload Multiple Files

```bash
# Upload entire directory
aws s3 cp ./models/gemma-3n-e2b/ \
  s3://browsergpt-models/gemma-3n/e2b/ \
  --endpoint-url https://your-account-id.r2.cloudflarestorage.com \
  --profile r2 \
  --recursive
```

### Option B: Using Node.js Script

#### 7.5 Install AWS SDK

```bash
npm install @aws-sdk/client-s3 dotenv
```

#### 7.6 Create Upload Script

```typescript
// upload-model.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function uploadModel(
  localFilePath: string,
  r2Key: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  const fileStream = fs.createReadStream(localFilePath);
  const stats = fs.statSync(localFilePath);
  const totalSize = stats.size;

  console.log(`Uploading ${localFilePath} (${formatBytes(totalSize)}) to R2...`);

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: r2Key,
    Body: fileStream,
    ContentType: 'application/octet-stream',
  });

  try {
    await s3Client.send(command);
    console.log(`✅ Successfully uploaded ${r2Key}`);
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Upload GEMMA 3N E2B model
uploadModel(
  './models/gemma-3n-e2b/model.onnx',
  'gemma-3n/e2b/model.onnx'
)
  .then(() => console.log('✅ Upload complete'))
  .catch((err) => console.error('❌ Upload error:', err));
```

#### 7.7 Run Upload Script

```bash
npx tsx upload-model.ts
```

---

## Step 8: Enable Public Access

### 8.1 Via CloudFlare Dashboard

1. Navigate to https://dash.cloudflare.com/
2. Click **R2** → Select **browsergpt-models**
3. Go to **Settings** tab
4. Scroll to **Public Access**
5. Click **Connect Domain** or **Allow Access**
6. You'll receive a public URL like:

```
https://pub-xxxxxxxxxxxxx.r2.dev
```

**Save this URL** - you'll need it for your application.

### 8.2 Test Public Access

```bash
curl -I https://pub-xxxxxxxxxxxxx.r2.dev/gemma-3/270mb/model.onnx
```

Expected response:

```
HTTP/2 200
content-type: application/octet-stream
content-length: 270000000
...
```

---

## Step 9: Configure CORS

Cross-Origin Resource Sharing (CORS) is **critical** for browser access.

### 9.1 Development CORS (Allow All Origins)

1. In R2 bucket settings, scroll to **CORS Policy**
2. Add this configuration:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 9.2 Production CORS (Restrict to Specific Domains)

```json
[
  {
    "AllowedOrigins": [
      "https://your-app.netlify.app",
      "https://browsergpt.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600,
    "ExposeHeaders": ["Content-Length", "ETag"]
  }
]
```

### 9.3 Save CORS Configuration

Click **Save** in the dashboard.

### 9.4 Test CORS

```javascript
// Run in browser console
fetch('https://pub-xxxxx.r2.dev/gemma-3/270mb/model.onnx', {
  method: 'GET',
  headers: { 'Accept': 'application/octet-stream' }
})
  .then(response => console.log('✅ CORS working:', response.status))
  .catch(error => console.error('❌ CORS error:', error));
```

---

## Step 10: Organize Your Bucket Structure

### Recommended Structure

```
browsergpt-models/
├── gemma-3/
│   ├── 270mb/
│   │   ├── model.onnx
│   │   ├── tokenizer.json
│   │   └── config.json
│   ├── 270mb-int4/
│   │   ├── model_quantized.onnx
│   │   └── tokenizer.json
│   └── metadata.json
├── gemma-3n/
│   ├── e2b/
│   │   ├── text/
│   │   │   ├── model.onnx
│   │   │   └── tokenizer.json
│   │   ├── vision/
│   │   │   └── mobilenet_v5.onnx
│   │   ├── audio/
│   │   │   └── audio_encoder.onnx
│   │   └── ple-cache/
│   │       └── embeddings.bin
│   ├── e4b/
│   │   └── [similar structure]
│   └── metadata.json
└── versions.json
```

### Create Metadata Files

**versions.json**:

```json
{
  "models": {
    "gemma-3-270mb": {
      "version": "1.0.0",
      "size": 270000000,
      "checksum": "sha256:abc123...",
      "updated": "2025-10-22"
    },
    "gemma-3n-e2b": {
      "version": "1.0.0",
      "size": 5100000000,
      "checksum": "sha256:def456...",
      "updated": "2025-10-22"
    }
  }
}
```

---

## Step 11: Integration with Your App

### 11.1 Environment Variables

```typescript
// .env
VITE_R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev
VITE_R2_BUCKET_NAME=browsergpt-models
```

### 11.2 Model URL Configuration

```typescript
// src/config/models.ts
const R2_BASE_URL = import.meta.env.VITE_R2_PUBLIC_URL;

export const MODEL_URLS = {
  gemma270mb: {
    model: `${R2_BASE_URL}/gemma-3/270mb/model.onnx`,
    tokenizer: `${R2_BASE_URL}/gemma-3/270mb/tokenizer.json`,
    config: `${R2_BASE_URL}/gemma-3/270mb/config.json`,
  },
  gemma3nE2B: {
    text: `${R2_BASE_URL}/gemma-3n/e2b/text/model.onnx`,
    vision: `${R2_BASE_URL}/gemma-3n/e2b/vision/mobilenet_v5.onnx`,
    audio: `${R2_BASE_URL}/gemma-3n/e2b/audio/audio_encoder.onnx`,
    pleCache: `${R2_BASE_URL}/gemma-3n/e2b/ple-cache/embeddings.bin`,
  },
};
```

### 11.3 Model Loader with Progress

```typescript
// src/services/ModelLoader.ts
export async function loadModelWithProgress(
  url: string,
  onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
): Promise<ArrayBuffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load model: ${response.statusText}`);
  }

  const total = parseInt(response.headers.get('content-length') || '0', 10);
  let loaded = 0;

  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    loaded += value.length;

    if (onProgress && total) {
      onProgress({
        loaded,
        total,
        percentage: (loaded / total) * 100,
      });
    }
  }

  // Concatenate chunks
  const concatenated = new Uint8Array(loaded);
  let position = 0;
  for (const chunk of chunks) {
    concatenated.set(chunk, position);
    position += chunk.length;
  }

  return concatenated.buffer;
}
```

---

## Step 12: Clean Up Your Repository

### 12.1 Update .gitignore

```bash
# Add to .gitignore
echo "# AI Model Files" >> .gitignore
echo "*.onnx" >> .gitignore
echo "*.bin" >> .gitignore
echo "*.tflite" >> .gitignore
echo "/models/" >> .gitignore
echo ".env" >> .gitignore
```

### 12.2 Remove Tracked Model Files

If models were previously committed:

```bash
git rm --cached models/*.onnx
git rm --cached models/*.bin
git commit -m "Remove model files, now hosted on CloudFlare R2"
git push origin main
```

---

## Troubleshooting

### CORS Errors

**Symptom**: `Access to fetch blocked by CORS policy`

**Solution**:
1. Verify CORS configuration in R2 bucket settings
2. Ensure your origin is in `AllowedOrigins`
3. Clear browser cache and retry

### 403 Forbidden

**Symptom**: Model fetch returns 403 status

**Solution**:
1. Verify public access is enabled on bucket
2. Check bucket settings → Public Access
3. Ensure R2 API token has correct permissions

### Upload Fails for Large Models

**Symptom**: Wrangler upload times out for models > 300MB

**Solution**:
1. Create R2 API credentials (Step 6)
2. Use AWS CLI or S3 SDK (Step 7)
3. Verify credentials in `.env` file

### Slow Downloads

**Symptom**: Model downloads are slow

**Solution**:
1. Check CloudFlare CDN is enabled
2. Verify R2 bucket is in optimal region
3. Consider model quantization to reduce size

---

## Monitoring & Analytics

### View Usage Stats

1. Go to https://dash.cloudflare.com/
2. Navigate to **R2** → **Metrics**
3. Monitor:
   - Storage usage
   - Class A operations (writes)
   - Class B operations (reads)
   - Bandwidth (always free!)

### Set Up Alerts

1. Go to **Account** → **Notifications**
2. Create alert for storage threshold
3. Set email notification

---

## Cost Optimization

### Free Tier Limits

- **Storage**: 10 GB/month
- **Class A Ops**: 1 million/month (PUT, POST, LIST)
- **Class B Ops**: 10 million/month (GET, HEAD)
- **Egress**: **Unlimited and FREE**

### Staying Within Free Tier

1. **Use quantized models**: INT4 models are 4x smaller
2. **Implement caching**: Cache models in IndexedDB
3. **Lazy load components**: Only load what's needed
4. **Monitor usage**: Check dashboard regularly

---

## Security Best Practices

### 1. Protect API Credentials

- ✅ Store in `.env` files
- ✅ Add `.env` to `.gitignore`
- ✅ Use environment variables in CI/CD
- ❌ Never commit credentials to git

### 2. Implement Integrity Checks

```typescript
async function verifyModelChecksum(
  arrayBuffer: ArrayBuffer,
  expectedChecksum: string
): Promise<boolean> {
  const hash = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hash));
  const actualChecksum = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return actualChecksum === expectedChecksum;
}
```

### 3. Use HTTPS Only

```typescript
const MODEL_URL = 'https://pub-xxxxx.r2.dev/model.onnx'; // ✅ HTTPS
// const MODEL_URL = 'http://...'; // ❌ Never use HTTP
```

---

## Next Steps

✅ Models hosted on CloudFlare R2
✅ Zero egress costs
✅ Global CDN distribution
✅ CORS configured for browser access

**Continue to**:
1. [Implementation Guide](../05-Implementation/) - Build your app
2. [API Documentation](../06-API-Reference/) - Integrate models
3. [Performance Guide](../07-Performance/) - Optimize loading

---

## Additional Resources

- [CloudFlare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Dr. Ernesto Lee's Full Guide](https://medium.com/@ernestodotnet/host-your-gemma-3-ai-models-on-cloudflare-r2-a-complete-guide-55ef76c1143c)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [R2 API Authentication](https://developers.cloudflare.com/r2/api/s3/tokens/)
- [AWS CLI with R2](https://developers.cloudflare.com/r2/examples/aws-cli/)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Author**: Based on Dr. Ernesto Lee's research
**Maintainer**: BrowserGPT Team
