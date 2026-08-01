---
name: build-reliable-agents
description: Design agents, subagents, and tool APIs that finish fast instead of looping, stalling, or hitting rate limits. Use when creating or refactoring AI agents, writing agent tools, wiring orchestrator-to-subagent delegation, or debugging an agent that makes too many tool calls, returns empty answers, streams huge payloads, or exhausts model quota.
---

# Build Reliable Agents

Rules for designing agents and their tools, distilled from debugging a production multi-agent assistant where half the canned prompts never finished (15-minute hangs, 523 MB streamed for one request, rate-limit storms). After applying these rules, every prompt completed in 20–90 seconds with exactly two tool calls. Evidence and before/after numbers: [references/case-study.md](references/case-study.md).

Most "the model is confused" behavior is not model weakness. It is payload size, budget starvation, or a protocol gap between agents. Fix the plumbing before blaming the model.

## Core rule: data flows around the model, not through it

The model should route and describe data, never carry it.

- Tools that **fetch** data store the full result server-side (in-memory store with TTL is fine) and return a reference token plus row count, column list, and a small preview (5–10 rows).
- Tools that **consume** data accept that token and resolve it server-side.
- Outputs meant for the UI (charts, maps, files, artifacts) are delivered out-of-band — a stream data part or file write — while the model receives a compact acknowledgement (`{ id, title, delivered: true }`) and an instruction to reference the output by name, not restate it.

Symptoms of violating this rule: rate-limit errors (`RESOURCE_EXHAUSTED`, 429), minutes-long silent retries, the model retyping rows into the next tool call, stream size growing quadratically, truncated or hallucinated data.

## Give every agent a survivable step budget

- Count the worst-case honest workflow (discovery + schema reads + queries + the final synthesis step) and set the step cap comfortably above it. The final answer costs a step too — a cap that fits the tool calls exactly produces an agent that ends with empty text.
- Tell the agent what to do near the limit: "If you are running low on steps, stop querying and summarize what you already have — partial data beats no answer."
- An agent that hits its cap silently returns nothing; its caller then retries, and the retry re-pays the whole workflow. Budget starvation in a subagent is the single most common cause of a "confused" orchestrator.

## Write an explicit delegation contract

- Delegate **once** per request with the complete requirement: every result set needed, the columns each needs, and sensible limits. Micro-delegations each re-pay discovery from scratch because subagent runs are stateless.
- Mandate a final-answer format and mark it non-optional: one-line summary, each reference token verbatim with row count and columns, and the data source. "Never end without a final answer."
- Bound the caller's retries in its instructions: "re-delegate at most once with a precise correction; then report the failure to the user." Unbounded retry loops look like confusion and burn quota.
- Never instruct a subagent to "ask the user" — it has no channel to the user. Have it report ambiguity in its answer and let the orchestrator ask.
- Know what your framework forwards between agents. Many (e.g. Mastra's agent-as-tool) return every subagent tool result to the caller verbatim, and some stream cumulative state snapshots per event. Keeping individual tool results small is what keeps delegation cheap.

## Put static knowledge in instructions, not behind tool calls

If a fact is stable for the session — table catalogs, schemas, environment config — inject it into the agent's instructions (dynamic instructions with a short-TTL cache work well) and say explicitly: "The catalog is above — do NOT call listTables unless a table you expect is missing." Discovery tools should be the fallback, not the routine.

## Design tool APIs for the model as the audience

- **Errors must teach the fix.** "Layer has no rows to plot" causes blind retries; "Set this layer's rowsRef to the token returned by bigquerySql" turns the same failure into a one-retry self-correction. Every thrown error should name the parameter to change and where the correct value comes from.
- **One schema, one source of truth.** Duplicated inline schemas drift, and validators that strip unknown keys (zod default) will silently discard a field the model passed correctly. If you must duplicate, make the validator reject unknown keys loudly instead of stripping.
- **Degrade gracefully at caps.** Never head-truncate ordered data — downsample evenly and keep endpoints (a path sliced at row 200 is silently corrupt; the model cannot see that rows 201+ vanished). State applied caps in the tool result.
- **Accept inputs models actually produce.** Tokenize search queries and rank by matches — whole-string substring matching returns zero results for any multi-word query. Auto-detect common column aliases (lat/latitude/stop_lat + shared-stem pairs) instead of failing on naming.
- **Fold bookkeeping in.** If every data call must be audited, write the audit record inside the data tool rather than requiring a separate audit tool call — each mandatory extra call taxes the step budget.
- Descriptions state WHEN to use the tool and the one preferred pattern, not a menu of options.

## Debug method: log the calls, not the vibes

When an agent misbehaves, do not tune prompts first. Capture evidence:

1. Log every tool call from the stream with input size, output size, and timing (a small script that POSTs a prompt and parses the SSE/stream events is enough).
2. Scan for the four signatures:
   - **Empty final text** from a subagent → step-budget starvation.
   - **Repeated identical calls** (same table/schema/query) → stateless re-discovery or a retry loop.
   - **Any tool output over ~20 KB** → a context bomb that will cascade into rate limits.
   - **Long silent gaps** → provider retry/backoff, usually caused by the context bombs.
3. Fix the largest byte count first. Re-run the same prompts and compare call counts, sizes, and wall time.

## Checklist before shipping an agent

- [ ] No tool returns more than a preview of bulk data into model context; bulk data moves by reference.
- [ ] UI-bound outputs bypass the model; the model gets an ack.
- [ ] Step cap ≥ worst-case workflow + synthesis + margin; instructions say what to do near the cap.
- [ ] Delegation: single complete request, mandatory answer format, bounded retries, no "ask the user" inside subagents.
- [ ] Stable facts injected into instructions with a cache, not re-fetched per run.
- [ ] Every tool error names the fix; schemas are single-sourced; caps downsample instead of truncate.
- [ ] A repeatable probe script exists that logs per-call sizes and timings for your canned prompts.
