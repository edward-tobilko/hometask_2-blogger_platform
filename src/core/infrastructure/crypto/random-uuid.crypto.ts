import { randomBytes, randomUUID } from "node:crypto";

export const createToken = () => randomBytes(32).toString("hex");

export const uuid = randomUUID();
