# 📚 StoryMind — Magical AI Storybooks

> **Gemini Live Agent Challenge — Creative Storyteller Category**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-StoryMind-orange)](https://storymind-hackathon-1.onrender.com)
[![Backend](https://img.shields.io/badge/⚡_Backend-Live-green)](https://storymind-hackathon.onrender.com/health)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 🌟 What is StoryMind?

StoryMind is a multimodal AI agent that generates **personalized, illustrated, and narrated storybooks** for children in real-time.

A parent enters their child's name, age, interests, and accessibility needs — and StoryMind streams back a complete storybook with:
- 📖 **AI-generated story text** (Gemini 2.5 Flash)
- 🎨 **Custom illustrations** per page
- 🔊 **Audio narration** in Hindi, English & Spanish (gTTS)
- ♿ **Accessibility support** (dyslexia-friendly, visual impairment)

All delivered as one seamless, interleaved multimodal stream. ✨

---

## 🎯 Live Demo

👉 **[https://storymind-hackathon-1.onrender.com](https://storymind-hackathon-1.onrender.com)**

Try it:
1. Enter a child's name (e.g. "Aarav")
2. Pick age, interests, language
3. Click **"Create My Story!"**
4. Watch the story stream page by page
5. Click 🔊 to hear it narrated

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Story Generation** | gemini-3-flash-preview writes personalized stories |
| 🎨 **Dynamic Illustrations** | Colorful, mood-matched illustrations per page |
| 🔊 **Multilingual Narration** | Audio in English, Hindi 🇮🇳, Spanish 🇪🇸 |
| ♿ **Accessibility First** | Dyslexia-friendly text, enriched narration |
| ⚡ **Real-time Streaming** | Pages stream one by one as generated |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| 🤖 AI Story | gemini-3-flash-preview (google-generativeai SDK) |
| 🔊 Audio | gTTS (free multilingual TTS) |
| ⚙️ Backend | FastAPI (Python) — Render.com |
| 🎨 Frontend | Next.js 14 (React) — Render.com |
| 🌊 Streaming | Server-Sent Events (SSE) |
| ☁️ Cloud | Google Cloud (Gemini API) |

---

## 🏗️ Architecture

```
User Browser
     │  HTTPS
     ▼
Next.js Frontend (Render)
     │  SSE Stream
     ▼
FastAPI Backend (Render)
     ├── Gemini 2.5 Flash → Story text
     ├── SVG Generator   → Illustrations
     └── gTTS            → Audio narration
```

---

## 🚀 Run Locally

```bash
git clone https://github.com/mandavi-singh/storymind-hackathon.git
cd storymind-hackathon
cp .env.example .env
# Add GEMINI_API_KEY to .env
docker compose up --build
```
Open **http://localhost:3000**

---

## 🏆 Judging Criteria

| Criterion | StoryMind |
|-----------|-----------|
| **Innovation & Multimodal UX (40%)** | Real-time story + illustrations + audio streamed together |
| **Technical Implementation (30%)** | Gemini SDK, SSE streaming, multilingual TTS, cloud deployed |
| **Demo & Presentation (30%)** | Live demo + health endpoint + architecture diagram |

---

## 🔗 Links

- 🌐 **Live App**: [storymind-hackathon-1.onrender.com](https://storymind-hackathon-1.onrender.com)
- ⚡ **API Health**: [storymind-hackathon.onrender.com/health](https://storymind-hackathon.onrender.com/health)
- 💻 **GitHub**: [github.com/mandavi-singh/storymind-hackathon](https://github.com/mandavi-singh/storymind-hackathon)

---

## 📄 License
MIT © 2026 StoryMind
