---
name: build-reliable-agents
description: Design agents, subagents, and tool APIs that finish fast instead of looping, stalling, or hitting rate limits. Use when creating or refactoring AI agents, writing agent tools, wiring orchestrator-to-subagent delegation, designing tool schemas, or debugging an agent that makes too many tool calls, returns empty answers, streams huge payloads, or exhausts model quota.
---

# Build Reliable Agents

Most "the model is confused" behavior is not model weakness. It is payload size, budget starvation, missing protocols between agents, or tool APIs designed for humans instead of models. Fix the plumbing before touching the prompt.

Read [references/anti-patterns.md](references/anti-patterns.md) for the what-not-to-do catalog (each with symptom, cause, and fix), and [references/case-study.md](references/case-study.md) for a measured before/after of these rules applied to a real multi-agent system.

## Architecture: earn every agent

- Start with one agent and a small toolset. Add a subagent only when it buys something concrete: context isolation (keeping noisy tool output out of the main thread), parallelism, or a genuinely different toolset/model. Every hop between agents loses information and adds latency, cost, and a new failure mode.
- The orchestrator owns the user conversation and anything user-visible (artifacts, files, UI updates). Workers own data access and computation. Do not let both do the same job — remove overlapping tools so there is exactly one obvious way to do each thing.
- Subagent runs are stateless: a second delegation remembers nothing from the first. Design around this — one complete delegation beats three incremental ones.
- Decide where each fact lives: stable session facts (catalogs, schemas, config, conventions) go in instructions; volatile facts go behind tools. An agent that must call a tool to learn what never changes is paying a tax on every run.

## Context is the working memory — budget it

Every tool result stays in context for the rest of the run. A single oversized result degrades every later step: slower calls, provider rate limits, then truncation and hallucination.

- **Move bulk data by reference, never through the model.** Fetch tools store full results server-side (an in-memory store with TTL is fine) and return a reference token plus row count, column list, and a 5–10 row preview. Consuming tools accept the token and resolve it server-side. The model routes and describes data; it must never carry or retype it.
- **Deliver UI-bound outputs out-of-band.** Charts, maps, files, and artifacts go directly to the client (stream data part, file write); the model receives a compact acknowledgement (`{ id, title, delivered: true }`) and an instruction to reference the output by name, not restate its contents.
- Cap every tool's return size by design. A tool result over ~20 KB is a context bomb; over ~100 KB it can break the run.
- Know what your framework forwards. Many multi-agent frameworks return every subagent tool result to the caller verbatim, and some stream cumulative state snapshots on every nested event — small tool results are what keep delegation and streaming cheap.

## Budgets and loops: assume things fail, bound everything

- Set the step cap from the worst-case honest workflow: discovery + reads + queries + **the final synthesis step** (it costs a step too) + margin. A cap that exactly fits the tool calls produces an agent that ends with empty text.
- Tell the agent what to do near the limit: "If you are running low on steps, stop calling tools and summarize what you already have — partial data beats no answer."
- Bound retries at every level and say so in instructions: tools retry internally at most once; the orchestrator re-delegates at most once with a precise correction, then reports failure to the user. Unbounded retry loops look like confusion and burn quota.
- Give long operations timeouts, and prefer failing with a described state over hanging silently.

## Delegation is a protocol — write the contract

- Delegate once with the complete requirement: every result set needed, the columns each needs, and limits. Name what you expect back.
- Mandate the worker's answer format and mark it non-optional: one-line summary, each reference token verbatim with row count and columns, and the data source. "Never end without a final answer" — an empty reply forces the caller to guess and retry.
- Workers have no channel to the user. Never instruct a subagent to "ask the user"; have it report ambiguity or options in its answer and let the orchestrator ask.
- Specify the failure protocol both ways: what the worker reports when it cannot comply, and what the caller does with that report.

## Tool APIs: the model is the audience

- **Errors must teach the fix.** State the parameter to change and where the correct value comes from ("Set this layer's rowsRef to the token returned by bigquerySql"), not just what failed. A good error converts a retry loop into a one-shot self-correction; write every thrown error expecting the model to read it and immediately retry.
- **Descriptions are prompts.** State WHAT the tool does, WHEN to use it, and the one preferred pattern — not a menu of alternatives. Put cross-tool workflow hints in the description ("pass the returned token to createChart").
- **One schema, one source of truth.** Duplicated inline schemas drift; validators that silently strip unknown keys (a common default) will discard fields the model passed correctly and produce impossible-looking bugs. Reject loudly instead of stripping.
- **Prefer fewer, more powerful tools.** Every tool adds schema tokens and decision burden. Fold mandatory bookkeeping (audit logs, telemetry) into the data tool instead of requiring a separate call; merge tools that are always called together.
- **Accept the inputs models actually produce.** Tokenize and rank search queries (whole-string substring matching returns nothing for multi-word queries). Auto-detect common column aliases and naming variants. Coerce obvious formats rather than erroring.
- **Degrade gracefully at caps.** Downsample ordered data evenly and keep endpoints; never head-truncate (the model cannot see that rows 201+ vanished, and a path cut mid-route is silently corrupt data). State applied caps in the result.
- **Keep return shapes stable and self-describing.** Consistent field names across tools, counts alongside collections, and a short `note` field for anything the model must know next ("preview shows 8 of 3,640 rows; pass rowsRef to chart the full set").
- Label side effects. Read-only tools, mutating tools, and irreversible tools should be distinguishable from name and description alone.

## Instructions: workflows, not vibes

- Write the happy path as numbered steps with the expected number of tool calls ("a typical task is 2–5 tool calls, then your answer"). Models calibrate effort to what you state.
- Be explicit about what NOT to do with tools the agent has ("the catalog is above — do NOT call listTables unless a table you expect is missing").
- Include concrete call examples for the trickiest tool — one worked example of correct arguments prevents a whole class of malformed calls.
- Instructions can be dynamic: inject cached slow-changing facts (catalog, schema digests) at run start rather than making the agent fetch them.

## Verify with a probe, not vibes

- Build a probe harness on day one: a script that sends a canned prompt to the agent endpoint and logs every stream event — tool name, input size, output size, timing. Keep a set of canned prompts as a regression suite and re-run after every change.
- When something misbehaves, scan the log for the four signatures:
  1. **Empty final text from a worker** → step-budget starvation.
  2. **Repeated near-identical calls** → stateless re-discovery or an unbounded retry loop.
  3. **Any tool output over ~20 KB** → context bomb; expect rate limits downstream.
  4. **Long silent gaps** → provider retry/backoff, usually caused by (3).
- Fix the largest byte count first, then re-measure call counts, sizes, and wall time against the same prompts.

## Pre-ship checklist

- [ ] Bulk data moves by reference; no tool returns more than a preview into context.
- [ ] UI-bound outputs bypass the model; the model gets an ack.
- [ ] Step cap ≥ worst-case workflow + synthesis + margin; near-cap behavior specified.
- [ ] Delegation contract: single complete request, mandatory answer format, bounded retries, no "ask the user" in workers.
- [ ] Stable facts injected into instructions with a cache, not re-fetched per run.
- [ ] Every tool error names the fix; schemas single-sourced and strict; caps downsample instead of truncate.
- [ ] No overlapping tools between orchestrator and workers.
- [ ] Probe script + canned prompts exist and pass with expected call counts.
