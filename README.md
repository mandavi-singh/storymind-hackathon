# 📚 StoryMind — Magical AI Storybooks

> **Gemini Live Agent Challenge — Creative Storyteller Category**

StoryMind is a multimodal AI agent that generates personalized, illustrated, and narrated storybooks for children in real-time. A parent enters their child's name, age, interests, and any accessibility needs — and StoryMind streams back a complete storybook: text, AI-generated illustrations (Imagen 3), and audio narration (Cloud TTS), all interleaved in one seamless flow.

---

## ✨ Features

- **Personalized stories** — name, age, interests, language (English / Hindi / Spanish)
- **Accessibility-first** — dyslexia-friendly text, enriched narration for visual impairment
- **Interleaved multimodal output** — text + image + audio stream page-by-page
- **Auto-narration** — Cloud TTS reads each page aloud automatically
- **Storybook UI** — page-turn animations, progress dots, mute toggle
- **Fully deployed on Google Cloud** — Cloud Run, Secret Manager, Firestore

---

## 🛠️ Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| AI story    | gemini-3-flash-preview      |
| Illustrations | Imagen 3 via Vertex AI                        |
| Narration   | Google Cloud Text-to-Speech                     |
| Backend     | FastAPI (Python) — Cloud Run                    |
| Frontend    | Next.js 14 (React) — Cloud Run                  |
| Secrets     | Google Secret Manager                           |
| Storage     | Firestore (story history)                       |
| CI/CD       | Cloud Build (`cloudbuild.yaml`)                 |

---

## 🚀 Quick Start (Local)

### Prerequisites
- Python 3.12+, Node 20+, Docker
- `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com)
- GCP project with billing enabled, `gcloud` authenticated

### Option A — Docker Compose (easiest)
```bash
git clone https://github.com/YOUR_USERNAME/storymind
cd storymind

export GEMINI_API_KEY=your_key_here
export GCP_PROJECT=your_project_id

docker compose up
```
Open http://localhost:3000

### Option B — Run directly
```bash
# Backend
cd backend
pip install -r requirements.txt
GEMINI_API_KEY=xxx GCP_PROJECT=yyy uvicorn main:app --reload --port 8080

# Frontend (new terminal)
cd frontend
npm install
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080 npm run dev
```

---

## ☁️ Deploy to Google Cloud

```bash
export GCP_PROJECT=your-project-id
export GEMINI_API_KEY=your-key
bash deploy.sh
```

This script:
1. Enables required GCP APIs
2. Stores your Gemini key in Secret Manager
3. Builds and deploys backend to Cloud Run
4. Builds and deploys frontend to Cloud Run

For CI/CD: connect your GitHub repo to Cloud Build and use `cloudbuild.yaml`.

---

## 🏗️ Architecture

```
User Browser
     │  HTTPS
     ▼
Next.js Frontend (Cloud Run)
     │  REST + SSE stream
     ▼
FastAPI Backend (Cloud Run)
  ├── Gemini 2.0 Flash ──→ Story text + image prompts
  ├── Imagen 3 (Vertex AI) ──→ Illustrations (base64)
  ├── Cloud TTS ──→ Audio narration (base64 MP3)
  └── Firestore ──→ Story history
     │
Secret Manager (GEMINI_API_KEY)
```

**Key design choice**: The backend streams Server-Sent Events (SSE). Each page's image and audio are generated in parallel (`asyncio.gather`), then streamed to the browser as JSON events. The frontend renders each page as it arrives — true interleaved multimodal output.

---

## 📋 Judging Criteria Alignment

| Criterion | How StoryMind addresses it |
|-----------|---------------------------|
| **Innovation & Multimodal UX (40%)** | Breaks the text-box paradigm: voice narration + AI images + story text stream simultaneously. Child hears the story while seeing custom illustrations. |
| **Technical Implementation (30%)** | Uses `google-generativeai` SDK (Gemini 2.0 Flash), Vertex AI (Imagen 3), Cloud TTS, Firestore, Secret Manager, Cloud Run. Async streaming with `asyncio.gather` for parallel image/audio gen. |
| **Demo & Presentation (30%)** | Live streaming demo is visually compelling. Architecture diagram in README. Cloud Run deployment proof via `deploy.sh` + Cloud Console. |

---

## 📁 Project Structure

```
storymind/
├── backend/
│   ├── main.py          # FastAPI app, Gemini + Imagen + TTS
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx     # Main UI (form + storybook reader)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── next.config.js
│   └── Dockerfile
├── cloudbuild.yaml       # CI/CD pipeline
├── docker-compose.yml    # Local dev
├── deploy.sh             # One-click GCP deploy
└── README.md
```

---

## 🌟 Bonus Points Checklist

- [x] Infrastructure-as-code: `deploy.sh` + `cloudbuild.yaml`
- [ ] Blog post (add link after writing)
- [ ] GDG profile (add link after signing up)

---

## 📄 License
MIT
