# CanonMerge

[![verify](https://github.com/duclucky/canonmerge/actions/workflows/verify.yml/badge.svg?branch=main)](https://github.com/duclucky/canonmerge/actions/workflows/verify.yml)

**Two writers propose sibling scenes; GenLayer validators decide whether the story becomes one shared canon or two honest forks.**

CanonMerge removes a unilateral editor from collaborative fictional canon. A sponsor opens a round with exactly 2 GEN and names two writers. Each wallet submits one immutable scene against the same parent. Validators compare meaning under the locked world rules. Contract code then derives the graph, continuation rights, and fixed credits.

## Live App

https://canonmerge.vercel.app

The production frontend reads CanonMerge through a same-origin GenLayer RPC function and uses an explicit detected-wallet chooser for EVM writes.

## Deployed Contract

- Network: GenLayer Studio Dev (chain 61997)
- Contract: `0xe985c3420bFDa71E922dBE01e2c62dC9F4146950`
- Explorer: https://explorer-studio-dev.genlayer.com/address/0xe985c3420bFDa71E922dBE01e2c62dC9F4146950

## What Finalizes

- `MERGEABLE`: one shared child node, continuation rights for both writers, and 1 GEN credit per writer.
- `CONFLICTING`: two fork nodes, one right per writer, and a 2 GEN sponsor refund credit.
- `UNVERIFIABLE`: an append-only retry record; no graph, right, or GEN consequence.
- Missing or unresolved work can be recovered after the exact deadline, returning 2 GEN to the sponsor.

The LLM never supplies recipients or amounts. The contract checks exact world, parent, branch, attempt, coverage, and conflict fields before deriving any consequence.

## Architecture

- `contracts/canonmerge.py`: one ASCII `CanonMerge(gl.contract.Contract)` pinned to a concrete GenVM runner.
- `tests/direct/`: role, isolation, deadline, malicious-output, retry, settlement, withdrawal, and accounting coverage.
- `frontend/`: Vite + React UI, EIP-6963/injected-wallet discovery, GenLayer SDK adapter, accepted/finalized/failure states, and canonical reloads.
- `frontend/api/genlayer-rpc.mjs`: bounded same-origin proxy for browser-safe Intelligent Contract reads.
- `scripts/`: resumable Studio Dev deployment and lifecycle runners.
- `docs/evidence/studio-dev/`: sanitized deployment, lifecycle, browser-read, and browser-wallet evidence.

## Verification

```powershell
npm run check
```

Current local result: one contract; 15 public methods (9 view, 6 write); 16 direct checks passing; 4 frontend wallet tests passing; TypeScript and production build passing. GitHub Actions runs the same contract lint, direct tests, and frontend check on public commits.

The finalized Studio Dev lifecycle used exactly 2 GEN, produced `MERGED / MERGEABLE`, withdrew both 1 GEN credits, and ended with `received=2 GEN`, `locked=0`, `credits=0`, `withdrawn=2 GEN`.

## Run the Frontend

```bash
npm ci --prefix frontend
npm run dev --prefix frontend
```

Copy `frontend/.env.example` to `frontend/.env` and set the deployed address when using another revision. `/genlayer-rpc` is proxied to Studio Dev during local development and served by the Vercel function in production.

## Deploy to Studio Dev

Use an ignored project `.env` or the authorized parent workspace `.env`; never place a key in frontend variables.

```bash
node scripts/studio-dev.mjs quote
node scripts/studio-dev.mjs deploy
node scripts/studio-dev-lifecycle.mjs
```

The deployment script reuses an active deployment when its source hash matches. The lifecycle runner reads canonical state before each write and records only allowlisted public evidence.

## Honest Limits

- The production browser read flow is verified. A browser extension funded a world with 2 GEN and later showed submitted, accepted, finalized, and canonical retry reload for a sponsor review. The two writer submissions in that browser proof used authorized lifecycle scripts; the earlier complete MERGEABLE lifecycle and withdrawals were also script-signed.
- CanonMerge judges consistency inside an explicitly fictional world. It does not prove copyright, real-world events, or offchain publication.
- V1 exposes continuation rights through `can_extend`; opening a child epoch from those rights is future milestone work.
- Studio Dev is the only deployed network, and no external adoption is claimed.

See [the specification](docs/README.md) for the 14-gate review, Evidence Authority Matrix, state machine, safety cards, and claim-to-code trace.
