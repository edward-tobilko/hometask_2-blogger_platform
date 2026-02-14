import { Collection, Db, MongoClient } from "mongodb";

import { appConfig } from "../core/settings/config";
import { POST_COMMENTS_COLLECTION_NAME } from "./collection-names.db";
import { PostCommentDB } from "./types.db";

let client: MongoClient;

export let postCommentsCollection: Collection<PostCommentDB>;

// * Подключения к БД
export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url);

  try {
    await client.connect();
    const dataBase: Db = client.db(appConfig.DB_NAME);

    // * Инициализация коллекций
    postCommentsCollection = dataBase.collection<PostCommentDB>(
      POST_COMMENTS_COLLECTION_NAME
    );

    await dataBase.command({ ping: 1 });

    console.log(`✅ Connected to the database: ${appConfig.DB_NAME}`);
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

// ? expiresAt / expireAfterSeconds / token / unique — это название полей в документе MongoDB.
