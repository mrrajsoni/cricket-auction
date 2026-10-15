# Handover — Big Pickle track

**Written 2026-10-15 (revised — Supabase-first stack adopted this session).** This file is *state
and protocol*, not rules. Read it before anything else, then `BIG_PICKLE_PHASES.md`. Where the two
disagree on how we talk to Raj, the shared contract in `docs/MENTORSHIP_GUIDE.md` wins.

---

## What this track is

A **separate, self-contained** session track for working with Raj on `cricket-auction`, alongside
the existing MUSE/CLAUDE track. Same repo, same person, same curriculum — **different documents**.
**Do not merge the tracks, and do not edit the other track's files** — if they diverge, report it.

| Track | Entry point | Curriculum | State |
| --- | --- | --- | --- |
| MUSE / Claude | `CLAUDE.md` → `docs/MENTORSHIP_GUIDE.md` | `docs/PHASE_LABS.md` + `docs/CAREER_ROADMAP.md` | `docs/HANDOVER.md` |
| **Big Pickle** | `AGENTS.md` | `BIG_PICKLE_PHASES.md` | **this file** |

---

## The contract

The five clauses are in `AGENTS.md` (auto-loaded) and in full in `docs/MENTORSHIP_GUIDE.md`. Shared
with the other track and binding on both. **This track adds one rule:** nothing in
`BIG_PICKLE_PHASES.md` is a solution. Naming a concept is allowed; writing it is not.

---

## Stack decision — 2026-10-15, Raj's call

**Supabase-first, hybrid runtime.** Local Supabase (CLI + Docker) for all lab tests; hosted project
demo-only. The custom alternate stack (own API / auth / realtime) is **one consolidated lab at the
end** (Lab 9), not built per lab. Labs 7–8 (AWS) keep their old text but are **undecided** — revisit
before he starts either. Details in `BIG_PICKLE_PHASES.md` → *Stack decisions*. This supersedes the
older "throwaway bare Postgres, no hosted Supabase" line; bare Postgres now appears only in Lab 9.
**Expected divergence:** the MUSE track's `docs/PHASE_LABS.md` still describes the owned-API stack.
Report it, do not edit it.

---

## Repo state

- `HEAD` = `7f1909f`; check `git status --short` and `git log --oneline -5` before starting — the
  other track may have moved the tree since this was written.
- The tree carries **Raj's own** pre-existing edits to `src/App.tsx` and
  `src/components/Layout/Layout.tsx`. **Leave them alone.**
- Untracked: `ROADMAP.md`, `docs/`, `src/pages/Docs/`, this track's `AGENTS.md`,
  `BIG_PICKLE_HANDOVER.md`, `BIG_PICKLE_PHASES.md`, plus the other track's `CLAUDE.md`,
  `MUSE_PHASES.md`, `big-pickle/`. Do not touch the other track's files.
- **Nothing is half-implemented.** No `scripts/`, no `docs/LAB-NOTES.md` — Lab 0 has produced
  nothing yet; Raj has not started it.

---

## Baseline defects — these are his labs, not our fix list

- **The build is red.** `src/pages/AuctionRoom/AuctionRoom.tsx:10` reads a `lastSoldId` that does not
  exist on `AuctionState`, `src/pages/Dashboard/Dashboard.tsx:16` computes an unused `mostActive`,
  and `vite.config.ts:3,9` uses `path` / `__dirname` with no `@types/node`. **Lab 0** asks him to
  make the build green. Do not fix it for him.
- **Lab 1's defects are in `src/store/auctionStore.ts` and `supabase/schema.sql`.** Do not enumerate
  them — Lab 1 asks him to find them, and a stretch item depends on it. The most you may ever say in
  one sentence: *a sale in the current app is not atomic.* The mechanism is his to discover.

---

## Environment facts already paid for

- **The agent sandbox cannot reach the Docker daemon** ("operation not permitted") — Raj runs every
  Supabase CLI / Docker experiment himself, in his own terminal. Do not attempt it for him; if it
  fails for him, first check Docker Desktop is actually running.
- **Postgres 18 is installed locally** (`/opt/homebrew/bin/{initdb,pg_ctl,psql,createdb,pg_isready}`,
  plus Postgres.app) — the fastest path for bare-Postgres needs, notably Lab 9.
- Leftover: `/tmp/ca-pg-test` is a *stopped* Postgres cluster from an earlier session. The sandbox
  cannot `rm` outside the workspace, so it is Raj's to delete.
- `npm run lint` cannot run — the repo has no ESLint config. Never offer it as a verification step.

---

## Verification notes

- Nothing is done without a command that reproduces its number.
- **`git diff --check` does not see untracked files**, and `docs/` is untracked — a docs change
  verified that way looks clean while proving nothing. Assert on content instead.
- There is **no test runner** in the repo yet (he creates one in Lab 0/Lab 1), and `npm test` does
  not exist. Never imply a suite exists; `npm run build` is red, so it cannot be a green signal.

---

## Next step

**Lab 0 — "Bring up Supabase and see what is inside"** (rewritten this session for the
Supabase-first stack; see `BIG_PICKLE_PHASES.md`). Raj has produced **nothing** yet: no `scripts/`,
no `docs/LAB-NOTES.md`, no explain-back.

Session shape: one-pass brief → one experiment he runs (Supabase CLI, in his own terminal) → three
sentences of explain-back → then Lab 0's identity-presentation design question, which he writes up
before writing code.

**First thing to ask a cold:** *"Have you run `supabase start` yet — and if so, what happened when
you tried to apply `supabase/schema.sql`?"* If he says no, brief Lab 0 from the phases file and
start with the CLI experiment.

---

## Landmine — do not trip this

An earlier session built **Lab 1's implementation** for him (migrations, transactional write
functions, a SQL assertion suite, client rewiring). **He rejected it** — he wants to write it
himself — and it was fully reverted: `git checkout` on `src/store/auctionStore.ts`, with
`supabase/migrations/`, `tests/`, `src/lib/bidErrors.ts` and `docs/CONCURRENCY.md` deleted.

**Do not resurrect it, and do not describe it.** No pre-written migrations, SQL functions or query
plans for any lab. If a previous session left lesson code behind, delete it and say so once.

---

## Session protocol

**Startup, in this order:**
1. Read `AGENTS.md` → this file → `BIG_PICKLE_PHASES.md` (current lab only; do not read ahead for
   Raj).
2. `git status --short` and `git log --oneline -5`. Confirm Raj's `App.tsx` / `Layout.tsx` edits are
   intact; if the tree is dirty in ways you did not create, **stop and ask**.
3. Confirm which lab he is on and what he produced since last time.
4. State the plan in one short message before writing anything.

**Shutdown — rewrite this file (it is state, not a log):** keep it under ~140 lines, rewriting
sections in place rather than appending; date-stamp every edit (even a no-change bump); record `HEAD`
and dirty files so the next session can `git diff`. `Next step` must let a cold session resume with
**one question** — name the lab, what Raj produced, and the literal first thing to ask. Never leak
solutions or hints into the lab sections; a future session reads this first, and leaks are spoilers.

**Session log** (optional, this track): `big-pickle/sessions/TEMPLATE.md`.

---

## Settled — don't relitigate

- Target role: **Full Stack with cloud/infra depth (AWS)**. ECS Fargate + Terraform get real depth;
  EKS stays recognition-level. Pace ≈20 h/week × 10 weeks.
- **Supabase is the backend and the object of study** (Raj's decision, 2026-10-15): hybrid runtime,
  consolidated fallback lab (Lab 9), AWS labs pending review. Don't reopen without him raising it.
- The mentorship guide is the shared contract and is **not** forked per track.
- The Big Pickle and MUSE tracks stay separate documents over one shared curriculum.
