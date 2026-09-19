# CanonMerge postmortem

## Validated

- The pinned contract lints as exactly one `CanonMerge` class.
- Direct mode covers all three verdict classes, exact time boundaries, authentication, replay, invalid coverage/IDs, recovery, withdrawals, and the global accounting invariant.
- Studio Dev finalized create, two role-bound submissions, semantic review, and both withdrawals. The final ledger has zero locked or outstanding credit.
- Local and production browsers read the same canonical merged world through a same-origin proxy.

## Lessons

- Treat the semantic result as a small topology class. Contract code can then own every right and GEN destination.
- Fictional state avoids unverifiable external truth while still creating an adversarial multi-party judgment problem.
- Ambiguous receipt transport must be reconciled from the exact hash and canonical credit before retrying; the Writer B withdrawal proved this path.
- Deployment packaging needs its own allowlist. GenVM caches must never enter a Vercel upload.

## Honest pending work

The complete MERGEABLE lifecycle used script signers. A separate production-browser proof used OKX to fund 2 GEN and request review, showing submitted, accepted, finalized, and a canonical RETRYABLE reload; its writer submissions used authorized lifecycle scripts. No external platform integration or adoption is claimed.

## Milestone headroom

Add authenticated cross-world imports: bind a source-world contract/address/node/version, verify provenance deterministically, let validators judge import conflicts, and consume node-specific continuation rights when opening the imported child epoch. This is a substantial state and integration increment, not a visual reskin.
