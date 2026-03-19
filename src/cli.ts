#!/usr/bin/env node

import { Command } from "commander";
import { getConfig, apiGet, apiPost, apiPatch } from "./client.js";
import {
  formatIssues,
  formatIssue,
  formatAgents,
  formatGoals,
  formatProjects,
  formatComments,
  formatStatus,
} from "./format.js";

const program = new Command();

program
  .name("paperclip")
  .description("CLI for the Paperclip agent platform")
  .version("0.1.0");

// Helper: output JSON or formatted text
function output(data: unknown, formatter: (d: any) => string, json: boolean) {
  if (json) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(formatter(data));
  }
}

// --- Status ---

program
  .command("status")
  .description("Company status dashboard")
  .option("--json", "Output raw JSON")
  .action(async (opts) => {
    const config = getConfig();
    const [issues, agents] = await Promise.all([
      apiGet(config, `/api/companies/${config.companyId}/issues`) as Promise<
        any[]
      >,
      apiGet(config, `/api/companies/${config.companyId}/agents`) as Promise<
        any[]
      >,
    ]);
    // Exclude done/cancelled from dashboard
    const active = issues.filter(
      (i) => !["done", "cancelled"].includes(i.status)
    );
    output({ issues: active, agents }, formatStatus, opts.json);
  });

// --- Issues ---

program
  .command("issues")
  .description("List issues for the company")
  .option("--status <status>", "Filter by status (todo, in_progress, done)")
  .option("--assignee <id>", "Filter by assignee agent ID (prefix match)")
  .option("--priority <priority>", "Filter by priority")
  .option("--project <id>", "Filter by project ID (prefix match)")
  .option("--limit <n>", "Limit results", "50")
  .option("--json", "Output raw JSON")
  .action(async (opts) => {
    const config = getConfig();
    let issues = (await apiGet(
      config,
      `/api/companies/${config.companyId}/issues`
    )) as any[];

    // Client-side filtering (API status filter is unreliable)
    if (opts.status) {
      issues = issues.filter((i) => i.status === opts.status);
    }
    if (opts.assignee) {
      issues = issues.filter(
        (i) =>
          i.assigneeAgentId &&
          i.assigneeAgentId.startsWith(opts.assignee)
      );
    }
    if (opts.priority) {
      issues = issues.filter((i) => i.priority === opts.priority);
    }
    if (opts.project) {
      issues = issues.filter(
        (i) => i.projectId && i.projectId.startsWith(opts.project)
      );
    }
    issues = issues.slice(0, parseInt(opts.limit, 10));
    output(issues, formatIssues, opts.json);
  });

program
  .command("issue <identifier>")
  .description("Get a single issue by identifier (e.g. SOU-137)")
  .option("--json", "Output raw JSON")
  .action(async (identifier: string, opts) => {
    const config = getConfig();
    const issues = (await apiGet(
      config,
      `/api/companies/${config.companyId}/issues`
    )) as any[];
    const issue = issues.find(
      (i) => i.identifier === identifier.toUpperCase()
    );
    if (!issue) {
      console.error(`Issue ${identifier} not found.`);
      process.exit(1);
    }
    output(issue, formatIssue, opts.json);
  });

program
  .command("update <identifier>")
  .description("Update an issue (status, priority, title)")
  .option("--status <status>", "New status (todo, in_progress, done)")
  .option("--priority <priority>", "New priority")
  .option("--title <title>", "New title")
  .option("--json", "Output raw JSON")
  .action(async (identifier: string, opts) => {
    const config = getConfig();
    // Find the issue ID
    const issues = (await apiGet(
      config,
      `/api/companies/${config.companyId}/issues`
    )) as any[];
    const issue = issues.find(
      (i) => i.identifier === identifier.toUpperCase()
    );
    if (!issue) {
      console.error(`Issue ${identifier} not found.`);
      process.exit(1);
    }
    const body: Record<string, string> = {};
    if (opts.status) body.status = opts.status;
    if (opts.priority) body.priority = opts.priority;
    if (opts.title) body.title = opts.title;
    if (Object.keys(body).length === 0) {
      console.error("No updates specified. Use --status, --priority, or --title.");
      process.exit(1);
    }
    const updated = await apiPatch(config, `/api/issues/${issue.id}`, body);
    output(updated, formatIssue, opts.json);
  });

program
  .command("create")
  .description("Create a new issue")
  .requiredOption("--title <title>", "Issue title")
  .option("--description <desc>", "Issue description")
  .option("--priority <priority>", "Priority (critical, high, medium, low)", "medium")
  .option("--project <id>", "Project ID")
  .option("--parent <id>", "Parent issue ID")
  .option("--json", "Output raw JSON")
  .action(async (opts) => {
    const config = getConfig();
    const body: Record<string, unknown> = {
      title: opts.title,
      priority: opts.priority,
    };
    if (opts.description) body.description = opts.description;
    if (opts.project) body.projectId = opts.project;
    if (opts.parent) body.parentId = opts.parent;
    const issue = await apiPost(
      config,
      `/api/companies/${config.companyId}/issues`,
      body
    );
    output(issue, formatIssue, opts.json);
  });

// --- Comments ---

program
  .command("comments <identifier>")
  .description("List comments on an issue")
  .option("--json", "Output raw JSON")
  .action(async (identifier: string, opts) => {
    const config = getConfig();
    const issues = (await apiGet(
      config,
      `/api/companies/${config.companyId}/issues`
    )) as any[];
    const issue = issues.find(
      (i) => i.identifier === identifier.toUpperCase()
    );
    if (!issue) {
      console.error(`Issue ${identifier} not found.`);
      process.exit(1);
    }
    const comments = await apiGet(config, `/api/issues/${issue.id}/comments`);
    output(comments, formatComments, opts.json);
  });

program
  .command("comment <identifier>")
  .description("Add a comment to an issue")
  .requiredOption("--body <text>", "Comment body")
  .option("--agent <id>", "Agent ID for the comment")
  .option("--json", "Output raw JSON")
  .action(async (identifier: string, opts) => {
    const config = getConfig();
    const issues = (await apiGet(
      config,
      `/api/companies/${config.companyId}/issues`
    )) as any[];
    const issue = issues.find(
      (i) => i.identifier === identifier.toUpperCase()
    );
    if (!issue) {
      console.error(`Issue ${identifier} not found.`);
      process.exit(1);
    }
    const body: Record<string, string> = { body: opts.body };
    if (opts.agent) body.agentId = opts.agent;
    const comment = await apiPost(
      config,
      `/api/issues/${issue.id}/comments`,
      body
    );
    if (opts.json) {
      console.log(JSON.stringify(comment, null, 2));
    } else {
      console.log("Comment added.");
    }
  });

// --- Checkout ---

program
  .command("checkout <identifier>")
  .description("Check out an issue for execution")
  .requiredOption("--agent <id>", "Agent ID performing checkout")
  .option("--json", "Output raw JSON")
  .action(async (identifier: string, opts) => {
    const config = getConfig();
    const issues = (await apiGet(
      config,
      `/api/companies/${config.companyId}/issues`
    )) as any[];
    const issue = issues.find(
      (i) => i.identifier === identifier.toUpperCase()
    );
    if (!issue) {
      console.error(`Issue ${identifier} not found.`);
      process.exit(1);
    }
    const result = await apiPost(config, `/api/issues/${issue.id}/checkout`, {
      agentId: opts.agent,
      expectedStatuses: ["todo", "in_progress", "blocked"],
    });
    output(result, formatIssue, opts.json);
  });

program
  .command("release <identifier>")
  .description("Release execution lock on an issue")
  .option("--status <status>", "Set status after release (e.g. done, blocked)")
  .option("--json", "Output raw JSON")
  .action(async (identifier: string, opts) => {
    const config = getConfig();
    const issues = (await apiGet(
      config,
      `/api/companies/${config.companyId}/issues`
    )) as any[];
    const issue = issues.find(
      (i) => i.identifier === identifier.toUpperCase()
    );
    if (!issue) {
      console.error(`Issue ${identifier} not found.`);
      process.exit(1);
    }
    const result = await apiPost(
      config,
      `/api/issues/${issue.id}/release`,
      opts.status ? { status: opts.status } : {}
    );
    output(result, formatIssue, opts.json);
  });

// --- Agents ---

program
  .command("agents")
  .description("List agents in the company")
  .option("--json", "Output raw JSON")
  .action(async (opts) => {
    const config = getConfig();
    const agents = await apiGet(
      config,
      `/api/companies/${config.companyId}/agents`
    );
    output(agents, formatAgents, opts.json);
  });

// --- Goals ---

program
  .command("goals")
  .description("List company goals")
  .option("--json", "Output raw JSON")
  .action(async (opts) => {
    const config = getConfig();
    const goals = await apiGet(
      config,
      `/api/companies/${config.companyId}/goals`
    );
    output(goals, formatGoals, opts.json);
  });

// --- Projects ---

program
  .command("projects")
  .description("List projects")
  .option("--json", "Output raw JSON")
  .action(async (opts) => {
    const config = getConfig();
    const projects = await apiGet(
      config,
      `/api/companies/${config.companyId}/projects`
    );
    output(projects, formatProjects, opts.json);
  });

program.parse();
