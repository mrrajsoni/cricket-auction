# BIG_PICKLE_PHASES — Complete Lab Track (Labs 0–9)

> Single-file, self-contained lab track for **Big Pickle** sessions.
> Covers the same curriculum as `MUSE_PHASES.md`; the two tracks are **separate** — do not merge them.
> Session state and protocol: `BIG_PICKLE_HANDOVER.md` (repo root). Entry point: `AGENTS.md`.
> **This file contains no solutions and no lesson code.** See *Operating rules*.
> **Updated 2026-10-15** — Supabase-first stack, see *Stack decisions*.

**Context.** Raj (~8.8 YOE, mostly frontend React/TS) uses `cricket-auction`
(Vite + React 19 + Zustand SPA over Supabase, no own server) as the vehicle to become a
full stack + cloud/infra engineer. Pace ≈20 h/week × 10 weeks. One merged PR + one `docs/`
artifact + one number per phase. Testing gates every phase.

**Stack direction (decided 2026-10-15).** Supabase is the backend and the object of study:
local Supabase (CLI + Docker) for every lab and prove-it step, hosted project for the final demo
only. A consolidated **fallback lab** (Lab 9) rebuilds the minimum custom stack — bare Postgres,
an identity layer, an API process, your own fan-out — as the answer to "Supabase is unavailable."
AWS direction for Labs 7–8: **undecided**, revisit before starting either.

---

## Stack decisions (2026-10-15) — binding until Raj revisits

1. **Hybrid runtime.** Local Supabase for tests (fast, offline, un-throttled); hosted project is
   demo-only, never a test target. This supersedes the earlier "throwaway bare Postgres" line —
   bare Postgres now appears only inside Lab 9.
2. **One consolidated fallback lab, not per-lab parallel builds.** Labs 0–8 use Supabase
   mechanisms; Lab 9 rebuilds what was leaned on, in one pass.
3. **Labs 7–8 (AWS) stay textually unchanged and undecided** until reached; their content may be
   rewritten or displaced by Lab 9.

---

## Operating rules

**The five clauses** (full text in `docs/MENTORSHIP_GUIDE.md` — shared contract with Raj, applies to
both tracks):

1. **Facts → answer directly. Decisions → he proposes first.** Do not quiz him on vocabulary he has
   never met.
2. **Two exchanges per concept.** A fourth exchange means the teaching failed, not him.
3. **Explain-back is ≤3 sentences, in chat.** The learnings file is per *lab*, not per concept.
4. **Hint ladder, by number.** He says "hint 2". L1 = name the concept. L2 = the exact doc + section.
   L3 = the shape of a solution in words. **L3 only when he asks.**
5. **Code policy: scaffolding yes, lesson code never.** Test runners, configs and scripts on request.
   Domain logic, SQL, and anything a lab exists to teach: **never** — unless he says "give me the
   code", in which case give it *and* the why.

**This file's own spoiler rule.** If it is not written in the sections below, it is not yours to
supply. No migrations, no function bodies, no table DDL, no query plans, no answer key, no
pre-written resume bullets. **Naming a concept is allowed; writing its implementation is not.**

**Landmine — read before Lab 1.** An earlier session built Lab 1's implementation for Raj
(migrations, transactional write functions, an assertion suite, client rewiring). He rejected it — he
wants to write it himself — and it was fully reverted. **Do not resurrect it, and do not describe
it.** One sentence naming the subject is the maximum.

---

## Progress tracker

| Lab | Weeks | Focus | Done when | Status |
| --- | --- | --- | --- | --- |
| 0 | pre | See inside Supabase | one command up, one command down | ⬜ |
| 1 | 1–2 | Atomic, race-safe sales | the invariant holds under concurrent attempts | ⬜ |
| 2 | 3–4 | The API Supabase gives you | no unvalidated path to a table | ⬜ |
| 3 | 5 | Authorization in the database | every denial path is tested | ⬜ |
| 4 | 6 | Server-authoritative realtime | reconnect loses nothing | ⬜ |
| 5 | 7 | Performance & caching | measured before/after | ⬜ |
| 6 | 8 | Observability | an SLO with an alert | ⬜ |
| 7 | 9 | Deploy on AWS *(content pending review)* | `terraform apply` from empty | ⬜ |
| 8 | 10 | Load, scale, harden *(content pending review)* | a published breaking point | ⬜ |
| 9 | placement TBD | The fallback stack | the app runs with Supabase swapped out | ⬜ |

Update the Status column in the same PR that finishes a lab.

---

## Lab 0 — Bring up Supabase and see what is inside

**Goal.** One command brings the full local stack up; one command tears it down. Side effect: you
know which processes `supabase start` launched, what each is for, and where `auth.uid()` gets its
answer from.

**Runtime.** Local Supabase via the Supabase CLI (needs Docker Desktop running **in your own
terminal** — the agent sandbox cannot reach the Docker daemon, so you run these experiments, not it).

**Learn first.** What `supabase init` writes; what `supabase start` launches and what each service
is for; migrations vs a single schema file; roles and table ownership; what a transaction is; what a
JWT carries and how a request's identity becomes visible to Postgres.

**Do.**
- Initialize the project in the repo and get `supabase/schema.sql` applying through the migration
  flow, so a reset reproduces it from nothing.
- Write `scripts/db-up.sh` (start stack + apply schema), `scripts/db-down.sh`, plus a `--reset`
  that drops and rebuilds from nothing. You will run `--reset` hundreds of times; make it fast and
  boring.
- **The real design question.** Local Supabase gives you the auth service for real — but a test
  still has to *present an identity*: something must obtain the token, and something must make
  Postgres see those claims when your SQL runs. Decide how a test does that. The decision you make
  here is spent in Lab 3 and again in Lab 9; write down what you chose and why, in
  `docs/LAB-NOTES.md`, **before** writing the code.
- **Fix the red build while you are here.** `npm run build` fails today for three reasons unrelated
  to auctions: `src/pages/AuctionRoom/AuctionRoom.tsx:10` reads a `lastSoldId` that does not exist
  on `AuctionState`, `src/pages/Dashboard/Dashboard.tsx:16` computes a `mostActive` it never uses,
  and `vite.config.ts:3,9` uses `path` / `__dirname` with no `@types/node` installed. Decide what
  `AuctionRoom` should actually do — do not delete the line to silence it.

**Prove it.** From empty: command 1 → schema applies → command 2 → nothing running and nothing left
behind. Insert the same auction id twice and explain the second result. `npm run build` exits 0.

**Traps.** Testing against the hosted project (you get throttled and you dirty your demo data);
concluding "the policy works" while connected as the table owner or service role — both outrank RLS
and it will bite you in Lab 3; leaving the stack running for days; a reset that is not actually
from nothing; forgetting `-v ON_ERROR_STOP=1` in your own `psql` calls.

**Keep.** `scripts/*.sh`, the Supabase project config, and `docs/LAB-NOTES.md` recording the
identity approach and why.

**Interview Q.** "How do you test row-level security without a cloud environment?"

---

## Lab 1 — Make a sale atomic (weeks 1–2) ⭐

Highest leverage lab. This is the one that changes how interviewers see you.

In this stack the browser reaches Postgres directly, with no server of your own in between — so
*where the transaction boundary lives* is a first-class decision, not a default.

**Defect — find it before you touch code, and write your answers in `docs/CONCURRENCY.md`:**
1. On confirm-sale, how many requests leave the browser, and is any single one of them "the sale"?
2. Where does the value written to a captain's purse come from — the database, or this browser?
3. If the second request fails and the third never runs, what state is the database in, and what
   undoes it?

You are looking for the mechanism, not the symptom.

**Properties to establish, in this order:**
- **P1 Atomicity.** A sale fully happens or does not happen. No intermediate state is observable,
  including when the client disappears mid-operation.
- **P2 Conservation.** A purse cannot be invented or destroyed. State the invariant as an equation
  before implementing anything, and make it something you can *query*.
- **P3 Exclusivity.** Two attempts on the same player at the same instant produce exactly one sale,
  and the loser is told why in a way the UI can act on. Define the error contract — which failure is
  a conflict, which is a validation error, which is "not yours" — before writing code.

**Learn first.** ACID; isolation levels and what each one does *not* protect you from; row locking
(and why lock order matters); `CHECK` constraints and unique indexes, including partial ones;
PL/pgSQL functions and where they run; validating inside a transaction vs before one.

**Do, in order.**
1. Write the invariant (P2) and the error contract into `docs/CONCURRENCY.md` **first**. Deciding
   this after writing code means the code decides it for you.
2. Make the invalid *states* unrepresentable in the storage layer, so a future bug in any language
   cannot produce them. Ask what your existing data already violates — and what the migration does
   about it.
3. Make the *transition* atomic: decide where authority for a sale lives, justify it in one
   paragraph, and implement that. If any logic stays in the browser, be explicit about what it is for
   and what happens when it is wrong.
4. Make the client obey the result instead of predicting it.

**Prove it** (harness of your choosing, e.g. `tests/sql/`):
- 20+ simultaneous sales against a purse that can afford 2 → exactly 2 succeed, invariant exact.
- 20+ simultaneous sales of the **same player** → exactly 1 succeeds.
- Every rejected attempt leaves **zero** trace: no orphaned row, no half-debited purse.
- Each invariant, attacked directly with raw SQL, is refused.
- The *same* scenario against your old code path **fails** — capture that before deleting the old
  code. Do not reconstruct it afterwards.

**Keep.** `supabase/migrations/` (yours), `tests/`, and `docs/CONCURRENCY.md` containing the failing
trace, the fix, and a before/after table with the command printed above each number.

**Traps.** Writing an absolute value into a column another session also writes; taking locks in
different orders in different functions; adding a constraint to a table whose existing rows already
violate it; building an index on a live table without thinking about the lock; assuming a failed
statement rolls back work you already committed; "testing" concurrency with sequential statements in
one session — know why that proves nothing.

**Stretch (same lab, same file).** Two more write paths repeat the same pattern. Find them yourself,
and say which is more dangerous and why.

**Interview Q.** Answer with your own numbers, not a description.

---

## Lab 2 — Know the API Supabase gives you (weeks 3–4)

**Goal.** No unvalidated path to a table, and no magic: you can name every way a client can reach
your data, what contract each path publishes, and where validation must live when there is no
server of your own.

**Learn first.** The auto-generated REST surface and how it maps tables and queries to endpoints;
RPC operations vs table operations; the OpenAPI document Supabase publishes; HTTP status semantics —
which code means what, and why; validation *at the boundary*, and where the boundary is in this
stack; cursor vs offset pagination; idempotency; what a rate limit actually protects.

**Do.** Inventory every read and write path the browser currently uses. For each, decide: allowed
shape or not, and where that gets enforced. Move validation to the strongest boundary available to
you. Decide and document: the resource shapes, which operations can be retried safely and how the
caller signals that, and what a paginated read looks like. Publish a machine-readable contract —
you may start from Supabase's generated one, then say explicitly what you added and why.

**Prove it.** Close the browser mid-operation and show the outcome is unchanged. Submit the same
operation twice and show one effect. Break the contract file on purpose and show a test fails.

**Keep.** The contract file and `docs/API.md` including the error vocabulary.

**Numbers.** p95 for the busiest read endpoint; payload bytes before/after pagination.

**Traps.** Validating in two places and trusting the wrong one; making every error a 400; offset
pagination on a table being written while you page it; treating "it worked in Postman" as proof;
assuming the generated API is safe because it is generated.

**Interview Q.** "Design the endpoint that sells a player. What can go wrong, and what does the
caller get back?"

---

## Lab 3 — Authorization in the database (week 5)

**Goal.** The boundary is policy enforced by Postgres, not the UI. Deny by default, and prove it —
including the cases where the caller is *you*.

**Learn first.** JWT structure and what it does / does not prove; how Supabase forwards a token's
claims to Postgres and what `auth.uid()` actually reads; the built-in roles and what each one may
do; in what order policies are evaluated; RBAC vs per-resource checks; OWASP A01; how RLS behaves
for the owner of a table versus a restricted role.

**Do.** Write the authorization rule down as a matrix before implementing it. Revisit every write
path you catalogued in Lab 2 and ask, for each, *who* may call it — including the cases where the
answer is "not even the admin". Replace the permissive read policy with something scoped, and make
sure your Lab 0 identity harness can still test it. **This is where the Lab 0 identity decision gets
spent.**

**Prove it.** A test per cell of that matrix, especially the denials. Prove a second tenant's data
is unreachable. Prove an anonymous caller cannot reach a write.

**Keep.** `docs/AUTHZ.md` (the matrix, every cell asserted) and the denial tests.

**Traps.** Checking a role but not the resource (the classic); letting the client tell you its
identity or its captain id; shipping a privileged key to the browser; forgetting that a privileged
function may bypass the policies you were relying on; testing authorization only from the happy
path; testing only as a superuser.

**Interview Q.** "How do you stop a captain bidding for another team?"

---

## Lab 4 — Server-authoritative realtime (week 6)

**Goal.** The client stops being the source of truth for a live auction — and you can explain every
hop between the writer and a spectator's screen.

**Learn first.** Supabase Realtime's topology — channels, what process receives a change, how it
reaches a subscriber; how authorization applies to realtime; broadcast vs presence vs database
changes; polling vs SSE vs WebSockets and when each is right; fan-out; connection lifecycle;
backpressure; snapshot-then-events; replay from a cursor; reconnect with backoff.

**Do.** Persist the live session so it survives the admin's process dying. Decide who may publish
state — hint: not the browser. Design the reconnect path **before** the happy path: what does a
client send to say "I last saw event N"? Trace where fan-out actually happens in your setup and
what happens to a subscriber that falls behind.

**Prove it.** Kill the writer mid-auction, reopen, and show the state is correct with zero missed
updates. Show an unauthorised client cannot publish. Show a slow client does not stall the others.

**Keep.** The architecture diagram of what you are actually running (browser ↔ Supabase services ↔
Postgres), `docs/REALTIME.md`, and a recording of the kill-and-recover.

**Numbers.** Fan-out p95 with ~1k simulated spectators; missed updates after a forced reconnect
(target: zero).

**Traps.** Trusting a client-supplied payload; unbounded per-connection buffers; no heartbeat, so
dead sockets linger; testing with one browser tab and calling it multi-client.

**Interview Q.** "How do ten thousand spectators see the same bid within a millisecond of each
other?"

---

## Lab 5 — Performance & caching (week 7)

**Goal.** Measured speed, not vibes. This is where your frontend strength compounds.

**Learn first.** Reading a query plan; what an index does and does not fix; N+1 (including the kind
a client library hides from you); cache-aside vs write-through; invalidation and expiry; HTTP
caching; Core Web Vitals.

**Do.** Before changing anything, capture the current numbers for the three worst paths. Then work
in the order the evidence dictates: the plan, then the query, then the access pattern, then the
cache, and only then the frontend bundle. Every change gets its own before/after.

**Prove it.** `EXPLAIN` output before and after, on a dataset large enough to matter — you will need
to generate it, so build that generator as part of this lab. Frontend numbers from a real audit.

**Keep.** `docs/PERFORMANCE.md` with commands and numbers.

**Traps.** Optimising before measuring; an index on a column the planner will not use; caching
something that must be correct; invalidating a cache by guessing; reporting a win from a warm cache
against a cold-cache baseline.

**Interview Q.** "Take this page from 3 s to under 1 s — walk me through it."

---

## Lab 6 — Observability (week 8)

**Goal.** You know it is broken before a user tells you.

**Learn first.** Metrics, logs and traces, and which question each answers; structured logging;
request correlation; RED / USE; SLOs and error budgets; alerting on symptoms rather than causes.

**Do.** Give every request an id and carry it through to the database call and the realtime publish.
Emit the three or four signals that describe your auction: rate, errors, latency, fan-out lag. Know
what Supabase's own dashboards and logs do and do not tell you — fill the gaps yourself. Draw the
dashboard you would want at 3 a.m. Define three SLOs and alert on them.

**Prove it.** Inject a failure and show the alert firing, with the correlation id leading you to the
cause. Time yourself from "alert" to "root cause" and write the number down.

**Keep.** `docs/SLO.md` and screenshots of the dashboard.

**Traps.** Logging without correlation ids; alerting on CPU instead of user-visible symptoms; a
dashboard nobody would open; cardinality that makes the metrics store expensive; assuming the
platform's dashboard is yours.

**Interview Q.** This is the one your resume already gestures at (Grafana, incident response) — now
it will be yours end to end.

---

## Lab 7 — Deploy it on AWS *(content pending review — decided 2026-10-15, revisit before starting)*

**Goal.** The `Docker & Kubernetes (basic)` line becomes real, and a cloud provider finally appears
on your resume.

**Learn first.** Container images and multi-stage builds; registries; a managed container runtime and
how it differs from a VM; managed database and cache services; secrets management; infrastructure as
code — state, plans, and why you review a plan before applying it.

**Do (in order).**
0. `docker compose up` brings up web + api + Postgres + Redis locally, multi-stage and non-root, with
   healthchecks. The same image must run on your laptop and in the cloud.
1. One managed container service behind a load balancer.
2. A managed Postgres and a managed cache, in private subnets.
3. Secrets from a secrets manager; task roles instead of static keys.
4. Static frontend behind a CDN; the load balancer serves the API only.
5. Describe every environment in code (dev / staging / prod), never by hand.
6. Autoscaling and alarms.
**Set a budget/billing alarm before step 1** — you are about to spend real money, and the expensive
parts are the database and the cache, not the containers.

**Prove it.** `terraform apply` from an empty account produces a working environment and
`terraform destroy` empties it — both from CI. The same image runs on your laptop and there. The demo
URL in your README is served from that environment and deployed by CI, not by hand.

**Keep.** `terraform/` and `docs/INFRA.md`, including the monthly cost per environment.

**Traps.** Building infrastructure by clicking and describing it later; long-lived credentials;
running a load test with the alarm unset; a "staging" that differs from production in ways you did
not choose; skipping the container layer, so application and infrastructure problems are
indistinguishable.

**Interview Q.** "How would you deploy this, and what happens when a task dies mid-auction?"

---

## Lab 8 — Load, scale, harden *(content pending review — decided 2026-10-15, revisit before starting)*

**Goal.** A breaking point you found yourself, and a fix you verified.

**Learn first.** Load testing and what a cold/warm run hides; partitioning; read replicas;
idempotency and retries; multi-tenancy isolation; blue/green deploys.

**Do.** Write scenarios that mirror your real traffic shape — many readers, few bidders, one writer —
with the pass/fail thresholds declared **in the script**. Run them until something breaks. Fix that
one thing, re-run, and keep both results. Add an end-to-end test of the full flow, including a
two-browser outbid race.

**Prove it.** `docs/SCALE.md` with the graphs, **including the failure**. A published number requires
a threshold in code, not a screenshot of a good run.

**Keep.** The k6 scenarios, `docs/SCALE.md`, the E2E test, and a README numbers table
(`Metric | Before | After | How measured`).

**Traps.** Load-testing the thing that is not the bottleneck; reporting the best run; scaling out a
system that is still incorrect — infrastructure multiplies whatever you have; no teardown, and a
surprise invoice.

**Interview Q.** "What breaks first at 100× scale, and how do you know?"

---

## Lab 9 — The fallback: what you build when Supabase is unavailable (placement TBD)

Added 2026-10-15. Replaces the earlier idea of a custom stack built in parallel with every lab.

**Goal.** One consolidated pass: replace every Supabase mechanism you leaned on with the minimum
you could build and fully explain — the identity layer, the API surface, the authorization
enforcement, the realtime fan-out — so vendor downtime (or a vendor) is a decision, not a crisis.

**Context.** Labs 0–8 use Supabase. This lab answers: what runs instead, on bare Postgres and a
process you own? Placement is undecided — if Labs 7–8 are cut or reshaped, this lab takes their
weeks; it is not scheduled until Raj schedules it.

**Learn first.** Mapping a managed service onto its plain components; a minimal server-side identity
flow; why the Lab 3 policy work transfers; choosing a fan-out mechanism when you own every hop.

**Do.** Take the Lab 0 identity decision and rebuild it without the managed auth service. Expose the
write paths from Labs 1–2 behind a process you own. Re-enforce Lab 3's matrix there. Rebuild the
Lab 4 fan-out. Write `docs/FALLBACK.md`: what maps to what, what you lost, what you gained, and the
one-sentence reason a team might choose either side.

**Prove it.** The same test suite passes against both backends. The UI works unchanged against your
stack — stop the local Supabase, switch the connection, and a full auction still runs.

**Keep.** The fallback code and `docs/FALLBACK.md`.

**Traps.** Rebuilding every Supabase feature instead of the minimum your app uses; an auth flow
weaker than the one you replaced; calling it done without the shared suite; a fallback nobody has
ever run end to end.

**Interview Q.** "Your backend vendor is down — what is your exit plan?"

---

## Verification bar

A lab is **not** finished when the code works. It is finished when you have tried to break your own
fix and failed, and you have the output to show it. That attempt is the deliverable.

- Nothing is done without a command that reproduces its number. A claim without its command is a
  rumour.
- Current repo reality: `npm run lint` cannot run (no ESLint config exists) — never offer it as a
  verification step. There is no test runner until Lab 0/Lab 1 creates one — never imply a suite
  exists. `npm run build` is red until Lab 0 fixes it.
- A docs change cannot be verified with `git diff --check` — `docs/` is untracked, so that reports
  clean while proving nothing. Assert on content instead.

## Review gate — before asking for review

1. Does the diff contain **only** what this lab is about?
2. Can the measurement be re-run with one command from the README or the doc?
3. Have you tried to break your own fix, and does the doc say what you tried?
4. Is there anything in the diff you could not explain line by line? Delete it or understand it.
5. Have you written the "why this and not the alternative" sentence for the main decision?

## Weekly shape (~20 h)

~4 h read the concept (no code) · ~12 h build on a branch · ~4 h write the artifact plus five
interview Q&As in your own words. **Merge a PR + a doc + a number every week.**

If a week overruns, borrow from Lab 8 (extra k6 scenarios, partitioning) — **never** from Labs 1–6.
Lab 9 is unscheduled buffer: it absorbs reshaped Labs 7–8 rather than eating Labs 1–6.

## Session protocol

Startup order, the shutdown handover template, and the current state all live in
`BIG_PICKLE_HANDOVER.md` (repo root). Read it before this file. Keep it to state, not rules.
