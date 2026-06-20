# Personal Fitness Coach API

Backend foundation for an AI-assisted fitness and nutrition application. It includes the five requested Prisma models and API endpoints for TDEE, macro allocation, safe weight-loss assessment, and a four-meal Vietnamese daily menu.

## Project structure

```text
prisma/schema.prisma       Database schema
src/domain/fitness.ts      Pure health and calorie calculations
src/domain/menu.ts         Four-meal Vietnamese menu generator
src/http/schemas.ts        Request validation
src/http/routes.ts         REST endpoints
src/app.ts                 Express configuration
src/server.ts              Server entry point
tests/fitness.test.ts      Calculation safety tests
```

## Run locally

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run dev
```

## Endpoints

- `GET /health`
- `POST /api/v1/calculations/tdee`
- `POST /api/v1/calculations/macros`
- `POST /api/v1/daily-plan`

Example daily plan request:

```json
{
  "currentWeightKg": 77.6,
  "targetWeightKg": 69,
  "requestedWeeks": 4,
  "bmrKcal": 1650,
  "activeCaloriesKcal": 404,
  "sex": "MALE",
  "boneMassKg": 2.4
}
```

The daily plan endpoint caps expected loss at `0.7 kg/week`, applies a calorie floor, prioritizes protein at `1.8-2.0 g/kg`, and flags low bone mass for calcium/Vitamin D food suggestions. These guardrails are conservative product defaults and do not replace clinical advice.

## Next modules

OCR/Vision ingestion, workout scheduling, progress re-evaluation, and the coach chatbot can be added around these domain functions without coupling them to an AI provider.
