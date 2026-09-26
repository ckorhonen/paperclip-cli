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

## Verification and effects

Read `.agents/rules/repo.md`. Use Bun with `bun install --frozen-lockfile` from the root. `bun run dev` runs the source CLI, `bun test` runs tests, and `bun run build` produces `dist/cli.js` for Node. No lint or standalone typecheck script is declared. Inspect the relevant command's help and tests when changing parsing, output, identifier resolution, or the client-side status filter.

Runtime API use needs `PAPERCLIP_API_KEY`, a company identifier, and the configured API URL. Tests should use the existing request mocks rather than real companies/issues. Create/update/comment/checkout commands mutate remote state; a local CLI build does not authorize them or prove the API accepted an operation. Keep credential values out of command output and fixtures. Preserve the existing issue-UUID resolution and unscoped issue endpoint rules.

## Completing work

Carry the authorized change through the relevant checks and repair failures it causes. Make routine, reversible implementation choices using existing patterns; ask only when missing information, a material product decision, or an authorization boundary prevents the next step. Existing authorization remains valid within its scope. If blocked, name the exact action and missing prerequisite, retain concise evidence, and continue independent work.

Choose verification proportional to the change. For instructions or prose, inspect changed paths, links, and local instruction precedence and run `git diff --check -- <changed-paths>`; don't install dependencies or run the application solely for a prose edit. For behavior changes, exercise the affected behavior and applicable checks below, then broaden only for failures or unresolved risk. Report files changed, checks actually run and their results, commands only inspected, and remaining limitations. A build or source inspection alone does not prove runtime behavior. Continue through already-authorized follow-through; stop at explicit review checkpoints or boundaries requiring new authorization.
