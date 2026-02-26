# STARLPrep Backend

Backend service for **STARLPrep.AI**, a mode-based interview coaching copilot that produces structured STARL answers and follow-up practice.

## What it does
- **Mode detection**: Quick Polish vs Guided Build vs Follow-up Simulator
- Generates: **Fit check**, STARL answer, **scoring rubric**, follow-up questions, and improvement plan
- **Guardrail**: avoids fabricated metrics; recommends labeled proxies when numbers are unknown

## Tech
- Node.js + Express
- LLM API (configured via env vars)
- Prompt orchestration via `promptSpec.js`

## Endpoints
- `GET /health` — service status
- `POST /chat` — accepts `{ sessionId, messages }` and returns `{ type, reply }`

## Local setup
1. `npm install`
2. Create `.env` with your API key
3. `npm start`

## Roadmap (reliability + product hardening)
- Session persistence (Redis/Supabase)
- Structured outputs (schema-validated)
- Evaluation harness (quality/cost/latency/safety)

## Links
- Live demo: https://starlprepai.lovable.app/
- Portfolio case study: https://pastoral-foe-73f.notion.site/Portfolio-Gianfranco-Senaja-6efc229b2a684e4b8355a91a4acf4a9c
