import { describe, expect, test } from "bun:test";
import {
  formatIssues,
  formatIssue,
  formatAgents,
  formatGoals,
  formatProjects,
  formatComments,
} from "../src/format";

describe("formatIssues", () => {
  test("formats multiple issues as compact lines", () => {
    const issues = [
      {
        identifier: "SOU-1",
        title: "Fix bug",
        status: "todo",
        priority: "high",
        assigneeAgentId: "abcd1234-0000-0000-0000-000000000000",
        labels: [],
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
      {
        identifier: "SOU-2",
        title: "Add feature",
        status: "in_progress",
        priority: "medium",
        assigneeAgentId: null,
        labels: [{ name: "enhancement" }],
        createdAt: "2026-01-02T00:00:00Z",
        updatedAt: "2026-01-02T00:00:00Z",
      },
    ];
    const result = formatIssues(issues);
    expect(result).toContain("SOU-1 [todo] high abcd1234 Fix bug");
    expect(result).toContain(
      "SOU-2 [in_progress] medium unassigned Add feature (enhancement)"
    );
  });

  test("returns message for empty list", () => {
    expect(formatIssues([])).toBe("No issues found.");
  });
});

describe("formatIssue", () => {
  test("formats single issue with description", () => {
    const issue = {
      identifier: "SOU-5",
      title: "Test issue",
      status: "done",
      priority: "low",
      assigneeAgentId: "agent-123",
      labels: [{ name: "bug" }],
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-02T00:00:00Z",
      description: "This is the description.",
      parentId: null,
    };
    const result = formatIssue(issue);
    expect(result).toContain("SOU-5: Test issue");
    expect(result).toContain("Status: done | Priority: low");
    expect(result).toContain("Assignee: agent-123");
    expect(result).toContain("Labels: bug");
    expect(result).toContain("This is the description.");
  });
});

describe("formatAgents", () => {
  test("formats agents list", () => {
    const agents = [
      {
        id: "a1",
        name: "Engineer",
        role: "engineer",
        title: "Software Engineer",
        status: "running",
        reportsTo: "ceo-id-12345678",
      },
    ];
    const result = formatAgents(agents);
    expect(result).toContain(
      "Engineer [running] engineer — Software Engineer (reports to ceo-id-1)"
    );
  });

  test("returns message for empty list", () => {
    expect(formatAgents([])).toBe("No agents found.");
  });
});

describe("formatGoals", () => {
  test("formats goals list", () => {
    const goals = [
      {
        id: "goal1234-5678-0000-0000-000000000000",
        title: "Revenue target",
        level: "company",
        status: "active",
        parentId: null,
      },
    ];
    const result = formatGoals(goals);
    expect(result).toContain("goal1234 [active] company: Revenue target");
  });
});

describe("formatProjects", () => {
  test("formats projects list", () => {
    const projects = [
      {
        id: "p1",
        name: "MyApp",
        description: "An app",
        status: "in_progress",
      },
    ];
    const result = formatProjects(projects);
    expect(result).toBe("MyApp [in_progress] — An app");
  });
});

describe("formatComments", () => {
  test("formats comments with agent prefix", () => {
    const comments = [
      {
        id: "c1",
        body: "Working on this now.",
        agentId: "abcd1234-5678",
        createdAt: "2026-01-15T10:30:00Z",
      },
      {
        id: "c2",
        body: "Done.",
        agentId: null,
        createdAt: "2026-01-16T11:00:00Z",
      },
    ];
    const result = formatComments(comments);
    expect(result).toContain("[2026-01-15] abcd1234: Working on this now.");
    expect(result).toContain("[2026-01-16] user: Done.");
  });

  test("returns message for empty list", () => {
    expect(formatComments([])).toBe("No comments.");
  });
});
