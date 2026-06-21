import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fileToBase64,
  parseInbodyImage,
  parseWorkoutImage,
} from "../src/services/ocrService.js";

const originalApiKey = process.env.OPENAI_API_KEY;
const originalVisionModel = process.env.OPENAI_VISION_MODEL;

function mockImage(name = "screenshot.png"): File {
  return new File(["image-bytes"], name, { type: "image/png" });
}

function mockOpenAIResponse(content: string) {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("OpenAI Vision OCR service", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-api-key";
    process.env.OPENAI_VISION_MODEL = "gpt-4o-mini";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalApiKey;
    if (originalVisionModel === undefined) delete process.env.OPENAI_VISION_MODEL;
    else process.env.OPENAI_VISION_MODEL = originalVisionModel;
  });

  it("converts an image File to base64", async () => {
    await expect(fileToBase64(new File(["hello"], "hello.png", { type: "image/png" })))
      .resolves.toBe("aGVsbG8=");
  });

  it("extracts and validates Inbody JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockOpenAIResponse(JSON.stringify({
      weightKg: 77.6,
      bmi: 25,
      bodyFatPercent: 24.1,
      fatMassKg: 18.7,
      muscleMassKg: 55.3,
      boneMassKg: 3,
      bmrKcal: 1661,
      bodyAge: 37,
    })));
    vi.stubGlobal("fetch", fetchMock);

    await expect(parseInbodyImage(mockImage("fitdays.png"))).resolves.toMatchObject({
      weightKg: 77.6,
      bodyFatPercent: 24.1,
      bmrKcal: 1661,
    });

    const [url, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    const body = JSON.parse(String(options.body));
    expect(body.model).toBe("gpt-4o-mini");
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages[1].content[1].image_url.url).toMatch(/^data:image\/png;base64,/);
  });

  it("extracts and validates workout JSON with nullable optional metrics", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockOpenAIResponse(JSON.stringify({
      type: "RUN",
      distanceKm: 5.2,
      durationSeconds: 1800,
      avgHeartRateBpm: null,
      activeCaloriesKcal: 350,
    }))));

    await expect(parseWorkoutImage(mockImage("garmin.png"))).resolves.toEqual({
      type: "RUN",
      distanceKm: 5.2,
      durationSeconds: 1800,
      avgHeartRateBpm: null,
      activeCaloriesKcal: 350,
    });
  });

  it("rejects malformed JSON returned by the model", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockOpenAIResponse("```json\n{}\n```")));
    await expect(parseInbodyImage(mockImage())).rejects.toMatchObject({
      code: "OCR_INVALID_RESPONSE",
    });
  });

  it("fails clearly when the API key is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(parseWorkoutImage(mockImage())).rejects.toMatchObject({
      code: "OCR_NOT_CONFIGURED",
    });
  });

  it("rejects image formats unsupported by OpenAI Vision", async () => {
    const heicFile = new File(["image"], "photo.heic", { type: "image/heic" });
    await expect(fileToBase64(heicFile)).rejects.toThrow("PNG, JPEG, WEBP");
  });
});
