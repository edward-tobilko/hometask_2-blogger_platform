import { randomBytes, randomUUID, createHash } from "node:crypto";

const token = randomBytes(32).toString("hex");

export const uuid = randomUUID();

const hash = createHash("sha256").update("hello").digest("hex");
