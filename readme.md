<div align="center">

# Voice AI

### A multilingual conversational support interface with voice and retrieval

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Hume](https://img.shields.io/badge/Hume-Voice_AI-7C3AED?style=flat-square)
![OpenAI](https://img.shields.io/badge/OpenAI-API-111827?style=flat-square&logo=openai&logoColor=white)

</div>

## Overview

Voice AI is a Next.js prototype for multilingual, voice-first product support. It combines Hume voice components, automatic language detection, and a local FAQ recommender so users can interact naturally and receive relevant NamazApp guidance.

## Capabilities

- Real-time voice interface through Hume components
- Language detection with CLD3 and franc fallback
- Local FAQ recommendation pipeline
- Trainable JSON recommendation model
- Responsive React interface with motion and accessible UI primitives
- Server-side integration points for OpenAI-powered responses

## Application flow

~~~mermaid
flowchart LR
    A[Voice or text] --> B[Language detection]
    B --> C[FAQ retrieval]
    C --> D[Response selection]
    D --> E[Conversational UI]
~~~

## Local setup

~~~bash
cp .env.example .env
npm install
npm run train
npm run dev
~~~

Add the required Hume and API credentials to the local environment file. Never commit real keys.

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
|---|---|
| **npm run dev** | Start the Next.js development server |
| **npm run train** | Rebuild the local FAQ recommendation model |
| **npm run build** | Create a production build |
| **npm run start** | Run the production build |
| **npm run lint** | Check the codebase |

## Core modules

| Path | Responsibility |
|---|---|
| **components/** | Voice and message interface |
| **app/api/recommend/** | Recommendation endpoint |
| **utils/languageDetector.ts** | Primary and fallback language detection |
| **utils/recommender.ts** | Local similarity-based FAQ retrieval |
| **scripts/train-recommender.js** | Model preparation |
| **data/** | FAQ source and generated model |

## Status

Functional prototype. Production work should add automated evaluation, confidence-aware fallback, rate limiting, secret validation, accessibility testing, observability, and a documented data-governance policy.
