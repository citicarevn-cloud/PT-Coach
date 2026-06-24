import { NextResponse } from "next/server";
import { z } from "zod";
import { getDemoUser } from "@/lib/demoUser";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  geminiApiKey: z.string().trim().max(512).optional(),
  openaiApiKey: z.string().trim().max(512).optional(),
  groqApiKey: z.string().trim().max(512).optional(),
  preferredAi: z.enum(["gemini", "openai", "groq"]).default("gemini"),
});

export async function POST(request: Request) {
  try {
    const input = settingsSchema.parse(await request.json());
    const user = await getDemoUser();
    const data = {
      preferredAi: input.preferredAi,
      ...(input.geminiApiKey ? { geminiApiKey: input.geminiApiKey } : {}),
      ...(input.openaiApiKey ? { openaiApiKey: input.openaiApiKey } : {}),
      ...(input.groqApiKey ? { groqApiKey: input.groqApiKey } : {}),
    };
    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: { geminiApiKey: true, openaiApiKey: true, groqApiKey: true, preferredAi: true },
    });
    return NextResponse.json({
      success: true,
      data: {
        hasGeminiApiKey: Boolean(updated.geminiApiKey),
        hasOpenAiApiKey: Boolean(updated.openaiApiKey),
        hasGroqApiKey: Boolean(updated.groqApiKey),
        preferredAi: updated.preferredAi,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Cài đặt AI không hợp lệ." }, { status: 400 });
    }
    console.error("AI settings update failed.", error);
    return NextResponse.json({ success: false, message: "Không thể lưu cài đặt AI." }, { status: 500 });
  }
}
