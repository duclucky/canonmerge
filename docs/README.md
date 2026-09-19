# CanonMerge — project specification

Status: `BUILDING`. Phase 3A–3B frontend baseline is verified locally; Phase 4 specification is locked. No deployed contract or live browser lifecycle is claimed yet.

## Identity

- Idea ID: `IDEA-030`
- Project name: CanonMerge
- Project slug: `canonmerge`
- Category: Projects
- Status: `BUILDING`
- Repository: local child Git repository; public remote pending Phase 11
- Target network: Studio Dev, as locked in parent `docs/09`

## One-sentence product hook

Two writers propose different next scenes for the same fictional world; GenLayer validators decide whether the scenes can share one canon, then the contract creates a shared node and 1 GEN credit for each writer or two separate forks and a 2 GEN sponsor refund.

## Trust problem

- Decision that must not depend on one party: whether two sibling edits can coexist under the world's locked rules, changing canon topology and continuation rights.
- Why database/ordinary EVM/backend LLM is insufficient: deterministic matching cannot resolve chronology and causal contradiction in natural language; a studio-hosted LLM lets the studio bias shared canon and GEN allocation.
- Value/rights/access at risk: two node-specific continuation rights and a 2 GEN collaboration purse.

## Fingerprint

- Trust problem: neutral semantic merge/fork decision for shared fictional game state.
- Actors/adversary: sponsor and two distinct writers; sponsor prefers coherent canon or refund, writers prefer merged edits and credits.
- Evidence class + authenticity mechanism: exact onchain parent/rules and two transaction-authored bounded branch texts, all bound to world, epoch, parent, actor, slot, nonce, and deadline. No offchain event is asserted.
- Consensus question: can both branches be true in one chronology without contradicting any locked parent constraint, with complete clause coverage?
- State machine: funded epoch, two branch slots, frozen pair, append-only attempts, one merged node or two forks, continuation rights, retry/recovery, pull credits/withdrawal.
- Direct consequence: graph topology and continuation rights change; fixed 2 GEN is split 1 GEN each on merge or returned to sponsor on conflict/recovery.
- Reuse surface: create/fund epoch, submit branch, review, read graph/rights, verify continuation eligibility, and withdraw for fiction platforms, RPG engines, and AI-game world editors.

## Mandatory gate matrix

| Gate | PASS/FAIL | Evidence/reason |
| --- | --- | --- |
| Replacement | PASS — DESIGN | A studio backend would control canon and credits; validators decide the semantic relation. |
| Judgment | PASS — DESIGN | Causal/temporal consistency across natural-language branches is not a string lookup. |
| Evidence availability | PASS — DESIGN | Exact bounded game commitments are canonical onchain state; no external source is consequential. |
| Evidence authenticity | PASS — DESIGN | Role-checked transaction authorship and world/epoch/parent binding; full matrix is recorded in Phase-2 research and will be copied here in Phase 4. |
| Equivalence | PASS — DESIGN | Strict entity/constraint/branch coverage and semantic relation class; rationale wording may differ. |
| Consequence | PASS — DESIGN | Final verdict changes graph topology, rights and fixed GEN destinations. |
| Adversarial | PASS — DESIGN | Sponsor and writers have opposed refund/merge incentives. |
| State model | PASS — DESIGN | Per-epoch isolation, direct deadlines, append-only attempts, idempotent credits, terminal refunds. |
| Reuse | PASS — DESIGN | Three named game/fiction consumers use the same typed public interface. |
| Contract count | PASS — DESIGN | One contract owns the necessary semantic and value boundary. |
| Differentiation | PASS — DESIGN | Seven-field comparison with RulebookAppeal, GrantLattice, SkillSlot and others has at most two broad matches each. |
| Claim-to-code | PASS — DESIGN | Planned action/state/view/test/browser paths are in Phase-2 research; full matrix due Phase 4. |
| Full lifecycle | PASS — DESIGN | Browser roles, wallet writes/finality/retry, canonical reads and withdrawals are planned; actual proof due later phases. |
| Scope honesty | PASS — DESIGN | Internal fictional consistency only; no copyright, offchain publication or real-world truth claim. |

One FAIL means redesign/reject.

## Actors, roles and incentives

| Actor | Permissions | Value at risk | Incentive to bias |
| --- | --- | --- | --- |
| Sponsor | Create and fund a 2 GEN epoch, inspect outcome, recover or withdraw sponsor credit | 2 GEN | May prefer `CONFLICTING` to receive refund |
| Writer A | Submit the A branch, inspect merge/fork, withdraw own credit | 1 GEN potential credit and shared-canon presence | May overstate compatibility |
| Writer B | Submit the B branch, inspect merge/fork, withdraw own credit | 1 GEN potential credit and shared-canon presence | May overstate compatibility |

## Scope and non-goals

### In scope

- Create worlds/epochs with short canonical text and two distinct writers.
- Compare one pair of transaction-authenticated sibling scenes and create shared or forked canon nodes.
- Display canon, history, continuation rights, role-gated actions, and real GEN credits.

### Out of scope

- Claims about literary copyright, legal title, or offchain publishing.
- Externally sourced game-event feeds and operator-authored model outputs.
- Onchain storage of private stories; all submitted text is public.

## Product/frontend blueprint

> Required for Projects. Provisional in Stage 1; finalized in Stage 2 before
> contract implementation.

### Human users and jobs

| User/role | Primary job | Decision or outcome needed |
| --- | --- | --- |
| Sponsor/story host | Introduce a world, invite two writers, fund one 2 GEN round, then see or recover the outcome | Understand terms and fixed payout before signing; see whether a shared canon or forks formed |
| Writer A/B | Read the canon and partner branch, author a bounded scene, follow semantic review, use continuation right and withdraw any 1 GEN credit | Know exactly which world/parent the text joins and whether the submitted transaction finalized |
| Reader/future builder | Explore public worlds and their branch history | Read canonical nodes and role rights without connecting a wallet |

Provisional contract-capability sketch: one wallet-funded world/epoch creation, two role-bound scene submissions, a review requested by an interested role, safe time-bound refund writes, one-time credit withdrawals, and node-specific continuation. Minimum views: world/epoch list and summary, parent/branch content, timeline/attempt summary, node graph, `can_extend`, caller credit and accounting. Meaningful UI states: not configured, disconnected, wrong network, open, waiting for either writer, ready for review, submitted, accepted/decided, finalized merge/fork, retryable, expired/refundable, failed, credit available, withdrawn. `2 GEN` is a whole-token purse; client passes base units only at the SDK boundary. No source can be fabricated before contract deployment.

### Information architecture

| Screen/view | User purpose | Primary action | Required states | Mobile behavior |
| --- | --- | --- | --- | --- |
| `/` — Welcome | Explain shared canon and the merge/fork outcome in human terms | Browse worlds or begin a world | loading/configuration/empty | Hero and two concise paths stack vertically |
| `/worlds` — Worlds | Find and revisit public worlds, filter by title and status | Open a world | loading/empty/error/list | Search and cards reflow to one column |
| `/worlds/new` — Start a world | Read 2 GEN terms, define bounded canon/rules and invite two wallet addresses | Fund and create | disconnected/wrong network/validation/submitted/finalized/failed | Single-column step groups, sticky summary below form on small screens |
| `/worlds/:id` — World | Read parent canon, two writer slots, current state and graph | Continue the role-appropriate task | loading/not found/open/ready/retryable/merged/forked/refundable | Canon appears before secondary history; actions remain visible |
| `/worlds/:id/write` — Write scene | Compose a bounded branch for an eligible A/B slot against locked canon | Submit scene | role-denied/late/draft/validating/submitted/finalized/failed | Text editor fills width; always keep visible label and word/byte limits |
| `/worlds/:id/outcome` — Outcome & history | Compare the accepted shared node or two forks, understand credits and next rights | Withdraw eligible credit or open a continuation | pending/retryable/merge/fork/credit/withdrawn/error | Branches stack with clear A/B labels; history is collapsible |
| `/account` — Wallet & credits | Review connected address, network, owned worlds, eligible credits and disconnect | Withdraw or disconnect | disconnected/loading/empty/credit/failed | Address wraps; large tap targets |
| `/help` — How it works | Explain public stories, GEN purse, validator decision, refund timing, and failure/retry | Navigate back into flow | static, with network/config notice | Short sections and anchor links |

Persistent navigation: brand/home, Worlds, Start a world, Help; Account appears as the clickable wallet address or a Connect button. Deep links into a world, editor, and outcome work. On phones, a compact labeled menu exposes the same destinations; no icon-only navigation. A back link returns from task views to the world. The shortest sponsor journey is welcome → start world → wallet select/network check → fund → world detail → outcome/history → optional credit withdraw. Writer journey is world detail → read canon → write scene → transaction finality → outcome/history → optional withdrawal and continuation.

### Visibility matrix

Use exactly one visibility class per row: `USER_PRIMARY`,
`USER_CONTEXTUAL`, or `SYSTEM_ONLY`.

| Function/data group | Visibility | Eligible role/state | User need or reason hidden |
| --- | --- | --- | --- |
| Story title, canon text, branch text, accepted merge/fork outcome, friendly timeline, role-eligible primary actions | `USER_PRIMARY` | All readers for public state; eligible writer/sponsor for actions | Core storytelling job |
| Connected address, 2 GEN terms, credit, network, finalized transaction link, history | `USER_CONTEXTUAL` | Connected user and any reader where public | Verification and money clarity without crowding story content |
| Raw storage keys, model prompts, validator votes, attempt hashes, evidence matrix, deployment/submission material | `SYSTEM_ONLY` | None in primary pages | Internal engineering and reviewer proof, optional Explorer link only |

### UI action matrix

In Stage 1, the contract capability/method may be provisional. Stage 2 must
replace it with the finalized public interface before contract code.

| Visible control | Contract capability/method | Eligible role | Legal state | Input/value | Finality | Failure/recovery |
| --- | --- | --- | --- | --- | --- | --- |
| Connect wallet | EIP-6963/injected provider discovery and selection modal | Any visitor | Any page | Selected EVM provider | Connected address/network verified, no contract write | Show no-wallet guidance; allow retry/switch |
| Create world | Provisional `create_world` | Sponsor | Configured, connected Studio Dev | Title, bounded canon/rules, distinct writer addresses, deadlines, exactly 2 GEN | submitted → accepted → finalized → canonical world read | Retain input on failure, retry only after checking state/receipt |
| Submit scene | Provisional `submit_branch` | Registered A/B writer | Slot empty, before deadline | Exact world/epoch/parent/slot, bounded text, 0 GEN | submitted → accepted → finalized → canonical branch read | Preserve draft in memory during the tab session; refresh canonical state before retry |
| Review branches | Provisional `review_merge` | Sponsor or registered writer | Both branches present, before review deadline | World/epoch, 0 GEN | submitted → decided/accepted → finalized → graph/credit read | Retry only when canonical attempt is retryable and time permits |
| Recover purse | Provisional `cancel_missing` / `recover_unresolved` | Sponsor or registered writer | Missing slot after submit deadline, or unresolved after review deadline | World/epoch, 0 GEN | finalized → sponsor credit read | Show eligibility; duplicate never creates another credit |
| Withdraw credit | Provisional `withdraw_credit` | Credited wallet | Positive canonical credit | 0 GEN | finalized → zero/updated credit read | No optimistic balance; retry after fresh canonical read |
| Verify a continuation right | `can_extend` view | Anyone may read | Finalized node right exists | Node ID and actor | canonical boolean | Explain that creating a child epoch is Milestone headroom, not a v1 write |
| Disconnect | Clear selected provider/account UI state | Connected wallet | Any | None | Immediate local UI disconnect; writes disabled | Reconnect through modal |

### User-facing state language

| Canonical status/violation | User-facing label | User consequence/next step |
| --- | --- | --- |
| `OPEN` / no branches | Waiting for two scenes | Eligible writer may submit |
| one branch present | One scene is in; another is needed | Other writer may submit |
| `READY` | Ready to compare | Interested role can request validator review |
| `REVIEWING` / submitted | Reviewing the scenes | Track accepted/decided then finality, no duplicate submission |
| `MERGEABLE` / merged | One shared canon | Both writers can continue; each has 1 GEN credit |
| `CONFLICTING` / forked | Two separate paths | Each writer has their own path; sponsor has 2 GEN refund credit |
| `RETRYABLE` / `UNVERIFIABLE` | Review needs another try | Retry within window; no rights or credits changed |
| expired with missing branch | Round ended before both scenes arrived | Eligible role can recover the 2 GEN purse |
| credit withdrawn | Credit collected | Canonical credit decreases to zero; no duplicate payout |

### Visual preservation constraints

- Visual language/layout to preserve after Phase 3A: editorial book/game world, warm ivory paper, deep ink, restrained amber and moss accents, Cormorant Garamond display with readable sans body, asymmetrical but orderly story cards, persistent top navigation, graph shown as readable connected chapter cards rather than a technical node dashboard. The skill's verified `editorial-grid-magazine` style result and book-brown/page-amber palette inform this choice; its suggested testimonial carousel is rejected because this product has no verified testimonials.
- Allowed functional edits: wire the existing pages to final contract methods, correct role/status conditions and labels, refine accessible feedback and responsive fit. Preserve the established page structure and tokens under FE-PRESERVE.
- System/reviewer details excluded from the primary UI: raw enums, runner versions, model prompts, proofs, attempt IDs, submission packet, contract storage. A small “View on Explorer” link can disclose a verified transaction.

Accessibility and behavior: visible labels, 44 px targets, high contrast text, keyboard-operable modal with focus return, skip link, semantic status live region, no color-only state, responsive checks at 375/768/1024/1440 px, and reduced-motion support. React route modules can lazy load; forms are controlled and retain unsent text in memory only. The frontend must never pretend that a transaction, balance, signature, fee, finality or onchain story exists.

## State model

### Stable IDs

- World ID: sponsor-supplied bounded ASCII identifier, unique forever.
- Node ID: `world_id + ":node:" + node_nonce`; the root is nonce `0`.
- Epoch ID: `world_id + ":epoch:" + epoch_nonce`; each parent has at most one active epoch.
- Branch ID: `epoch_id + ":A"` or `":B"`; a slot is immutable after submission.
- Attempt ID: `epoch_id + ":attempt:" + attempt_nonce`; append-only, never hardcoded by client.

### Structured storage

- `worlds`: keyed world summaries with sponsor, root/current nodes and next nonces.
- `nodes`: keyed immutable canon nodes with parent, text, source branch IDs and continuation-right holders.
- `epochs`: keyed roles, parent, bounded rules, deadlines, status, fixed purse and settlement marker.
- `branches`: keyed writer-authenticated immutable text and submitted timestamp.
- `attempts`: keyed normalized verdict/coverage/conflict data and retry status.
- `credits`: pull ledger keyed by address; `total_locked`, `total_credits`, `total_withdrawn`, `total_received` support invariant views.

### State machine

```text
OPEN --submit_branch(A/B)--> OPEN
OPEN --second branch--> READY
READY --review_merge--> MERGED | FORKED | RETRYABLE
RETRYABLE --review_merge before deadline--> MERGED | FORKED | RETRYABLE
OPEN --cancel_missing at/after submit deadline--> CLOSED
READY/RETRYABLE --recover_unresolved at/after review deadline--> CLOSED
MERGED/FORKED/CLOSED --withdraw_credit--> same terminal state
```

### Temporal entrypoint rules

> Phase and clock are independent. Every time-bounded public write must enforce
> its own exact interval. State the equality boundary and stale-phase behavior
> for each affected method.

- Canonical transaction-time source: `gl.message.datetime` converted to Unix seconds by the pinned runner API.
- Default/exception interval semantics: submissions and review require `now < deadline`; equality is late. Recovery requires `now >= deadline`.
- Entrypoint-local deadline/expiry guards: `create_world` validates future ordered deadlines; `submit_branch` checks `now < submit_deadline`; `review_merge` checks `now < review_deadline`; recovery checks its own equality boundary even if status is stale.
- Recovery/cancellation caller + state + time + actor-interest conditions: exact sponsor/writer role; missing branch plus `now >= submit_deadline` for `cancel_missing`; READY/RETRYABLE plus `now >= review_deadline` for `recover_unresolved`; never after settlement; each credits sponsor exactly once.

### Illegal transitions

- Replacing immutable root/rules, writer addresses, parent, deadlines or branch text.
- Same address as sponsor and writer or both writer slots; zero/invalid addresses.
- Second submission to a filled slot, wrong writer/slot, wrong parent/epoch, late submit/review.
- Review without exactly two branches or after settlement; retry of a non-RETRYABLE result.
- Creating graph nodes or credits from `UNVERIFIABLE`, malformed or incomplete validator output.
- Recovery before the relevant deadline, by a non-interested caller, or after any settlement.
- Withdrawal with zero credit or reentrant/double withdrawal.

### Authorization

- Sponsor alone creates a world and supplies exactly 2 GEN; sponsor cannot be either writer.
- Writer A/B alone submits its exact slot; writers must be distinct.
- Sponsor or either registered writer may request review/retry and time-eligible recovery.
- Only the credited address withdraws its own credit.
- Continuation epoch creation requires an active node-specific right and consumes that right once.

### Idempotency and double-action prevention

- Unique world IDs and monotonic nonces prevent replay.
- Filled branch slots are immutable; settlement flag precedes node/ledger mutation.
- A normalized accepted verdict creates nodes/rights and credits in one atomic write once.
- Recovery shares the settlement flag and cannot run after merge/fork.
- Withdrawal debits credit before `emit_transfer`; duplicate calls see zero credit.

## Write-method safety matrix

> Required before contract implementation. Every state-changing or
> value-affecting write method must have a row. Treat cancel, refund, retry,
> settle, withdraw, close, restore, and recover as high-risk transitions, not
> helper functions.

| Method | Caller | Allowed states | Forbidden states | Temporal/expiry gate | Idempotency | Value/accounting effect | Views affected | Negative tests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `create_world` | Sponsor | New ID | Existing ID; overlapping roles | `submit_deadline > now`; `review_deadline > submit_deadline` | Unique world ID | Receives exactly 2 GEN; locked +2 | world, node, epoch, accounting | wrong value, duplicate ID, invalid roles/text, past/equal deadlines |
| `submit_branch` | Exact writer for slot | OPEN, empty slot | filled/terminal/wrong epoch | `now < submit_deadline`; equality rejects with stale OPEN unchanged | Slot immutable | None | branch, epoch status | wrong caller/slot, duplicate, `deadline-1/=/+1`, oversized/injection text |
| `review_merge` | Sponsor/writer | READY or RETRYABLE | OPEN/terminal | `now < review_deadline`; equality rejects even if READY | Current attempt nonce; terminal settlement once | MERGE: locked -2, credits +1/+1; CONFLICT: locked -2, sponsor credit +2; retry: unchanged | attempt, epoch, nodes, rights, credits, accounting | wrong caller/state, duplicate, deadline boundaries, malicious output/coverage/conflict IDs |
| `cancel_missing` | Sponsor/writer | OPEN with missing branch | READY/terminal/both branches | `now >= submit_deadline`; before rejects | Shared settlement flag | locked -2; sponsor credit +2 | epoch, sponsor credit, accounting | wrong caller/state, `deadline-1/=/+1`, duplicate, both branches present |
| `recover_unresolved` | Sponsor/writer | READY or RETRYABLE | OPEN/terminal | `now >= review_deadline`; before rejects | Shared settlement flag | locked -2; sponsor credit +2 | epoch, sponsor credit, accounting | wrong caller/state, boundary trio, duplicate, already finalized |
| `withdraw_credit` | Credited caller | Any with credit > 0 | credit 0 | N/A: credit availability, not time, is the gate | Debit before transfer | credit -amount; withdrawn +amount; native transfer | caller credit, accounting | zero/double withdrawal, transfer failure/accounting rollback |

No write method may be implemented while its row has a blank or vague safety
cell. A genuinely non-temporal method records `N/A` with a reason in
`Temporal/expiry gate`.

## Frontend lifecycle coverage matrix

> Required for Projects. Every claimed browser workflow step must have a
> frontend wrapper/control/test/finality/canonical-reload path. Script-only
> steps must be marked pending and not claimed as browser-complete.

| Canonical state | User action | Contract write | UI component | Frontend test | Evidence status |
| --- | --- | --- | --- | --- | --- |
| No world | Create/fund 2 GEN | `create_world` | NewWorld form | adapter regression + form/role test | UI baseline done; SDK/network pending |
| OPEN | Submit A/B scene | `submit_branch` | WriteScene | wrapper value/account test + role/deadline UI test | UI baseline done; SDK/network pending |
| READY/RETRYABLE | Review/retry | `review_merge` | WorldDetail action | lifecycle state/finality/reload test | UI baseline done; SDK/network pending |
| MERGED/FORKED | Read graph/rights | view calls | Outcome | canonical mapping/render test | UI baseline done; contract pending |
| CLOSED/recovery eligible | Recover purse | `cancel_missing` / `recover_unresolved` | WorldDetail action | role/time/reload test | UI baseline done; contract pending |
| positive credit | Withdraw | `withdraw_credit` | Account/Outcome | real SDK value-free write + reload test | UI baseline done; contract pending |

## Evidence policy

- Authoritative sources: contract-held root/rules and wallet-authored branch commitments only. No fetched URL is consequential in v1.
- Provenance/authentication: `gl.message.sender`, immutable keyed state, exact world/epoch/parent/slot/nonce binding.
- Authorized attestor/signer: sponsor for root/roles; exact writer for each branch. No prose signature is accepted.
- Anti-replay event/digest identity: unique world ID, monotonic epoch/attempt nonce, fixed slot and stored text hash.
- Signed timestamp bounds: transaction timestamp at each entrypoint; no actor-supplied timestamp is trusted.
- Immutable policy/source version URLs and hashes: N/A, because v1 has no external policy/source. The immutable parent node/rules and stored hash are the policy version.
- Allowed schemes/domains/paths: none for consequential evidence.
- Time/window rules: submit/review `< deadline`; recovery `>= deadline`.
- Size/count bounds: world ID/title/rules/canon/branch lengths bounded; exactly two distinct writers and two slots; bounded constraint/conflict arrays.
- Missing evidence: missing branch blocks review; recovery only after submit deadline.
- Contradictory evidence: valid sibling contradiction is semantic input and may yield `CONFLICTING`; malformed identity/coverage is invalid output and reverts.
- Unavailable source: N/A for web; LLM/runtime unavailable records `RETRYABLE` with no consequence.
- Invalid/unverifiable attestation (must be non-penalizing): wrong sender/binding reverts before review; semantic uncertainty is `RETRYABLE`; neither moves GEN/rights.
- Canonical objective/policy source and hash: stored world/epoch/parent/rules and their deterministic hashes.
- Workflow/entity, step/requirement, actor/subject binding: exact world, epoch, parent, slot, writer, attempt and every parent constraint.
- Prompt-injection boundary: branch text is quoted untrusted story data, never instructions; output must satisfy deterministic enum/coverage/conflict invariants.
- Private/unverifiable evidence excluded: private drafts, URLs, screenshots, server logs, claimed copyright or offchain publication.

A commit hash or SHA-256 digest proves byte stability only. It does not prove
the underlying real-world fact is authentic.

### Evidence Authority Matrix

| Consequential claim/fact | Evidence/artifact | Data controller | Authoritative source/issuer | Deterministic verification | Canonical objective/entity/actor binding | Freshness/anti-replay | Semantic role after verification | Non-penalizing failure state | Consequence blocked | Required negative test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Root world/rules define the fictional baseline | Bounded contract strings | Sponsor | Sponsor transaction and new-world state | Exact sender, role separation, bounds, unique ID | world/root node/version and deadlines | Immutable ID/nonces; future deadlines | Define only fictional baseline/constraints | Revert before activation | branch review, nodes, rights, credits | same bytes under another world/sponsor or replayed ID reject with accounting unchanged |
| Branch A is writer A's proposed fictional change | Bounded stored string/hash | Writer A | Exact registered writer A transaction | sender, slot A empty, hash from exact stored bytes | world/epoch/parent/slot A/writer A | unique slot/nonce; `now < submit_deadline` | Compare its meaning with B/parent | Revert before attempt | graph, rights, all credits | valid digest from writer B/wrong parent/epoch or at deadline rejects unchanged |
| Branch B is writer B's proposed fictional change | Bounded stored string/hash | Writer B | Exact registered writer B transaction | sender, slot B empty, hash from exact stored bytes | world/epoch/parent/slot B/writer B | unique slot/nonce; `now < submit_deadline` | Compare its meaning with A/parent | Revert before attempt | graph, rights, all credits | valid digest from A/wrong parent/epoch or replay rejects unchanged |
| Verdict relates the exact canonical pair | Structured nondet output | Leader proposes; validators independently replay | GenLayer consensus over exact state | strict IDs/enums/coverage/conflict links and deterministic consequence derivation | current world/epoch/parent/branches/attempt | append-only current attempt; one settlement | Classify only `MERGEABLE`/`CONFLICTING`/`UNVERIFIABLE` | Invalid output reverts; uncertainty only RETRYABLE | all node/right/GEN consequences | valid-shape output with missing/extra/duplicate clause, invented ID, unsupported conflict or payout instruction cannot mutate hard state |

Every actor-controlled evidence path that can affect transfer, payout, credit,
settlement, slashing, quarantine, routing, access, or rights needs one complete
row. No cell may be blank or vague. If an interested actor controls all fetched
bytes and no independent authority verifies the consequential claim, Evidence
authenticity is `FAIL` and implementation must not start.

No consequential fact may rely only on actor-controlled public bytes,
claimant-hosted JSON, screenshots, self-reported logs, commit hashes, SHA-256
digests, or LLM judgment that a signature "looks valid". If deterministic
authentication is absent or invalid, the consequence must be
`UNVERIFIABLE`/`RETRYABLE`/non-penalizing.

At least one negative test per consequential evidence class must keep the
bytes and digest valid while making provenance actor-controlled, incorrectly
bound, replayed, stale, future-dated, or wrong-version. The test must prove that
GEN accounting, settlement, access, routing, quarantine, and other hard state
remain unchanged except for an explicit non-penalizing retry/unverifiable
record allowed by the state machine.

## Consensus design

### Leader task

- Inputs: exact immutable world ID, epoch/attempt, parent canon/rules, branch IDs/authors/text, enumerated clause IDs.
- Fetch: none; read canonical storage only.
- Extraction: identify each branch's factual changes, chronology and causal dependencies against all parent constraints.
- Normalization: exact IDs; verdict enum; every parent and branch clause covered once; conflict edge list only between known clause IDs; concise rationale.
- Structured output: JSON `{world_id, epoch_id, attempt_id, parent_id, branch_a_id, branch_b_id, verdict, covered_parent_ids, covered_a_ids, covered_b_ids, conflicts, rationale}`.

### Consensus-critical fields

| Field | Type/bounds | Comparison rule | Why critical |
| --- | --- | --- | --- |
| bound IDs | bounded ASCII strings, exact stored values | strict equality | prevents replay/cross-world result |
| verdict | `MERGEABLE|CONFLICTING|UNVERIFIABLE` | exact enum/semantic agreement | derives only allowed topology/value class |
| coverage sets | bounded arrays, every expected ID exactly once | set equality plus no duplicate/extra | prevents omitted constraints/branches |
| conflicts | bounded A/B/parent clause edges | exact normalized supported edge set | proves conflict relation rather than trusting prose |
| rationale | bounded text | non-critical except validators confirm it supports class | explanation only, never settlement input |

### Validator

- Independent evidence/replay: validator re-reads the same canonical state, independently interprets both branches and compares normalized decision meaning.
- Semantic rule: `MERGEABLE` only if every asserted change can coexist in a consistent chronology and every locked constraint remains true; `CONFLICTING` only with at least one supported contradiction/causal impossibility.
- Rejection conditions: wrong IDs, invalid enum, incomplete/duplicate/extra coverage, invented clause/conflict, conflict list inconsistent with verdict, unsupported rationale, arbitrary amount/payee, malformed JSON.
- `UNDETERMINED` handling: normalized as `UNVERIFIABLE`, appended as `RETRYABLE`, no graph/right/accounting mutation.

### Rationale policy

- Rationale is bounded user-context only. Contract logic trusts only validated enum, IDs, coverage and conflict relations and derives all destinations/amounts itself.

## Consequence and accounting

| Verdict | Canonical state change | Consumer action | Value movement |
| --- | --- | --- | --- |
| `MERGEABLE` | epoch MERGED; one shared child node; rights for both writers | consumers may accept either writer's continuation against shared node | locked -2 GEN; writer A +1 GEN credit; writer B +1 GEN credit |
| `CONFLICTING` | epoch FORKED; two child nodes, one right per writer | consumers expose both paths independently | locked -2 GEN; sponsor +2 GEN credit |
| `UNVERIFIABLE` | append RETRYABLE attempt only | none | no change |
| expired/missing/unresolved recovery | epoch CLOSED; no new node/right | none | locked -2 GEN; sponsor +2 GEN credit |

- Accepted/finalized boundary: contract mutation occurs only inside the accepted write execution; frontend claims the result only after network finalization and canonical reload.
- Ledger invariant: `total_received == total_locked + total_credits + total_withdrawn`; per epoch received is exactly 2 GEN and terminal locked is zero.
- Child-message/transfer evidence: no child contract in v1; native transfer only during withdrawal and must have receipt/balance evidence on Studio Dev.
- Withdrawal/settlement: pull ledger, debit before `emit_transfer`, one-time credit.
- Cure/appeal/restore: only RETRYABLE attempts may retry before deadline; no semantic appeal in v1. After deadline recovery refunds sponsor without creating canon.

## Reusable interface

### Write methods

- `create_world(world_id, title, canon, rules, writer_a, writer_b, submit_deadline, review_deadline)` payable exactly 2 GEN.
- `submit_branch(world_id, epoch_id, slot, text)`.
- `review_merge(world_id, epoch_id)`.
- `cancel_missing(world_id, epoch_id)`.
- `recover_unresolved(world_id, epoch_id)`.
- `withdraw_credit()`.

### View methods

- `get_world`, `get_epoch`, `get_branch`, `get_attempt`, `get_node`.
- `get_world_count`, `get_world_id(index)`; the v1 frontend bounds enumeration to 200 worlds and filters participant worlds client-side.
- `get_credit(actor)`, `can_extend(node_id, actor)`, `get_accounting()`.

### Consumer/callback

- Authentication: no callback/consumer in v1; views are the reusable boundary. Future consumer must authenticate exact contract sender/address.
- Idempotency key: future delivery would use world/epoch/result version; v1 node IDs and settlement flag already provide canonical identity.
- Failure/retry: consumers poll finalized views and never infer a result from transaction submission.
- Authorized cancellation: recovery remains in the main contract and follows the safety matrix; no external consumer may cancel.

## Threat model

| Threat | Attack | Mitigation | Test |
| --- | --- | --- | --- |
| Role forgery | other address fills a writer slot or recovers purse | exact sender and distinct-role checks | wrong sponsor/writer/slot; accounting unchanged |
| Replay/overwrite | resubmit branch, adjudicate or settle twice | immutable slots, attempt nonce, settlement flag | duplicate branch/review/recovery/withdraw |
| Prompt injection | branch instructs model to ignore rules/pay attacker | quote as untrusted story, strict schema and derived amounts | injection strings cannot alter IDs/payees/amounts |
| Malicious leader | missing constraint, invented conflict, extra entity or arbitrary payout | deterministic complete coverage/conflict/accounting validation | valid-shape invalid-meaning outputs revert unchanged |
| Temporal race | submit/review exactly at deadline with stale state | entrypoint-local `now` check, equality late | boundary -1/= /+1 with phase stale |
| Orphaned purse | writer disappears or model remains unavailable | cancel/recover paths and sponsor pull credit | missing branch and retryable expiry reach zero liability |
| Cross-world collision | result/branch reused for another parent | exact world/epoch/parent/slot/hash binding | valid digest wrong parent/world rejects |
| Transfer replay | double withdrawal or reentry | debit before transfer, zero credit check | second withdrawal transfers zero/reverts |

## Test plan

- Happy path: merge and conflict rounds with distinct roles, node/right assertions and all withdrawals.
- Unauthorized: every write from unrelated/sponsor-as-writer/wrong writer and wrong slot.
- Isolation: two worlds/epochs/branches/credits cannot overwrite one another.
- Evidence failure: missing branch, wrong parent/epoch/hash/slot and malformed bounded inputs.
- Malicious leader: wrong IDs, extra/missing/duplicate coverage, invalid enum, unsupported conflict/root mismatch and arbitrary payout text.
- Prompt injection: both branches contain instruction/payout/authority redefinition prose; it remains data and cannot alter settlement.
- Semantic mismatch: leader says MERGEABLE while supported conflict exists and vice versa; validator replay disagrees or deterministic invariant rejects.
- Verdict classes: merge, conflict, unverifiable/retryable.
- Duplicate: world, branch, review after final, recovery after final, double withdrawal.
- Recovery/value write safety: wrong caller/state, deadline -1/= /+1 with stale status and unchanged rejected state.
- Accounting/value: exact 2 GEN payable metadata, incorrect value, both settlement mappings, zero terminal liability and transfer failure rollback.
- Cure/restore: retry only from RETRYABLE before review deadline; recovery afterward.
- Consumer enforcement: `can_extend` exact actor/node/right and consume-on-continuation in later milestone; v1 exposes view only if continuation write is deferred.
- Undetermined/retry: unavailable/malformed model output appends only retry record and preserves nodes/rights/ledger.

## Claim-to-code matrix

| Product claim | Contract method/state | View/read | Direct test | Network evidence |
| --- | --- | --- | --- | --- |
| Open a world with two writers and 2 GEN | `create_world`, OPEN epoch/root node | `get_world`, `get_epoch`, accounting | role/value/deadline/isolation tests | deploy/create receipt + canonical read |
| Writers submit immutable sibling scenes | `submit_branch`, stored A/B, READY | `get_branch`, `get_epoch` | wrong caller/duplicate/boundary tests | two wallet writes + reload |
| Validators merge coherent scenes | `review_merge`, MERGED, shared node/rights, credits | `get_attempt`, `get_node`, `can_extend`, credits | paraphrase, coverage, malicious output, accounting | finalized review + shared node + two 1 GEN credits |
| Contradictory scenes remain separate | `review_merge`, FORKED, two nodes, sponsor credit | nodes, epoch, sponsor credit | supported conflict and no false merge | finalized review + two nodes + 2 GEN sponsor credit |
| Uncertain review is non-penalizing | RETRYABLE attempt | attempt/epoch/accounting | source/model/malformed output unchanged | retry lifecycle and canonical unchanged state |
| Purse is recoverable | `cancel_missing` / `recover_unresolved`, CLOSED | epoch, sponsor credit, accounting | boundary trio/wrong caller/double recovery | finalized recovery + withdraw + zero liability |
| Users withdraw once | `withdraw_credit` | credit/accounting | zero/double/transfer failure | receipt and before/after balances |
| Frontend shows real lifecycle | same write/view surface | all canonical views | adapter SDK interception + UI state tests | Chrome wallet submitted/accepted/finalized/retry/reload evidence |

No important claim may have a blank cell.

## Analogue and differentiation matrix

| Analogue/prior idea | Similar dimensions | Structural difference | Collision decision |
| --- | --- | --- | --- |
| RulebookAppeal | sponsor/players, semantic game judgment, GEN ledger | no issuer ruling/appeal/winner/deposit; sibling merge/fork topology and continuation rights | distinct: at most two broad dimensions |
| GrantLattice | wallet-authored parent/child text and right family | no delegation/attenuation/ancestor revocation; two siblings merge or fork | distinct |
| SemanticPolicyQuorum | wallet-authored text, semantic review, 2 GEN | no policy-owner intersection/executor authorization; graph topology is direct consequence | distinct |
| TenderSeal | sponsor purse and multiple contributors | no sealed bid/RFP/winner/bond; both scenes survive even on conflict | distinct |
| SkillSlot Clearing | normalized semantic relation then deterministic consequence | no bipartite offers/capacity/booking/right routing; one pair changes a canon DAG | distinct |
| Async Agent Arena | AI gaming theme | no operator-generated outputs, quality ranking, bracket or Arc bridge; writers authenticate exact inputs | distinct |

## Deployment and evidence plan

- Network: Studio Dev only, RPC/chain/explorer per parent `docs/09`.
- Actors/wallet separation: existing authorized sponsor plus two distinct existing authorized EOAs when available; never expose keys. Generate/fund only if necessary and authorized.
- Deploy steps: pinned v0.6 compatible runner/SDK, lint/direct/check, safe env discovery, deploy once, verify SUCCESS/finality/address/source identity.
- Consequential lifecycle: create 2 GEN, A/B submit, review one merge case, read nodes/rights/credits, withdraw both; second conflict/recovery case if funds/roles permit without exceeding 1–2 GEN per demo transaction.
- Canonical reads: world, epoch, branches, current attempt, nodes, rights, per-actor credits and invariant.
- Balance/receipt proof: safe allowlisted hashes/status/block/timestamps/addresses plus before/after whole-GEN balances; never full receipt/validator config.
- Evidence path: `docs/evidence/studio-dev/`, one active `deployment.json`, sanitized lifecycle/browser/precheck records.
- Resume/idempotency: discover deployment and current IDs/state before every write; do not replay ambiguous transaction; archive superseded revisions.

## Definition of Done

### Intelligent Contracts

- [ ] Reusable primitive.
- [ ] Semantic validator judgment.
- [ ] Direct consequence.
- [ ] Reuse proof (documented views/adapter, or a separately justified consumer contract).
- [ ] Adversarial tests.
- [ ] Real network lifecycle.
- [ ] Canonical evidence.

### Projects, if selected

- [ ] Real frontend wallet write.
- [ ] Full lifecycle/failure/retry.
- [ ] Canonical reads.
- [ ] Meaningful user outcome.
- [ ] Browser evidence.
- [ ] Every claimed browser lifecycle action has frontend wrapper/control/test/finality/canonical reload.
- [ ] Primary UI contains only user-relevant data/actions; system/reviewer
      details are contextual or hidden.

## Honest limitations

- V1 judges internal fictional consistency; it does not prove authorship, copyright, quality, publication or external game events.
- Branch text and addresses are public. No private story workflow is supported.
- Phase 3 frontend is locally built and honest but remains unwired until Phase 7; Studio Dev/browser evidence is pending.
- One-model Phase-2 viability spike is not validator agreement or production reliability evidence.
- Cross-world imports and external provenance are a milestone, not v1 behavior.

## Kill criteria

- Current pinned runner cannot lint or reliably execute bounded structured nondeterminism.
- Deterministic invariants cannot prevent incomplete/unsupported verdicts from changing graph/value state.
- Direct tests cannot prove every terminal/recovery path reaches an explicit GEN destination.
- Studio Dev cannot complete one real semantic lifecycle or browser IC reads fail CORS/proxy checks.
- The implementation drifts into a centralized backend decision, fake wallet state, or a duplicate winner/appeal/policy primitive.
