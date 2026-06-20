import { ActivityType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const exercises = [
  {
    name: "30 phút CARDIO HIIT ĐỐT MỠ tại nhà",
    youtubeUrl: "https://www.youtube.com/watch?v=AMKKNs9cZZM",
    activityType: ActivityType.HIIT,
    durationMinutes: 32,
    formInstructions: "Giữ thẳng lưng, siết cơ core",
    injuryWarnings: "Tránh tiếp đất bằng gót chân",
    muscleGroups: ["full_body", "core", "legs"],
    difficulty: "INTERMEDIATE",
  },
  {
    name: "Tập Toàn Thân Săn Chắc Giảm Mỡ Tại Nhà",
    youtubeUrl: "https://www.youtube.com/watch?v=QZGGuyU044k",
    activityType: ActivityType.STRENGTH,
    durationMinutes: 36,
    formInstructions: "Hít vào khi hạ, thở ra khi nâng",
    injuryWarnings: "Không khóa khớp",
    muscleGroups: ["full_body", "core"],
    difficulty: "INTERMEDIATE",
  },
  {
    name: "10 Phút Tập Đốt Năng Lượng Giảm Mỡ",
    youtubeUrl: "https://www.youtube.com/watch?v=ConKZlJg6lM",
    activityType: ActivityType.HIIT,
    durationMinutes: 10,
    formInstructions: "Tập trung nhịp thở nhanh",
    injuryWarnings: "Người huyết áp cao cần lưu ý",
    muscleGroups: ["full_body"],
    difficulty: "BEGINNER",
  },
];

async function seedExerciseLibrary(): Promise<void> {
  for (const exercise of exercises) {
    const existing = await prisma.exerciseLibrary.findFirst({
      where: { youtubeUrl: exercise.youtubeUrl },
      select: { id: true },
    });

    if (existing) {
      await prisma.exerciseLibrary.update({
        where: { id: existing.id },
        data: exercise,
      });
    } else {
      await prisma.exerciseLibrary.create({ data: exercise });
    }
  }
}

seedExerciseLibrary()
  .then(() => console.log(`Seeded ${exercises.length} Hubert Cù exercises.`))
  .catch((error: unknown) => {
    console.error("Failed to seed exercise library:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
