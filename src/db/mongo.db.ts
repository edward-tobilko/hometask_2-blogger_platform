import { Collection, Db, MongoClient } from "mongodb";

const BLOG_COLLECTION_NAME = "blogs";
const POST_COLLECTION_NAME = "posts";

let client: MongoClient;

export let blogCollection: Collection<DriverType>;
export let postCollection: Collection<RideType>;

// * Подключения к бд
export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url);

  const dataBase: Db = client.db(SETTINGS_MONGO_DB.DB_NAME);

  // * Инициализация коллекций
  blogCollection = dataBase.collection<DriverType>(DRIVER_COLLECTION_NAME);
  postCollection = dataBase.collection<RideType>(RIDE_COLLECTION_NAME);

  try {
    await client.connect();
    await dataBase.command({ ping: 1 });

    console.log("✅ Connected to the database");
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
