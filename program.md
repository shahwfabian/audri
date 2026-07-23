# Audri Autoresearch Program

This file is the operating program for autonomous Audri research. The pattern is adapted from `karpathy/autoresearch`: fixed budget, fixed metric, small editable scope, repeated experiments, and ruthless logging. The domain is different. Audri optimizes scholarship product quality, factual trust, paid-product readiness, and operating cost.

## Scope

Use this program for open-ended background development, prompt experiments, evaluation design, model-routing research, scholarship-ingestion improvements, and agent-team orchestration.

Do not use this program for real student submissions, production billing changes, production email sends, irreversible external writes, or connector activity that exposes private data unless the owner explicitly authorizes that run.

## Setup

1. Pick a run tag such as `2026-07-22-url-research`.
2. Create `research/runs/<run-tag>/`.
3. Create `research/runs/<run-tag>/results.tsv` with this header:

```text
timestamp	commit	metric	status	scope	description	next
```

4. Define the hypothesis in `research/runs/<run-tag>/brief.md`.
5. Define the fixed editable scope. Prefer one path or one subsystem.
6. Define the fixed budget before edits. Include wall-clock limit, model-call limit, token limit, and allowed commands.
7. Establish a baseline before changing code.

## Default Metrics

Pick one primary metric per run. Track supporting metrics only when they clarify the decision.

- Essay quality run: improve synthetic eval score for requirement coverage, source grounding, student-fact preservation, word-limit compliance, and house style.
- URL research run: improve scholarship requirement extraction accuracy and reduce unsupported claims.
- Reliability run: reduce failing tests, runtime errors, bad states, or retry loops.
- Cost run: reduce model calls, tokens, latency, or duplicate retrieval without lowering quality.
- Product run: improve one verified user flow with screenshots or targeted browser checks.

Hard failures override metric gains: fabricated student facts, unsupported scholarship claims, leaked secrets, broken auth, broken quota enforcement, broken billing state, new em dash or en dash in user-facing copy, or visible UI breakage.

## Experiment Loop

1. Check branch, HEAD, worktree, and current untracked files.
2. Read `AGENTS.md`, this file, and only the files in scope.
3. Record the baseline result in `results.tsv`.
4. Make the smallest experiment that can test the hypothesis.
5. Run the fixed verification command set.
6. Record the result as `keep`, `discard`, or `crash`.
7. Keep the edit only if it improves the primary metric and passes hard constraints.
8. If discarded, revert only the experiment's own edits. Never revert unrelated user work.
9. Continue until the stop condition is reached or the owner interrupts.

## Agent Team Pattern

Use stochastic teams when independent perspectives can change the result.

- Research agents are read-only and receive narrow briefs.
- One writer edits the shared workspace.
- A fresh verifier reviews the result against `AGENTS.md`, this program, and the run brief.
- The synthesizer keeps dissent when evidence is unresolved.

Use cheaper approved models for bounded discovery when the harness supports routing. Use the strongest available model for synthesis, security review, final product decisions, and scholarship judgment. Keep provider identifiers in environment variables.

## Suggested Audri Runs

- Build a synthetic scholarship eval harness for `/generate`.
- Add source-grounding checks for URL mode.
- Measure prompt changes against word-limit and house-style compliance.
- Reduce duplicate model calls in essay generation.
- Improve scholarship ingestion coverage with bounded source fetches.
- Verify the paid upgrade lifecycle in Stripe test mode.

## Stop Conditions

Stop a run when one condition is true:

- The metric improves and verification passes.
- Three consecutive experiments fail for the same reason.
- The next step needs owner authority or credentials.
- The run reaches its declared wall-clock, token, or command budget.
- A hard failure appears.

## Reporting

At handoff, report:

- Run tag.
- Baseline.
- Best result.
- Kept change or discarded direction.
- Verification performed.
- Failure observed.
- One reusable learning that should or should not be promoted into `AGENTS.md`.
