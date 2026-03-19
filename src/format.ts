/**
 * Token-efficient formatters for CLI output.
 * Default output is compact text; --json gives raw JSON.
 */

interface Issue {
  identifier: string;
  title: string;
  status: string;
  priority: string;
  assigneeAgentId?: string | null;
  labels?: Array<{ name: string }>;
  createdAt: string;
  updatedAt: string;
  description?: string | null;
  parentId?: string | null;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  title: string;
  status: string;
  reportsTo?: string | null;
}

interface Goal {
  id: string;
  title: string;
  level: string;
  status: string;
  parentId?: string | null;
}

interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: string;
}

interface Comment {
  id: string;
  body: string;
  agentId?: string | null;
  createdAt: string;
}

export function formatIssues(issues: Issue[]): string {
  if (issues.length === 0) return "No issues found.";
  const lines = issues.map((i) => {
    const assignee = i.assigneeAgentId
      ? i.assigneeAgentId.slice(0, 8)
      : "unassigned";
    const labels = i.labels?.map((l) => l.name).join(",") || "";
    return `${i.identifier} [${i.status}] ${i.priority} ${assignee} ${i.title}${labels ? ` (${labels})` : ""}`;
  });
  return lines.join("\n");
}

export function formatIssue(i: Issue): string {
  const lines: string[] = [
    `${i.identifier}: ${i.title}`,
    `Status: ${i.status} | Priority: ${i.priority}`,
  ];
  if (i.assigneeAgentId) lines.push(`Assignee: ${i.assigneeAgentId}`);
  if (i.parentId) lines.push(`Parent: ${i.parentId}`);
  if (i.labels?.length)
    lines.push(`Labels: ${i.labels.map((l) => l.name).join(", ")}`);
  lines.push(`Created: ${i.createdAt} | Updated: ${i.updatedAt}`);
  if (i.description) {
    lines.push("");
    lines.push(i.description);
  }
  return lines.join("\n");
}

export function formatAgents(agents: Agent[]): string {
  if (agents.length === 0) return "No agents found.";
  return agents
    .map(
      (a) =>
        `${a.name} [${a.status}] ${a.role} — ${a.title}${a.reportsTo ? ` (reports to ${a.reportsTo.slice(0, 8)})` : ""}`
    )
    .join("\n");
}

export function formatGoals(goals: Goal[]): string {
  if (goals.length === 0) return "No goals found.";
  return goals
    .map(
      (g) =>
        `${g.id.slice(0, 8)} [${g.status}] ${g.level}: ${g.title}${g.parentId ? ` (parent: ${g.parentId.slice(0, 8)})` : ""}`
    )
    .join("\n");
}

export function formatProjects(projects: Project[]): string {
  if (projects.length === 0) return "No projects found.";
  return projects
    .map(
      (p) =>
        `${p.name} [${p.status}]${p.description ? ` — ${p.description}` : ""}`
    )
    .join("\n");
}

interface StatusSummary {
  issues: Issue[];
  agents: Agent[];
}

export function formatStatus(data: StatusSummary): string {
  const { issues, agents } = data;
  const lines: string[] = [];

  // Issue counts by status
  const statusCounts: Record<string, number> = {};
  for (const i of issues) {
    statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
  }
  lines.push("Issues:");
  for (const [s, c] of Object.entries(statusCounts).sort()) {
    lines.push(`  ${s}: ${c}`);
  }

  // Active agents
  const activeAgents = agents.filter(
    (a) => a.status === "active" || a.status === "running"
  );
  const idleAgents = agents.filter((a) => a.status === "idle");
  lines.push(
    `\nAgents: ${activeAgents.length} active, ${idleAgents.length} idle, ${agents.length} total`
  );

  // Blocked issues (important to surface)
  const blocked = issues.filter((i) => i.status === "blocked");
  if (blocked.length > 0) {
    lines.push(`\nBlocked (${blocked.length}):`);
    for (const b of blocked) {
      lines.push(`  ${b.identifier} ${b.title}`);
    }
  }

  // In-review issues
  const inReview = issues.filter((i) => i.status === "in_review");
  if (inReview.length > 0) {
    lines.push(`\nIn Review (${inReview.length}):`);
    for (const r of inReview) {
      lines.push(`  ${r.identifier} ${r.title}`);
    }
  }

  return lines.join("\n");
}

export function formatComments(comments: Comment[]): string {
  if (comments.length === 0) return "No comments.";
  return comments
    .map((c) => {
      const who = c.agentId ? c.agentId.slice(0, 8) : "user";
      const date = c.createdAt.slice(0, 10);
      return `[${date}] ${who}: ${c.body.slice(0, 500)}`;
    })
    .join("\n\n");
}
