import mongoose from "mongoose";

import { appConfig } from "@core/settings/config";

export async function runMongoose(): Promise<void> {
  try {
    await mongoose.connect(appConfig.MONGO_URL);

    console.log(`✅ Connected (mongoose) to DB: ${mongoose.connection.name}`);
  } catch (error: unknown) {
    throw new Error(`❌ Mongoose connection failed: ${error}`);
  }
}

export async function stopMongoose(): Promise<void> {
  const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

  if (state === 1) {
    await mongoose.disconnect();
    return;
  }

  // * если ещё коннектится — дождёмся / мягко закроем
  if (state === 2) {
    try {
      await mongoose.connection.close();
    } catch {}
  }
}
