# Feedback to product decisions — cases

Feature slug: `feedback-to-decisions`  
Revision: 1  
Status: draft  
Source: [requirements revision 1](../requirements/feedback-to-decisions-requirements.md)  
Approval evidence: none. All cases await explicit user approval.  
Change note: initial cases preserving user scenarios and separating AI-proposed additions.  
Plan: none created.

These are proposed acceptance cases, not executed tests. Integration cases use controlled extraction/model responses for failure handling; AI quality cases need a human-labelled corpus and recorded model outputs. Review paraphrase clustering, speaker labels, source fidelity and quote accuracy against the original files, not just extracted text.

| ID | Source | Scenario/input | Action | Expected result | Level | Approval |
| --- | --- | --- | --- | --- | --- | --- |
| FTD-01 | User | Play Store, ticket and interview feedback in documents | Import and analyze | All three channels contribute; records retain source file/channel and inspectable locator | End-to-end | Pending |
| FTD-02 | User | Word document and PDF with known customer feedback | Import each | Readable feedback units extracted; original wording and source locations preserved | Integration + manual fidelity | Pending |
| FTD-03 | User | 50 distinct reviews; exactly 12 describe onboarding confusion | Analyze and open theme/export | Reports 12 of 50 reviews (24%); all 12 supporting records are inspectable; no demo records in denominator | End-to-end + AI quality | Pending |
| FTD-04 | User | Paraphrases of onboarding confusion plus unrelated complaints | Analyze | Related paraphrases cluster together; distinct pain points remain separate; top findings are specific and counted, not just “users are unhappy” | AI quality | Pending |
| FTD-05 | User | Known customer quotes supporting each theme | Open citations | Quoted original text matches supplied evidence and resolves to its actual file/record/location | End-to-end + manual fidelity | Pending |
| FTD-06 | User | Feedback with explicit customer departure signals | Analyze | Flags churn with supporting customer quote and source, rather than an unsupported assertion | AI quality | Pending |
| FTD-07 | User | Evidence-backed pain points | Generate roadmap | Each suggested action addresses a specific pain point and links back to its supporting evidence | AI quality + end-to-end | Pending |
| FTD-08 | AI-proposed | Same content in DOCX, legacy DOC, text PDF and scanned PDF | Import each separately | Equivalent feedback extracted without binary garbage or invented text; poor scan quality is flagged for review | Integration + manual fidelity | Pending |
| FTD-09 | AI-proposed | One review mentions onboarding three times; one interview response spans pages; mixed channels | Analyze | Each source feedback unit counts once per theme; mixed denominator says feedback records; no inference of unique people from record count | Unit + integration | Pending |
| FTD-10 | AI-proposed | Re-import same file across supported formats; two distinct customers use identical wording | Import and analyze | Confirmed duplicate imports do not inflate counts; independently identified customer records are retained | Integration | Pending |
| FTD-11 | AI-proposed | Interviewer prompts, agent replies and stakeholder opinions mixed with customer statements | Import and analyze | Non-customer speech retains speaker attribution and is excluded from default customer evidence/counts | AI quality + integration | Pending |
| FTD-12 | AI-proposed | Empty, corrupt, password-protected or oversized file; extraction fails | Import then retry valid file | Clear actionable error or review state; no invented records or partial silent success; valid retry works | Integration + UI | Pending |
| FTD-13 | AI-proposed | CSV containing quoted commas, escaped quotes, embedded newlines and blank feedback rows | Import with mapping | Exact text/columns preserved; blank rows skipped; stable unique IDs and correct locators | Unit + integration | Pending |
| FTD-14 | AI-proposed | AI returns fabricated/empty quote, unknown record ID, or unrelated theme membership | Validate result | Invalid evidence is rejected or explicitly held for review; it cannot appear as verified support, inflate accepted counts, or silently export | Integration + AI quality | Pending |
| FTD-15 | AI-proposed | “Uninstalled”; “will cancel”; “switched to X”; one-star anger; “will not cancel”; mere competitor mention | Analyze churn | Distinguishes actual departure, intent, switching and frustration; negation/name alone does not trigger churn; every accepted quote matches source | AI quality + integration | Pending |
| FTD-16 | AI-proposed | Theme frequencies 12, 20 and 5 returned unsorted; equal-frequency ties | Render themes | Displays 20, 12, 5; stable tie order; severity does not silently replace stated frequency ranking | Unit + UI | Pending |
| FTD-17 | AI-proposed | Filter to 20 records with 4 matches; toggle duplicates/secondhand; then zero records | Inspect all tabs and export | Cohort, counts (4/20), quotes and churn agree everywhere; inclusion policy is consistent; empty state avoids misleading percentages | Integration + UI | Pending |
| FTD-18 | AI-proposed | New real upload in demo; new records or corrected quote after analysis | Import/edit then view results | Demo remains separate; prior analysis is visibly stale until refreshed; unanalysed records are not labelled analyzed | End-to-end | Pending |
| FTD-19 | AI-proposed | Successful analysis returns no themes; sparse or contradictory evidence | Analyze after prior results | Old themes are cleared; no forced 3–6 themes; sparse evidence and contradictions are disclosed without fabricated certainty | Integration + AI quality | Pending |
| FTD-20 | AI-proposed | Missing API key, timeout, rate limit, malformed JSON or missing response fields | Analyze, then retry | Clear failure; no crash/false success/partial replacement; prior results labelled appropriately; retry can recover | Integration + UI | Pending |
| FTD-21 | AI-proposed | Rapid import/retry; two uploads finish out of order; data changes during analysis | Complete operations in reverse order | Stable unique record IDs; no lost or duplicate additions; old response cannot overwrite newer workspace analysis | Integration | Pending |
| FTD-22 | AI-proposed | Roadmap with invalid theme link, unsupported severity or invented impact/effort | Validate and export | Invalid links rejected; priority rationale and uncertainties shown; hypothesis, measurable metric and validation step included; unknown targets/effort not invented | Integration + AI quality | Pending |
| FTD-23 | AI-proposed | Hindi/Hinglish feedback and embedded “ignore instructions” text | Extract/analyze | Original script preserved, translations labelled; embedded directives cannot change evidence, counts or analysis rules | AI quality + manual fidelity | Pending |
| FTD-24 | AI-proposed | Broken citation, inconsistent filter result, or evaluation never executed | Open evaluation results | Actual failure/not-run status shown; no hardcoded passes or unmeasured accuracy claims | Integration | Pending |
| FTD-25 | AI-proposed | Keyboard-only use and narrow screen; long quotes and filenames | Import, filter, open/close evidence, export | Controls have accessible names, focus is visible/restored, dialogs work by keyboard, content remains readable without clipped evidence | Manual accessibility + visual | Pending |

## Approval request

Review requirements revision 1 assumptions and approve or amend FTD-01–FTD-25 in test revision 1. User-origin scenarios remain pending too. No implementation begins in this stage.
