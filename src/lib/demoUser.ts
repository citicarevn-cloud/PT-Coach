import { prisma } from "./prisma";

export const DEMO_USER_EMAIL = "ted.tran@example.com";

export async function getDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: { name: "Ted Tran" },
    create: { email: DEMO_USER_EMAIL, name: "Ted Tran", sex: "MALE" },
  });
}
