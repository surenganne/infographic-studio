# Infographic Studio

An AI-powered infographic generator built with Next.js. Paste your content, pick a style, and get a professional infographic in seconds — powered by the [KIE API](https://kie.ai) (Nano Banana 2 model).

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

![Infographic Studio Overview](public/infographic-studio-overview.png)

## Features

- Paste structured text content and auto-parse it into titled sections
- Configure aspect ratio (16:9, 9:16, 1:1, 4:3), resolution (1K / 2K / 4K), font style, and brand colors
- Four diagram types: Infographic, Technical diagram, Flowchart, Comparison
- Fixed sidebar layout — the Generate button is always visible, no scrolling required
- Gallery with hover actions: download, regenerate, delete
- Click any image to open a full-screen preview overlay
- Generated images stored in S3 (LocalStack in dev, AWS S3 in prod)
- Async generation with polling — results appear automatically when ready

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Image generation**: KIE API — Nano Banana 2
- **Object storage**: AWS S3 / LocalStack
- **HTTP client**: Axios
- **Container**: Docker + Docker Compose

## Getting Started

### Prerequisites

- A [KIE API key](https://kie.ai/api-key)
- Node.js 20+ (local dev) or Docker (containerised)

---

### Option 1 — Local Development

```bash
git clone https://github.com/surenganne/infographic-studio.git
cd infographic-studio
npm install
```

Create `.env.local`:

```env
KEI_API_KEY=your_api_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> In local dev mode the app skips S3 storage (no `S3_ENDPOINT` set) and returns the KIE image URL directly.

---

### Option 2 — Docker with LocalStack S3

**Prerequisites:** Docker and Docker Compose installed.

```bash
git clone https://github.com/surenganne/infographic-studio.git
cd infographic-studio

# Copy the example env file and add your KIE API key
cp .env.example .env
```

Edit `.env`:

```env
KEI_API_KEY=your_api_key_here
```

Build and start all services:

```bash
docker compose up --build
```

This starts two containers:

| Container | Description | Port |
|---|---|---|
| `infographic-studio` | Next.js application | 3000 |
| `localstack` | Local AWS S3 emulator | 4566 |

The `infographic-studio` S3 bucket is created automatically on LocalStack startup via `scripts/init-localstack.sh`.

Open [http://localhost:3000](http://localhost:3000).

**Stop the stack:**

```bash
docker compose down
```

**Inspect stored images:**

```bash
docker exec localstack awslocal s3 ls s3://infographic-studio/infographics/
```

---

### Image Storage Flow (Docker mode)

```
User clicks Generate
       │
       ▼
Next.js /api/generate
       │  POST createTask
       ▼
  KIE API (Nano Banana 2)
       │  polls until success
       │  gets resultUrl
       ▼
Next.js fetches image from KIE
       │  stores PNG
       ▼
  LocalStack S3
  (bucket: infographic-studio)
       │
       ▼
Returns /api/image/<key> to browser
```

---

## Content Format

The text input supports a simple structure:

```
Your Title Here

Section One:
• Key point
• Another point

Section Two:
• More details
• Even more details

Any extra notes go here as plain text.
```

- First line → title
- Lines ending with `:` → section headers
- Lines starting with `•`, `-`, or `*` → bullet points
- Everything else → additional notes passed to the prompt

## Project Structure

```
.
├── Dockerfile
├── docker-compose.yml
├── scripts/
│   └── init-localstack.sh       # Creates S3 bucket on LocalStack startup
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── generate/        # Calls KIE API, stores image in S3
    │   │   ├── image/[key]/     # Streams image from S3 to browser
    │   │   └── download/        # Downloads image from S3
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── infographic-generator.tsx
    │   ├── content-input.tsx
    │   ├── style-config.tsx
    │   └── gallery.tsx
    ├── lib/
    │   ├── kei-api.ts           # KIE API client with async polling
    │   ├── storage.ts           # S3 / LocalStack client
    │   └── prompt-builder.ts    # Prompt templates per diagram type
    └── types/
        └── index.ts
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `KEI_API_KEY` | Yes | — | KIE API key from [kie.ai/api-key](https://kie.ai/api-key) |
| `S3_ENDPOINT` | No | — | S3 endpoint URL (set to `http://localstack:4566` for Docker) |
| `S3_BUCKET` | No | `infographic-studio` | S3 bucket name |
| `AWS_REGION` | No | `us-east-1` | AWS region |
| `AWS_ACCESS_KEY_ID` | No | `test` | AWS access key (use `test` for LocalStack) |
| `AWS_SECRET_ACCESS_KEY` | No | `test` | AWS secret key (use `test` for LocalStack) |

## API Notes

- Generation is asynchronous — the app polls `/api/v1/jobs/recordInfo` until the task completes
- KIE-hosted image URLs expire after **14 days** — the app stores images in S3 to avoid this
- Rate limit: 20 requests per 10 seconds per account

## License

MIT
