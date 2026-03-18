/**
 * Paperclip API client. Handles auth, requests, and error handling.
 */

export interface ClientConfig {
  apiUrl: string;
  apiKey: string;
  companyId: string;
}

export function getConfig(): ClientConfig {
  const apiUrl = process.env.PAPERCLIP_API_URL || "http://127.0.0.1:3100";
  const apiKey = process.env.PAPERCLIP_API_KEY || "";
  const companyId = process.env.PAPERCLIP_COMPANY_ID || "";

  if (!apiKey) {
    throw new Error(
      "PAPERCLIP_API_KEY is required. Set it as an environment variable."
    );
  }
  if (!companyId) {
    throw new Error(
      "PAPERCLIP_COMPANY_ID is required. Set it as an environment variable."
    );
  }

  return { apiUrl, apiKey, companyId };
}

export async function apiGet(
  config: ClientConfig,
  path: string
): Promise<unknown> {
  const url = `${config.apiUrl}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

export async function apiPost(
  config: ClientConfig,
  path: string,
  body: unknown
): Promise<unknown> {
  const url = `${config.apiUrl}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

export async function apiPatch(
  config: ClientConfig,
  path: string,
  body: unknown
): Promise<unknown> {
  const url = `${config.apiUrl}${path}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}
