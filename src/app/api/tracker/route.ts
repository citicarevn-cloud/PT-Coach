import { NextResponse } from "next/server";
import { z } from "zod";
import { getDemoUser } from "../../../lib/demoUser";
import { normalizeToLocalMidnight } from "../../../lib/dates";
import { prisma } from "../../../lib/prisma";

const trackerUpdatesSchema = z.object({
  waterCompleted: z.boolean().optional(),
  workoutCompleted: z.boolean().optional(),
  dietCompleted: z.boolean().optional(),
}).strict().refine((updates) => Object.keys(updates).length > 0, {
  message: "Cần ít nhất một trạng thái để cập nhật.",
});

const trackerRequestSchema = z.object({
  date: z.string().datetime({ offset: true }),
  updates: trackerUpdatesSchema,
}).strict();

export async function POST(request: Request) {
  try {
    const parsed = trackerRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "INVALID_TRACKER_DATA", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const user = await getDemoUser();
    const date = normalizeToLocalMidnight(new Date(parsed.data.date));
    const updatedTracker = await prisma.dailyTracker.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: parsed.data.updates,
      create: { userId: user.id, date, ...parsed.data.updates },
    });

    return NextResponse.json({ success: true, data: updatedTracker });
  } catch (error) {
    console.error("Daily tracker update failed.", error);
    return NextResponse.json(
      { success: false, error: "TRACKER_UPDATE_FAILED" },
      { status: 500 },
    );
  }
}
