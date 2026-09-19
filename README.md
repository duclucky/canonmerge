# CanonMerge

CanonMerge is a GenLayer Project that lets two registered writers propose sibling fictional scenes, then asks validators whether both can coexist in one canon. A finalized merge creates one shared node, two continuation rights, and two 1 GEN credits. A finalized conflict creates two forks and returns the 2 GEN purse to the sponsor. Unverifiable reviews move no rights or GEN.

## Verify

```powershell
npm run check
```

The check runs `genvm-lint`, direct-mode contract tests, frontend TypeScript, frontend wallet adapter tests, and a production build.

## Layout

- `contracts/canonmerge.py` - one pinned, ASCII GenLayer Intelligent Contract
- `tests/direct/` - state, time, evidence, consensus, and accounting tests
- `frontend/` - React product with detected-wallet selection and canonical reads
- `scripts/` - resumable Studio Dev deployment and lifecycle tooling
- `docs/` - specification and sanitized evidence

All product values are shown in GEN. The contract uses base units only at the SDK/VM boundary (1 GEN = 10^18 base units).

## Live evidence

- Studio Dev contract: https://explorer-studio-dev.genlayer.com/address/0xe985c3420bFDa71E922dBE01e2c62dC9F4146950
- Sanitized deployment and 2 GEN lifecycle records: docs/evidence/studio-dev/`n
