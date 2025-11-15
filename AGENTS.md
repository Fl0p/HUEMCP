# Repository Guidelines

## Project Structure & Module Organization
`server/` hosts all TypeScript sources, with `index.ts` providing the CLI entrypoint and modules such as `bridge-discovery.ts`, `hue-bridge-client.ts`, and `config.ts` covering discovery, transport, and persistence. The compiler emits to `dist/` (never edit this tree manually) and bundles live under `build/`. Documentation lives in `docs/`, while `manifest.json`, `icon.png`, and `scripts/generate-manifest.js` describe the MCP bundle.

## Build, Test, and Development Commands
- `yarn dev` — compile with `tsc` and start the server with `NODE_ENV=development` for `.env` support.
- `yarn dev:mcp` — run the development build and force the `start` command to mimic editor integration.
- `yarn setup` / `yarn dev:setup` — launch the Hue Bridge discovery wizard; run until a key is stored.
- `yarn start` — production build followed by `node dist/index.js`; use before releasing.
- `yarn manifest` — regenerate `manifest.json` via `scripts/generate-manifest.js`.
- `yarn mcpb` — `yarn build`, rebuild the manifest, and pack `build/huemcp.mcpb` with `mcpb`.
- `yarn clean` — delete `dist/` so subsequent compiles are reproducible.

## Coding Style & Naming Conventions
The project uses strict ES2022 TypeScript with two-space indentation and single-quoted strings. Keep files in kebab-case, declare classes/interfaces in PascalCase, and name functions/constants in camelCase. Favor utility classes (`Logger`, `ConfigManager`, `BridgeDiscovery`) over duplicate logic, stick with async/await, and run `yarn build` before submitting so the compiler can lint.

## Testing Guidelines
There is no dedicated framework yet, so document manual verification (`yarn setup` output, light state changes from `docs/hue-sync.md`) in every PR. New tests should sit next to the modules under `server/` as `*.spec.ts`, run via Node’s built-in `node --test`, and mock Hue endpoints so CI avoids hardware.

## Commit & Pull Request Guidelines
Git history favors an emoji prefix plus an imperative sentence (`🔧 Add…`, `🚸 Improve…`). Keep subjects under 72 characters, mention related issues, and describe code changes plus manual checks in the body. PRs should flag manifest or packaging updates (so reviewers rerun `yarn mcpb`), link to doc edits, and attach CLI logs/screenshots when debugging discovery or setup.

## Security & Configuration Tips
`ConfigManager` writes Hue credentials to `server/hue-config.json`; keep it untracked. Use `HUE_BRIDGE_IP` and `HUE_API_KEY` in production rather than `.env`, redact keys in logs just as `runSetup()` already does, and update `docs/manual-setup.md` whenever configuration prompts change.
