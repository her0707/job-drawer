import { describe, expect, it } from "vitest";
import { isCronRequestAuthorized } from "@/lib/cron/auth";

describe("isCronRequestAuthorized", () => {
  it("rejects cron requests when no secret is configured", () => {
    const request = new Request("https://example.com/api/cron/gmail-sync", {
      headers: {
        authorization: "Bearer configured-secret",
      },
    });

    expect(isCronRequestAuthorized(request, undefined)).toBe(false);
  });

  it("rejects cron requests without the expected bearer token", () => {
    const request = new Request("https://example.com/api/cron/gmail-sync", {
      headers: {
        authorization: "Bearer wrong-secret",
      },
    });

    expect(isCronRequestAuthorized(request, "configured-secret")).toBe(false);
  });

  it("accepts cron requests with the configured bearer token", () => {
    const request = new Request("https://example.com/api/cron/gmail-sync", {
      headers: {
        authorization: "Bearer configured-secret",
      },
    });

    expect(isCronRequestAuthorized(request, "configured-secret")).toBe(true);
  });
});
