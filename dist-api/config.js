"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const configSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().default(3001),
    DATABASE_URL: zod_1.z.string().default("file:./dev.db"),
});
exports.config = configSchema.parse(process.env);
