import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeWorkoutSession, buildWorkoutPrompt } from "../src/services/aiCoachService.js";

const walkSession = {
  type: "WALK" as const,
  distanceKm: 6.21,
  durationSeconds: 3685,
  avgHeartRateBpm: 134,
  activeCaloriesKcal: 404,
  heartRateZone: 2 as const,
};

describe("AI Coach service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds a grounded Vietnamese workout prompt", () => {
    const prompt = buildWorkoutPrompt(walkSession);
    expect(prompt).toContain("Đi bộ 6,21 km trong 1 giờ 1 phút");
    expect(prompt).toContain("134 bpm");
    expect(prompt).toContain("Zone 2");
  });

  it("returns the local coach response when no API key is configured", async () => {
    const currentApiKey = process.env.OPENAI_API_KEY;
    let message: string;
    try {
      delete process.env.OPENAI_API_KEY;
      message = await analyzeWorkoutSession(walkSession);
    } finally {
      if (currentApiKey === undefined) delete process.env.OPENAI_API_KEY;
      else process.env.OPENAI_API_KEY = currentApiKey;
    }

    expect(message).toContain("Tuyệt vời Ted");
    expect(message).toContain("Zone 2");
    expect(message).toContain("bữa tối");
  });

  it("uses the Chat Completions messages contract when an API key exists", async () => {
    const currentApiKey = process.env.OPENAI_API_KEY;
    const currentModel = process.env.OPENAI_MODEL;
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: "Phân tích từ Chat Completions" } }],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    try {
      process.env.OPENAI_API_KEY = "test-key";
      delete process.env.OPENAI_MODEL;
      await expect(analyzeWorkoutSession(walkSession)).resolves.toBe("Phân tích từ Chat Completions");
    } finally {
      if (currentApiKey === undefined) delete process.env.OPENAI_API_KEY;
      else process.env.OPENAI_API_KEY = currentApiKey;
      if (currentModel === undefined) delete process.env.OPENAI_MODEL;
      else process.env.OPENAI_MODEL = currentModel;
    }

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    const body = JSON.parse(String(options.body));
    expect(body).toMatchObject({
      model: "gpt-4o-mini",
      max_tokens: 250,
      messages: [
        { role: "system" },
        { role: "user", content: expect.stringContaining("Đi bộ 6,21 km") },
      ],
    });
    expect(body).not.toHaveProperty("instructions");
    expect(body).not.toHaveProperty("input");
  });
});
