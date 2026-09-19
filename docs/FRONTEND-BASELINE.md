# Phase 3A–3B frontend baseline

Verified locally on 2026-09-19 before contract implementation.

## Product completeness

- Routes: `/`, `/worlds`, `/worlds/new`, `/worlds/:id`, `/worlds/:id/write`, `/worlds/:id/outcome`, `/account`, `/help`.
- Persistent navigation: home/brand, worlds, start, help, wallet/account with disconnect.
- Main sponsor journey: understand → create/fund 2 GEN → revisit world → see outcome/history → withdraw eligible credit.
- Main writer journey: read canon → submit a scene → revisit world → see merge/fork → withdraw or continue when eligible.
- Public reader journey: browse/search/filter worlds → read canon/branches → inspect outcome and history without a wallet.

## Honest baseline

- The Studio Dev contract banner states that deployment is pending.
- The adapter throws `ContractUnavailableError`; no static fixture is presented as onchain state.
- Create/submit/review/recover/withdraw controls are disabled or absent until configuration, role, state, network and wallet conditions are satisfied.
- GEN is shown only as whole `1 GEN` / `2 GEN` amounts; no base units appear in user copy.
- The frontend does not simulate signatures, balances, fees, transactions, accepted/finalized state, or canonical storage.

## Verification evidence

Command:

```text
npm run check
```

Output summary:

```text
tsc --noEmit && vite build
✓ 1967 modules transformed
✓ built in 377ms
```

Browser-local proof at `http://127.0.0.1:5173/`:

- Desktop home visibly rendered the editorial hero, persistent navigation and deployment-pending disclosure.
- 375 × 812 viewport visibly reflowed the hero, wallet button, menu and story cards without horizontal overflow.
- `/worlds/new` exposed labeled fields, public-text/2 GEN disclosure and a disabled write with the exact pending-deployment explanation.
- The centered wallet modal listed detected OKX Wallet and MetaMask choices; no provider was auto-selected; Escape closed it and focus started on the close control.
- `/worlds` showed the honest contract-unavailable state instead of fixtures.
- Browser console warnings/errors: `[]`.

## Preservation lock

Phase 7 may wire the adapter and make the smallest role/state/status corrections. Preserve the page map, editorial paper/ink/amber/moss visual system, typography, navigation, responsive structure and user-language hierarchy under FE-PRESERVE.
