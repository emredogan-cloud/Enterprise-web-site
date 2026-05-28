# User Profile — Engineering Standards

The developer strictly prefers **TypeScript**, **minimal dependencies**, and **clear abstraction over premature optimization**. Prefers **small, composable scripts**. Values **deterministic verification** (e.g., tests/lints) over assumptions.

## Working implications for the agent
- Default to **TypeScript**; do not add a dependency unless it clearly earns its weight.
- Favor **clear, readable abstractions** over speculative performance work.
- Prefer **small, single-purpose, composable scripts** (in `scripts/`) over monolithic tooling.
- **Verify with deterministic checks** (`npm run lint`, `npm test`, `npm run build`) rather than assuming correctness.
