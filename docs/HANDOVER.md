# Handover — session state

**Written 2026-10-15.** This is state, not rules. If it and `docs/MENTORSHIP_GUIDE.md` disagree, the
guide wins. Read it after the guide and before touching anything.

## What this repo is for

Raj (≈8.8 YOE, mostly frontend — React/TypeScript) is using this app, `cricket-auction` (Vite + React 19
+ Zustand SPA over Supabase), as the vehicle to become a full-stack engineer. He learns by writing the
code himself:

- `docs/MENTORSHIP_GUIDE.md` — how we talk (rules; auto-loaded via `CLAUDE.md`)
- `docs/PHASE_LABS.md` — the curriculum, Labs 0–8
- `docs/CAREER_ROADMAP.md` — the strategy behind the labs (§9 is an answer key — read late)

## The contract, in five lines

1. **Facts** → answer directly, no quiz. **Decisions** → he proposes first.
2. **Two exchanges per concept.** A fourth exchange means the teaching failed, not him.
3. **Explain-back ≤3 sentences**, in chat. The learnings file is per lab, not per concept.
4. **Hint ladder by number** — he says "hint 2". L1 concept name, L2 exact doc + section,
   L3 shape of a solution. L3 only when he asks for it.
5. **Code:** scaffolding (test runners, configs, scripts) on request; lesson code never. Skeleton =
   names + TODOs, no logic.

## Repo state

- `HEAD` = `7f1909f`. The tree also carries Raj's **own** pre-existing edits to `src/App.tsx` and
  `src/components/Layout/Layout.tsx` — leave them alone.
- Untracked: `ROADMAP.md`, `docs/`, `src/pages/Docs/`.
- **Nothing is half-implemented.** An earlier session built Lab 1 for him (migrations with constraints
  and indexes, transactional write functions, SQL assertion suites, client rewiring). He rejected it —
  he wants to write it himself — and it was fully reverted: `git checkout` on
  `src/store/auctionStore.ts`, and `supabase/migrations/`, `tests/`, `src/lib/bidErrors.ts` and
  `docs/CONCURRENCY.md` deleted. **Do not resurrect it, and do not describe it.** Verified afterwards:
  the file is byte-identical to `HEAD` and no trace of the implementation remains in `src/`,
  `supabase/` or `docs/`.
- `docs/` holds exactly three files by design — he chose strategy + labs + rules over splitting the guide
  into two files or replacing it.

## Baseline defects — these are his labs, not our fix list

- **The build is red.** Re-verified 2026-10-15 with `npx tsc -p tsconfig.app.json --noEmit` → 3
  diagnostics: `src/pages/AuctionRoom/AuctionRoom.tsx:10` reads a `lastSoldId` that does not exist on
  `AuctionState` (reported twice), and `src/pages/Dashboard/Dashboard.tsx:16` declares an unused
  `mostActive`. Plus 2 in the node project from the full `npm run build`: `vite.config.ts:3` (`path`
  module) and `:9` (`__dirname`) with no `@types/node`. Lab 0 asks him to make the build green.
- The defects Lab 1 targets are in `src/store/auctionStore.ts` and `supabase/schema.sql`. **Do not
  enumerate them** — Lab 1 asks him to find them, and one of its stretch items depends on him finding
  them unaided.
- `supabase/schema.sql` contains no `CREATE INDEX` at all, and its read policies are permissive. Lab
  material; not yours to fix.
- A sale in the current app is not atomic (the client-side path). This is Lab 1's subject. That sentence
  is the most you should say; the mechanism is his to discover.

## Environment facts already paid for

- **Docker Desktop is installed, but an agent sandbox was denied its daemon socket** ("operation not
  permitted"). Don't send him down that path blind — offer the local cluster instead.
- **Postgres 18 is installed locally**: `/opt/homebrew/bin/{initdb,pg_ctl,psql,createdb,pg_isready}`, and
  Postgres.app exists. A throwaway cluster works and starts in seconds.
- **`supabase/schema.sql` will not apply to bare Postgres**: it references `auth.users` and calls
  `auth.uid()` in its policies. Building that missing layer — plus a way for a test to present an
  identity — is Lab 0's real design question. **Hint; do not hand it over.**
- Leftover worth mentioning once: `/tmp/ca-pg-test` is a *stopped* Postgres cluster from that earlier
  session. The sandbox cannot `rm` outside the workspace, so it is Raj's to delete.
- `npm run lint` cannot run (the repo has no ESLint config). Never offer it as a verification step.

## Verification notes for this repo

- Nothing is done without a command that reproduces its number (`docs/CAREER_ROADMAP.md` §7).
- **`git diff --check` does not see untracked files** and `docs/` is untracked — a docs change verified
  that way looks clean while proving nothing. Use a content assertion instead.
- There is no test runner in the repo yet. He creates one in Lab 0/Lab 1; until then, never imply a suite
  exists.
- `npm test` does not exist. `npm run build` is red (see above), so it cannot serve as a green signal yet.

## Next step

**Lab 0** — a database he can drop and rebuild, and the identity layer that makes RLS-dependent code
testable locally. Session shape: one-pass brief → one experiment he runs → three sentences of
explain-back → then Lab 0's design question, which he writes up before writing code.

If he opens cold, ask where he got to (has he run Lab 0's experiment? written the explain-back?) rather
than restating the plan.

## Settled — don't relitigate

- Target role: **Full Stack with cloud/infra depth (AWS)**; ECS Fargate + Terraform get real depth, EKS
  stays recognition-level. Pace ≈20 h/week × 10 weeks.
- The guide was amended **in place** with the five clauses, rather than split into two files or replaced
  by a minimal contract. It now loads automatically through `CLAUDE.md`.
