import { afterEach, describe, expect, it, vi } from "vitest";

const geminiMocks = vi.hoisted(() => ({
  generateContent: vi.fn(),
  getGenerativeModel: vi.fn(),
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel(config: unknown) {
      geminiMocks.getGenerativeModel(config);
      return { generateContent: geminiMocks.generateContent };
    }
  },
}));

import { fileToBase64, parseInbodyImage, parseWorkoutImage } from "../src/services/ocrService.js";

function mockImage(name = "screenshot.png"): File {
  return new File(["image-bytes"], name, { type: "image/png" });
}

function mockGeminiText(content: string) {
  geminiMocks.generateContent.mockResolvedValue({ response: { text: () => content } });
}

describe("Gemini Vision OCR service", () => {
  afterEach(() => vi.clearAllMocks());

  it("converts image bytes to base64", async () => {
    await expect(fileToBase64(mockImage())).resolves.toBe(Buffer.from("image-bytes").toString("base64"));
  });

  it("extracts and validates Inbody JSON with Gemini Pro vision", async () => {
    mockGeminiText(JSON.stringify({
      weightKg: 77.6, bmi: 25, bodyFatPercent: 24.1, fatMassKg: 18.7,
      muscleMassKg: 55.3, boneMassKg: 3, bmrKcal: 1661, bodyAge: 37,
    }));
    await expect(parseInbodyImage(mockImage(), "test-key")).resolves.toMatchObject({ weightKg: 77.6, bmrKcal: 1661 });
    expect(geminiMocks.getGenerativeModel).toHaveBeenCalledWith(expect.objectContaining({ model: "gemini-1.5-pro" }));
    expect(geminiMocks.generateContent).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ inlineData: expect.objectContaining({ mimeType: "image/png" }) }),
    ]));
  });

  it("extracts workout JSON", async () => {
    mockGeminiText(JSON.stringify({
      type: "RUN", distanceKm: 5.2, durationSeconds: 1800,
      avgHeartRateBpm: null, activeCaloriesKcal: 350,
    }));
    await expect(parseWorkoutImage(mockImage("garmin.png"), "test-key")).resolves.toMatchObject({
      type: "RUN", distanceKm: 5.2, durationSeconds: 1800, activeCaloriesKcal: 350,
    });
  });

  it("rejects malformed JSON returned by Gemini", async () => {
    mockGeminiText("not-json");
    await expect(parseInbodyImage(mockImage(), "test-key")).rejects.toMatchObject({ code: "OCR_INVALID_RESPONSE" });
  });

  it("fails clearly when the saved Gemini key is missing", async () => {
    await expect(parseWorkoutImage(mockImage(), null)).rejects.toMatchObject({
      code: "OCR_NOT_CONFIGURED",
      message: expect.stringContaining("Cài đặt (Settings)"),
    });
  });

  it("rejects image formats unsupported by Gemini Vision", async () => {
    const heicFile = new File(["image"], "photo.heic", { type: "image/heic" });
    await expect(fileToBase64(heicFile)).rejects.toThrow("PNG, JPEG, WEBP");
  });
});
