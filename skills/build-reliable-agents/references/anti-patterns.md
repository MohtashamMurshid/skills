# Anti-patterns: what not to do when building agents

Each entry lists the symptom you observe, the underlying mistake, and the fix. These are the failure modes humans and agents most often build in without noticing — every one of them was found in real systems.

## Context and data flow

### 1. Raw data through the model
**Symptom:** rate-limit errors (`RESOURCE_EXHAUSTED`, 429), minutes-long silent stalls, the model retyping rows into the next tool call, truncated or invented values.
**Mistake:** tools return full result sets (hundreds of KB) into model context; the model is then asked to pass that data onward.
**Fix:** store results server-side, return a reference token + counts + small preview; downstream tools resolve the token. The model never carries bulk data.

### 2. Full artifacts returned to the model when they're meant for the UI
**Symptom:** a chart/map/file renders fine but the run slows down and later steps degrade; token bills spike.
**Mistake:** the artifact-building tool returns the entire artifact (geometry, rows, base64) as its result, so it lands in context even though only the UI needs it.
**Fix:** stream the artifact to the client out-of-band; return `{ id, title, delivered: true }` plus a note telling the model to reference it by name.

### 3. Ignoring what the framework forwards between agents
**Symptom:** the orchestrator's context explodes even though the worker behaved; streams grow quadratically (hundreds of MB for one request).
**Mistake:** assuming only the worker's final text reaches the caller. Many frameworks attach every worker tool result verbatim, and some re-emit the entire accumulated run state on every nested stream event.
**Fix:** keep individual tool results small (that bounds both forwarding and snapshots); verify by measuring the caller-side stream, not the worker's output.

## Budgets and loops

### 4. Step cap that exactly fits the tool calls
**Symptom:** a worker does all the work, then returns empty text; the caller retries; the loop repeats the entire workflow.
**Mistake:** counting only tool calls when setting `maxSteps` — the final synthesis/answer step costs a step too.
**Fix:** cap = worst-case tool calls + synthesis + margin. Instruct: "near the limit, stop calling tools and summarize what you have."

### 5. Unbounded retries — at any level
**Symptom:** the same delegation or tool call repeated 3–6 times with slight rewording; quota burned; the user sees a spinner for minutes.
**Mistake:** no retry policy anywhere, so every layer (tool, worker, orchestrator, provider SDK) retries independently and multiplies.
**Fix:** state bounds in instructions ("re-delegate at most once with a precise correction, then report failure") and in code (tool-internal retry ≤ 1).

### 6. Mandatory busywork calls
**Symptom:** workers run out of steps on trivial tasks.
**Mistake:** requiring a separate bookkeeping call (audit record, telemetry ping) after every data call.
**Fix:** fold bookkeeping into the data tool itself.

## Delegation

### 7. Micro-delegations
**Symptom:** the orchestrator delegates 5–6 times for one user request; each delegation re-runs discovery (list tables, read schemas) from scratch.
**Mistake:** treating a stateless subagent like a stateful colleague you can drip-feed.
**Fix:** one delegation carrying the complete requirement — every result set, its columns, its limits.

### 8. No mandatory answer format for workers
**Symptom:** worker replies vary between prose, raw dumps, and nothing; the orchestrator can't parse them and guesses.
**Mistake:** letting agent-to-agent communication be freeform.
**Fix:** mandate the reply shape (summary + tokens verbatim + counts + source) and mark it non-optional: "never end without a final answer."

### 9. Telling a subagent to "ask the user"
**Symptom:** worker stalls or produces a question nobody sees.
**Mistake:** workers have no user channel.
**Fix:** workers report ambiguity and candidates in their answer; the orchestrator asks the user.

### 10. Overlapping tools between orchestrator and workers
**Symptom:** the orchestrator sometimes does the worker's job badly (or vice versa); behavior differs run to run.
**Mistake:** giving both layers the same discovery/query tools "just in case."
**Fix:** exactly one obvious owner per capability; remove the duplicates.

## Tool API design

### 11. Errors that state the failure but not the fix
**Symptom:** blind retry loops on the same failing call.
**Mistake:** `"Layer has no rows to plot"` tells the model nothing actionable.
**Fix:** name the parameter and the source of the correct value: `"Set this layer's rowsRef to the token returned by bigquerySql."` Expect the model to read the error and retry once, correctly.

### 12. Duplicated schemas + silent stripping
**Symptom:** the model passes a correct field; the tool behaves as if it were never sent; falls back to wrong data with no error (silently wrong output — the worst failure mode).
**Mistake:** the same layer/input shape defined twice (e.g. inline and shared), one copy missing a field, and a validator that strips unknown keys by default.
**Fix:** single-source every schema; configure validation to reject unknown keys loudly.

### 13. Search that can't match how models query
**Symptom:** a search tool returns zero results for every realistic query.
**Mistake:** substring-matching the whole query string; models send multi-word queries like "headway rapid rail frequency".
**Fix:** tokenize, match per-keyword, rank by match count, return top N.

### 14. Head-truncation at caps
**Symptom:** maps with chopped routes, charts missing categories — with no error anywhere.
**Mistake:** `rows.slice(0, N)` on ordered data; the model cannot see that the tail vanished.
**Fix:** downsample evenly, preserve endpoints, and state the applied cap in the result.

### 15. Rigid input expectations
**Symptom:** failures on `stop_lat`/`stop_lon` when the tool expects `lat`/`lng`; failures on formats any human would accept.
**Mistake:** designing for the ideal caller instead of the actual output distribution of a model.
**Fix:** accept common aliases and shared-stem pairs; coerce obvious formats; document the canonical form in the description so the model converges on it.

### 16. Tool descriptions that list options instead of a pattern
**Symptom:** the model picks a different approach every run; some are wrong.
**Mistake:** "you can pass rows, or a ref, or a query, or..."
**Fix:** one preferred pattern stated imperatively, with the alternative as an explicit escape hatch for a named situation.

## Instructions

### 17. Static facts hidden behind tool calls
**Symptom:** every run starts with the same discovery calls (list tables, fetch config) whose answers never change within a session.
**Mistake:** making the agent fetch what the system already knows.
**Fix:** inject cached slow-changing facts into instructions at run start, and say "do NOT call listX — the catalog is above."

### 18. Happy-path-only instructions
**Symptom:** graceful runs when everything works; chaos on the first error (loops, silence, invented data).
**Mistake:** no failure protocol, no budget guidance, no "what to do when a tool errors twice."
**Fix:** specify near-cap behavior, retry bounds, and the failure report format. "Partial beats empty" needs to be written down.

### 19. No expected effort calibration
**Symptom:** the agent issues a dozen exploratory calls for a task that needs three.
**Mistake:** instructions never say what a typical task costs.
**Fix:** "a typical task is 2–5 tool calls, then your answer" — models calibrate to stated expectations.

## Verification

### 20. Debugging by prompt-tweaking
**Symptom:** days of instruction rewrites with no improvement.
**Mistake:** treating a plumbing problem (payload sizes, budgets, protocols) as a prompting problem.
**Fix:** log every call's input/output size and timing first; look for the four signatures (empty worker text, repeated calls, >20 KB outputs, long gaps); fix the biggest byte count; re-measure with the same canned prompts.
