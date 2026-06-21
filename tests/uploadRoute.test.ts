import { beforeEach, describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({ getDemoUser: vi.fn() }));
vi.mock("../src/lib/demoUser.js", () => ({ getDemoUser: routeMocks.getDemoUser }));

import { POST } from "../src/app/api/upload/route.js";

describe("POST /api/upload validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeMocks.getDemoUser.mockResolvedValue({ id: "user-1", geminiApiKey: null });
  });

  it("rejects a request without an image", async () => {
    const formData = new FormData();
    formData.append("uploadType", "inbody");
    const response = await POST(new Request("http://localhost/api/upload", { method: "POST", body: formData }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ success: false, error: "MISSING_IMAGE" });
  });

  it("rejects an unsupported upload type", async () => {
    const formData = new FormData();
    formData.append("uploadType", "profile");
    formData.append("file", new File(["image"], "photo.png", { type: "image/png" }));
    const response = await POST(new Request("http://localhost/api/upload", { method: "POST", body: formData }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: "INVALID_UPLOAD_TYPE" });
  });

  it("returns the Settings error when Vision has no saved Gemini key", async () => {
    const formData = new FormData();
    formData.append("uploadType", "workout");
    formData.append("file", new File(["image"], "workout.png", { type: "image/png" }));
    const response = await POST(new Request("http://localhost/api/upload", { method: "POST", body: formData }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: "OCR_NOT_CONFIGURED",
      message: expect.stringContaining("Cài đặt (Settings)"),
    });
  });
});
