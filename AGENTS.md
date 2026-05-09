# Repository Guidelines

## Project Overview

`paperclip-cli` is a TypeScript CLI for the Paperclip agent platform. It is designed for both human and agent use with compact text output by default and `--json` for raw machine-readable output.

## Development Commands

- `bun install` installs dependencies.
- `bun run dev -- <command>` runs the CLI from source.
- `bun test` runs the Bun tests in `test/`.
- `bun run build` builds the npm package output in `dist/cli.js`.

## Architecture

- `src/client.ts` contains the API client, auth, and fetch helpers.
- `src/format.ts` contains token-efficient text formatters.
- `src/cli.ts` is the Commander-based CLI entrypoint.
- `test/` contains Bun tests for client behavior, formatters, and config.

## Conventions

- Default output is compact text; use `--json` for raw JSON.
- Keep client-side filtering for issue status because the API status filter is unreliable.
- Resolve issue identifiers such as `SOU-137` to UUIDs via the list endpoint before detail/update calls.
- Required environment variables are `PAPERCLIP_API_KEY`, `PAPERCLIP_COMPANY_ID`, and optionally `PAPERCLIP_API_URL`.
- PATCH and comment endpoints are not company-scoped; use `/api/issues/{id}`.

## Agent Workflow

- `AGENTS.md` is the canonical root instruction file.
- `CLAUDE.md` should remain a symlink to `AGENTS.md`.
- `.agents/` is the canonical repo-local agent workspace for rules, commands, and skills.
- `.codex` and `.claude` should point at `.agents` unless a future tool needs a real directory.
- No repo-local skill is currently justified; the CLI workflow is covered by package scripts and tests.
