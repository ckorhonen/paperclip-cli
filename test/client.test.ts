import { describe, expect, test } from "bun:test";
import { getConfig } from "../src/client";

describe("getConfig", () => {
  test("throws when PAPERCLIP_API_KEY is missing", () => {
    const orig = process.env.PAPERCLIP_API_KEY;
    delete process.env.PAPERCLIP_API_KEY;
    // Also clear it fully in case it's empty string
    process.env.PAPERCLIP_API_KEY = "";
    try {
      expect(() => getConfig()).toThrow("PAPERCLIP_API_KEY is required");
    } finally {
      if (orig) process.env.PAPERCLIP_API_KEY = orig;
    }
  });

  test("throws when PAPERCLIP_COMPANY_ID is missing", () => {
    const origKey = process.env.PAPERCLIP_API_KEY;
    const origCo = process.env.PAPERCLIP_COMPANY_ID;
    process.env.PAPERCLIP_API_KEY = "test-key";
    delete process.env.PAPERCLIP_COMPANY_ID;
    process.env.PAPERCLIP_COMPANY_ID = "";
    try {
      expect(() => getConfig()).toThrow("PAPERCLIP_COMPANY_ID is required");
    } finally {
      if (origKey) process.env.PAPERCLIP_API_KEY = origKey;
      if (origCo) process.env.PAPERCLIP_COMPANY_ID = origCo;
    }
  });

  test("returns config with defaults", () => {
    const origKey = process.env.PAPERCLIP_API_KEY;
    const origCo = process.env.PAPERCLIP_COMPANY_ID;
    const origUrl = process.env.PAPERCLIP_API_URL;
    process.env.PAPERCLIP_API_KEY = "test-key";
    process.env.PAPERCLIP_COMPANY_ID = "test-company";
    delete process.env.PAPERCLIP_API_URL;
    try {
      const config = getConfig();
      expect(config.apiUrl).toBe("http://127.0.0.1:3100");
      expect(config.apiKey).toBe("test-key");
      expect(config.companyId).toBe("test-company");
    } finally {
      if (origKey) process.env.PAPERCLIP_API_KEY = origKey;
      if (origCo) process.env.PAPERCLIP_COMPANY_ID = origCo;
      if (origUrl) process.env.PAPERCLIP_API_URL = origUrl;
    }
  });
});
