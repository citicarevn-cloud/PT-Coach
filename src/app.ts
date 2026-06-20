import cors from "cors";
import express from "express";
import helmet from "helmet";
import { apiRouter } from "./http/routes.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/v1", apiRouter);
