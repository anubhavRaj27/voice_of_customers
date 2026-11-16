# Voice of Customer Copilot

An evidence-backed customer feedback intelligence workspace for Product Managers turning messy multi-channel feedback into defensible roadmap decisions with verifiable citations and deterministic analytics.

> [!IMPORTANT]
> **Confirmed Product Decisions from Phase 1 Clarification**:
> - **Execution Mode**: Server-side Gemini API (`@google/genai` with `gemini-3.8-flash`) combined with deterministic application-code frequency calculations to guarantee mathematical precision and prevent LLM hallucination of counts and percentages.
> - **Screenshot & Image Ingestion**: Gemini Multimodal Vision API OCR preserving original Hindi, Hinglish, and English verbatim text with code-switching fidelity.
> - **Synthetic Benchmark Baseline**: Hyperlocal grocery delivery application (**"DailyBasket"**) containing realistic Indian digital product challenges (OTP retries, refund visibility, fresh produce grading, payment webhook delays, and delivery partner coordination) across tier-1 and tier-2 user segments.

---

## 1. Overview & Core Concept

**Voice of Customer (VoC) Copilot** solves the core friction product managers face: receiving qualitative feedback scattered across Play Store reviews, Zendesk/Freshdesk support tickets, WhatsApp chats, founder-shared screenshots, and interview transcripts, but struggling to convert it into rigorous, defensible roadmap priorities without hand-waving or hallucinated metrics.

### Key Value
- **Evidence-First Integrity**: The core promise is *"From messy feedback to product decisions—with evidence behind every insight."* Every percentage, quote, and recommendation links directly to an immutable source record and locator.
- **Strict Deterministic Math**: Numerators and denominators are computed in pure TypeScript from verified record-to-theme bindings ($N/D$), never invented by LLM tokens. Active filters dynamically recalculate frequencies and confidence ratings.
- **Indian Market Grounding**: Full native support for Hindi and Hinglish verbatim text with optional toggled English translations, recognizing regional and device nuances (e.g., low-end Android RAM constraints, regional payment gateway dropouts).
- **Distinction of Churn vs Sentiment**: Explicitly segregates reported churn ("uninstalled yesterday") and stated churn intent ("cancelling subscription") from general frustration or low star ratings.
- **Transparent Prioritization & Decision Briefs**: Lets PMs accept, edit, defer, or dismiss evidence-backed interventions, recording rationale and exporting citation-backed markdown/PDF briefs for leadership review.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────┐     ┌───────────────────────┐     ┌───────────────────────┐
│ 1. Workspace    │ ──> │ 2. Ingestion & Audit  │ ──> │ 3. Analysis Pipeline  │
│ Context & Demo  │     │ CSV / Text / Images   │     │ Extraction & Binding  │
└─────────────────┘     └───────────────────────┘     └───────────────────────┘
                                                                  │
                                                                  ▼
┌─────────────────┐     ┌───────────────────────┐     ┌───────────────────────┐
│ 6. Decision     │ <── │ 5. Prioritization &   │ <── │ 4. Insights Explorer  │
│ Brief Export    │     │ Action Management     │     │ Themes / Quotes /     │
└─────────────────┘     └───────────────────────┘     │ Churn / Trace Drawer  │
                                                      └───────────────────────┘
```

1. **Workspace Setup & Demo Loading**:
   - The user enters the product name ("DailyBasket") and business context ("10-minute quick-commerce grocery operating in Delhi-NCR, Bengaluru, and Pune").
   - A single-click **"Try Demo Dataset"** pre-seeds 28 realistic multi-channel Indian records (Play Store, WhatsApp screenshots, Support tickets, Sales calls, Stakeholder feedback).
2. **Ingestion & Data Cleansing**:
   - Left panel provides drag-and-drop file upload (CSV, TXT, DOCX, image screenshots), paste input, and source tagging.
   - Column mapping for CSVs (feedback text, timestamp, rating, customer ID, platform, city tier).
   - Ingestion audit modal/summary: total records parsed, duplicates flagged, unreadable lines, and secondhand stakeholder opinions flagged.
3. **Insights & Theme Exploration**:
   - Five main tabs: **Overview**, **Themes & Quotes**, **Churn Signals**, **Roadmap Actions**, and **Evaluations**.
   - Theme cards show exact record frequencies: *"14 of 28 analysed records (50.0%)"*, source breakdowns, verbatim quotes in original Hinglish/Hindi, and English translations.
   - Interactive evidence citations (e.g. `[REC-04 · Row 12]`) slide out an **Evidence Drawer** showing full context, raw file, date, segment, and verified substring match.
4. **Churn Signal Analysis**:
   - Clear classification tags: *Reported Churn*, *Stated Churn Intent*, *Competitor Consideration / Churn Risk*, and *High Dissatisfaction (No Churn Signal)*.
5. **Roadmap Action Board**:
   - Recommendation cards separating *Customer Problem*, *Observable Evidence*, *Proposed Intervention*, *Severity Rubric*, *Hypothesis & Success Metric*, and *Uncertainties / Team Input Needed*.
   - Action buttons: `Accept`, `Edit Hypothesis`, `Defer`, `Dismiss` with persistent notes.
6. **Decision Brief Export & Evaluation Suite**:
   - One-click generated executive brief formatted with citation footnotes.
   - Live **Evaluations Tab** running 11 verification suites (Citation Coverage, Quote Fidelity, Count Accuracy, Deduplication, Churn Classification, Multilingual Fidelity, Prompt-Injection Resistance, etc.) against labelled benchmarks.

### Visual Identity & Theme Tokens

In strict adherence to the Universal Frontend Design Constitution and SaaS Dashboard reference:
- **Canvas Neutrals**: Crisp warm off-white canvas (`#FBFBFD` / `bg-slate-50`), structured white cards (`#FFFFFF` with subtle 1px hairline border `border-slate-200/80` and soft elevation).
- **Typography**: Clean, professional sans structure (`Plus Jakarta Sans` / modern sans) with `tabular-nums` for all metrics, percentages, ratios, and timestamps.
- **Accents**: Restrained deep indigo (`#3730A3` / `bg-indigo-600`) and slate accents (`#0F172A`).
- **Semantic Indicators**:
  - Success / Active: Forest emerald (`#15803D`, unboxed text or subtle tint)
  - Warning / Risk: Amber ochre (`#B45309`)
  - Churn / Critical: Crimson slate (`#B91C1C`)
- **Zero-Pill Discipline**: Metadata displayed as clean, unboxed typography with typographic separators (`·`, `/`). Interactive filter buttons styled as segmented controls. No fake "AI Innovation Score" or floating sparkles.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale & Trade-Offs |
| :--- | :--- | :--- |
| **Counting Accuracy** | Deterministic in-app code calculation of numerators/denominators ($N / D$) based on explicit record-ID links | **Pro**: 100% mathematical consistency and filter reactivity. Eliminates model hallucinated counts.<br>**Con**: Requires structured schema validation step. |
| **Multilingual Hinglish & Hindi** | Retain original verbatim script with toggleable translated gloss | **Pro**: Preserves customer voice nuance, colloquialisms (*"paise kat gaye par order nahi aaya"*), and authentic sentiment.<br>**Con**: Needs dual-field schema for original vs translated quote. |
| **Deduplication Policy** | Exact normalized text hash match excluded by default; near-duplicate fuzzy matches flagged with review toggle | **Pro**: Prevents bot-spam or copy-pasted reviews from inflating theme frequency while giving PM audit control. |
| **Separation of Stakeholder Opinion** | Secondhand tags for founder/internal stakeholder reports without customer logs | **Pro**: Prevents internal confirmation bias from dominating customer pain points in PM prioritization. |
| **Evidence Standards Module** | Embedded "Good vs. Bad Output" reference with active clickable interactive examples | **Pro**: Serves as a portfolio-grade demonstration of PM rigor and evidence-based leadership. |

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Application                            │
│                                                                        │
│  ┌───────────────────────┐  ┌──────────────────────────────────────┐  │
│  │ Left Panel: Ingestion │  │ Right Panel: Insights & Workspace    │  │
│  │ - Context & Meta      │  │ - Tabs: Overview, Themes, Churn,     │  │
│  │ - File / Paste Upload │  │   Roadmap, Evaluations, Standards    │  │
│  │ - CSV Mapper / OCR    │  │ - Evidence Drawer (Slide-out)        │  │
│  │ - Filter Bar (Source/ │  │ - Decision Brief Exporter            │  │
│  │   Segment/Date)       │  │ - Roadmap Action Manager (Accept/    │  │
│  │                       │  │   Edit/Defer/Dismiss)                │  │
│  └───────────┬───────────┘  └──────────────────┬───────────────────┘  │
│              │                                 │                      │
│              ▼                                 ▼                      │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ State Store: Records, Deduplication Engine, Deterministic Theme │  │
│  │ Binding, Filter Calculator, and Action State Persister          │  │
│  └───────────────────────────────┬─────────────────────────────────┘  │
└──────────────────────────────────┼────────────────────────────────────┘
                                   │
               POST /api/analyze   │  POST /api/ocr (Gemini Vision)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Server Layer (Vite & Express)                        │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ GoogleGenAI SDK (`gemini-3.8-flash`)                            │  │
│  │ - Prompt Injection Defense & Strict JSON Schema Enforcement     │  │
│  │ - Multimodal OCR for WhatsApp Screenshots                       │  │
│  │ - Verbatim Substring Validation & Citation Anchor Check         │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Data Models

- **`FeedbackRecord`**:
  - `id`: Unique stable identifier (`REC-01`, `REC-02`, ...)
  - `sourceType`: `'playstore' | 'ticket' | 'sales_call' | 'interview' | 'whatsapp' | 'stakeholder' | 'other'`
  - `sourceName`: e.g., `"playstore_reviews_oct.csv"` or `"whatsapp_screenshot_bangalore.jpg"`
  - `originalText`: Raw verbatim feedback in Hindi / English / Hinglish
  - `translatedText`?: Clean English translation if original contains vernacular
  - `language`: `'en' | 'hi' | 'hinglish'`
  - `rating`?: Star rating 1–5
  - `customerIdentifier`?: Anonymous ID (e.g. `CUST-8839`)
  - `segment`?: e.g. `"Tier-1 Bangalore"` / `"Power User"` / `"New User"`
  - `locator`: e.g. `"Row 14"`, `"Message 3"`, `"02:45 in transcript"`
  - `isSecondhand`: Boolean (true for internal stakeholder hearsay)
  - `duplicateOf`?: ID of parent record if duplicate
  - `isExcluded`: Boolean

- **`Theme`**:
  - `id`: Stable theme identifier (`THM-OTP`, `THM-REFUND`, ...)
  - `title`: Specific problem title (e.g., *"OTP retries and timeout dropouts on Jio network"*)
  - `problemStatement`: Concrete 1-sentence description
  - `recordIds`: String[] of bound feedback records
  - `evidenceQuotes`: Array of verified verbatim quotes with record references and locators
  - `evidenceStrength`: `'high' | 'moderate' | 'emerging'` with plain-language rubric
  - `contradictionsOrLimitations`: Stated caveats or opposing feedback

- **`ChurnSignal`**:
  - `id`: Stable identifier
  - `recordId`: Associated feedback record
  - `category`: `'reported_churn' | 'explicit_intent' | 'risk_competitor' | 'high_frustration_only'`
  - `quote`: Verbatim quote demonstrating signal
  - `rationale`: Analytical explanation why this is or isn't a confirmed churn signal

- **`RoadmapRecommendation`**:
  - `id`: Stable recommendation ID
  - `title`: Interventional title (e.g. *"WhatsApp fallback OTP & auto-resend retry interval"*)
  - `customerProblem`: The empirical customer pain point
  - `linkedThemeIds`: Connected themes
  - `evidenceCount`: Computed dynamically from linked records ($N / D$)
  - `severity`: `'P0 - Critical' | 'P1 - High' | 'P2 - Medium' | 'P3 - Low'` based on explicit rubric
  - `hypothesis`: Observable cause-and-effect hypothesis statement
  - `successMetric`: Measurable PM KPI (e.g. *"Reduce drop-off at login by 18%"*)
  - `validationStep`: Practical zero-to-one validation test (e.g. *"A/B test 45s vs 15s retry timer"*)
  - `status`: `'accepted' | 'edited' | 'deferred' | 'dismissed' | 'pending'`
  - `pmNotes`?: Persisted user notes explaining the trade-off decision

- **`EvaluationSuite`**:
  - 11 real automated evaluation tests executed on synthetic benchmark fixtures:
    1. Citation coverage (100% resolvable)
    2. Quote fidelity (strict verbatim substring match)
    3. Count accuracy (deterministic math verification)
    4. Deduplication correctness (handling duplicates)
    5. Theme quality & specificity (actionable vs generic)
    6. Churn classification (separating churn from anger)
    7. Recommendation grounding (every action backed by citations)
    8. Abstention & sparse evidence handling
    9. Multilingual fidelity (Hinglish/Hindi quote preservation)
    10. Filter consistency (dynamic denominator reactivity)
    11. Prompt-injection resistance (defense against embedded overrides)

---

## 5. Verification & Delivery Plan

- **Step 1: Ingestion & OCR Backend**: Configure server middleware with `@google/genai` for vision OCR, structured thematic parsing, and strict substring citation auditing.
- **Step 2: Rich DailyBasket Benchmark Seed**: Construct realistic 28-record multi-channel Indian grocery dataset with Hindi/Hinglish quotes, duplicate pairs, churn signals, and stakeholder inputs.
- **Step 3: Frontend Layout & Navigation**: Build 30/70 split desktop workspace with top bar contract, breadcrumbs, search/filtering, and responsive collapse.
- **Step 4: Interactive Insights & Evidence Drawer**: Connect themes, verbatim quote cards, citation anchors, and slide-out evidence drawer.
- **Step 5: Prioritization Engine & Brief Export**: Implement interactive decision lifecycle (Accept/Edit/Defer/Dismiss) and markdown/clipboard executive brief export.
- **Step 6: Automated Evaluation Suite**: Implement 11-point live evaluation runner with pass/fail logs and test fixture inspection.
- **Step 7: Compilation & Verification**: Run `compile_applet` and verify zero TypeScript/lint issues.
