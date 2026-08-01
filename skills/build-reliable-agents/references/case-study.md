# Case study: from 523 MB streams to two tool calls

The system: a dashboard assistant (orchestrator agent) with a dataset subagent that queries BigQuery, plus chart/map artifact tools. Model: a fast/cheap tier model for every agent. Four canned "suggested prompts" exercised the pipeline; two never completed.

## Measured failure (before)

| Prompt | Outcome |
|---|---|
| Transit network map | Died after 15+ min; 6 delegations; 523 MB streamed; no artifact |
| Peak headways chart | Timed out at 8 min; one delegation took 7.5 min and returned empty text |
| POI treemap | Worked (42 s) — single delegation, small data |
| Hub heatmap | Worked (60 s) — single delegation, small data |

The difference between success and failure was purely data volume and step count — not prompt wording.

## Root causes found by logging every stream event

1. **Subagent step cap = 12, but the mandated workflow needed 13+ calls** (list tables + 5 schemas + 6–9 queries + audit + summary). The run was cut off exactly at the summary step → returned `text: ""` → orchestrator re-delegated → each retry re-ran discovery from scratch.
2. **Framework forwarded every subagent tool result to the orchestrator** (`subAgentToolResults`), including a 741 KB raw query result (3,640 geometry rows) → ~200 K tokens injected into the orchestrator context → provider `RESOURCE_EXHAUSTED` → minutes-long backoff retries.
3. **The chat route re-emitted the subagent's entire accumulated state on every nested event.** Once an 800 KB result was buffered, every subsequent chunk re-sent it: 994 chunks → 523 MB over SSE for one request.
4. **Whole-string substring search**: `searchTables("headway rapid rail transit frequency line")` matched nothing, ever, pushing the orchestrator back into more delegations.
5. **The orchestrator eventually asked the subagent to "output the raw JSON array of rows" as text** — thousands of rows through a fast-tier model — which hung the run permanently.
6. Smaller defects: geometry head-truncated at 200 rows (silently chopping paths); duplicated zod schema stripped a correctly-passed field; error messages stated failures without fixes; a mandatory separate audit-tool call taxed the step budget.

## Fixes applied

- Server-side rows store with TTL; the query tool returns `rowsRef` + columns + 8-row preview; artifact tools accept `rowsRef` (top-level and per-layer) and resolve rows server-side.
- Artifact tools stream the full artifact to the UI as a data part; the model receives a ~900-char ack.
- Subagent: step cap 12 → 24; table catalog injected into (cached) dynamic instructions; mandatory final-answer format ("never end without one; partial beats empty"); audit folded into the query tool.
- Orchestrator: delegate once with the complete requirement; re-delegate at most once; never request raw row dumps.
- Tokenized, ranked table search; even-stride path downsampling preserving endpoints; shared-stem lat/lon detection (`stop_lat`/`stop_lon`); every error message names the parameter to fix and the source of the correct value.

## Measured result (after)

| Prompt | Before | After |
|---|---|---|
| Transit network map | dead, 523 MB, no artifact | 35 s, 2 tool calls, complete 2-layer map |
| Peak headways chart | timed out, no artifact | 89 s, 2 tool calls |
| POI treemap | 42 s | 33 s |
| Hub heatmap | 60 s | 22 s |

Stream size for the heavy prompt dropped from 523 MB to under 1 MB. Every prompt converged to the ideal shape: one delegation, one artifact call. During verification, the one tool error that still occurred (a schema-stripped field) was self-corrected by the model in a single retry — because the error message said exactly what to change.
