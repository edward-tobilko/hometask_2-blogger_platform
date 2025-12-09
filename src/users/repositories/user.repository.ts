import { ObjectId } from "mongodb";

import { userCollection } from "../../db/mongo.db";
import { UserDomain } from "../domain/user.domain";

export class UserRepository {
  async createUserRepo(user: UserDomain): Promise<UserDomain> {
    const insertResult = await userCollection.insertOne(user);

    user._id = insertResult.insertedId;

    return user;
  }

  async deleteUserRepo(id: string): Promise<boolean> {
    const isDeleted = await userCollection.deleteOne({ _id: new ObjectId(id) });

    return isDeleted.deletedCount === 1;
  }
}
