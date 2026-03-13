import os
import json
import asyncio
import base64
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import google.generativeai as genai
from gtts import gTTS
import io

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="StoryMind API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class StoryRequest(BaseModel):
    child_name: str
    age: int
    interests: list[str]
    language: str = "en"
    accessibility: list[str] = []
    num_pages: int = 5

def build_story_prompt(req: StoryRequest) -> str:
    interests_str = ", ".join(req.interests)
    lang_map = {"en": "English", "hi": "Hindi", "es": "Spanish"}
    lang = lang_map.get(req.language, "English")
    return f"""You are a children's story writer.
Create a {req.num_pages}-page storybook for a {req.age}-year-old named {req.child_name}.
Interests: {interests_str}. Language: {lang}.

Output ONLY valid JSON, no extra text:
{{
  "title": "Story title here",
  "pages": [
    {{
      "page": 1,
      "text": "Story text max 40 words.",
      "narration": "Warm narration text.",
      "bg_color": "#FFD6A5",
      "emoji": "🌟"
    }}
  ]
}}

Rules:
- bg_color: soft pastel hex color matching page mood
- emoji: one emoji matching the page scene
- text: max 40 words, simple language
- Make it magical and fun!"""

def make_svg_image(bg_color: str, page_num: int, emoji: str) -> str:
    color = bg_color if bg_color.startswith("#") else "#FFD6A5"
    safe_emoji = emoji if emoji else "⭐"
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <rect width="800" height="600" fill="{color}" rx="24"/>
  <circle cx="400" cy="280" r="150" fill="white" opacity="0.35"/>
  <text x="400" y="310" font-size="130" text-anchor="middle" dominant-baseline="central">{safe_emoji}</text>
  <text x="400" y="470" font-size="24" text-anchor="middle" fill="#5a4a6a" font-family="Georgia,serif">Page {page_num}</text>
  <circle cx="100" cy="100" r="45" fill="white" opacity="0.2"/>
  <circle cx="700" cy="500" r="65" fill="white" opacity="0.15"/>
  <circle cx="720" cy="110" r="28" fill="white" opacity="0.22"/>
  <circle cx="80" cy="520" r="38" fill="white" opacity="0.18"/>
</svg>"""
    return base64.b64encode(svg.encode()).decode()

@app.get("/health")
async def health():
    return {"status": "ok", "service": "StoryMind"}

@app.post("/api/story/stream")
async def stream_story(req: StoryRequest):
    async def event_generator() -> AsyncIterator[str]:
        try:
            model    = genai.GenerativeModel("gemini-3-flash-preview")
            prompt   = build_story_prompt(req)
            response = model.generate_content(prompt)
            raw      = response.text.strip()

            # Strip markdown fences if present
            if raw.startswith("```"):
                lines = raw.split("\n")
                raw = "\n".join(lines[1:])
            if raw.endswith("```"):
                lines = raw.split("\n")
                raw = "\n".join(lines[:-1])
            raw = raw.strip()

            story = json.loads(raw)

            # Send title event
            title_event = json.dumps({"type": "title", "text": story["title"]})
            yield f"data: {title_event}\n\n"

            # Send each page
            for page in story["pages"]:
                bg_color = page.get("bg_color", "#FFD6A5")
                emoji    = page.get("emoji", "⭐")
                img_b64  = make_svg_image(bg_color, page["page"], emoji)

                # Generate audio with gTTS (free, works for Hindi!)
                audio_b64 = ""
                try:
                    lang_map = {"en": "en", "hi": "hi", "es": "es"}
                    tts_lang = lang_map.get(req.language, "en")
                    tts = gTTS(text=page["text"], lang=tts_lang, slow=False)
                    buf = io.BytesIO()
                    tts.write_to_fp(buf)
                    buf.seek(0)
                    audio_b64 = base64.b64encode(buf.read()).decode("utf-8")
                except Exception as e:
                    print(f"gTTS error: {e}")

                payload = {
                    "type":     "page",
                    "page":     page["page"],
                    "text":     page["text"],
                    "image":    img_b64,
                    "audio":    audio_b64,
                    "bg_color": bg_color,
                }
                page_event = json.dumps(payload)
                yield f"data: {page_event}\n\n"

            # Send done event
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except json.JSONDecodeError as e:
            err = json.dumps({"type": "error", "message": f"JSON parse error: {str(e)}"})
            yield f"data: {err}\n\n"
        except Exception as e:
            print(f"Stream error: {e}")
            err = json.dumps({"type": "error", "message": str(e)})
            yield f"data: {err}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
