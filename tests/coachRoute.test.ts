import { beforeEach, describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getDemoUser: vi.fn(),
  generateContent: vi.fn(),
}));

vi.mock("../src/lib/demoUser.js", () => ({ getDemoUser: routeMocks.getDemoUser }));
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: routeMocks.generateContent };
    }
  },
}));

import { POST } from "../src/app/api/coach/analyze/route.js";

describe("POST /api/coach/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeMocks.getDemoUser.mockResolvedValue({ geminiApiKey: "test-gemini-key" });
    routeMocks.generateContent.mockResolvedValue({ response: { text: () => "Tuyệt vời Ted, buổi tập rất chất lượng." } });
  });

  it("returns a Gemini Coach message for a valid workout", async () => {
    const response = await POST(new Request("http://localhost/api/coach/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "WALK", distanceKm: 6.21, durationSeconds: 3685,
        avgHeartRateBpm: 134, activeCaloriesKcal: 404, heartRateZone: 2,
      }),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ message: expect.stringContaining("Tuyệt vời Ted") });
  });

  it("returns the Settings message when the user has no Gemini key", async () => {
    routeMocks.getDemoUser.mockResolvedValue({ geminiApiKey: null });
    const response = await POST(new Request("http://localhost/api/coach/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "WALK", durationSeconds: 1200, activeCaloriesKcal: 120 }),
    }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: "GEMINI_KEY_REQUIRED",
      message: expect.stringContaining("Cài đặt (Settings)"),
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
