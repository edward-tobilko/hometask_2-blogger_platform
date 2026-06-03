import { ApiProperty } from '@nestjs/swagger';
import {
  SecurityDevicesDocument,
  SecurityDevicesLean,
} from '../../domain/entities/security-devices.entity';

export class SecurityDevicesViewModel {
  @ApiProperty({ description: 'IP address of device during signing in' })
  ip!: string;

  @ApiProperty({
    description:
      'Device name: for example Chrome 105 (received by parsing http header "user-agent")',
  })
  title!: string;

  @ApiProperty({
    description: 'Date of the last generating of refresh/access tokens',
  })
  lastActiveDate!: string;

  @ApiProperty({ description: 'Id of connected device session' })
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
