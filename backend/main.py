import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI()

# Allow your mobile app to call this API (simple dev setup)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI client reads OPENAI_API_KEY from environment
client = OpenAI()


class ChatRequest(BaseModel):
    message: str


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/chat")
def chat(req: ChatRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not set on the server")

    system_prompt = """
You are a Gym Workout Tracker AI.

Rules:
- Interpret short, messy gym messages.
- Infer missing exercise names from context.
- Auto-increment set numbers per exercise.
- Convert all weights to numeric pounds.
- Never explain reasoning.
- Output structured workout log rows only.
- Treat this as a memory layer, not a coach.
"""

    try:
        resp = client.responses.create(
            model="gpt-4o-mini",
            input=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": req.message
                }
            ],
        )

        return {"reply": resp.output_text}

    except Exception:
        raise HTTPException(status_code=500, detail="OpenAI request failed")


@app.get("/")
def root():
    return {"message": "API running"}