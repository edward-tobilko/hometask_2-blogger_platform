import { Collection, Db, MongoClient } from "mongodb";

import { PostDbDocument } from "../posts/types/post.types";
import { BlogDbDocument } from "../blogs/types/blog.types";
import { SETTINGS_MONGO_DB } from "../core/settings/setting-mongo-db";

let client: MongoClient;

const BLOG_COLLECTION_NAME = "blogs";
const POST_COLLECTION_NAME = "posts";

export let blogCollection: Collection<BlogDbDocument>;
export let postCollection: Collection<PostDbDocument>;

// * Подключения к бд
export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url);

  try {
    await client.connect();
    const dataBase: Db = client.db(SETTINGS_MONGO_DB.DB_NAME);

    // * Инициализация коллекций
    blogCollection = dataBase.collection<BlogDbDocument>(BLOG_COLLECTION_NAME);
    postCollection = dataBase.collection<PostDbDocument>(POST_COLLECTION_NAME);

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
