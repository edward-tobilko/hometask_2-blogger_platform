import { ObjectId } from "mongodb";

import { userCollection } from "../../db/mongo.db";
import { UserDB } from "db/types.db";

export class UserRepository {
  async createUserRepo(user: UserDB): Promise<UserDB> {
    const insertResult = await userCollection.insertOne(user);

    user._id = insertResult.insertedId;

    return user;
  }

  async deleteUserRepo(id: string): Promise<boolean> {
    const isDeleted = await userCollection.deleteOne({ _id: new ObjectId(id) });

    return isDeleted.deletedCount === 1;
  }

  async updateConfirmStatus(_id: ObjectId) {
    const resultUserConfirmStatus = await userCollection.updateOne(
      { _id },
      { $set: { "emailConfirmation.isConfirmed": true } }
    );

    return resultUserConfirmStatus.modifiedCount === 1;
  }
}
