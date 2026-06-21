import { NextResponse } from "next/server";
import { z } from "zod";
import { getDemoUser } from "@/lib/demoUser";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  geminiApiKey: z.string().trim().min(20).max(256),
});

export async function POST(request: Request) {
  try {
    const input = settingsSchema.parse(await request.json());
    const user = await getDemoUser();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { geminiApiKey: input.geminiApiKey },
      select: { geminiApiKey: true },
    });
    return NextResponse.json({
      success: true,
      data: { hasGeminiApiKey: Boolean(updated.geminiApiKey) },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Gemini API Key không hợp lệ." }, { status: 400 });
    }
    console.error("Gemini settings update failed.", error);
    return NextResponse.json({ success: false, message: "Không thể lưu Gemini API Key." }, { status: 500 });
  }
}
