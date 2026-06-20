import { describe, expect, it } from "vitest";
import { POST } from "../src/app/api/coach/analyze/route.js";

describe("POST /api/coach/analyze", () => {
  it("returns an AI Coach message for a valid workout", async () => {
    const response = await POST(new Request("http://localhost/api/coach/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "WALK",
        distanceKm: 6.21,
        durationSeconds: 3685,
        avgHeartRateBpm: 134,
        activeCaloriesKcal: 404,
        heartRateZone: 2,
      }),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      message: expect.stringContaining("Tuyệt vời Ted"),
    });
  });

  it("rejects invalid workout data", async () => {
    const response = await POST(new Request("http://localhost/api/coach/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "WALK", durationSeconds: -1 }),
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: "INVALID_WORKOUT_DATA" });
  });
});
