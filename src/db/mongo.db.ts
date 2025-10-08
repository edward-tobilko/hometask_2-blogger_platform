import { Collection, Db, MongoClient } from "mongodb";

import { PostDb } from "../posts/types/post.types";
import { BlogDb } from "../blogs/types/blog.types";
import { SETTINGS_MONGO_DB } from "../core/settings/setting-mongo-db";

const BLOG_COLLECTION_NAME = "blogs";
const POST_COLLECTION_NAME = "posts";

let client: MongoClient;

export let blogCollection: Collection<BlogDb>;
export let postCollection: Collection<PostDb>;

// * Подключения к бд
export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url);

  const dataBase: Db = client.db(SETTINGS_MONGO_DB.DB_NAME);

  // * Инициализация коллекций
  blogCollection = dataBase.collection<BlogDb>(BLOG_COLLECTION_NAME);
  postCollection = dataBase.collection<PostDb>(POST_COLLECTION_NAME);

  try {
    await client.connect();
    await dataBase.command({ ping: 1 });

    console.log(`✅ Connected to the database: ${SETTINGS_MONGO_DB.DB_NAME}`);
  } catch (e) {
    await client.close();

    throw new Error(`❌ Database not connected: ${e}`);
  }
}

// * для тестов
export async function stopDB() {
  if (!client) {
    throw new Error(`❌ No active client`);
  }

  await client.close();
}
