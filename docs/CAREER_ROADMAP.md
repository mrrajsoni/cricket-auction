# Career Roadmap — Cricket Auction → Full Stack + Cloud/Infra

Derived from **the extracted text of `Raj_Soni_8YOE_Resume.pdf`** (not a summary of it) and from the
**current state of this repository** — every claim below is anchored to a file and a line.

`ROADMAP.md` in the repo root is the earlier, longer version: 20 weeks at 10–15 h/week,
frontend-weighted, Kubernetes explicitly ruled out. This document supersedes it. §10 lists the
deltas so nothing in it is silently lost.

**The hands-on track lives in `docs/PHASE_LABS.md`.** One lab per phase: the defect to fix, the
property to establish, how to prove it, what to keep, and the traps. This document says *why*; that
one says *do*.

**Scope decisions that shape everything below**

| Decision | Value | Consequence |
| --- | --- | --- |
| Target role | Full Stack Developer **with cloud/infra depth** | Cloud is a first-class track, not a footnote |
| Time budget | ~20 h/week × 10 weeks ≈ **200 h** | One merge + one doc + one number per week |
| Cloud depth | **ECS Fargate + Terraform get real depth; EKS stays recognition-level** | Avoids reproducing the `(basic)` claim that is already the top probe risk |
| Verification | Tests run against a **throwaway local Postgres** (Docker, or a local cluster), never the hosted Supabase project | No credentials or shared-state risk — and you can drop and recreate it at will |

---

## 1. Resume read

### 1.1 What is already strong — do not spend the 200 hours here

| Area | Verbatim evidence from the resume | Why it survives an interview |
| --- | --- | --- |
| Measured frontend performance | "deferred non-blocking API calls, deduped requests, and virtualized data tables rendering hundreds of records across 150+ columns … cutting initial load time by 3 seconds" | Mechanism + constraint + measured outcome in one bullet. Your strongest technical line. |
| Vendor replacement with a business outcome | "rule-engine UI from scratch, replacing expensive third-party fraud-detection vendors (Accertify, Forter) … eliminating $25,000 in monthly licensing costs" | Frame as *system design under compliance constraints*, never as "I built a UI". |
| Component architecture adopted org-wide | "prop-configurable data-table component adopted as the primary data surface across the application" | Evidence of influence beyond your own tickets. |
| Design-system migration at scale | "UI migration from Material-UI to Mantine UI … using Atlassian design tokens" | Shows you can land a cross-cutting change. |
| AI leverage with a number | "cutting boilerplate/layout coding time from roughly 8 hours to 2–3 hours per feature while raising unit-test coverage from 10% to around 60%" | Modern, quantified, defensible. |
| Ops adjacency (real but shallow) | "Worked with Jenkins pipelines for automated builds and deployments; used Grafana to monitor API error logs and troubleshoot production issues" | A foundation to build real observability on — you already have the vocabulary. |
| One genuine backend/realtime project | Realtime Metrics Dashboard: Next.js 16 App Router + RSC, WebSocket gateway with Redis Pub/Sub fan-out, two-token JWT with httpOnly refresh + token-reuse detection, 10-second Redis tickets for WS upgrades, Docker + Compose, reconnect with backoff | Proves you can *do* this. The gap is that there is exactly one of it. |

Tenure arithmetic: Dec 2017 → present is ≈8.8 years, so "8 YOE" is if anything conservative.

### 1.2 What is a claim to be tested, not a credential

| Claim on the resume | Backing | What the interviewer will do with it |
| --- | --- | --- |
| "WebSockets, Redis Pub/Sub, PostgreSQL, JWT auth (access/refresh rotation), Node.js" | One project, and it is a *personal* project | "Walk me through the Redis ticket flow." "Your gateway has 3 replicas — a client reconnects to a different one mid-stream. What happens?" |
| "Docker & Kubernetes (basic)" | Docker is backed (the dashboard is containerised with Compose). **Kubernetes has zero backing anywhere on the resume.** | The `(basic)` hedge invites exactly the probe you cannot answer. **Fix this line first** — either it becomes real (§5) or it goes. |
| "REST/GraphQL" | Skills list only, no project | "Which GraphQL server have you shipped?" — remove until §4 week 3/4 gives you REST to point at. |
| "Next.js: App Router, React Server Components, Route Handlers, Edge Runtime, SSR/CSR trade-offs" | The dashboard only | Edge runtime and RSC boundaries are favourite probing grounds; expect "what actually streams first paint here?" |
| "raising unit-test coverage from 10% to around 60%" | Real, but the tests cover "components, hooks, API calls, and user-interaction" | "How do you test your *domain* logic?" — a 60% UI-weighted number does not answer it. |
| "achieving 99.9% uptime during the prototype phase" (Tone Matters) | No baseline, no traffic, no period | Reads as padding. Delete it or restate it without the percentage. |
| Scale numbers | Only "enterprise analytics product used by thousands of users" (Lumel) | "How many concurrent users did your realtime path serve? rps? p95?" Currently unanswerable — §7 is where you manufacture these numbers. |
| Mentoring / leadership | **Nothing** in any role | A 9-year engineer with no scope signal. This is the cheapest gap to close: document the design reviews and pairing you already do (see §8). |

### 1.3 The three questions that break the "Full Stack" positioning today

1. **"Two captains confirm a bid for the same player in the same millisecond. What happens inside the database?"**
   Nothing on the resume answers it, and — see §2 — nothing in *this repo* does either: `placeBid`
   issues three unbatched statements and rolls back by hoping the browser stays alive
   (`src/store/auctionStore.ts` L251–314).
2. **"Where does your authorization actually live?"**
   The resume says "RBAC integration" — meaning frontend integration. Here the only boundary is RLS,
   and every read policy is `USING (true)` (`supabase/schema.sql`), so anyone holding the anon key
   can read every auction, player and bid.
3. **"Which AWS services have you run in production, and how would you deploy this repo today?"**
   No cloud provider appears anywhere in the resume, and this repo has no server, no container,
   no CI and no deploy. This is the question the chosen target makes unavoidable.

Those three questions are answered by **week 2, week 5 and week 9** respectively (§4) — which is the
whole justification for the ordering in §3.

### 1.4 Title note

The current role reads **Senior Software Engineer** (only Lumel was titled *Frontend Developer*), so
the title itself already supports a full-stack pitch. The evidence underneath the title does not yet —
that is what the next 10 weeks buy. Says nothing about your ability; only about what is currently
written down.

---

## 2. Why this repository is the right material

Most portfolio projects are CRUD apps: the database is a dumb store, the write path is one statement,
and nothing can ever go wrong. This one is different in a way you cannot fake — **it is a real-time,
money-critical, multi-tenant, concurrently-written system whose correctness is currently guaranteed by
nothing.**

### 2.1 Baseline (as of this document)

```
                 ┌───────────────────────────────────────────────────────────┐
                 │  Browser — Vite + React 19 + Zustand + react-router 7     │
                 │  framer-motion · recharts · react-hook-form + zod         │
                 │  ─────────────────────────────────────────────────────    │
                 │  src/store/auctionStore.ts  (688 lines, 65 files in src)  │
                 │    auctionId · captains · players · bids                  │
                 │    liveSession  ← the ENTIRE live auction state lives here│
                 └──────┬────────────────────────────────────┬───────────────┘
                        │                                    │
        anon key, and no server of your own                 │ broadcast
                        │                                    │ event: "session_update"
                        │                                    │ (any client can send this)
                        ▼                                    ▼
     ┌──────────────────────────────────────────────────────────────────────────┐
     │ Supabase                                                                 │
     │   Postgres    ── RLS with every SELECT ... USING (true) (schema.sql)      │
     │               ── 0 CREATE INDEX statements · no CHECK on the purse        │
     │   Auth        ── the profiles row is written BY THE CLIENT (authStore     │
     │                  L73, L145) — no trigger, so orphaned users are possible  │
     │   Realtime    ── postgres_changes (server→client) PLUS Broadcast, which   │
     │                  the client uses to write OTHER clients' state directly   │
     └──────────────────────────────────────────────────────────────────────────┘
```

74 tracked files. No Dockerfile, no CI, no test runner, no `docs/` directory until this commit.

### 2.2 The shape of the domain forces the right concepts

| Property of this domain | Concept it forces you to learn | Where it bites today |
| --- | --- | --- |
| Auctions are **contended writes** | ACID, isolation levels, `SELECT … FOR UPDATE`, optimistic locking | `placeBid` fires three unbatched statements (L251–278); `undoLastBid` repeats it (L347–365) |
| A purse is **money** | idempotency, `CHECK` constraints, audit trail, double-spend prevention | The purse check is client-side only (`auctionStore` L212, `OwnerBid` L62) |
| Live bidding is **fan-out** | WS gateway, Redis pub/sub, backpressure, snapshot + replay resync | `liveSession` exists only in client memory; the broadcast sender is whichever client feels like it (L563–596) |
| Many auctions = **multi-tenancy** | tenant scoping, RLS, per-tenant caching/sharding | `initialize()` loads "the newest active auction in the world" (L85–90); `createAuction` completes *every* active auction globally (L376–379) |
| Spectators are **read-heavy** | caching, CDN, CQRS read models, cursor pagination | `select *` with no bound (L128–144); a fresh query per realtime bid = N+1 (L616–644) |
| It has to be **deployable** | Docker, CI/CD, observability, load testing, SLOs | None of it exists yet |

That table is the syllabus. Every phase in §4 attacks a row of it, and every row has a file and a
line number — which is exactly what makes it credible in an interview: you are not describing a
tutorial, you are describing **a defect you found in your own system and then closed.**

---

## 3. What to attack first — the non-negotiable order

This order is not a preference. Each item is a **precondition** for the next one, and the column that
matters most is the last: what it costs you to do them out of order.

| # | Target | Why it has to be next | Proof it is needed here | Cost of skipping / reordering |
| --- | --- | --- | --- | --- |
| 1 | **Correctness** — transactions, constraints, indexes | A system that can silently oversell cannot be trusted to scale: every later phase multiplies an existing bug instead of exposing it | `placeBid` L251–278, `undoLastBid` L347–365, no `CHECK` on the purse, no `CREATE INDEX` in `schema.sql` | You deploy something confidently wrong, and the oversell becomes an incident with a cloud bill |
| 2 | **Own the API** — Node + TS + Fastify, zod at the boundary, error taxonomy, cursor pagination, OpenAPI | Correctness needs a server boundary you control; and every later phase needs a host process to hang behaviour on | All writes live in `auctionStore.ts`; the repo has no server | Auth, rate limiting, caching and tracing have nowhere to live; you would rebuild them ad hoc per feature |
| 3 | **Auth & authorization server-side** — JWT verification, RBAC + resource-level policies, refresh rotation with reuse detection, audit log, tenant-scoped RLS | The only boundary today is RLS, and every read is `USING (true)`; an anon key reads everything | `schema.sql` L75/81/87/93; `authStore` L73/L145 create profiles client-side | Every new endpoint ships unauthorised by default — the classic OWASP A01 breach at your own scale |
| 4 | **Server-authoritative realtime** — WS gateway, Redis pub/sub fan-out, snapshot + replay, reconnect | Now that a server exists and requests are authorised, the client stops being the source of truth | `liveSession` is client-memory only; `broadcastLiveState` L589–596 accepts payloads from any client | You keep a "live" system that loses the auction when the admin reloads, and you cannot scale past one tab |
| 5 | **Caching & query performance** — N+1 removal, `EXPLAIN ANALYZE`, Redis cache-aside, TanStack Query, route-level code splitting | You can only tune what is already correct and observable through one API — tuning the old client-side path is wasted work | N+1 at L616–644, unbounded `select *` at L128–144 | Doing this first optimises a path you are about to delete; you publish numbers that later change |
| 6 | **Observability** — structured logs with correlation IDs, metrics, OTel traces, Grafana, 3 SLOs + alerts, Sentry | You need real traffic through a real API to have anything worth observing; and §7's whole point is that every claim needs a number | Grafana/Jenkins appear on the resume, so you have the vocabulary but not the ownership | Your performance and scaling claims stay anecdotes; no answer to "how do you know it's broken before users tell you?" |
| 7 | **Cloud/infra** — Docker → ECR → ECS Fargate → RDS + ElastiCache → ALB/CloudFront → Secrets Manager/SSM → Terraform → (EKS last) | Infrastructure *amplifies* whatever you have. Point it at a correct, authorised, observable app and it looks like engineering; point it at an overselling app and you have scaled a bug | No Dockerfile, no CI, no deployed URL | You get the `(basic)` problem again: infra words with nothing underneath them |
| 8 | **Packaging & E2E** — Playwright happy path + outbid race, README with architecture + measured numbers, ADRs, live demo URL | This is the part an interviewer actually reads, and it can only be written once the numbers exist | 74 tracked files, no README | Invisible work. All 200 hours stay private. |

### The one deviation from `ROADMAP.md`'s ordering

`ROADMAP.md` made tests **Phase 8** — last. Here, **testing is a gate on every phase, starting now**,
and §4 only reserves packaging/E2E for the final week. The reason is concrete: the claim this whole
roadmap is built to earn is *"the bid path is race-safe"*. That claim is only worth making if a
concurrency test fails before the fix and passes after — and that test is produced in **week 1–2**,
not week 19. A testing phase at the end cannot retro-fit evidence into a claim you already made.

### The rule for the whole 10 weeks

> **Do not start a phase until the previous phase has produced all three: a merged PR, a `docs/` artifact, and a number.**

Write that on a sticky note. It is the difference between 10 weeks that produce a portfolio and 10
weeks that produce a folder of half-finished branches.

### Do not start with these, no matter how tempting

Kubernetes depth, GraphQL, Kafka, Elasticsearch, microservices, a Next.js/rewrite-for-the-resume, or
another frontend framework. Each is a *destination* shaped problem, and you already own the two
places where this app is genuinely hard (concurrent writes, and fan-out to spectators). Depth in
those two beats breadth in six — especially with 200 hours.

---

## 4. The 10-week schedule — ~20 h/week, ≈200 h

Every week has the same shape: **~4 h read the concept (no coding) · ~12 h build on a branch · ~4 h
write the artifact and five interview Q&As in your own words.** Every week ends with a merged PR, a
`docs/` artifact, and a number.

| Wk | Concept to learn | What ships (the PR) | Artifact | The number it produces |
| --- | --- | --- | --- | --- |
| **1** | ACID, isolation levels, `CHECK`/unique constraints, partial indexes | Make the invalid states unrepresentable at the storage layer, and prove your existing data already satisfies them | `docs/CONCURRENCY.md` started, containing the **failing** trace | Oversell *before* the fix: how many of 50 concurrent confirmations succeed against one purse |
| **2** | PL/pgSQL, `SELECT … FOR UPDATE`, optimistic locking, idempotency, error contracts | Make a sale one atomic transition with a defined error contract, and reduce the client to obeying the result rather than predicting it; add whatever indexes the query plans demand | `docs/CONCURRENCY.md` finished; your test harness in `tests/` | Exactly 1 sale, 0 negative purses, 0 double-sales from 50 concurrent bids — *and* the same test failing against the old code path |
| **3** | Layering (route → service → repository), zod at the boundary, REST resource design, OpenAPI, offset vs cursor pagination | `apps/api` on Fastify; auction/player/bid reads with cursor pagination; `openapi.yaml` + generated typed client | `docs/API.md` with the error taxonomy (401/403/404/409/422/429/500) | p95 of `GET /auctions/:id/state` over 1k seeded rows; payload size before vs after pagination |
| **4** | Idempotency keys, rate limiting, retries and backoff, contract testing | Every write moved off the client; `Idempotency-Key` on sale; `@fastify/rate-limit`; contract tests against the OpenAPI spec | `docs/API.md` extended with idempotency semantics | 100 duplicated sale requests → exactly 1 sale written |
| **5** | JWT structure and verification, refresh rotation + reuse detection, RBAC vs ABAC, OWASP A01, RLS as a boundary | Auth middleware deriving `{userId, role, captainId, auctionId}` from the token + a `memberships` table; resource-level policy functions; `audit_log`; tenant-scoped RLS replacing `USING (true)`; trigger creating `profiles` | `docs/AUTHZ.md` — the role × resource × action matrix | Denial paths covered: **every cell** of the matrix asserted by a test |
| **6** | WS vs SSE vs polling, gateway design, Redis pub/sub fan-out, sticky sessions, backpressure, reconnect + resync | `auction_sessions` + `session_events`; server-only broadcast; `GET /ws/auctions/:id` streaming a snapshot then events, with `lastEventId` replay; Redis pub/sub across 2 API containers; heartbeats + backoff | `docs/REALTIME.md` + the browser ↔ gateway ↔ Redis ↔ Postgres diagram | Fan-out p95 at 1k simulated spectators; **missed bids after a forced mid-auction reconnect (target: 0)** |
| **7** | Query planner, `EXPLAIN (ANALYZE, BUFFERS)`, N+1, cache-aside, TTL and thundering herd, HTTP caching, Core Web Vitals | N+1 eliminated; Redis cache-aside on the state snapshot with explicit invalidation; TanStack Query replaces the hand-rolled fetching; route-level code splitting + prefetch | `docs/PERFORMANCE.md` | `EXPLAIN ANALYZE` before/after on a 100k-bid dataset; LCP/TTI before/after from Lighthouse |
| **8** | Three pillars, structured logging, RED/USE, OpenTelemetry, Prometheus + Grafana, SLO/SLI/error budgets | Correlation-ID JSON logs; `prom-client` metrics; one OTel trace across HTTP → DB → Redis → WS; a Grafana "Auction health" dashboard; 3 SLOs with alerts; Sentry on both apps | Grafana screenshots + `docs/SLO.md` | 3 SLOs with current attainment, and mean-time-to-detection before vs after alerting |
| **9** | Containers, ECR, ECS Fargate, RDS, ElastiCache, ALB, secrets management, Terraform, environment separation | Multi-stage non-root Dockerfiles; Terraform creating VPC, RDS, ElastiCache, ALB, ECS services, ECR, Secrets Manager for dev + staging + prod; billing alarms | `docs/INFRA.md` + the `terraform/` module tree | Cost per environment per month; deployed cold-start and p95 from CloudWatch |
| **10** | k6 load testing, partitioning, tenant isolation, blue/green, E2E | k6 scenarios (10k spectators · 500 concurrent bidders on one player · 1k parallel auctions); `bids` partitioned by month; tenant-isolation integration test; Playwright happy path **plus a two-browser outbid race**; README with architecture, numbers and the demo URL | `docs/SCALE.md`, README, ADRs, 50 interview Q&As | The breaking point — *X rps / Y concurrent sockets at p95 Z ms* — then the fix and the re-run that beats it |

### Notes on how this budget was derived

- **Weeks 1–2 are the work being built alongside this document**, so week 1 does not start from zero.
- **The ~50 h deficit vs `ROADMAP.md` is paid for in two places**: continuous testing replaces its
  standalone Phase 8 (§3), and frontend polish is confined to week 7's *measured* changes instead of
  an open-ended "make it fast" phase.
- **There is no slack week.** If something overruns, take the time from week 10 (k6 scenario 3,
  partitioning) and never from weeks 1–6 — those are the phases that produce the interview answers.
- **EKS is optional week 11.** Terraform + ECS Fargate gives you the depth; EKS only adds a
  different control plane. Say so out loud in the interview rather than bluffing "Kubernetes (basic)".
- If you can only protect 10 h in some week, keep the **merge** and drop the artifact — then write the
  artifact the following Monday. An unmerged branch is worth nothing; a missing doc is recoverable.

---

## 5. The cloud/infra track (AWS)

This is the track that makes `Docker & Kubernetes (basic)` defensible — and, more importantly, puts a
cloud provider on a resume that currently names **none**. It is deliberately a ladder: each rung is
only useful once the rung above it works, because running a broken deployment on Fargate just gives
you a *faster, more expensive* broken deployment.

| Rung | What you build | What it teaches | Why skipping it backfires |
| --- | --- | --- | --- |
| **0** | A local `docker compose up` that brings up **web + api + Postgres + Redis** | multi-stage builds, non-root users, healthchecks, container networking, volumes, env injection | Without this, Fargate is a black box you cannot debug when it fails at 1 a.m. |
| **1** | Images pushed to **ECR**; one service on **ECS Fargate** behind an **ALB** | registries, task definitions, CPU/memory sizing, target groups, health checks, rolling deploys | Jumping straight to EKS means learning two unfamiliar systems simultaneously |
| **2** | **RDS Postgres** + **ElastiCache Redis** in private subnets | managed data services, connection pooling (PgBouncer), subnet groups, backups/PITR, and *why your app must survive a failover* — the direct sequel to week 1's transaction work | A connection pool that assumes a permanent TCP connection will die the first time RDS fails over |
| **3** | **Secrets Manager / SSM parameter store**, task roles instead of static keys | secret rotation, least-privilege IAM, why an env var in a task definition is not a secret strategy | This is the "how do you handle secrets" question, answered with a service rather than a promise |
| **4** | **CloudFront + S3** for the built frontend; ALB only for the API | CDN, cache-control/ETags at the edge, origin separation, why "static hosting" is not the same as serving an SPA well | Ties directly into week 7's Core Web Vitals numbers — the edge is where they are won |
| **5** | **Terraform** for everything above, in three workspaces: dev / staging / prod | declarative infra, remote state + locking, drift, plan-before-apply, reviewable infra changes | Console-built infra is the detail that makes an interviewer file you as "not real ops" |
| **6** | Autoscaling + alarms: ECS target-tracking on CPU/RPS, RDS storage alarms, and a **billing alarm with a hard budget** | capacity, scale-out vs scale-up, and why autoscaling without backpressure and idempotency multiplies bugs rather than traffic | §3 row 7 in one sentence: infrastructure amplifies correctness — or the lack of it |
| **7** *(optional)* | **EKS** — only after rungs 1–6 are genuinely done | control plane, node groups, ingress, Helm, and why most teams do not need this | It is a different job. Do not trade a solid ECS story for a shallow EKS one — that is how `(basic)` got on the resume in the first place |

### Cost guardrails — do this *before* rung 1

You have no AWS account on record, and an unattended load test can generate a genuinely unpleasant
invoice. Spend 1–2 hours on this first:

- **Root user:** MFA on, no access keys. Do daily work as an IAM user, also with MFA.
- **AWS Budgets + a billing alarm at a hard limit** (e.g. $50/month) *before* the first service exists.
- **Instance ceiling:** `t3.micro`/`db.t4g.micro` class only. RDS and ElastiCache are the expensive
  parts, not Fargate — single-AZ in dev, multi-AZ only in prod.
- **One region, and stay in it.** Latency and cost both behave predictably that way.
- **`terraform destroy` when you are not load-testing.** That teardown ability is the concrete payoff
  of rung 5, and it is worth saying in an interview.

### What "done" looks like for this track

- `terraform apply` in an empty account yields a working dev environment; `terraform destroy` empties
  it again, and both are run from CI rather than your laptop.
- **The same image runs locally and on Fargate** — no "works on my machine".
- The README's demo URL is CloudFront-fronted, with the API behind an ALB.
- You can answer out loud, without notes: *"what happens when the ECS task dies mid-auction?"* —
  which is answerable only because week 6 persisted the session and made clients resync.

### Where this lands in the 10 weeks

Rungs 0–1 in the first half of week 9 · rungs 2–4 in the second half · rungs 5–6 across week 9–10 ·
rung 7 is the optional week 11. If week 9 runs long, ship rungs 0–3 and defer Terraform to week 10 —
never defer the billing guardrails.

---

## 6. The enterprise checklist, mapped to this repository

This is the table to open in an interview. Left column is what "enterprise-grade" means; middle
column is **the exact defect in this repo, with its line number**; right column is where it gets fixed.

| Concern | Enterprise answer | The exact defect here | Fixed in |
| --- | --- | --- | --- |
| **Millions of rows** | Indexes, partitioning, cursor pagination, archival | `supabase/schema.sql` contains **zero** `CREATE INDEX` statements, and `initialize()` pulls every player and every bid for the auction with no bound (`auctionStore.ts` L128–144) | wk 1, 3, 10 |
| **Millions of users** | Stateless API, horizontal scale, CDN, edge caching | No API process exists at all — the browser *is* the application state (L40–47, L80–181) | wk 3, 6, 9 |
| **Faster load** | Code splitting, SSR/RSC, caching, query tuning, compression | Every read is an unqualified `select *`; the 12 page modules under `src/pages` are not route-split | wk 7 |
| **Request volume** | Rate limiting, queues, backpressure, idempotency, circuit breakers | One bid = three unbatched statements (L251–278); nothing rate-limits a client, and a double-tap writes twice | wk 2, 4 |
| **Security** | Server authz, RLS, OWASP, secrets, audit log, least privilege | Every read policy is `USING (true)` (`schema.sql` L75, L81, L87, L93), so an anon key can read every auction, player and bid; there is no audit log; live-state payloads from *any* client are trusted (L589–596) | wk 5 |
| **Observability** | Metrics + logs + traces, dashboards, SLOs, alerting | None. Failures surface as a human-readable string on the store (`error:` at L302 and elsewhere) | wk 8 |
| **Scaling** | Redis pub/sub for WS, multi-instance, sharding by auction, read replicas | Live state lives in one browser's memory, and the realtime path is client→client Broadcast — so a second admin tab is a second source of truth (L559–581) | wk 4, 6, 10 |
| **Authentication** | OIDC, access/refresh rotation, reuse detection, revocation | `authStore.signUp` L73 and `claimInvite` L145 insert the `profiles` row **from the client** — no trigger, so a failed insert orphans the user; `.single()` on a possibly-empty select throws (L97, L130) | wk 5 |
| **Authorization** | RBAC + resource-level, deny-by-default, tested denials | Roles are read client-side (L93–112; `authStore` L39–50) and only narrow a *query* — they never gate a write. A captain's purse limit lives in a React component (`OwnerBid.tsx` L62) | wk 5 |
| **Reliability** | Transactions, idempotency, retries, graceful degradation, resync | `placeBid`'s rollback only executes if the browser survives (L280–305); `undoLastBid` is three more unbatched statements (L347–365); an admin reload loses the entire live session | wk 1, 2, 6 |
| **Data** | Migrations, constraints, backups, PITR, audit trail | No migrations directory — two loose `.sql` files; no constraint on the purse; nothing prevents a second sale of the same player | wk 1, 9 |
| **Multi-tenancy** | Tenant scoping, per-tenant caching/sharding | `initialize()` means "the newest active auction *anywhere*" (L85–90), and `createAuction` completes **every** active auction in the database (L376–379) | wk 3, 5, 10 |
| **Delivery** | Docker, CI/CD, migrations in CI, env separation, feature flags | No Dockerfile, no CI, no test runner; secrets only in `.env.local` | wk 9, 10 |
| **Cloud / infra** | IaC, managed services, autoscaling, budgets | Nothing on any cloud provider — not in the repo, and not in the resume either | wk 9 |

Every row is a thing you can demonstrate rather than assert. That is the whole difference between
this table and a skills list.

---

## 7. What to measure — the proof discipline

The point of the next 10 weeks is not to *have done* backend work. It is to be able to say a sentence
like *"bid commit p95 went from 340 ms to 45 ms, measured with `EXPLAIN (ANALYZE, BUFFERS)` on a
100k-bid dataset in local Docker Postgres"* — and to be able to reproduce it live if asked.

**No phase ends with a feeling. Every phase ends with a number.**

### 7.1 The metric set

| Layer | Metric | How it is produced | First measured in |
| --- | --- | --- | --- |
| Database | Scan type, rows examined, buffer hits, execution time | `EXPLAIN (ANALYZE, BUFFERS)` on a seeded 100k-bid dataset | wk 1, re-run wk 7 |
| Correctness | Concurrent successes vs. failures; negative-purse count (must be 0); double-sale count (must be 0) | The concurrency test in `tests/` against Docker Postgres | wk 1 (fails) → wk 2 (passes) |
| API | p50 / p95 / p99 per endpoint, payload bytes | `autocannon` or k6 against `apps/api`, plus a `prom-client` duration histogram | wk 3 |
| Realtime | Publish → client-received latency p95; **missed bids after a forced reconnect**; sockets held per instance | k6 WebSocket scenario + a client-side latency probe | wk 6 |
| Frontend | LCP, INP, TTI, JS KB per route, number of requests | Lighthouse CI with performance budgets committed as code | wk 7 |
| Scale | Max sustained rps at the p95 SLO; concurrent sockets; error rate under load | k6 scenarios, with thresholds declared **in the script** so CI can fail on regression | wk 10 |
| Cost | $/month per environment, and $/1k auctions | AWS Cost Explorer / Budgets | wk 9 |
| Reliability | Error rate %, SLO attainment, mean time to detect | Grafana panels + the 3 SLOs from wk 8 | wk 8, revisited wk 10 |

### 7.2 The six rules that make a number trustworthy

1. **Measure before you change anything.** The "before" number goes in the artifact *first*, even when
   it is embarrassing — the failing trace is the most valuable thing in `docs/CONCURRENCY.md`.
2. **Same machine, same dataset, same command.** Write the literal command into the doc, not "I ran
   EXPLAIN". A number without its command is a rumour.
3. **The dataset generator is itself a deliverable.** A seed script producing ~1,000 auctions / 100k
   bids / 50k users lives in the repo, so anyone can reproduce your numbers.
4. **Percentiles, never averages.** p50/p95/p99, or the number is meaningless. Averages hide exactly
   the tail that interviews and incidents are about.
5. **Publish the miss.** If a change does not improve the number, write that down too. "Indexes did not
   help here because the planner chose a seq scan at this size — here is the threshold where it flips"
   is a *stronger* senior signal than a suspiciously clean win.
6. **State the environment.** Local Docker vs. deployed Fargate, instance size, dataset size. An
   unqualified "handles 10k users" is the kind of claim that gets picked apart.

### 7.3 Where the numbers end up

- **Per week:** the week's `docs/` artifact, as a before/after table with the command printed above it.
- **At the end:** a **README numbers table** — `Metric | Before | After | How measured` — plus a live
  demo URL. This is the single most-read part of the whole 200 hours.
- **In the interview:** the claim template *"X → Y, measured with Z, on a dataset of N, on this
  hardware."* Practise saying the environment clause out loud; it is what separates a measurement from
  a marketing sentence.
- **As code where possible:** k6 thresholds and Lighthouse budgets are committed, so the numbers are
  *enforced*, not just reported. A regression then fails a build instead of quietly shipping.

---

## 8. Resume repositioning

Write the resume **as each phase lands**, never all at the end — you will forget the interesting
detail ("the planner chose a seq scan until ~40k rows") within a fortnight. Target: roughly 40% of
your bullets backend/infra, every one carrying a number.

### 8.1 Fix these lines now, before any new work exists

| Current line | Problem | Change to |
| --- | --- | --- |
| "Also familiar with: … Docker & Kubernetes (basic)" | Split two very different claims; the `(basic)` hedge invites exactly the probe you cannot answer | "**Docker** (multi-stage builds, Compose, ECS/Fargate)" now — and add Kubernetes **only** after §5 rung 7 |
| "REST/GraphQL" | GraphQL has no project behind it anywhere | Drop GraphQL. After week 3: "REST (OpenAPI, cursor pagination, idempotency keys)" |
| "achieving 99.9% uptime during the prototype phase" (Tone Matters) | A percentage with no traffic, period, or baseline attached reads as padding and is trivial to puncture | Delete the number, or replace with something falsifiable about the prototype |
| "raising unit-test coverage from 10% to around 60%" | True, but the tests are UI-weighted — the follow-up question is "how do you test domain logic?" | Keep, and after week 2 append: "…including a concurrency test proving no oversell under 50 simultaneous bids" |

### 8.2 The bullet each week earns — and the gate that makes it honest

| Wk | The bullet you may write | Only claim it once |
| --- | --- | --- |
| 1–2 | "Rewrote the bid path as a single transactional Postgres function (row-level locking, `CHECK` constraints, partial unique index); proved **0 oversells and 0 negative purses across 50 concurrent bids**, where the previous three-statement path oversold on N of them." | `docs/CONCURRENCY.md` holds the failing trace *and* the passing re-run |
| 3–4 | "Designed a versioned REST API (Fastify + zod + OpenAPI, cursor pagination, idempotency keys, per-user rate limiting) that moved every auction write off the client; sustained X rps at p95 Y ms." | `openapi.yaml` + the generated typed client exist |
| 5 | "Implemented server-authoritative authorization — JWT verification, RBAC plus resource-level policies, tenant-scoped RLS, and an audit log — with a deny-path suite covering **every** role × resource × action." | `docs/AUTHZ.md`'s matrix has every cell asserted by a test |
| 6 | "Built a horizontally scalable realtime gateway (WebSocket + Redis pub/sub fan-out) serving N concurrent spectators at p95 X ms, with snapshot + `lastEventId` replay: **0 bids lost across forced mid-auction reconnects**." | `docs/REALTIME.md` plus the kill-the-admin-tab demo |
| 7 | "Cut state-read latency from A to B ms by eliminating an N+1, adding five indexes (`EXPLAIN ANALYZE` before/after on 100k bids) and a Redis cache-aside layer; LCP improved X → Y on the live-auction pages." | `docs/PERFORMANCE.md`'s table is filled in with commands |
| 8 | "Instrumented the stack with OpenTelemetry, Prometheus and Grafana and defined 3 SLOs with alerting, cutting mean time to detection from X to Y." | `docs/SLO.md` + dashboard screenshots exist |
| 9 | "Containerised a 5-service stack and provisioned it on AWS — ECS Fargate, RDS, ElastiCache, ALB, CloudFront, Secrets Manager — entirely through Terraform across dev/staging/prod with budget alarms; $X/month." | `terraform/` applies from empty, and `docs/INFRA.md` is written |
| 10 | "Load-tested to breaking point with k6 (10k spectators; 500 concurrent bidders on one player): X rps at p95 Y ms; identified the bottleneck, fixed it, and re-ran." | `docs/SCALE.md` has the graphs **including the failure** |
| any | "Ran weekly design reviews and wrote N ADRs covering the bid-transaction, authz and realtime decisions." | You actually wrote the ADRs. This closes your only real *seniority* gap (§1.2) — take it. |

### 8.3 How to write the bullets

- **Mechanism first, number last.** "Rewrote X as Y; result Z" reads as engineering. "Improved
  performance by 80%" reads as marketing.
- **One sentence each.** The rule-engine bullet works because it fits in a breath.
- **Keep the Etraveli rule-engine bullet first.** Replacing Accertify/Forter and killing $25k/month is
  your strongest line at any level — frame it as system design under compliance constraints.
- **Order by relevance to the target**, not strictly by date: the API, authz and infra bullets should
  sit above the design-system and migration bullets.
- **Never write a number you cannot reproduce on demand.** An interviewer *will* ask "how did you
  measure that?", and §7 exists precisely so the answer is a command rather than a story.

---

## 9. Interview drill set — the ten questions, answered from this repo

Practise these out loud, weekly, from week 1. Each one is answerable with something you will have
built; the "artifact" line is what you point at afterwards.

> **Read this section late, not first — it is an answer key.** These answers describe where the design
> ends up, including the Lab 1 fix. Do the lab in `docs/PHASE_LABS.md`, attempt the answer out loud in
> your own words, *then* read this and compare. Reading it first costs you the reps that make the story
> yours — and an interviewer can tell the difference between a memorised design and one you debugged.

**1. "Two captains confirm a bid for the same player in the same millisecond. What happens?"**
By week 2 this is one Postgres function in one transaction. It takes `SELECT … FOR UPDATE` on the
*captain* row and on the *player* row, in a **fixed order** (auction → captain → player) so two
transactions cannot deadlock by acquiring locks in opposite orders. The second transaction blocks
until the first commits; when it proceeds, the player's status has changed, so it re-reads, sees the
player is no longer `available`, and returns a conflict rather than writing. Even if the application
logic were wrong, a partial unique index on `players (id) WHERE status = 'sold'` plus a unique index on
`bids (player_id)` makes a double sale impossible at the storage layer — the constraint is the last
line of defence, and the API surfaces that failure as **409 Conflict**, not 500. Under the old code,
the same test produces N successes and a negative purse.
*Artifact:* `docs/CONCURRENCY.md` — the failing trace next to the passing one.

**2. "How do you stop a purse going negative?"**
Three layers, deliberately redundant: a client-side pre-check purely for UX (`auctionStore.ts` L212,
`OwnerBid.tsx` L62) — it prevents a pointless round-trip, and is *not* trusted; the transactional
function, which is the authority and re-reads the purse under lock; and a pair of `CHECK` constraints
in the schema that make an over-drawn or over-credited purse unrepresentable, whichever code path
caused it.
*Artifact:* your Lab 1 migration, and the assertion that attacks each invariant with raw SQL.

**3. "Ten thousand spectators need to see the same bid. How?"**
Clients stop being publishers. A client sends an *intent* (`POST /bids`); the server validates,
commits, then publishes to a WebSocket gateway. With more than one API instance, the commit is
fanned out through **Redis pub/sub** so every instance pushes to its own sockets — no sticky sessions,
no cross-instance gossip. On subscribe a client gets a **snapshot**, then a stream of events carrying
monotonic ids; a slow client that falls behind its buffer is dropped back to a fresh snapshot instead
of being fed an ever-growing backlog (backpressure, not infinite buffering).
*Artifact:* `docs/REALTIME.md` + the browser ↔ gateway ↔ Redis ↔ Postgres diagram.

**4. "The admin's laptop dies mid-auction. What happens to the auction?"**
Nothing — which is the point. The live session lives in `auction_sessions` (active group, queue,
index, current bid, leader) and every bid appends to `session_events`. The admin reopens the tab, the
client sends its `lastEventId`, and the server replays the delta. Today the honest answer is "the
auction state is gone, because it only ever existed in that browser's memory".
*Artifact:* the demo video — kill the tab, reopen, state intact.

**5. "Where does authorization live, and how do you know it works?"**
Server-side, deny-by-default. Every request verifies the JWT and derives `{userId, role, captainId,
auctionId}` from the token plus a `memberships` table — never from the request body. Roles are
composed: RBAC answers "what can this role do", then resource-level policy functions answer "on *this*
resource" (a captain may bid only for their own captain id; an admin only within their own auction).
RLS remains as defence in depth with tenant scoping instead of `USING (true)`. Proof is a test suite
that asserts **every denial path** in the role × resource × action matrix, plus an `audit_log` row for
every mutation.
*Artifact:* `docs/AUTHZ.md` — every cell asserted.

**6. "Why is Supabase Realtime's built-in authorization not enough here?"**
Because today the live channel trusts its senders. Any client holding the anon key can
`.send({ event: 'session_update', payload })` and rewrite the current bid and the queue for every
spectator (`auctionStore.ts` L563–596) — the channel authorizes *membership*, not *authority*, and the
payload is client-authored. Realtime is excellent for pushing **server-originated** changes
(`postgres_changes` on rows written by an authorized API); it is the wrong tool for accepting
authoritative state *from* clients.
*Artifact:* §6's security row.

**7. "Make it fast. What do you actually change?"**
In order: read the planner (`EXPLAIN (ANALYZE, BUFFERS)`) before touching anything; add the five
missing indexes — there are currently **zero** in the schema; eliminate the N+1 where every realtime
bid INSERT triggers another query for names (`auctionStore.ts` L616–644) by publishing the complete
payload; replace the unbounded `select *` at L128–144 with cursor pagination; put the state snapshot
behind a Redis cache-aside with explicit invalidation on write; then on the client, TanStack Query for
dedupe/retry/stale-while-revalidate and route-level code splitting.
*Artifact:* `docs/PERFORMANCE.md` — p50/p95 and LCP before/after, with the command printed.

**8. "How do you know it's broken before users tell you?"**
Three pillars wired to one trace: structured JSON logs carrying a correlation id propagated into DB
queries and WebSocket publishes; `prom-client` metrics (request rate, error rate, duration histograms,
WS connections, bid-commit latency, fan-out lag); and OpenTelemetry spans so one slow bid is one
trace across HTTP → DB → Redis → WS. Then three SLOs with alerts on **symptoms** (bid commit p95,
fan-out p95, error rate) rather than causes.
*Artifact:* `docs/SLO.md` + Grafana "Auction health" screenshots.

**9. "What breaks first at 100× scale?"**
Partitioning `bids` by month, because that table is the only one that grows without bound; then read
replicas for spectator reads (they are read-only and tolerate slight staleness), then sharding by
`auction_id` since auctions are naturally independent tenants. And the honest part: *"I know because
I load-tested to failure with k6 at X rps / Y sockets, and the first thing to break was Z."*
*Artifact:* `docs/SCALE.md`, including the failure.

**10. "A user double-taps 'Confirm sale'. What happens?"**
An `Idempotency-Key` on the sale request; the server stores the key with the result, so the retry
replays the stored response instead of re-executing. If the key is missing or duplicated, the unique
index on `bids (player_id)` still makes a second sale of the same player impossible, and the API
returns 409. The client shows a pending state instead of optimistically inventing a result.
*Artifact:* `docs/API.md`'s idempotency section, plus the 100-duplicate-requests → 1-sale test.

> **One more you should volunteer, unprompted:** *"the riskiest thing I found in my own system was
> that the client was the source of truth for a live auction — including who won."* Naming that
> yourself is a stronger senior signal than any of the ten answers above.

---

## 10. What not to do — and the delta against `ROADMAP.md`

### 10.1 What not to do in these 10 weeks

| Don't | Why |
| --- | --- |
| **Rewrite in Next.js** (or any framework) "for the resume" | You would spend 40 hours on migration and 0 on the backend gap that is actually costing you interviews. Add the API instead. The Next.js/RSC claim already exists via the metrics dashboard — strengthen it *there* if you want, not here. |
| **Chase Kubernetes depth** | Rung 7 of §5, optional, and only once ECS + Terraform are solid. 200 hours cannot buy depth in both, and a shallow EKS story would just re-create the `(basic)` line you are trying to delete. |
| **Move to microservices** | One well-layered API. Extract the WebSocket gateway *only* if week 6 shows a real reason (different scaling profile per component). |
| **Add GraphQL, Kafka or Elasticsearch** | None of them is the bottleneck here, and each would eat a week that weeks 1–6 need. |
| **Learn a second cloud in parallel** | One provider, done properly, is the claim. Two providers half-learned is a skills list again. |
| **Build more UI** (admin analytics, prettier live views) | Frontend is already your strength; it adds nothing to this target. The live-auction UI is only touched in week 7 to *measure* it. |
| **Start Terraform before local Compose works** | You will be debugging application and infrastructure problems at the same time, with no way to tell them apart. |
| **Run a load test without a billing alarm** | The one item on this list that can cost real money. §5's guardrails come first, always. |
| **Skip the artifact because the code works** | An unmerged branch and an undocumented win are worth nothing to a hiring manager. Merge + doc + number, every week. |
| **Optimise coverage percentages** | 60% → 70% on components buys nothing. Optimise the correctness tests that prove a claim you intend to make. |

### 10.2 The delta against `ROADMAP.md` — what moved, and what survives

Nothing from `ROADMAP.md` is dropped silently; every item either survives, moves, or is explicitly
superseded. **One substantive reversal:**

| `ROADMAP.md` | Status here | Where it lives now |
| --- | --- | --- |
| §7: "Don't learn Kubernetes deeply … K8s is a different job" | **Reversed**, with the reason kept | §5 rung 7 — optional week 11, *after* ECS is proven. The original reasoning still holds: it is a different job, and 200 h cannot fund both. |
| Phase 0 — ESLint/Prettier/strict TS, CI, README, baseline tag | Kept, **relocated** | CI arrives with the infra work (wk 9–10); README + tag in wk 10. The ESLint config is a 30-minute warm-up in week 1 — `npm run lint` literally cannot run today — not a phase. |
| Phase 1 — Postgres correctness | Kept, **now weeks 1–2** | §4 wk 1–2, and being implemented today |
| Phase 2 — Own the backend | Kept | §4 wk 3–4 |
| Phase 3 — Auth & authorization | Kept, incl. the `profiles` trigger, audit log and session revocation | §4 wk 5 |
| Phase 4 — Realtime with server authority | Kept | §4 wk 6 |
| Phase 5 — Performance & caching | Kept, minus the open-ended "make the frontend fast" sprawl | §4 wk 7 (measured changes only) |
| Phase 6 — Observability | Kept | §4 wk 8 |
| Phase 7 — Delivery, scale & hardening | **Split** | Cloud portion → §5 (wk 9); k6, partitioning, multi-tenancy → §4 wk 10 |
| Phase 8 — Tests & packaging | **Changed** | Testing became a per-phase gate (§3); packaging → §4 wk 10 |
| §5 Enterprise checklist | **Superseded** | §6 — same rows, now with file:line anchors and a cloud row |
| §6 Resume repositioning | **Superseded** | §8 — same idea, now gated per week so nothing is claimed early |
| §8 Weekly cadence (Mon–Tue read, Wed–Fri build, Sat artifact, Sun 5 Q&As) | **Kept in spirit** | §4's weekly shape: ~4 h read · ~12 h build · ~4 h artifact + five Q&As |
| §9 Definition of done | **Absorbed** | §5's infra definition-of-done + §6's checklist; the Compose-up, CI, deployed-demo and README-numbers items all survive |
| Seed script (1k auctions / 100k bids / 50k users), k6 scenarios, the two-browser outbid race, ADRs, the live demo URL | **Kept** | §4 wk 10, §7 rule 3, §8.2 |

**What this document adds that `ROADMAP.md` did not have:** the resume verified against its own
source text rather than a summary, three corrected claims and a ranked probe list (§1.2–1.3); the
observation that **no cloud provider appears anywhere on the resume**; the mentoring/leadership gap
and the ADR bullet that closes it (§8.2); the measurement discipline and reproducibility rules (§7);
and the budget arithmetic that shows 20 h × 10 weeks is ~50 h short of the old plan — which is *why*
one phase had to be absorbed rather than compressed.
