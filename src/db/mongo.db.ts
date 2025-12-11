import { Collection, Db, MongoClient } from "mongodb";

import { SETTINGS_MONGO_DB } from "../core/settings/setting-mongo.db";
import { BlogDomain } from "../blogs/domain/blog.domain";
import { PostDomain } from "../posts/domain/post.domain";
import { UserDomain } from "../users/domain/user.domain";
import { AuthDomain } from "../auth/domain/auth.domain";

let client: MongoClient;

const AUTH_COLLECTION_NAME = "auth";
const BLOG_COLLECTION_NAME = "blogs";
const POST_COLLECTION_NAME = "posts";
const USERS_COLLECTION_NAME = "users";

export let authCollection: Collection<AuthDomain>;
export let blogCollection: Collection<BlogDomain>;
export let postCollection: Collection<PostDomain>;
export let userCollection: Collection<UserDomain>;

// * Подключения к бд
export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url);

  try {
    await client.connect();
    const dataBase: Db = client.db(SETTINGS_MONGO_DB.DB_NAME);

    // * Инициализация коллекций
    authCollection = dataBase.collection<AuthDomain>(AUTH_COLLECTION_NAME);
    blogCollection = dataBase.collection<BlogDomain>(BLOG_COLLECTION_NAME);
    postCollection = dataBase.collection<PostDomain>(POST_COLLECTION_NAME);
    userCollection = dataBase.collection<UserDomain>(USERS_COLLECTION_NAME);

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
