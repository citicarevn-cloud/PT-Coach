import { describe, expect, it } from "vitest";
import { POST } from "../src/app/api/tracker/route.js";

describe("POST /api/tracker validation", () => {
  it("rejects an empty updates object", async () => {
    const response = await POST(new Request("http://localhost/api/tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: "2026-06-18T17:00:00.000Z", updates: {} }),
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "INVALID_TRACKER_DATA",
    });
  });

  it("rejects unknown tracker fields", async () => {
    const response = await POST(new Request("http://localhost/api/tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: "2026-06-18T17:00:00.000Z",
        updates: { stepsCompleted: true },
      }),
    }));

    expect(response.status).toBe(400);
  });
});
