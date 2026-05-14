import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

export const throttlerModule = ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],

  useFactory: (config: ConfigService) => {
    const isDisabled = config.get('DISABLE_RATE_LIMIT') === 'true';

    return [
      {
        ttl: Number(config.get('TTL_RATE_LIMIT')),
        limit: isDisabled ? 10000 : Number(config.get('COUNT_RATE_LIMIT')),
      },
    ];
  },
});
