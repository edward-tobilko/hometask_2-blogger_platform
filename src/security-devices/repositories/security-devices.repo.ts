import { ObjectId } from "mongodb";
import { injectable } from "inversify";

import { authSessionCollection } from "db/mongo.db";
import { ISecurityDevicesRepo } from "security-devices/interfaces/ISecurityDevicesRepo";

@injectable()
export class SecurityDevicesRepo implements ISecurityDevicesRepo {
  async removeAllSecurityDevicesExceptCurrent(
    userId: string,
    currentDeviceId: string
  ): Promise<number> {
    // * Удалить все сессии пользователя userId, в которых deviceId НЕ равен currentDeviceId.
    const deletedDevices = await authSessionCollection.deleteMany({
      userId: new ObjectId(userId),
      deviceId: { $ne: currentDeviceId },
    });

    return deletedDevices.deletedCount;
  }

  async removeSecurityDeviceById(deviceId: string): Promise<boolean> {
    const deletedDevice = await authSessionCollection.deleteOne({ deviceId });

    return deletedDevice.deletedCount === 1;
  }
}

// ? $ne в MongoDB означает «not equal» — «не равен».

// ? $eq - равно
// ? $in - входит в список
// ? $nin - не входит в список
// ? $gt - больше
// ? $gte - больше или равно
// ? $lt - меньше
// ? $lte - меньше или равно
