# Browser-local Studio Dev verification

Verified on 2026-09-19 through the Vite same-origin `/genlayer-rpc` proxy in a real browser surface.

- `/worlds` loaded `canonmerge-demo-e479ac7` from the deployed contract without `Failed to fetch` or a CORS error.
- The card displayed canonical status `One shared canon` and title `The Glass Archive`.
- `/worlds/canonmerge-demo-e479ac7` reloaded both exact submitted scenes and the finalized decision.
- `/worlds/canonmerge-demo-e479ac7/outcome` reloaded the parent canon, both branches, `MERGEABLE`, and the shared finalized story state.
- No fixture or local-storage world state exists in the adapter.

The browser was disconnected, so write controls remained disabled behind explicit wallet selection. Wallet transaction encoding and account binding are covered by `frontend/src/lib/contract.test.ts`; the separate Studio Dev lifecycle evidence proves all six real transactions finalized successfully.
