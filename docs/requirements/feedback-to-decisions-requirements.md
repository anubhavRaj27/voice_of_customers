# Feedback to product decisions

Feature slug: `feedback-to-decisions`  
Revision: 1  
Status: draft  
Approval evidence: none; user requested review and cases, not approval of proposed behavior.

## Source and scope

User request (2026-11-16): ingest messy customer feedback from Play Store reviews, support tickets, interviews and other sources via documents/PDFs; identify and cluster top pain points, attach real quotes, flag churn signals, and recommend roadmap actions. Good output: “12 out of 50 reviews mention onboarding confusion.” Bad output: “users are unhappy with onboarding.”

Deliverables at this stage: code review and [test-case revision 1](../test-cases/feedback-to-decisions-test.md). No implementation, executable tests, or implementation plan.

## Requirements supplied by user

- Accept feedback documents/PDFs from different customer channels.
- Cluster semantically related feedback into useful pain points and identify the top ones.
- Report explicit supporting counts and sample denominators, rather than vague sentiment summaries.
- Attach authentic customer quotations traceable to the supplied evidence.
- Identify churn signals and recommend evidence-backed roadmap actions.

## Assumptions proposed for approval

- “Doc” means both `.docx` and legacy `.doc`; PDF includes text and scanned documents. Direct integrations with stores/ticket systems are outside this request.
- Count distinct feedback units (one review, ticket, or interview response), not lines, pages, files, repeated mentions, or unique people. Preserve the parent unit when splitting a long response. Mixed-channel denominators say “feedback records,” not “reviews.” Customer counts require sufficient identity information.
- Exclude confirmed duplicate imports and non-customer speech from default customer counts; identical text alone is not proof that two customers are the same record.
- Rank top pain points by eligible record frequency with a stable tie order. Severity and roadmap priority are separate, explained judgments.
- Keep demo and real feedback separate. Document uploads may be sequential; simultaneous multi-file selection is not required by this revision.
- Preserve original language and label translations separately. Sparse or contradictory evidence must be visible; do not require an arbitrary minimum of three themes.
- On import, edit, or source-data change, mark prior analysis stale until refreshed. Use one consistent active cohort across screens and exports.
- Permanent storage, authentication, deployment, and automatic source connectors are outside this revision. The current app loses changes on refresh.

## Code review findings

Static inspection only; no live Gemini/document-quality validation was performed. The built-in evaluation screen is not an independent passing test suite.

1. **Document ingestion is incomplete.** `src/components/FeedbackInbox.tsx:80–131` handles CSV, PDF and images specially but reads DOCX as plain text; `.doc` is absent from the picker. Plain text is split by line rather than customer unit.
2. **Real and demo data mix.** `src/App.tsx:35–38` initializes seeded data; import handlers append real records without clearing or separating the demo.
3. **Speaker/source fidelity is lost.** PDF records are always `pdf_document`; only stakeholders are marked secondhand. Support agents/interviewers can count as customers. Images are always WhatsApp with `isSecondhand: false` (`FeedbackInbox.tsx:135–227`).
4. **Counts have a sound core but unreliable inputs.** `src/utils/mathEngine.ts` counts unique linked record IDs against active record count. It cannot establish whether AI theme membership is correct. PDF/image imports skip CSV deduplication; length-based record IDs can collide after skipped rows or overlapping imports. CSV parsing removes quote delimiters before a second comma-parsing pass, corrupting quoted commas.
5. **Quotes are not strictly enforced.** `server.ts:280–305` compares case/whitespace-normalized theme quotes and returns mismatches with a flag. Themes and exports still display these quotes. Churn quotes, theme membership IDs, and recommendation links lack equivalent validation. PDF quotes are checked against model-extracted text, not the original file.
6. **“Top” is not actually ranked.** `ThemesTab.tsx:80` renders the received order despite its frequency-ranking claim.
7. **Cohorts and freshness diverge.** Theme quotes and churn cards remain unfiltered while counts change. Screens re-exclude duplicates after the inclusion toggle. `App.tsx:103–114` retains old themes on a successful empty result; edits/imports do not invalidate previous analysis or protect against stale responses.
8. **Evaluation claims overstate verification.** `evaluationFixtures.ts` hardcodes passing results for abstention, filter consistency and prompt injection. Other checks use heuristics; recommendation checks only require nonempty theme links, not existing themes. These do not prove AI quality.

## Review conclusion

The app demonstrates the intended workflow, and deterministic frequency calculation is already present. It is not yet reliable enough to treat arbitrary uploaded documents as verified product-decision evidence. Prioritize ingestion, cohort integrity, validated citations, and honest analysis/evaluation state before trusting generated recommendations.
