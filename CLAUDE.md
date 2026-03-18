# paperclip-cli

TypeScript CLI for the Paperclip agent platform.

## Dev

```bash
bun install
bun run dev -- <command>    # Run from source
bun test                    # Run tests
bun run build               # Build for npm (dist/cli.js)
```

## Architecture

- `src/client.ts` — API client (auth, fetch helpers)
- `src/format.ts` — Token-efficient text formatters
- `src/cli.ts` — Commander-based CLI entry point
- `test/` — Bun tests for formatters and config

## Conventions

- Default output is compact text, `--json` for raw JSON
- Client-side filtering (API status filter is unreliable)
- All issue lookups resolve identifier (e.g. SOU-137) to UUID via list endpoint
- Environment: `PAPERCLIP_API_KEY`, `PAPERCLIP_COMPANY_ID`, `PAPERCLIP_API_URL`

## Known Issues

- API status query param causes 500; always fetch all and filter client-side
- `PAPERCLIP_API_KEY` can appear empty via `$VAR` expansion; use `env | grep` workaround
- PATCH/comment endpoints are NOT company-scoped (use `/api/issues/{id}`)
