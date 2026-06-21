import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_KEY_REQUIRED_MESSAGE =
  "Chưa cài đặt Gemini API Key";

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
export const GEMINI_VISION_MODEL = "gemini-2.5-flash";

export class GeminiClientError extends Error {
  constructor(
    public readonly code: "GEMINI_KEY_REQUIRED" | "GEMINI_PROVIDER_ERROR" | "GEMINI_EMPTY_RESPONSE",
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "GeminiClientError";
  }
}

export function requireGeminiApiKey(apiKey: string | null | undefined): string {
  const normalized = apiKey?.trim();
  if (!normalized) throw new GeminiClientError("GEMINI_KEY_REQUIRED", GEMINI_KEY_REQUIRED_MESSAGE);
  return normalized;
}

export async function generateGeminiText(options: {
  apiKey: string | null | undefined;
  prompt: string;
  model?: string;
  image?: { data: string; mimeType: string };
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string> {
  const apiKey = requireGeminiApiKey(options.apiKey);

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: options.model || GEMINI_TEXT_MODEL,
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxOutputTokens ?? 1_024,
        ...(options.json ? { responseMimeType: "application/json" } : {}),
      },
    });
    const content = options.image
      ? [{ text: options.prompt }, { inlineData: options.image }]
      : options.prompt;
    const result = await withTimeout(model.generateContent(content), 45_000);
    const text = result.response.text().trim();
    if (!text) throw new GeminiClientError("GEMINI_EMPTY_RESPONSE", "Gemini không trả về nội dung.");
    return text;
  } catch (error) {
    if (error instanceof GeminiClientError) throw error;
    throw new GeminiClientError(
      "GEMINI_PROVIDER_ERROR",
      "Không thể kết nối hoặc nhận phản hồi hợp lệ từ Gemini.",
      { cause: error },
    );
  }
}

export function extractJsonText(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (fenced?.[1] ?? trimmed).trim();
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Gemini request timed out.")), timeoutMs);
    }),
  ]);
}
