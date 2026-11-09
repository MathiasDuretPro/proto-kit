---
name: prepare-test
description: Phase 6. Use to prepare user testing of the prototype: test plan from the journeys, mock data per task, optional local tracking, preview deployment.
---

# prepare-test

## Inputs
- Journeys in `context/inventory.md`, goals in `context/client.md > User testing`.

## Steps
1. Write `docs/test-plan.md`:
   - test goals;
   - tasks for participants, in their words, no UI vocabulary;
   - success criteria per task (reached screen, time, errors);
   - end-of-test questions.
2. For each task, prepare the mock data it needs in `src/mocks/` (realistic
   names, prices, dates; edge cases where the task requires them).
3. Tracking, only if the designer asks: enable `src/lib/tracking.ts`
   (`enableTracking()`), mark key elements with `data-track="<name>"`. Events
   stay in the browser and export as JSON. No third-party service without
   explicit approval.
4. Preview deployment: `vercel.json` is ready. Linking a Vercel project needs
   the designer's account and approval.
5. Dry run: walk every task end to end, note any dead end.

## Deliverable
`docs/test-plan.md`, mocks per task, tracking on if requested, preview link if approved.

## Stop when
- CHECKPOINT: ready to test.
