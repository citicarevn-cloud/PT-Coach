import { describe, expect, it } from "vitest";
import { POST } from "../src/app/api/upload/route.js";

describe("POST /api/upload validation", () => {
  it("rejects a request without an image", async () => {
    const formData = new FormData();
    formData.append("uploadType", "inbody");
    const response = await POST(new Request("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "MISSING_IMAGE",
    });
  });

  it("rejects an unsupported upload type", async () => {
    const formData = new FormData();
    formData.append("uploadType", "profile");
    formData.append("file", new File(["image"], "photo.png", { type: "image/png" }));
    const response = await POST(new Request("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: "INVALID_UPLOAD_TYPE" });
  });

  it("returns a configuration error when Vision has no API key", async () => {
    const currentApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    try {
      const formData = new FormData();
      formData.append("uploadType", "workout");
      formData.append("file", new File(["image"], "workout.png", { type: "image/png" }));
      const response = await POST(new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      }));

      expect(response.status).toBe(503);
      await expect(response.json()).resolves.toMatchObject({ error: "OCR_NOT_CONFIGURED" });
    } finally {
      if (currentApiKey === undefined) delete process.env.OPENAI_API_KEY;
      else process.env.OPENAI_API_KEY = currentApiKey;
    }
  });
});
