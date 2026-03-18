# paperclip-cli

CLI for the [Paperclip](https://github.com/ckorhonen) agent platform. Designed for both human and agent use with token-efficient output by default.

## Install

```bash
npm install -g paperclip-cli
# or
npx paperclip-cli issues
```

## Setup

Set these environment variables:

```bash
export PAPERCLIP_API_KEY="your-api-key"
export PAPERCLIP_COMPANY_ID="your-company-id"
export PAPERCLIP_API_URL="http://127.0.0.1:3100"  # optional, defaults to localhost
```

## Commands

### Issues

```bash
paperclip issues                              # List all issues
paperclip issues --status todo                # Filter by status
paperclip issues --assignee abcd1234          # Filter by assignee (prefix match)
paperclip issues --priority critical          # Filter by priority
paperclip issues --project 54bfdd24           # Filter by project (prefix match)
paperclip issues --limit 10                   # Limit results
paperclip issue SOU-137                       # Get single issue detail
paperclip create --title "New task"           # Create issue
paperclip update SOU-137 --status done        # Update issue
```

### Comments

```bash
paperclip comments SOU-137                    # List comments
paperclip comment SOU-137 --body "Done."      # Add comment
```

### Checkout

```bash
paperclip checkout SOU-137 --agent <agent-id> # Check out issue for execution
```

### Agents, Goals, Projects

```bash
paperclip agents                              # List agents
paperclip goals                               # List goals
paperclip projects                            # List projects
```

### Options

All commands support `--json` for raw JSON output (useful for piping to `jq`).

## Development

```bash
bun install
bun run dev -- issues          # Run locally
bun test                       # Run tests
bun run build                  # Build for npm
```
