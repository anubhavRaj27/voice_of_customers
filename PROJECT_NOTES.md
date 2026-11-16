# Voice of Customer Copilot

A React + TypeScript dashboard exported from Google AI Studio. It turns customer feedback into themes, churn signals, and suggested roadmap actions, with source quotes and a downloadable decision brief.

- **Demo:** starts with synthetic DailyBasket feedback and analysis.
- **Frontend:** `src/App.tsx` connects the tabs in `src/components/`; sample data lives in `src/data/`.
- **Backend:** `server.ts` runs Express and Vite on port 8080. Gemini handles new AI analysis and image/PDF text extraction.
- **Storage:** data lives in browser memory; refreshing resets changes. There is no database.

## Run locally

1. `npm install` (first setup only).
2. `npm run dev`.
3. Open http://localhost:8080.

The demo and CSV/text imports work without an API key. For AI features, set `GEMINI_API_KEY` in `.env` and restart the server. `.env` is ignored by Git. AI requests send the selected feedback or uploaded document to Gemini.

Checks: `npm run lint` checks TypeScript; `npm run build` builds the frontend.

Current limitations: live Gemini calls require a valid key and an available configured model; DOCX is offered by the upload picker but has no proper Word document parser, so use text, CSV, or PDF instead.
