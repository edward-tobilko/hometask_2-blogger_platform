import mongoose from "mongoose";

import { appConfig } from "@core/settings/config";

export async function runMongoose(url: string): Promise<void> {
  try {
    await mongoose.connect(url, {
      dbName: appConfig.DB_NAME,
    });

    console.log(`✅ Connected (mongoose) to DB: ${appConfig.DB_NAME}`);
  } catch (error: unknown) {
    throw new Error(`❌ Mongoose connection failed: ${error}`);
  }
}

export async function stopMongoose(): Promise<void> {
  await mongoose.disconnect();
}
