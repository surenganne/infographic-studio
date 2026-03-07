# Infographic Studio

An AI-powered infographic generator built with Next.js. Paste your content, pick a style, and get a professional infographic in seconds — powered by the [KIE API](https://kie.ai) (Nano Banana 2 model).

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- Paste structured text content and auto-parse it into titled sections
- Configure aspect ratio (16:9, 9:16, 1:1, 4:3), resolution (1K / 2K / 4K), font style, and brand colors
- Fixed sidebar layout — the Generate button is always visible, no scrolling required
- Gallery with hover actions: download, regenerate, delete
- Click any image to open a full-screen lightbox preview
- Async generation with polling — results appear automatically when ready

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Image generation**: KIE API — Nano Banana 2
- **HTTP client**: Axios

## Getting Started

### Prerequisites

- Node.js 20+
- A [KIE API key](https://kie.ai/api-key)

### Installation

```bash
git clone https://github.com/your-username/infographic-studio.git
cd infographic-studio
npm install
```

### Environment Setup

Create a `.env.local` file in the project root:

```env
KEI_API_KEY=your_api_key_here
```

Get your API key at [https://kie.ai/api-key](https://kie.ai/api-key).

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
src/
├── app/
│   ├── api/generate/route.ts   # API route — creates task and polls KIE
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── infographic-generator.tsx  # Main layout (sidebar + gallery)
│   ├── content-input.tsx          # Text input panel
│   ├── style-config.tsx           # Style controls
│   └── gallery.tsx                # Image grid + lightbox
├── lib/
│   ├── kei-api.ts                 # KIE API client
│   └── prompt-builder.ts          # Prompt construction from content + style
└── types/
    └── index.ts
```

## API Notes

- Generation is asynchronous — the app polls `/api/v1/jobs/recordInfo` until the task completes
- Generated images are hosted by KIE and expire after **14 days** — download anything you want to keep
- Rate limit: 20 requests per 10 seconds per account

## License

MIT
