import mongoose from "mongoose";

export async function clearDb(): Promise<void> {
  // * защита — убедимся, что подключение уже есть
  if (mongoose.connection.readyState !== 1) {
    throw new Error("clearDb called before mongoose connected");
  }

  const collections = mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
}
