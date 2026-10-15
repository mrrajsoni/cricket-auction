# Full-Stack Roadmap — Cricket Auction → Enterprise-Grade

Personal skill roadmap derived from (a) your resume and (b) the current state of this repo.
Goal: reposition from **Senior Frontend Engineer** → **Full Stack Developer** (8 YOE band),
using this project as the proof-of-work vehicle.

---

## 1. Read of your resume

**What you already have (strong, don't re-learn):**

| Area | Evidence |
| --- | --- |
| Senior-level React/TS | 8 YOE, rule-engine UI from scratch, MUI→Mantine migration, design tokens |
| Frontend performance | Deferred/non-blocking calls, request dedupe, virtualized 150-column tables, −3s load |
| Component architecture | Prop-configurable DataTable adopted app-wide |
| Testing + AI leverage | Claude Code, coverage 10% → ~60% |
| Auth *surface* | "authentication flow implementation, RBAC integration" |
| Ops *surface* | Jenkins pipelines, Grafana log monitoring, incident response |

**Where the gap for "Full Stack" actually is:**

Your resume is ~85% frontend. The words `WebSockets, Redis Pub/Sub, PostgreSQL, JWT, Node.js,
Docker & Kubernetes (basic), REST/GraphQL` appear once — under a self-declared skills list,
with only *one* project (Realtime Metrics Dashboard) backing them. At 8 YOE an interviewer
will treat that list as a claim to be tested, not a credential. If probed on "what happens
inside the transaction when two bids land at once?", the frontend résumé has no answer.

The fix is not more buzzwords. It's **depth in 6 areas, demonstrated in this repo.**
Depth > breadth. A single deeply-engineered flagship beats five tutorial projects.

---

## 2. This project is unusually good material — here's why

Cricket Auction is a **real-time, money/points-critical, multi-tenant, concurrent-write** system.
That shape forces you to learn exactly the things that separate "React dev" from "full stack":

- Auctions are **contended writes** → transactions, isolation levels, row locking, optimistic concurrency
- A purse is **money** → idempotency, constraints, audit trails, double-spend prevention
- Live bidding is **fan-out** → WebSocket gateways, pub/sub, backpressure, state resync
- Many auctions = **multi-tenancy** → tenant scoping, RLS, per-tenant caching/sharding
- Spectators = **read-heavy** → caching, CDN, CQRS read models, pagination
- It's deployable → Docker, CI, observability, load testing, SLOs

You can't fake any of that. That's the point.

### Current architecture (baseline)

```
Browser (Vite + React 19 + Zustand + react-router 7)
   │  ← anon key (public), no server of your own
   └──> Supabase: Postgres + Auth + Realtime   ·   ~4.2k LOC
```

- `src/store/auctionStore.ts` (688 lines) — one Zustand store owns *all* server state:
  auctionId, captains, players, bids, and the entire `liveSession`.
- Live bidding state lives **only in client memory**, synced via Supabase **Broadcast**.
- `placeBid()` = optimistic client update + **3 independent writes** with a hand-rolled rollback.
- `initialize()` loads *everything* for the auction in one shot, unbounded.
- 0 tests · 0 CI · no ESLint config (the `lint` script can't run) · no indexes in the schema.

### Concrete gaps → the curriculum (this is the map)

| # | Where | Problem | Concept it teaches you |
| --- | --- | --- | --- |
| 1 | `auctionStore.placeBid` L251–278 | 3 writes (bids / players / captains) with no transaction. A crash or timeout between them leaves the DB inconsistent, and the client "rollback" never runs because the process died | **ACID transactions, atomicity, server-side domain logic** |
| 2 | `placeBid` L212, `canAfford` in `OwnerBid` | `soldPoints > purseRemaining` is checked **client-side only**, then written. Two concurrent confirms → purse goes negative | **Concurrency control, row locking, `CHECK` constraints, optimistic locking** |
| 3 | `OwnerBid.handleRaise` → `raiseLiveBid(captainId, newAmount)` | Amount is whatever the client sends. No server validation of increment, purse, or turn order | **Never trust the client; server authority; validation at the boundary** |
| 4 | `subscribeLiveSession` L563–580 | Any client holding the anon key can `.send({event:'session_update'})` and rewrite the live bid + queue for every spectator | **Authorization on realtime channels, signed/server-originated events** |
| 5 | `liveSession` (client-only) | Admin reloads → auction state gone. No recovery, no spectator-accurate state | **Server as source of truth, event sourcing, snapshot + replay** |
| 6 | `initialize()` L85–115 | "Fetch the newest active auction in the world" — plus `createAuction` completes *all* active auctions globally (L376) | **Multi-tenancy & tenant scoping** (RLS is silently saving you here — fragile) |
| 7 | `supabase/schema.sql` | No `CREATE INDEX` anywhere. RLS policies do an `IN (SELECT …)` subquery per row | **B-tree/partial indexes, `EXPLAIN ANALYZE`, query planning, RLS performance** |
| 8 | RLS policies | Every read is `USING (true)` — any anon user can dump every auction, player, and bid | **Row Level Security as your only boundary; least privilege; tenant membership** |
| 9 | Realtime handler L616–644 | On every `bids` INSERT it fires *another* query for names → realtime N+1 | **N+1 queries, denormalization, read models** |
| 10 | `initialize()` L128–144 | `select *` on all players + all bids, unbounded, no pagination | **Pagination, cursors, streaming, virtualized reads** (your Etraveli strength — extend it server-side) |
| 11 | `authStore.signUp` L73, `claimInvite` L145 | Profile row created by the **client**; no DB trigger → orphaned users. `.single()` on a possibly-empty select throws | **DB triggers, idempotency, race conditions, error contracts** |
| 12 | Repo-wide | No tests, no CI, no ESLint config, secrets in `.env.local` only | **Test pyramid, CI/CD, config/secret management** |

Every phase below attacks these.

---

## 3. What to target FIRST (ordered, non-negotiable)

Do these in order. Each unlocks the next.

1. **Server-side domain logic + Postgres transactions & concurrency.**
   Everything else is decoration until the system is *correct*. `place_bid` must be atomic and
   race-safe. This is the #1 interview differentiator at 8 YOE.
2. **A real backend you own (Node + TypeScript + Fastify/Express).**
   API design, validation (zod), error model, versioning, layering. Kills "frontend-only".
3. **Auth & authorization on the server.** JWT verification, RBAC + resource-level (ABAC) checks,
   refresh-token rotation, session revocation. Your Etraveli "RBAC integration" becomes real.
4. **Real-time with server authority.** Live session persisted server-side; WS gateway; Redis
   pub/sub fan-out; reconnect + resync. Turns "WebSockets/Redis" on your resume into fact.
5. **Caching & query performance.** Indexes, `EXPLAIN ANALYZE`, N+1 elimination, Redis cache,
   TanStack Query on the client (replacing hand-rolled store fetching).
6. **Observability.** Structured logs, metrics, traces, Grafana dashboards, SLOs, error tracking.
   You already touched Grafana — go end-to-end and own it.
7. **Delivery at scale.** Docker, CI/CD, k6 load test, rate limiting, idempotency keys,
   multi-tenancy, partitioning. Then measure and publish numbers.
8. **Tests + packaging.** Tests, README with architecture diagram, deployed demo, ADRs.

**Do not** start with Kubernetes, GraphQL, microservices, or a rewrite into another framework.

---

## 4. Phases (≈20 weeks @ 10–15 hrs/week)

Each phase = *learn a concept → apply it in this repo → produce an artifact → prepare the interview story.*

---

### Phase 0 — Baseline & instrument (Week 1)
**Learn:** ESLint/Prettier/TS strict mode, conventional commits, dangling-dependency analysis.

- Add ESLint + Prettier + `strict` tsconfig flags; get `npm run lint` green.
- Write a `README.md` with a current architecture diagram + a "known limitations" section
  (copy table from §2). Naming your own gaps is a senior signal.
- Tag a git release `v0.1-frontend-only` so future diffs tell the story.

**Artifact:** green lint, `README.md`, baseline tag.

---

### Phase 1 — Postgres correctness (Weeks 2–4) ⭐ highest priority
**Learn:** ACID, isolation levels (read committed vs repeatable read vs serializable),
`SELECT … FOR UPDATE`, optimistic locking (`version` column), `CHECK` constraints,
unique constraints, DB functions/PL-pgSQL, `EXPLAIN ANALYZE`, index types.

**Apply here:**
1. `ALTER TABLE captains ADD CONSTRAINT purse_non_negative CHECK (purse_remaining >= 0);`
   — the DB becomes the last line of defence.
2. Unique constraint preventing a player being sold twice:
   `CREATE UNIQUE INDEX ON players (id) WHERE status = 'sold';` (partial index) — and
   `CREATE UNIQUE INDEX ON bids (player_id);`
3. Add `version INT NOT NULL DEFAULT 0` to `captains`; write optimistic-lock updates
   (`… UPDATE … WHERE id = $1 AND version = $2`).
4. Rewrite `placeBid` as **one** Postgres function: lock the captain row, validate purse,
   re-validate player status, insert bid, update player, decrement purse, bump version —
   all inside one transaction. Replace the 3 parallel writes.
5. Add the missing indexes:
   `bids(auction_id, created_at DESC)`, `players(auction_id, status)`,
   `captains(auction_id)`, `bids(player_id)`, `profiles(captain_id)`.
6. Add `SELECT … FOR UPDATE` on the captain in `place_bid` and compare behaviour under load.

**Artifact:** `supabase/migrations/002_correctness.sql`; a `docs/CONCURRENCY.md` showing
a before/after with two concurrent `confirmSale` calls — the old code oversells, the new one doesn't.

**Interview payoff (this is the money question):** *"Walk me through what happens when two
bids hit the same captain at the same millisecond."* You'll have a real answer, a real bug,
and a real fix.

---

### Phase 2 — Own the backend (Weeks 5–7)
**Learn:** layered architecture (routes → service → repository), zod validation at the boundary,
error taxonomy (401/403/404/409/422/429/500), idempotency keys, REST resource design,
OpenAPI, pagination (offset vs cursor), Node async patterns + connection pooling.

**Apply here:** stand up `apps/api` (Node + TS + **Fastify** — schema-first, fast, plays well with zod).

```
POST /v1/auctions
GET  /v1/auctions/:id/players?cursor=&limit=       (cursor pagination)
POST /v1/auctions/:id/players/:pid/sale            (Idempotency-Key header)
POST /v1/auctions/:id/players/:pid/unsold
POST /v1/auctions/:id/bids                         (validate: turn, increment, purse, role)
POST /v1/auctions/:id/sales/:saleId/undo           (server decides what's "last")
GET  /v1/auctions/:id/state                        (snapshot for connect/resync)
```

- Move every write out of `auctionStore.ts` into the API. The Zustand store becomes a thin
  UI cache, not the source of truth.
- Introduce **idempotency keys** on `sale` so a double-tap or a retried request can't sell twice.
- Introduce **rate limiting** (`@fastify/rate-limit`) per user and per IP.
- Write `openapi.yaml`; generate a typed client so the frontend can't drift.

**Artifact:** working API + OpenAPI spec + typed client + a Postman/Bruno collection.
**Interview payoff:** API design, layering, contracts, error semantics — the "backend half" of
the interview you currently can't win.

---

### Phase 3 — Auth & authorization, properly (Weeks 8–9)
**Learn:** JWT structure, signing vs encryption, access/refresh rotation, refresh-token reuse
detection, session revocation, OIDC, RBAC vs ABAC, OWASP Top 10 (esp. A01 Broken Access Control).

**Apply here:**
1. Move role resolution **server-side**: verify the JWT on every request; derive
   `{userId, role, captainId, auctionId}` from the token + a `memberships` table.
2. Add resource-level authz: a captain may only bid **for their own captain id**; an admin only
   for **their own auction**. Write it as a middleware + explicit policy functions, and unit-test it.
3. Refresh-token rotation with reuse detection (ties directly into your Realtime Metrics
   Dashboard project — do the *same* pattern here so it's proven twice).
4. Add an **audit log** table: who did what, when, from where. Enterprise requirement, and it
   makes the auction legally reconstructable.
5. Replace the `USING (true)` read policies with tenant-membership scoping. Keep the anon key in
   the client; treat **RLS as the only boundary** and prove it with a test that tries to read
   another auction.
6. Add a DB trigger on `auth.users` insert → create `profiles` row (kills the client-side
   profile race in `authStore.signUp`).
7. Session revocation + "sign out all devices".

**Artifact:** `docs/AUTHZ.md` matrix (role × resource × action) + a test suite asserting every
denial path. **Interview payoff:** "how do you stop a captain bidding for another team?" — with code.

---

### Phase 4 — Real-time with server authority (Weeks 10–12)
**Learn:** WS vs SSE vs polling trade-offs, gateway design, Redis pub/sub fan-out, sticky
sessions, connection lifecycle, backpressure, reconnect + state resync, event vs snapshot.

**Apply here (this is where you fix gaps #4 and #5):**
- Persist the live session in the DB: `auction_sessions` (active_group, player queue, index,
  current bid, leader) + `session_events` (append-only bid events).
- **Only the server broadcasts.** Clients send *intents* (`POST /bids`); the server validates,
  commits, then publishes. Spectator never trusts another client.
- Build a WS gateway: `GET /ws/auctions/:id`. On connect, send a **snapshot** then a stream of
  events. On reconnect, client sends `lastEventId` and the server replays the delta — no missed bids.
- Add **Redis pub/sub** so you can run multiple API instances; test it (2 containers, one Redis).
- Add heartbeats, `AbortController` cleanup, and exponential-backoff reconnect (you did this in
  the metrics dashboard — repeat it here).
- Delete `broadcastLiveState` and the unauthenticated `live:` channel.

**Artifact:** architecture diagram (browser ↔ gateway ↔ Redis ↔ Postgres) + a demo video showing
"kill the admin's tab mid-auction, reopen, state is intact."
**Interview payoff:** the horizontal-scaling question — *"how do 10k spectators get the same bid?"*

---

### Phase 5 — Performance & caching (Weeks 13–14)
**Learn:** Postgres query planner, `EXPLAIN (ANALYZE, BUFFERS)`, N+1, cache-aside vs
write-through, cache invalidation, TTL/locking/thundering herd, HTTP caching + ETags, CDN,
connection pooling (PgBouncer), code splitting, Core Web Vitals.

**Apply here:**
- Fix the realtime N+1 (gap #9): publish the full bid payload from the server instead of
  re-querying per event.
- Cache the auction "state snapshot" in Redis (short TTL + explicit invalidation on write).
- Prove index wins with `EXPLAIN ANALYZE` before/after on a seeded 100k-bid dataset.
- Replace `initialize()`'s unbounded load (gap #10) with cursor pagination + TanStack Query
  (stale-while-revalidate, request dedupe, optimistic updates, retry/backoff) — then delete the
  hand-rolled optimistic logic in the store.
- Frontend: route-level code splitting, prefetch on hover, memoized selectors, `React.memo`
  where profiling says so. Measure with Lighthouse → publish before/after numbers.
- Add HTTP compression, cache headers, ETags on read endpoints.

**Artifact:** `docs/PERFORMANCE.md` with a table of measurements (p50/p95 latency, TTI, query
times). **This is where your existing strength compounds.**

---

### Phase 6 — Observability (Weeks 15–16)
**Learn:** the three pillars (metrics/logs/traces), structured logging, RED/USE methods,
OpenTelemetry, Prometheus + Grafana, SLO/SLI/error budgets, alerting on symptoms.

**Apply here:**
- Structured JSON logs with correlation IDs (request id → propagated to DB + WS).
- `prom-client` metrics: request rate, error rate, duration histograms, WS connections,
  bid-commit latency, realtime fan-out lag.
- OpenTelemetry tracing: HTTP handler → DB query → Redis publish, as one trace.
- Grafana dashboards: "Auction health" (bids/min, p95 sale latency, WS connections, error rate).
- Define 3 SLOs (e.g. sale p95 < 300ms, WS fan-out p95 < 150ms, error rate < 0.5%) and an alert.
- Sentry (or GlitchTip) on both apps for real stack traces.

**Artifact:** screenshots of your Grafana dashboard + the SLO doc.
**Payoff:** the interview answer that separates seniors — *"how do you know it's broken before
users tell you?"* You already have a Grafana line on the resume; this makes it yours.

---

### Phase 7 — Delivery, scale & hardening (Weeks 17–18)
**Learn:** Docker multi-stage builds, compose, CI/CD pipelines, migrations in CI, k6/Locust,
horizontal scaling, horizontal vs vertical, partitioning, blue/green, feature flags,
CQRS/read models, idempotency + retries + circuit breakers.

**Apply here:**
- Dockerfiles for web + api (multi-stage, non-root, small), `docker-compose.yml` with Postgres,
  Redis, api, web, Grafana. One `docker compose up` to run the whole thing.
- GitHub Actions: lint → typecheck → unit tests → integration tests (Testcontainers/local
  Supabase) → build → deploy. Branch protection.
- Seed script that generates 1,000 auctions / 100k bids / 50k users.
- **k6** load test scenarios: (a) 10k spectators on one auction, (b) 500 concurrent bidders on
  one player, (c) 1k auctions in parallel. Find the breaking point, fix it, re-run, publish numbers.
- Partition `bids` by month (or by auction) once it's large; measure.
- Multi-tenancy: scope *everything* by auction; add a tenant-isolation integration test.
- Add a `bid_attempts` write-ahead table (or a queue) so bids survive an API restart.

**Artifact:** `docs/SCALE.md` with k6 graphs + "we handle X rps / Y concurrent sockets at p95 Z ms."

---

### Phase 8 — Tests & packaging (Weeks 19–20)
**Learn:** test pyramid, Vitest/RTL, integration testing against a real DB, Playwright E2E,
contract testing, coverage as a signal not a goal.

**Apply here:**
- Unit: `bidIncrements`, `playerParser`, authz policy functions.
- Integration: `place_bid` under 50 concurrent transactions (proves no oversell).
- E2E (Playwright): create auction → invite captain → live bidding → confirm sale → dashboard,
  including a **two-browser outbid race**.
- Coverage gate in CI; keep it meaningful (~70% on services, not on CSS).
- Final `README.md`: one-paragraph pitch, architecture diagram, feature list, how to run,
  **measured numbers**, and a "what I'd do at 100× scale" section.

---

## 5. Enterprise-scale checklist mapped to this repo

| Concern | Enterprise answer | Where you implement it |
| --- | --- | --- |
| Millions of rows | Indexes, partitioning, cursor pagination, archival | Phase 1, 5, 7 |
| Millions of users | Stateless API, horizontal scale, CDN, edge caching | Phase 4, 7 |
| Faster load | Code splitting, SSR/RSC, caching, query tuning, compression | Phase 5 |
| Request volume | Rate limiting, queues, backpressure, idempotency, circuit breakers | Phase 2, 7 |
| Security | Server authz, RLS, OWASP, secrets, audit log, least privilege | Phase 3 |
| Observability | Metrics + logs + traces, dashboards, SLOs, alerting | Phase 6 |
| Scaling | Redis pub/sub for WS, multi-instance, sharding by auction, read replicas | Phase 4, 7 |
| Authentication | OIDC, access/refresh rotation, reuse detection, revocation | Phase 3 |
| Authorization | RBAC + ABAC/resource-level, deny-by-default, tested denials | Phase 3 |
| Reliability | Transactions, idempotency, retries, graceful degradation, resync | Phase 1, 4 |
| Data | Migrations, constraints, backups, PITR, audit trail | Phase 1, 3, 7 |
| Delivery | Docker, CI/CD, migrations in CI, env separation, feature flags | Phase 0, 7 |

---

## 6. Resume repositioning (do this *after* the work, not before)

Roughly 40% of your bullets should become backend/infra, each with a number. Draft lines you'll
earn by finishing the phases (fill in real measurements):

- "Designed a transactional, race-safe bid engine (Postgres row locking + `CHECK` constraints +
  idempotency keys), eliminating oversell under 500 concurrent bidders verified by a k6 load test."
- "Built a horizontally scalable realtime gateway (Node + WebSocket + Redis pub/sub) serving
  N concurrent spectators per auction at p95 fan-out latency of X ms, with snapshot+replay resync."
- "Implemented server-authoritative authorization (JWT verification, RBAC + resource-level
  policies) with an audit log and a deny-path test suite covering every role × resource × action."
- "Instrumented the stack with OpenTelemetry, Prometheus and Grafana; defined 3 SLOs with
  alerting, cutting mean time to detection from X to Y."
- "Containerized a 5-service stack and built a GitHub Actions pipeline (lint → typecheck →
  integration tests → build → deploy) with a coverage gate."

Also: **prune or prove** the "Also familiar with" line. `Docker & Kubernetes (basic)` and
`REST/GraphQL` invite probing questions that a frontend-weighted resume can't answer. After this
roadmap, Docker becomes real — keep it, drop "basic". GraphQL: either build one endpoint on the
API or remove it.

And lead with the **Etraveli rule-engine story** — replacing Accertify/Forter and killing $25k/mo
of vendor spend is your strongest, most senior signal. Frame it as *system design under
compliance constraints*, not "I built a UI".

---

## 7. What NOT to do

- Don't rewrite in Next.js / another framework just for the resume. Add the API instead.
- Don't learn Kubernetes deeply. Docker + compose + a deploy is enough; K8s is a different job.
- Don't switch to microservices. One well-layered API, then *maybe* extract the WS gateway.
- Don't chase more frontend frameworks (you have React/Angular/Vue3 — enough).
- Don't add GraphQL, Kafka, or Elasticsearch until the checklist above is done.
- Don't optimise coverage numbers; optimise the correctness tests that matter.

---

## 8. Weekly cadence that actually works

- **Mon–Tue (2h):** read the concept (one chapter / one doc / one paper). No coding.
- **Wed–Fri (3h):** apply it in this repo, on a branch, in a PR you review yourself.
- **Sat (3h):** write the artifact (`docs/*.md`, diagram, measurements) — this is what
  interviewers actually read.
- **Sun (1h):** write 5 interview Q&As on the week's concept, in your own words, in a
  `docs/interview-notes/` file. Say them out loud.

Rule: **every phase ends with a merged PR, a doc, and a number.**

---

## 9. Definition of done for "I'm a full stack developer now"

- [ ] `docker compose up` brings up web + api + Postgres + Redis + Grafana
- [ ] All writes go through an API I own; no client-side domain logic
- [ ] `place_bid` is transactional and race-safe, with a test that proves it
- [ ] Every realtime event is server-originated and authorized
- [ ] Clients can reconnect mid-auction and resync with zero lost bids
- [ ] Authz is deny-by-default with a tested policy matrix
- [ ] A Grafana dashboard exists with 3 SLOs and alerts
- [ ] k6 load test results are published in `docs/SCALE.md`
- [ ] CI runs lint, typecheck, unit, integration, E2E, and blocks on failure
- [ ] `README.md` shows an architecture diagram and measured numbers
- [ ] Live deployed demo URL at the top of the README
