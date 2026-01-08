import { Collection, Db, MongoClient } from "mongodb";

import { appConfig } from "../core/settings/config";
import {
  AUTH_COLLECTION_NAME,
  BLACK_LIST_FOR_REFRESH_TOKENS_COLLECTION_NAME,
  BLOG_COLLECTION_NAME,
  POST_COLLECTION_NAME,
  POST_COMMENTS_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
} from "./collection-names.db";
import {
  AuthDB,
  BlackListRefreshTokenDB,
  BlogDB,
  PostCommentDB,
  PostDB,
  UserDB,
} from "./types.db";

let client: MongoClient;

export let authCollection: Collection<AuthDB>;
export let blogCollection: Collection<BlogDB>;
export let postCollection: Collection<PostDB>;
export let userCollection: Collection<UserDB>;
export let postCommentsCollection: Collection<PostCommentDB>;
export let blackListRefreshTokensCollection: Collection<BlackListRefreshTokenDB>;

// * Подключения к бд
export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url);

  try {
    await client.connect();
    const dataBase: Db = client.db(appConfig.DB_NAME);

    // * Инициализация индексов
    blackListRefreshTokensCollection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );
    blackListRefreshTokensCollection.createIndex(
      { tokenHash: 1 },
      { unique: true }
    );

    // * Инициализация коллекций
    authCollection = dataBase.collection<AuthDB>(AUTH_COLLECTION_NAME);
    blogCollection = dataBase.collection<BlogDB>(BLOG_COLLECTION_NAME);
    postCollection = dataBase.collection<PostDB>(POST_COLLECTION_NAME);
    userCollection = dataBase.collection<UserDB>(USERS_COLLECTION_NAME);
    postCommentsCollection = dataBase.collection<PostCommentDB>(
      POST_COMMENTS_COLLECTION_NAME
    );
    blackListRefreshTokensCollection =
      dataBase.collection<BlackListRefreshTokenDB>(
        BLACK_LIST_FOR_REFRESH_TOKENS_COLLECTION_NAME
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

// ? expiresAt / expireAfterSeconds / tokenHash / unique — это название полей в документе MongoDB.
