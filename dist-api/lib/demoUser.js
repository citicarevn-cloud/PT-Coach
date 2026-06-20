"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_USER_EMAIL = void 0;
exports.getDemoUser = getDemoUser;
const prisma_1 = require("./prisma");
exports.DEMO_USER_EMAIL = "ted.tran@example.com";
async function getDemoUser() {
    return prisma_1.prisma.user.upsert({
        where: { email: exports.DEMO_USER_EMAIL },
        update: { name: "Ted Tran" },
        create: { email: exports.DEMO_USER_EMAIL, name: "Ted Tran", sex: "MALE" },
    });
}
