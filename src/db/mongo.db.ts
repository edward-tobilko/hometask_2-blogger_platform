import { Collection, Db, MongoClient } from "mongodb";

import { appConfig } from "../core/settings/config";
import {
  AUTH_COLLECTION_NAME,
  BLOG_COLLECTION_NAME,
  POST_COLLECTION_NAME,
  POST_COMMENTS_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
} from "./collection-names.db";
import { AuthDB, BlogDB, PostCommentDB, PostDB, UserDB } from "./types.db";

let client: MongoClient;

export let authCollection: Collection<AuthDB>;
export let blogCollection: Collection<BlogDB>;
export let postCollection: Collection<PostDB>;
export let userCollection: Collection<UserDB>;
export let postCommentsCollection: Collection<PostCommentDB>;

// * Подключения к БД
export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url);

  try {
    await client.connect();
    const dataBase: Db = client.db(appConfig.DB_NAME);

    // * Инициализация коллекций
    authCollection = dataBase.collection<AuthDB>(AUTH_COLLECTION_NAME);
    blogCollection = dataBase.collection<BlogDB>(BLOG_COLLECTION_NAME);
    postCollection = dataBase.collection<PostDB>(POST_COLLECTION_NAME);
    userCollection = dataBase.collection<UserDB>(USERS_COLLECTION_NAME);
    postCommentsCollection = dataBase.collection<PostCommentDB>(
      POST_COMMENTS_COLLECTION_NAME
    );

    // * Инициализация индексов ( чтобы «протухшие» сессии убирались автоматически )
    authCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

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
