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
  await mongoose.disconnect();
}
