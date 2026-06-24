import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import type { User } from "@prisma/client";
import { extractAndParseJSON } from "./aiHelper";

type AiProvider = "gemini" | "openai" | "groq";

type AiUser = Pick<User, "geminiApiKey" | "openaiApiKey" | "groqApiKey" | "preferredAi">;

export class AiFallbackServiceError extends Error {
  constructor(
    public readonly code: "AI_NOT_CONFIGURED" | "AI_PROVIDER_ERROR" | "AI_INVALID_RESPONSE",
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AiFallbackServiceError";
  }
}

export async function generateFitnessPlanWithFallback(prompt: string, user: AiUser): Promise<unknown> {
  const providers = buildProviderQueue(user);

  if (providers.length === 0) {
    throw new AiFallbackServiceError(
      "AI_NOT_CONFIGURED",
      "Vui lòng vào mục Cài đặt (Settings) để nhập Gemini, OpenAI hoặc Groq API Key trước khi sử dụng.",
    );
  }

  const failures: Array<{ provider: AiProvider; error: unknown }> = [];

  for (const provider of providers) {
    try {
      const rawText = await generateWithProvider(provider, prompt, user);
      return extractAndParseJSON(rawText);
    } catch (error) {
      failures.push({ provider, error });
      console.error(`[AI_FALLBACK] Provider ${provider} FAILED. Reason:`, getErrorMessage(error));
    }
  }

  const hasInvalidJson = failures.some(({ error }) => error instanceof Error && error.message.includes("JSON"));
  const failureSummary = failures
    .map(({ provider, error }) => `${provider}: ${getErrorMessage(error)}`)
    .join(" | ");
  throw new AiFallbackServiceError(
    hasInvalidJson ? "AI_INVALID_RESPONSE" : "AI_PROVIDER_ERROR",
    hasInvalidJson
      ? "Dữ liệu trả về không đúng định dạng JSON."
      : `Tất cả nhà cung cấp AI khả dụng đều đang lỗi hoặc hết quota. Chi tiết: ${failureSummary}`,
    { cause: failures.at(-1)?.error },
  );
}

function buildProviderQueue(user: AiUser): AiProvider[] {
  const preferred = normalizeProvider(user.preferredAi);
  const ordered: AiProvider[] = [preferred, "gemini", "openai", "groq"];
  const unique = [...new Set(ordered)];

  return unique.filter((provider) => {
    if (provider === "gemini") return Boolean(user.geminiApiKey?.trim());
    if (provider === "openai") return Boolean(user.openaiApiKey?.trim());
    return Boolean(user.groqApiKey?.trim());
  });
}

function normalizeProvider(provider: string | null | undefined): AiProvider {
  if (provider === "openai" || provider === "groq" || provider === "gemini") return provider;
  return "gemini";
}

async function generateWithProvider(provider: AiProvider, prompt: string, user: AiUser): Promise<string> {
  if (provider === "gemini") return generateWithGemini(prompt, requireKey(user.geminiApiKey, "Gemini"));
  if (provider === "openai") return generateWithOpenAI(prompt, requireKey(user.openaiApiKey, "OpenAI"));
  return generateWithGroq(prompt, requireKey(user.groqApiKey, "Groq"));
}

async function generateWithGemini(prompt: string, apiKey: string): Promise<string> {
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 8_192,
    },
  });
  const result = await withTimeout(model.generateContent(prompt), 45_000);
  const text = result.response.text().trim();
  if (!text) throw new Error("Gemini không trả về nội dung.");
  return text;
}

async function generateWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  const client = new OpenAI({ apiKey });
  const response = await withTimeout(
    client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Bạn là AI Fitness Coach. Chỉ trả về một JSON object hợp lệ, không markdown, không giải thích ngoài JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 8_192,
      response_format: { type: "json_object" },
    }),
    45_000,
  );
  const text = response.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI không trả về nội dung.");
  return text;
}

async function generateWithGroq(prompt: string, apiKey: string): Promise<string> {
  const client = new Groq({ apiKey });
  const response = await withTimeout(
    client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a fitness planning engine. Return raw valid JSON only. No markdown, no greetings, no commentary.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 8_192,
      response_format: { type: "json_object" },
    }),
    45_000,
  );
  const text = response.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Groq không trả về nội dung.");
  return text;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown AI provider error";
  }
}

function requireKey(apiKey: string | null | undefined, providerName: string): string {
  const normalized = apiKey?.trim();
  if (!normalized) throw new Error(`${providerName} API Key chưa được cấu hình.`);
  return normalized;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("AI provider request timed out.")), timeoutMs);
    }),
  ]);
}
