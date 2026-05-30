import {
  SecurityDevicesDocument,
  SecurityDevicesLean,
} from '../../domain/entities/security-devices.entity';

export class SecurityDevicesViewModel {
  ip!: string;
  title!: string;
  lastActiveDate!: string;
  deviceId!: string;

  static mapToViewModel(
    this: void,
    device: SecurityDevicesDocument | SecurityDevicesLean,
  ): SecurityDevicesViewModel {
    const dto = new SecurityDevicesViewModel();

    dto.ip = device.ip;
    dto.title = device.title;
    dto.lastActiveDate = device.lastActiveDate.toString();
    dto.deviceId = device.deviceId;

    return dto;
  }

  static mapToViewModels(
    devices: SecurityDevicesLean[],
  ): SecurityDevicesViewModel[] {
    return devices.map((device) =>
      SecurityDevicesViewModel.mapToViewModel(device),
    );
  }
}
